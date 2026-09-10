#!/usr/bin/env bash
# ==============================================================================
# AIVOA - AI-Powered Customer Complaint Management System
# 1-Click Startup Script for Backend (FastAPI + LangGraph) & Frontend (React + Redux)
# ==============================================================================

set -e

# Change to project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo " Starting AIVOA QMS AI Customer Complaint System"
echo "============================================================"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r backend/requirements.txt
fi

# Ensure sample documents are generated
echo "Checking sample test documents..."
./venv/bin/python backend/samples/generate_samples.py

# Check frontend node_modules
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "------------------------------------------------------------"
echo "Starting Backend Server (FastAPI + LangGraph) on Port 8000..."
PYTHONPATH=. ./venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Frontend Server (React + Redux + Vite) on Port 5173..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "============================================================"
echo " System Ready!"
echo " Frontend UI: http://localhost:5173"
echo " Backend API: http://localhost:8000"
echo " API Docs:    http://localhost:8000/docs"
echo "============================================================"
echo "Press Ctrl+C to stop both servers."

wait
