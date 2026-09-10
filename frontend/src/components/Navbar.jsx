import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRegistryOpen, 
  setSettingsOpen, 
  setSampleDocsOpen 
} from '../store/chatSlice';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Database, 
  Settings, 
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { selectedModel, apiKey } = useSelector((state) => state.settings);
  const { form, completeness } = useSelector((state) => state.complaint);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Module */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                AIVOA <span className="text-blue-600 font-semibold text-sm">QMS Copilot</span>
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
                Pharma QA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              API & FDF Customer Complaint Management System
            </p>
          </div>
        </div>

        {/* Center: Active Model & Regulatory Compliance Badge */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-md font-medium">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>LLM:</span>
            <span className="font-semibold text-slate-900">{selectedModel}</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" title="Groq API Key Active" />
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-normal">
                Autonomous Fallback
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>FDA 21 CFR 211.198</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => dispatch(setSampleDocsOpen(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Sample Documents</span>
          </button>

          <button
            onClick={() => dispatch(setRegistryOpen(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Complaint Registry</span>
          </button>

          <button
            onClick={() => dispatch(setSettingsOpen(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            title="Configure Groq API Key & Models"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
}
