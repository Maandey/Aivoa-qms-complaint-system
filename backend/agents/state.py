from typing import TypedDict, Dict, Any, List, Optional

class AgentState(TypedDict):
    # User input and context
    prompt: str
    current_form_data: Dict[str, Any]
    conversation_history: List[Dict[str, str]]
    api_key: Optional[str]
    model_name: Optional[str]

    # Extraction and routing
    intent: str # "log_complaint" | "edit_complaint" | "document_extraction" | "chat"
    raw_document_text: Optional[str]
    extracted_fields: Dict[str, Any]
    updated_fields: Dict[str, Any]

    # Reasoning & Quality outputs
    risk_assessment: Dict[str, Any]
    completeness: Dict[str, Any]
    duplicates: List[Dict[str, Any]]
    summary_message: str

    # Status
    error: Optional[str]

