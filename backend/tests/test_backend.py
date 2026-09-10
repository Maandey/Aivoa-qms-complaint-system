import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.agents.tools import LogComplaintTool, EditComplaintTool
from backend.agents.fallback_engine import calculate_completeness

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AIVOA" in data["service"]

def test_tool_1_log_complaint():
    """Verify Tool 1: Log Complaint Tool extracts data from natural language."""
    prompt = (
        "St. Jude Memorial Hospital reported that Batch B24019 of Paracetamol 500mg tablets "
        "has dark brown discoloration and small black spots. Mfg Date: 2024-01-15, Exp Date: 2026-01-14. "
        "120 bottles affected. Complaint Date: 2024-05-10."
    )
    extracted, risk, summary = LogComplaintTool.run(prompt)
    
    assert "Paracetamol" in extracted["product_name"]
    assert extracted["batch_number"] == "B24019"
    assert extracted["quantity_affected"] == "120"
    assert risk["severity"] in ["Major", "Critical"]
    assert len(risk["containment_actions"]) > 0
    assert "B24019" in summary

def test_tool_2_edit_complaint():
    """Verify Tool 2: Edit Complaint Tool updates requested fields while strictly preserving existing ones."""
    initial_form = {
        "complaint_source": "Hospital Clinical Pharmacy",
        "customer_name": "St. Jude Memorial Hospital",
        "product_name": "Paracetamol Tablets",
        "product_strength": "500 mg",
        "batch_number": "B24019",
        "manufacturing_date": "2024-01-15",
        "expiry_date": "2026-01-14",
        "quantity_affected": "120",
        "quantity_unit": "bottles",
        "complaint_type": "Physical Defect / Discoloration",
        "complaint_date": "2024-05-10",
        "description": "Brownish discoloration observed on tablets.",
        "initial_severity": "Major",
        "priority": "High"
    }

    edit_prompt = "Change the batch number to BN-98421 and quantity affected to 500 bottles. Make priority Critical."
    merged, updated, risk, summary = EditComplaintTool.run(edit_prompt, initial_form)

    # Edited fields must be updated
    assert merged["batch_number"] == "BN-98421"
    assert merged["quantity_affected"] == "500"
    
    # Intact fields MUST be preserved
    assert merged["customer_name"] == "St. Jude Memorial Hospital"
    assert merged["product_name"] == "Paracetamol Tablets"
    assert merged["manufacturing_date"] == "2024-01-15"
    assert merged["expiry_date"] == "2026-01-14"
    assert merged["complaint_type"] == "Physical Defect / Discoloration"

def test_completeness_checker():
    """Verify GMP Completeness Checker score and missing fields."""
    partial_form = {
        "product_name": "Amoxicillin Oral Suspension",
        "batch_number": "AMX-8921"
    }
    res = calculate_completeness(partial_form)
    assert res["score"] < 50
    assert "Manufacturing Date" in res["missing_fields"]
    assert "Customer Name" in res["missing_fields"]
    assert res["is_ready_for_gmp_submission"] is False

def test_api_process_endpoint():
    """Verify the /api/ai/process endpoint invoking LangGraph."""
    payload = {
        "prompt": "Apollo Pharmacy reported severe caking in Amoxicillin Oral Suspension 250mg/5mL, Batch AMX-8921, 500 packs affected.",
        "current_form_data": {}
    }
    response = client.post("/api/ai/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Amoxicillin" in data["form_data"]["product_name"]
    assert data["form_data"]["batch_number"] == "AMX-8921"
    assert data["risk_assessment"]["severity"] in ["Major", "Critical"]

def test_complaints_crud():
    """Verify database persistence of logged complaints."""
    new_comp = {
        "complaint_source": "Hospital Clinical Pharmacy",
        "customer_name": "St. Jude Memorial Hospital",
        "product_name": "Paracetamol Tablets",
        "product_strength": "500 mg",
        "batch_number": "B24019",
        "manufacturing_date": "2024-01-15",
        "expiry_date": "2026-01-14",
        "quantity_affected": "120",
        "quantity_unit": "bottles",
        "complaint_type": "Physical Defect / Discoloration",
        "complaint_date": "2024-05-10",
        "description": "Brownish discoloration observed on tablets.",
        "initial_severity": "Major",
        "priority": "High",
        "status": "Pending Triage",
        "completeness_score": 100
    }
    res = client.post("/api/complaints", json=new_comp)
    assert res.status_code == 200
    created = res.json()
    assert "CC-" in created["complaint_number"]
    comp_id = created["id"]

    # List
    list_res = client.get("/api/complaints")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get single
    get_res = client.get(f"/api/complaints/{comp_id}")
    assert get_res.status_code == 200
    assert get_res.json()["batch_number"] == "B24019"

    # Patch status
    patch_res = client.patch(f"/api/complaints/{comp_id}/status?status=Under%20Investigation")
    assert patch_res.status_code == 200
    assert patch_res.json()["new_status"] == "Under Investigation"

def test_tool_3_document_upload():
    """Verify Tool 3: Document Extraction Tool extracts data from uploaded PDF."""
    import os
    sample_pdf_path = os.path.join(os.path.dirname(__file__), "..", "samples", "sample_complaint_paracetamol.pdf")
    assert os.path.exists(sample_pdf_path)

    with open(sample_pdf_path, "rb") as f:
        files = {"file": ("sample_complaint_paracetamol.pdf", f, "application/pdf")}
        response = client.post("/api/ai/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["tool_used"] == "document_extraction"
    assert "Paracetamol" in data["form_data"]["product_name"]
    assert data["form_data"]["batch_number"] == "B24019"
    assert data["form_data"]["quantity_affected"] == "120"

