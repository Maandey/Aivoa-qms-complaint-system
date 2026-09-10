import os
import io
import email
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pypdf import PdfReader
from typing import Optional
from backend.schemas.complaint import AIProcessRequest, AIProcessResponse, ComplaintFormData, RiskAssessmentData, CompletenessData, DuplicateWarning
from backend.agents.graph import complaint_agent_app

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extracts raw text from PDF, EML, TXT, DOCX."""
    ext = os.path.splitext(filename)[1].lower()
    text = ""

    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    elif ext == ".eml":
        msg = email.message_from_bytes(file_bytes)
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body += part.get_payload(decode=True).decode(errors="replace") + "\n"
        else:
            body = msg.get_payload(decode=True).decode(errors="replace")
        text = f"Subject: {msg.get('Subject', '')}\nFrom: {msg.get('From', '')}\nDate: {msg.get('Date', '')}\n\n{body}"
    elif ext in [".txt", ".log", ".csv"]:
        text = file_bytes.decode(errors="replace")
    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
        except Exception:
            text = file_bytes.decode(errors="replace")
    else:
        text = file_bytes.decode(errors="replace")

    return text.strip()


@router.post("/process", response_model=AIProcessResponse)
async def process_prompt(request: AIProcessRequest):
    """Processes natural language prompt to log or edit complaint via LangGraph."""
    try:
        initial_state = {
            "prompt": request.prompt,
            "current_form_data": request.current_form_data or {},
            "conversation_history": request.conversation_history or [],
            "api_key": request.api_key,
            "model_name": request.model or "gemma2-9b-it",
            "intent": "",
            "raw_document_text": None,
            "extracted_fields": {},
            "updated_fields": {},
            "risk_assessment": {},
            "completeness": {},
            "duplicates": [],
            "summary_message": "",
            "error": None
        }

        result = complaint_agent_app.invoke(initial_state)

        return AIProcessResponse(
            success=True,
            tool_used=result.get("intent", "log_complaint"),
            summary_message=result.get("summary_message", "Complaint processed successfully."),
            updated_fields=result.get("updated_fields", {}),
            form_data=ComplaintFormData(**result.get("current_form_data", {})),
            risk_assessment=RiskAssessmentData(**result.get("risk_assessment", {})),
            completeness=CompletenessData(**result.get("completeness", {})),
            duplicates=[DuplicateWarning(**d) for d in result.get("duplicates", [])]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent workflow error: {str(e)}")


@router.post("/upload", response_model=AIProcessResponse)
async def upload_document(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    model: Optional[str] = Form("gemma2-9b-it")
):
    """Handles file uploads (PDF, EML, TXT, DOCX) and executes DocumentExtractionTool via LangGraph."""
    try:
        content = await file.read()
        extracted_text = extract_text_from_file(content, file.filename)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="Could not extract readable text from document.")

        initial_state = {
            "prompt": file.filename,
            "current_form_data": {},
            "conversation_history": [],
            "api_key": api_key,
            "model_name": model or "gemma2-9b-it",
            "intent": "document_extraction",
            "raw_document_text": extracted_text,
            "extracted_fields": {},
            "updated_fields": {},
            "risk_assessment": {},
            "completeness": {},
            "duplicates": [],
            "summary_message": "",
            "error": None
        }

        result = complaint_agent_app.invoke(initial_state)

        return AIProcessResponse(
            success=True,
            tool_used="document_extraction",
            summary_message=result.get("summary_message", f"Extracted details from {file.filename}."),
            updated_fields=result.get("updated_fields", {}),
            form_data=ComplaintFormData(**result.get("current_form_data", {})),
            risk_assessment=RiskAssessmentData(**result.get("risk_assessment", {})),
            completeness=CompletenessData(**result.get("completeness", {})),
            duplicates=[DuplicateWarning(**d) for d in result.get("duplicates", [])]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")


@router.get("/samples")
async def list_sample_documents():
    """Returns metadata and text previews of preloaded realistic pharma complaint files."""
    samples_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")
    
    samples = [
        {
            "id": "paracetamol_pdf",
            "filename": "sample_complaint_paracetamol.pdf",
            "title": "Hospital Complaint: Discolored Paracetamol 500mg (PDF)",
            "type": "Finished Dosage Form (FDF) - Hospital Pharmacy",
            "description": "Hospital nurse complaint for brown discoloration and black spots in batch B24019.",
            "download_url": "/api/ai/samples/download/sample_complaint_paracetamol.pdf"
        },
        {
            "id": "atorvastatin_eml",
            "filename": "sample_complaint_atorvastatin.eml",
            "title": "Formulator Email: Atorvastatin API Residual Solvents OOS (EML)",
            "type": "Active Pharmaceutical Ingredient (API) - Raw Material",
            "description": "Customer incoming QC lab email regarding Methanol solvent OOS at 3,850 ppm.",
            "download_url": "/api/ai/samples/download/sample_complaint_atorvastatin.eml"
        },
        {
            "id": "amoxicillin_txt",
            "filename": "sample_complaint_amoxicillin.txt",
            "title": "Retail Note: Amoxicillin Suspension Severe Caking (TXT)",
            "type": "Finished Dosage Form (FDF) - Reconstitution Defect",
            "description": "Retail pharmacy chain report on caking and gritty agglomerates in batch AMX-8921.",
            "download_url": "/api/ai/samples/download/sample_complaint_amoxicillin.txt"
        }
    ]
    return samples


@router.get("/samples/download/{filename}")
async def download_sample(filename: str):
    """Downloads sample document file."""
    samples_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")
    file_path = os.path.join(samples_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample file not found")
    return FileResponse(file_path, filename=filename)

