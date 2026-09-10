import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.complaint import Complaint, AuditLog
from backend.schemas.complaint import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/api/complaints", tags=["Complaints Registry"])

def generate_complaint_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Complaint).count() + 1
    return f"CC-{year}-{count:04d}"

@router.post("", response_model=ComplaintResponse)
def create_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    comp_number = generate_complaint_number(db)
    
    complaint = Complaint(
        complaint_number=comp_number,
        status=data.status or "Pending Triage",
        complaint_source=data.complaint_source,
        customer_name=data.customer_name,
        product_name=data.product_name,
        product_strength=data.product_strength,
        batch_number=data.batch_number,
        manufacturing_date=data.manufacturing_date,
        expiry_date=data.expiry_date,
        quantity_affected=data.quantity_affected,
        quantity_unit=data.quantity_unit or "kg",
        complaint_type=data.complaint_type,
        complaint_date=data.complaint_date or datetime.utcnow().strftime("%Y-%m-%d"),
        description=data.description,
        initial_severity=data.initial_severity or "Major",
        priority=data.priority or "Medium",
        ai_risk_assessment=data.ai_risk_assessment,
        completeness_score=data.completeness_score or 85
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Add audit log
    audit = AuditLog(
        complaint_id=complaint.id,
        action="LOGGED_VIA_CO_PILOT",
        changed_fields=data.model_dump(exclude={"ai_risk_assessment"}),
        performed_by="AIVOA Co-Pilot Intake Agent"
    )
    db.add(audit)
    db.commit()

    return complaint


@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    status: Optional[str] = None,
    product: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if product:
        query = query.filter(Complaint.product_name.ilike(f"%{product}%"))
    if severity:
        query = query.filter(Complaint.initial_severity == severity)
    return query.order_by(Complaint.created_at.desc()).all()


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp


@router.patch("/{complaint_id}/status")
def update_status(complaint_id: int, status: str, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comp.status = status
    db.commit()
    return {"status": "success", "new_status": status}


@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(comp)
    db.commit()
    return {"status": "deleted"}
