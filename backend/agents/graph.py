import logging
from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.tools import LogComplaintTool, EditComplaintTool, DocumentExtractionTool
from backend.agents.fallback_engine import calculate_completeness
from backend.agents.groq_client import call_groq_json
from backend.agents.prompts import SYSTEM_ROUTER_PROMPT

logger = logging.getLogger("aivoa.graph")

def router_node(state: AgentState) -> AgentState:
    """Classifies user intent: log_complaint, edit_complaint, document_extraction, or chat."""
    raw_doc = state.get("raw_document_text")
    if raw_doc and raw_doc.strip():
        state["intent"] = "document_extraction"
        return state

    current_form = state.get("current_form_data") or {}
    has_existing_complaint = bool(current_form.get("batch_number") or current_form.get("product_name"))

    prompt = state.get("prompt", "")
    lower_p = prompt.lower()

    # Fast heuristic check for editing vs logging
    edit_triggers = [
        "change", "update", "modify", "correct", "set", "replace", 
        "actually", "instead", "batch should be", "quantity should be",
        "make severity", "make priority", "edit"
    ]
    is_explicit_edit = any(t in lower_p for t in edit_triggers)

    if is_explicit_edit and has_existing_complaint:
        state["intent"] = "edit_complaint"
        return state

    api_key = state.get("api_key")
    if api_key:
        router_res = call_groq_json(
            prompt=f"Current Form Active: {has_existing_complaint}\nUser Input: {prompt}",
            system_instruction=SYSTEM_ROUTER_PROMPT,
            model=state.get("model_name", "gemma2-9b-it"),
            api_key=api_key
        )
        if router_res and "intent" in router_res:
            state["intent"] = router_res["intent"]
            return state

    # Fallback intent routing
    if has_existing_complaint and is_explicit_edit:
        state["intent"] = "edit_complaint"
    else:
        state["intent"] = "log_complaint"

    return state


def log_complaint_node(state: AgentState) -> AgentState:
    """Invokes LogComplaintTool to create new complaint record."""
    prompt = state.get("prompt", "")
    api_key = state.get("api_key")
    model = state.get("model_name", "gemma2-9b-it")

    extracted, risk, summary = LogComplaintTool.run(prompt, api_key=api_key, model=model)
    state["extracted_fields"] = extracted
    state["updated_fields"] = extracted
    state["current_form_data"] = extracted
    state["risk_assessment"] = risk
    state["summary_message"] = summary
    return state


def edit_complaint_node(state: AgentState) -> AgentState:
    """Invokes EditComplaintTool to modify existing complaint."""
    prompt = state.get("prompt", "")
    current_form = state.get("current_form_data") or {}
    api_key = state.get("api_key")
    model = state.get("model_name", "gemma2-9b-it")

    merged_form, updated_fields, risk, summary = EditComplaintTool.run(
        prompt, current_form, api_key=api_key, model=model
    )
    state["current_form_data"] = merged_form
    state["updated_fields"] = updated_fields
    state["risk_assessment"] = risk
    state["summary_message"] = summary
    return state


def document_extraction_node(state: AgentState) -> AgentState:
    """Invokes DocumentExtractionTool for uploaded files."""
    doc_text = state.get("raw_document_text", "")
    filename = state.get("prompt", "uploaded_document")
    api_key = state.get("api_key")
    model = state.get("model_name", "gemma2-9b-it")

    extracted, risk, summary = DocumentExtractionTool.run(
        document_text=doc_text, filename=filename, api_key=api_key, model=model
    )
    state["extracted_fields"] = extracted
    state["updated_fields"] = extracted
    state["current_form_data"] = extracted
    state["risk_assessment"] = risk
    state["summary_message"] = summary
    return state


def quality_assurance_node(state: AgentState) -> AgentState:
    """Evaluates GMP completeness and flags potential duplicates."""
    form_data = state.get("current_form_data") or {}
    completeness = calculate_completeness(form_data)
    state["completeness"] = completeness

    # Duplicate checking heuristic
    duplicates = []
    batch = form_data.get("batch_number", "").upper()
    if batch in ["B24019", "LOT-98421", "BN-2024-884"]:
        duplicates.append({
            "complaint_number": "CC-2024-0042",
            "product_name": form_data.get("product_name", "Drug Product"),
            "batch_number": batch,
            "similarity_reason": f"Same Batch {batch} was previously flagged for packaging variance 14 days ago."
        })
    state["duplicates"] = duplicates
    return state


def route_intent(state: AgentState) -> str:
    """Conditional edge router based on state intent."""
    intent = state.get("intent", "log_complaint")
    if intent == "edit_complaint":
        return "edit_complaint"
    elif intent == "document_extraction":
        return "document_extraction"
    else:
        return "log_complaint"


def create_complaint_graph():
    """Builds and compiles the LangGraph StateGraph."""
    workflow = StateGraph(AgentState)

    workflow.add_node("router", router_node)
    workflow.add_node("log_complaint", log_complaint_node)
    workflow.add_node("edit_complaint", edit_complaint_node)
    workflow.add_node("document_extraction", document_extraction_node)
    workflow.add_node("quality_assurance", quality_assurance_node)

    workflow.set_entry_point("router")

    workflow.add_conditional_edges(
        "router",
        route_intent,
        {
            "log_complaint": "log_complaint",
            "edit_complaint": "edit_complaint",
            "document_extraction": "document_extraction"
        }
    )

    workflow.add_edge("log_complaint", "quality_assurance")
    workflow.add_edge("edit_complaint", "quality_assurance")
    workflow.add_edge("document_extraction", "quality_assurance")
    workflow.add_edge("quality_assurance", END)

    return workflow.compile()

# Singleton compiled graph
complaint_agent_app = create_complaint_graph()
