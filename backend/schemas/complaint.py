from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ComplaintFormData(BaseModel):
    complaint_source: Optional[str] = ""
    customer_name: Optional[str] = ""
    product_name: Optional[str] = ""
    product_strength: Optional[str] = ""
    batch_number: Optional[str] = ""
    manufacturing_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    quantity_affected: Optional[str] = ""
    quantity_unit: Optional[str] = "kg"
    complaint_type: Optional[str] = ""
    complaint_date: Optional[str] = ""
    description: Optional[str] = ""
    initial_severity: Optional[str] = "Major"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending Triage"

class RiskAssessmentData(BaseModel):
    severity: str = "Major"
    priority: str = "Medium"
    patient_risk: str = "Potential clinical impact requiring QA retention sample analysis."
    regulatory_impact: str = "ICH Q9 / 21 CFR 211.198 Standard Complaint Evaluation."
    containment_actions: List[str] = Field(default_factory=list)
    root_cause_categories: Dict[str, List[str]] = Field(default_factory=dict)
    capa_recommendations: List[Dict[str, str]] = Field(default_factory=list)
    defect_classification: Optional[str] = "Critical Quality Attribute (CQA) Deviation"

class CompletenessData(BaseModel):
    score: int = 0
    missing_fields: List[str] = Field(default_factory=list)
    is_ready_for_gmp_submission: bool = False

class DuplicateWarning(BaseModel):
    complaint_number: str
    product_name: str
    batch_number: str
    similarity_reason: str

class AIProcessRequest(BaseModel):
    prompt: str
    current_form_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    api_key: Optional[str] = None
    model: Optional[str] = "gemma2-9b-it"

class AIProcessResponse(BaseModel):
    success: bool = True
    tool_used: str  # log_complaint, edit_complaint, document_extraction, chat
    summary_message: str
    updated_fields: Dict[str, Any] = Field(default_factory=dict)
    form_data: ComplaintFormData
    risk_assessment: RiskAssessmentData
    completeness: CompletenessData
    duplicates: List[DuplicateWarning] = Field(default_factory=list)

class ComplaintCreate(ComplaintFormData):
    ai_risk_assessment: Optional[Dict[str, Any]] = None
    completeness_score: Optional[int] = 0

class ComplaintResponse(ComplaintCreate):
    id: int
    complaint_number: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
