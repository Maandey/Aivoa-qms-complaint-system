import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes.ai import router as ai_router
from backend.routes.complaints import router as complaints_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIVOA QMS Customer Complaint Management API",
    description="AI-Powered QMS Complaint Intake & Triage Assistant for Pharma Manufacturing (API & FDF)",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(ai_router)
app.include_router(complaints_router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "AIVOA QMS AI Copilot",
        "module": "API & FDF Quality Assurance Customer Complaints",
        "regulations": ["FDA 21 CFR 211.198", "EU GMP Chapter 8", "ICH Q9/Q10"]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
