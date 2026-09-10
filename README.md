# AIVOA – AI-Powered Customer Complaint Management System
### API & FDF Quality Assurance Module | Pharmaceutical Manufacturing QMS

An enterprise-grade, AI-powered Customer Complaint Management System engineered for pharmaceutical manufacturers producing **Active Pharmaceutical Ingredients (API)** and **Finished Dosage Forms (FDF)**.

Built for the **AIVOA Round 1 AI Product Engineer** technical assignment according to the provided reference UI screenshot and video workflow specification.

---

## System Architecture

```
                                  USER INTERFACE (React + Redux)
     ┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
     │         Log Customer Complaint Form           │          AI Complaint Intake Assistant        │
     │  - Origin & Customer Details (1)              │  - Drag & Drop Document (PDF, EML, TXT, DOCX) │
     │  - Product & Batch Identification (2)         │  - Paste Raw Complaint / Email Modal          │
     │  - Complaint Details (3)                      │  - Dynamic Extraction Progress Bar            │
     │  - Initial Assessment & Priority (4)          │  - Interactive Conversational Thread          │
     │  - AI Risk & HRA / Ishikawa / CAPA Tabs       │  - Natural Language Edit / Modify             │
     └───────────────────────────────────────────────┴───────────────────────────────────────────────┘
                                                     ▲
                                                     │ Redux Store (complaintSlice, chatSlice)
                                                     ▼
                                        BACKEND REST API (FastAPI)
                       POST /api/ai/process  |  POST /api/ai/upload  |  /api/complaints
                                                     │
                                                     ▼
                                           LANGGRAPH WORKFLOW
                                     ┌───────────────────────────────┐
                                     │     Intent Router / Triage    │
                                     └───────────────┬───────────────┘
                                                     │
                     ┌───────────────────────────────┼───────────────────────────────┐
                     ▼                               ▼                               ▼
     ┌───────────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────────┐
     │    1. Log Complaint Tool      │ │   2. Edit Complaint Tool  │ │ 3. Document Extraction Tool   │
     │ - Natural language extraction │ │ - Targeted field updates  │ │ - Multi-format text parsing   │
     │ - Initial risk & triage       │ │ - Strict field preservation│ - Batch & defect mapping       │
     └───────────────┬───────────────┘ └─────────────┬─────────────┘ └───────────────┬───────────────┘
                     │                               │                               │
                     └───────────────────────────────┼───────────────────────────────┘
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │      QA Risk Assessment       │
                                     │ - ICH Q9 Health Hazard (HHE)  │
                                     │ - FDA 21 CFR 211.198 Impact   │
                                     │ - Immediate Containment Plan  │
                                     │ - Ishikawa 5M+E Root Cause    │
                                     │ - CAPA Action Plan Generator  │
                                     │ - GMP Completeness Checker    │
                                     └───────────────┬───────────────┘
                                                     │
                                                     ▼
                                   ┌───────────────────────────────────┐
                                   │ LLM: Groq (gemma2-9b-it / Llama)  │
                                   │ Database: SQLite / Postgres / DB  │
                                   └───────────────────────────────────┘
```

---

## Key Features & The 3 AI Tools

### 1. Tool 1: Log Complaint Tool
- Extracts pharma-specific attributes from free-form natural language prompts:
  - **Origin**: Complaint Source, Customer Name
  - **Product Traceability**: Product Name, Strength/Grade, Batch/Lot Number, Manufacturing Date, Expiry Date, Quantity Affected & Units (kg, bottles, packs, vials)
  - **Defect Description**: Complaint Type, Complaint Date, Detailed Technical Narrative
- Automatically initiates **ICH Q9 Quality Risk Assessment**:
  - Classifies severity (`Critical`, `Major`, `Minor`) and priority (`High`, `Medium`, `Low`).
  - Proposes immediate containment actions (e.g. quarantine retain samples, warehouse distribution hold).

### 2. Tool 2: Edit Complaint Tool
- Enables conversational editing of existing complaints via natural language (e.g. *"Change batch number to BN-98421 and quantity to 250 bottles, and escalate severity to Critical"*).
- **Strict Data Preservation**: Selectively updates only the targeted fields while keeping all other fields completely intact.
- Re-evaluates risk assessment, patient hazard, and CAPA recommendations based on the modified data.

### 3. Tool 3: Document Extraction Tool
- Ingests uploaded pharmaceutical complaint documents:
  - **PDF documents** (e.g., official hospital defect reports, quality notification letters)
  - **EML email files** (e.g., incoming client QA emails, RFC 822 format)
  - **TXT / DOCX files** (e.g., intake memos, call logs)
- Parses raw text, maps attributes into the QMS schema, renders animated extraction progress, and populates the form and risk copilot.

---

## 🌟 Bonus Features (Enterprise QMS Enhancements)

1. **GMP Complaint Completeness Checker**:
   - Scores files from 0 to 100% against US FDA 21 CFR 211.198 mandatory complaint record requirements.
   - Identifies missing fields (e.g., missing lot number, dates, customer) and provides actionable recommendations.
2. **Preliminary Root Cause Analysis (Ishikawa 5M+E)**:
   - Categorizes potential root causes into: **Material**, **Machine**, **Method**, **Man**, and **Environment**.
3. **Automated CAPA Recommendation Engine**:
   - Generates specific Corrective and Preventive Actions with recommended owner department (`QC Lab`, `Engineering`, `QA Operations`) and target turnaround days (7, 14, 21 days).
4. **Duplicate & Recurring Complaint Detection**:
   - Cross-references incoming batch numbers against previous complaints to warn of recurring quality defects across lots.
5. **Electronic Complaint Registry & Audit Trail**:
   - Persistent database storage (SQLAlchemy ORM supporting SQLite, PostgreSQL, and MySQL).
   - Traceable complaint numbers (`CC-2024-0001`), status workflow (`Pending Triage` → `Under Investigation` → `CAPA Initiated` → `Closed`), and 1-click JSON export.
6. **Preloaded Realistic Pharma Test Documents**:
   - Built-in sample generator producing realistic PDF, EML, and TXT files for instant testing.

---

## Mandatory Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite | Modular component architecture matching reference UI |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) | Slices for `complaintSlice`, `chatSlice`, `settingsSlice` |
| **Styling & Typography** | Tailwind CSS v4, Google Inter Font | High-contrast enterprise QMS theme with custom scrollbars |
| **Icons** | Lucide React | Clean, domain-appropriate icons |
| **Backend** | Python 3.10+, FastAPI | High-performance asynchronous REST API |
| **Agent Framework** | LangGraph (`StateGraph`) | Multi-tool stateful workflow with conditional routing |
| **LLM Inference** | Groq API (`gemma2-9b-it`, `llama-3.3-70b-versatile`) | Fast inference + intelligent fallback engine for zero downtime |
| **Database** | SQLAlchemy (SQLite default / PostgreSQL / MySQL) | Full complaint registry with audit logs |

---

## ⚡ Quick Start Guide

### Option 1: 1-Click Startup Script (Recommended)

Simply run:
```bash
./run.sh
```
This script will:
1. Verify Python virtual environment and dependencies.
2. Automatically generate the realistic sample PDF, EML, and TXT test files.
3. Start the FastAPI backend on `http://localhost:8000`.
4. Start the React frontend on `http://localhost:5173`.

---

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Generate realistic test documents
python backend/samples/generate_samples.py

# Run backend server
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Running Automated Tests

Run the complete test suite:
```bash
PYTHONPATH=. ./venv/bin/pytest backend/tests/test_backend.py -v
```

All tests pass including:
- Health check endpoint
- Tool 1: Log Complaint Tool (entity extraction & risk derivation)
- Tool 2: Edit Complaint Tool (field modification & preservation verification)
- Tool 3: Document Extraction Tool (PDF ingestion & parsing)
- GMP Completeness Checker
- Complaints Database CRUD & Status transitions

## Pharmaceutical Regulatory Compliance Standards
This application incorporates key tenets of global pharmaceutical regulatory standards:
- **US FDA 21 CFR 211.198 (Complaint Files)**: Mandates written records of each complaint, evaluation of serious and unexpected defects, determination of whether an investigation is required, and documented follow-up.
- **EU GMP Guide Chapter 8 (Complaints and Product Recall)**: Triage principles, Quality Defect classification (Critical / Major / Other), and distribution restriction.
- **ICH Q9 (Quality Risk Management)**: Systematic risk evaluation of patient health hazard, root cause analysis (Ishikawa 5M+E), and risk-based decision making.
- **ICH Q10 (Pharmaceutical Quality System)**: CAPA methodology, continual quality improvement, and management review.

---

*Built with curiosity, robust software architecture, and product thinking for the AIVOA AI Product Engineer Internship.*

