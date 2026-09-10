from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(50), default="Pending Triage", nullable=False)

    # 1. Origin & Customer Details
    complaint_source = Column(String(100), nullable=True)
    customer_name = Column(String(200), nullable=True)

    # 2. Product & Batch Identification
    product_name = Column(String(200), nullable=True)
    product_strength = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True, index=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    quantity_affected = Column(String(50), nullable=True)
    quantity_unit = Column(String(50), default="kg", nullable=True)

    # 3. Complaint Details
    complaint_type = Column(String(100), nullable=True)
    complaint_date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    # 4. Initial Assessment & Priority
    initial_severity = Column(String(50), default="Major", nullable=True)
    priority = Column(String(50), default="Medium", nullable=True)

    # AI Risk & Intelligence JSON payload
    ai_risk_assessment = Column(JSON, nullable=True)
    completeness_score = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")


class RiskAssessmentRecord(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    severity_level = Column(String(50))
    priority_level = Column(String(50))
    patient_risk_summary = Column(Text)
    regulatory_impact_flag = Column(String(100)) # e.g. "FDA 21 CFR 211.198 - 3-Day Alert Required"
    containment_actions = Column(JSON) # List of actions
    root_cause_categories = Column(JSON) # Ishikawa categories (Material, Machine, Method, Man, Environment)
    capa_recommendations = Column(JSON) # Action plans
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "AI_LOGGED", "AI_MODIFIED", "MANUAL_SAVE"
    changed_fields = Column(JSON, nullable=True)
    performed_by = Column(String(100), default="AIVOA Co-Pilot")
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")

