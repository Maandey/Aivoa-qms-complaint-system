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
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { selectedModel, apiKey } = useSelector((state) => state.settings);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Module */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs text-white">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                AIVOA <span className="text-slate-600 font-semibold text-xs tracking-normal">QMS Copilot</span>
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                API & FDF Module
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Pharmaceutical Quality Assurance Complaint Intake
            </p>
          </div>
        </div>

        {/* Center: Personalized QA Inspector Profile & Telemetry */}
        <div className="hidden lg:flex items-center space-x-3.5">
          
          {/* Personalized QA Officer Avatar */}
          <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 rounded-lg shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-blue-500/20">
              AM
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800">Anubhav Maandey</span>
                <span className="text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded">
                  Lead QA
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
                Manufacturing Site #04 • Shift A
              </span>
            </div>
          </div>

          {/* Active Model Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200/70 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 text-[11px]">Model:</span>
            <span className="font-semibold text-slate-800 text-[11px] font-mono">{selectedModel}</span>
            {apiKey ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="Groq API Key Active" />
            ) : (
              <span className="bg-slate-200/70 text-slate-700 text-[9px] px-1.5 py-0.2 rounded font-medium">
                Autonomous
              </span>
            )}
          </div>

          {/* Regulatory Tag */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs bg-slate-50/80 border border-slate-200/70 px-2.5 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium text-slate-700">FDA 21 CFR 211.198</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch(setSampleDocsOpen(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Documents</span>
          </button>

          <button
            onClick={() => dispatch(setRegistryOpen(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Complaint Registry</span>
          </button>

          <button
            onClick={() => dispatch(setSettingsOpen(true))}
            className="p-2 text-slate-500 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs"
            title="Configure Groq API Key & Models"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
