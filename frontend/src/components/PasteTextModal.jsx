import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setPasteModalOpen, 
  addMessage, 
  setIsProcessing, 
  setExtractionProgress, 
  resetProgress 
} from '../store/chatSlice';
import { populateFromAI } from '../store/complaintSlice';
import { processAIPrompt } from '../services/api';
import { X, FileText, Sparkles, Send } from 'lucide-react';

const PRELOADED_TEMPLATES = [
  {
    title: "Scenario 1: Discolored Paracetamol Tablets (FDF)",
    preview: "St. Jude Hospital ward nurses reported black spots & brown discoloration...",
    text: `From: "St. Jude Memorial Hospital - Inpatient Pharmacy" <pharmacy@stjude-health.org>
Date: 2024-05-10
Subject: Customer Complaint: Batch B24019 Paracetamol 500mg Tablets Discoloration

We are filing an urgent complaint regarding Paracetamol Tablets 500 mg, Batch B24019, Mfg Date 2024-01-15, Exp Date 2026-01-14. 
During morning rounds on May 10, 2024, our staff identified dark brown discoloration and small embedded black spots on tablets across 120 sealed HDPE bottles. 
Dispensing has been suspended. Please quarantine retain samples and issue replacement stock immediately.`
  },
  {
    title: "Scenario 2: Atorvastatin API Residual Solvents OOS (API)",
    preview: "Novartis formulation plant incoming QC detected 3,850 ppm Methanol...",
    text: `URGENT API QUALITY COMPLAINT
Customer Name: Novartis Formulations Dublin Plant
Complaint Source: Customer Quality Control Incoming Laboratory
Product Name: Atorvastatin Calcium API
Product Strength/Grade: 99.8% Purity (USP Grade)
Batch Number: ATV-2024-001
Manufacturing Date: 2024-02-10
Expiry Date: 2027-02-09
Quantity Affected: 50 kg (2 fiber drums)
Complaint Date: 2024-06-12
Complaint Type: Chemical / Out of Specification (OOS) Residual Solvents
Initial Severity: Critical

GC headspace analysis detected Methanol at 3,850 ppm, exceeding the ICH Q3C limit of 3,000 ppm. Material is quarantined.`
  },
  {
    title: "Scenario 3: Amoxicillin Suspension Caking & Clumping (FDF)",
    preview: "Apollo Pharmacy retail network reported severe caking in Batch AMX-8921...",
    text: `Complaint Source: Retail Pharmacy Chain Logistics
Customer Name: Apollo Pharmacy Central Distribution Center
Complaint Date: 2024-07-04
Product Name: Amoxicillin Oral Suspension
Product Strength: 250 mg / 5 mL
Batch/Lot Number: AMX-8921
Mfg Date: 2024-03-01
Expiry Date: 2025-08-31
Quantity Affected: 500 packs
Complaint Type: Physical Defect / Inadequate Re-suspendability & Severe Caking

Bottles exhibit hard sediment caking at the base that fails to disperse upon reconstitution, creating risk of dose heterogeneity.`
  }
];

export default function PasteTextModal() {
  const dispatch = useDispatch();
  const { isPasteModalOpen } = useSelector((state) => state.chat);
  const { form } = useSelector((state) => state.complaint);
  const { apiKey, selectedModel } = useSelector((state) => state.settings);

  const [pastedText, setPastedText] = useState('');

  if (!isPasteModalOpen) return null;

  const handleExtract = async (textToUse) => {
    const text = (textToUse || pastedText).trim();
    if (!text) return;

    dispatch(setPasteModalOpen(false));
    dispatch(addMessage({
      sender: 'user',
      text: `Pasted Complaint Content:\n${text.slice(0, 150)}...`
    }));

    dispatch(setIsProcessing(true));
    dispatch(setExtractionProgress({ progress: 20, message: 'Parsing complaint text...' }));

    try {
      await new Promise(r => setTimeout(r, 400));
      dispatch(setExtractionProgress({ progress: 60, message: 'Extracting pharma attributes & risk...' }));

      const response = await processAIPrompt({
        prompt: text,
        currentFormData: form,
        conversationHistory: [],
        apiKey,
        model: selectedModel
      });

      dispatch(setExtractionProgress({ progress: 100, message: 'Form populated!' }));

      dispatch(populateFromAI({
        form_data: response.form_data,
        risk_assessment: response.risk_assessment,
        completeness: response.completeness,
        duplicates: response.duplicates,
        updated_fields: response.updated_fields
      }));

      dispatch(addMessage({
        sender: 'assistant',
        text: response.summary_message,
        tool_used: response.tool_used || 'document_extraction',
        updated_fields: response.updated_fields,
        risk_summary: response.risk_assessment
      }));

      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    } catch (err) {
      dispatch(addMessage({
        sender: 'assistant',
        text: `Extraction error: ${err.message}`,
        is_error: true
      }));
      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Paste Complaint Text / Email
              </h3>
              <p className="text-xs text-slate-500">
                Paste raw complaint emails, faxes, or choose a realistic scenario
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setPasteModalOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Quick Scenario Templates */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1-Click Realistic Pharma Scenarios
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRELOADED_TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => handleExtract(tpl.text)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Run Demo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {tpl.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
              OR Custom Paste
            </span>
          </div>

          <div>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw email header and body, customer service phone log, or QA inspection notes here..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none font-mono text-slate-800 bg-slate-50/30"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => dispatch(setPasteModalOpen(false))}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!pastedText.trim()}
            onClick={() => handleExtract()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extract with AI</span>
          </button>
        </div>

      </div>
    </div>
  );
}
