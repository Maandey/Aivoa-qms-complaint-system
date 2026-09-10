import re
import json
import logging
from typing import Dict, Any, Tuple
from backend.agents.prompts import (
    LOG_COMPLAINT_EXTRACTION_PROMPT,
    EDIT_COMPLAINT_PROMPT,
    RISK_ASSESSMENT_PROMPT
)
from backend.agents.groq_client import call_groq_json
from backend.agents.fallback_engine import (
    extract_fallback_complaint,
    generate_fallback_risk,
    calculate_completeness
)

logger = logging.getLogger("aivoa.tools")

class LogComplaintTool:
    """Tool 1: Processes natural language prompt to extract details and populate the complaint form."""

    @staticmethod
    def run(prompt: str, api_key: str = None, model: str = "gemma2-9b-it") -> Tuple[Dict[str, Any], Dict[str, Any], str]:
        logger.info("Executing LogComplaintTool...")
        
        extracted_data = None
        if api_key:
            extracted_data = call_groq_json(
                prompt=f"Customer Complaint Input:\n{prompt}",
                system_instruction=LOG_COMPLAINT_EXTRACTION_PROMPT,
                model=model,
                api_key=api_key
            )

        if not extracted_data:
            extracted_data = extract_fallback_complaint(prompt)

        # Risk assessment
        risk_data = None
        if api_key:
            risk_data = call_groq_json(
                prompt=f"Complaint Details for Risk Assessment:\n{json.dumps(extracted_data, indent=2)}",
                system_instruction=RISK_ASSESSMENT_PROMPT,
                model=model,
                api_key=api_key
            )
        
        if not risk_data:
            risk_data = generate_fallback_risk(extracted_data)

        # Sync severity & priority
        if risk_data.get("severity"):
            extracted_data["initial_severity"] = risk_data["severity"]
        if risk_data.get("priority"):
            extracted_data["priority"] = risk_data["priority"]

        summary = (
            f"Successfully logged new complaint for **{extracted_data.get('product_name', 'Product')}** "
            f"(Batch: `{extracted_data.get('batch_number', 'N/A')}`). "
            f"Triage Severity evaluated as **{extracted_data.get('initial_severity', 'Major')}** with **{extracted_data.get('priority', 'Medium')}** Priority."
        )

        return extracted_data, risk_data, summary


class EditComplaintTool:
    """
    Tool 2: Modifies existing complaint fields via natural language without overwriting intact fields.
    
    Quality Engineering Decision (ALCOA+ Data Integrity):
    In pharmaceutical manufacturing QMS, accidental overwriting or erasure of unmentioned
    attributes during an edit violates FDA 21 CFR Part 11 / ALCOA+ data integrity principles.
    We enforce a non-destructive patch strategy where untouched fields are guaranteed immutable,
    and only explicitly targeted keys are modified.
    """

    @staticmethod
    def run(prompt: str, current_form: Dict[str, Any], api_key: str = None, model: str = "gemma2-9b-it") -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any], str]:
        logger.info("Executing EditComplaintTool...")

        updated_fields = {}
        explanation = ""

        if api_key:
            edit_res = call_groq_json(
                prompt=EDIT_COMPLAINT_PROMPT.format(
                    current_form_json=json.dumps(current_form, indent=2),
                    user_prompt=prompt
                ),
                system_instruction="You are a precise pharma QMS form editor. Return only updated fields.",
                model=model,
                api_key=api_key
            )
            if edit_res and "updated_fields" in edit_res:
                updated_fields = edit_res["updated_fields"]
                explanation = edit_res.get("explanation", "Fields updated via Groq AI.")

        # Fallback intelligent regex editor if Groq didn't update or no key
        if not updated_fields:
            temp_extracted = extract_fallback_complaint(prompt)
            lower_p = prompt.lower()

            standalone_batch = re.search(r'\b(B\d{4,6}|LOT-[A-Z0-9]+|BN-[A-Z0-9]+|BATCH-[A-Z0-9]+|[A-Z]{2,4}-\d{3,6}-[A-Z0-9]+)\b', prompt, re.IGNORECASE)
            if standalone_batch:
                updated_fields["batch_number"] = standalone_batch.group(1).strip()
            elif "batch" in lower_p or "lot" in lower_p:
                updated_fields["batch_number"] = temp_extracted["batch_number"]

            if "quantity" in lower_p or "qty" in lower_p or any(u in lower_p for u in ["kg", "bottles", "vials", "packs"]):
                updated_fields["quantity_affected"] = temp_extracted["quantity_affected"]
                updated_fields["quantity_unit"] = temp_extracted["quantity_unit"]
            if "product" in lower_p or "medicine" in lower_p:
                updated_fields["product_name"] = temp_extracted["product_name"]
            if "strength" in lower_p or "potency" in lower_p:
                updated_fields["product_strength"] = temp_extracted["product_strength"]
            if "customer" in lower_p or "hospital" in lower_p or "pharmacy" in lower_p:
                updated_fields["customer_name"] = temp_extracted["customer_name"]
            if "date" in lower_p:
                if "mfg" in lower_p or "manufacturing" in lower_p:
                    updated_fields["manufacturing_date"] = temp_extracted["manufacturing_date"]
                if "exp" in lower_p or "expiry" in lower_p:
                    updated_fields["expiry_date"] = temp_extracted["expiry_date"]
            if "severity" in lower_p or "critical" in lower_p or "major" in lower_p or "minor" in lower_p:
                if "critical" in lower_p: updated_fields["initial_severity"] = "Critical"
                elif "minor" in lower_p: updated_fields["initial_severity"] = "Minor"
                else: updated_fields["initial_severity"] = "Major"
            if "priority" in lower_p:
                if "critical" in lower_p or "high" in lower_p: updated_fields["priority"] = "High"
                elif "low" in lower_p: updated_fields["priority"] = "Low"
                else: updated_fields["priority"] = "Medium"
            elif "high" in lower_p or "low" in lower_p:
                if "high" in lower_p: updated_fields["priority"] = "High"
                elif "low" in lower_p: updated_fields["priority"] = "Low"

            # If still nothing matched, apply non-empty diff
            if not updated_fields:
                for k, v in temp_extracted.items():
                    if k in ["batch_number", "quantity_affected", "customer_name", "product_name"] and v and v != current_form.get(k):
                        updated_fields[k] = v

        # Apply updates onto copy of current form to guarantee intact fields are preserved
        merged_form = dict(current_form)
        for k, v in updated_fields.items():
            if v is not None and str(v).strip() != "":
                merged_form[k] = v

        # Re-evaluate Risk Assessment based on updated data
        risk_data = generate_fallback_risk(merged_form)
        if api_key:
            new_risk = call_groq_json(
                prompt=f"Re-evaluate Risk Assessment after updates:\n{json.dumps(merged_form, indent=2)}",
                system_instruction=RISK_ASSESSMENT_PROMPT,
                model=model,
                api_key=api_key
            )
            if new_risk:
                risk_data = new_risk

        field_list = ", ".join([f"`{k}`" for k in updated_fields.keys()]) or "requested attributes"
        summary = (
            f"Updated {field_list} while preserving existing complaint data. "
            f"Risk assessment re-calculated: **{risk_data.get('severity')}** severity, **{risk_data.get('priority')}** priority."
        )

        return merged_form, updated_fields, risk_data, summary


class DocumentExtractionTool:
    """Tool 3: Extracts text from uploaded files (PDF, EML, TXT, DOCX) and populates the complaint form and risk assessment."""

    @staticmethod
    def run(document_text: str, filename: str = "", api_key: str = None, model: str = "gemma2-9b-it") -> Tuple[Dict[str, Any], Dict[str, Any], str]:
        logger.info(f"Executing DocumentExtractionTool for file '{filename}'...")
        
        # We reuse the extraction and risk pipeline with specific document context
        extracted_data, risk_data, _ = LogComplaintTool.run(
            prompt=f"DOCUMENT SOURCE: {filename}\nDOCUMENT CONTENT:\n{document_text}",
            api_key=api_key,
            model=model
        )

        summary = (
            f"Document **{filename}** successfully parsed and analyzed. "
            f"Extracted **{extracted_data.get('product_name')}** (Batch `{extracted_data.get('batch_number')}`) "
            f"with **{len(extracted_data)}** attributes mapped to the QMS Complaint Form."
        )

        return extracted_data, risk_data, summary
