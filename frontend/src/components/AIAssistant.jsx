import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addMessage, 
  setIsProcessing, 
  setExtractionProgress, 
  resetProgress,
  setPasteModalOpen 
} from '../store/chatSlice';
import { populateFromAI } from '../store/complaintSlice';
import { processAIPrompt, uploadComplaintDocument } from '../services/api';
import { 
  Sparkles, 
  UploadCloud, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Loader2,
  Bot,
  User,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';

export default function AIAssistant() {
  const dispatch = useDispatch();
  const { messages, isProcessing, extractionProgress, extractionStatusMessage } = useSelector((state) => state.chat);
  const { form } = useSelector((state) => state.complaint);
  const { apiKey, selectedModel } = useSelector((state) => state.settings);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, extractionProgress]);

  const simulateProgress = async (onComplete) => {
    dispatch(setExtractionProgress({ progress: 15, message: 'Parsing document structure & raw text...' }));
    await new Promise((r) => setTimeout(r, 400));
    dispatch(setExtractionProgress({ progress: 45, message: 'Extracting pharma attributes & batch telemetry...' }));
    await new Promise((r) => setTimeout(r, 450));
    dispatch(setExtractionProgress({ progress: 80, message: 'Evaluating ICH Q9 risk, severity & CAPA...' }));
    await new Promise((r) => setTimeout(r, 350));
    dispatch(setExtractionProgress({ progress: 100, message: 'Populating QMS Complaint form...' }));
    await new Promise((r) => setTimeout(r, 300));
    onComplete();
  };

  const handleSendPrompt = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isProcessing) return;

    // Add user message to thread
    dispatch(addMessage({
      sender: 'user',
      text: prompt,
    }));
    setInputPrompt('');
    dispatch(setIsProcessing(true));

    try {
      await simulateProgress(async () => {
        const response = await processAIPrompt({
          prompt,
          currentFormData: form,
          conversationHistory: messages.map(m => ({ role: m.sender, content: m.text })),
          apiKey,
          model: selectedModel
        });

        // Update Redux state with extracted/edited fields
        dispatch(populateFromAI({
          form_data: response.form_data,
          risk_assessment: response.risk_assessment,
          completeness: response.completeness,
          duplicates: response.duplicates,
          updated_fields: response.updated_fields
        }));

        // Add assistant response to thread
        dispatch(addMessage({
          sender: 'assistant',
          text: response.summary_message,
          tool_used: response.tool_used,
          updated_fields: response.updated_fields,
          risk_summary: response.risk_assessment
        }));

        dispatch(resetProgress());
        dispatch(setIsProcessing(false));
      });
    } catch (err) {
      dispatch(addMessage({
        sender: 'assistant',
        text: `Error processing request: ${err.message}. Please try again or check settings.`,
        is_error: true
      }));
      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    dispatch(addMessage({
      sender: 'user',
      text: `Uploaded complaint document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    }));

    dispatch(setIsProcessing(true));

    try {
      await simulateProgress(async () => {
        const response = await uploadComplaintDocument({
          file,
          apiKey,
          model: selectedModel
        });

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
          tool_used: 'document_extraction',
          updated_fields: response.updated_fields,
          risk_summary: response.risk_assessment
        }));

        dispatch(resetProgress());
        dispatch(setIsProcessing(false));
      });
    } catch (err) {
      dispatch(addMessage({
        sender: 'assistant',
        text: `Document processing failed: ${err.message}`,
        is_error: true
      }));
      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const quickPrompts = [
    {
      label: "Log: Discolored Paracetamol",
      text: "St. Jude Hospital reported Batch B24019 of Paracetamol 500mg tablets has brownish discoloration and black spots. Mfg Date: 2024-01-15, Exp: 2026-01-14. 120 bottles affected."
    },
    {
      label: "Edit: Change Batch & Qty",
      text: "Change the batch number to BN-98421 and quantity affected to 250 bottles. Also set severity to Critical."
    },
    {
      label: "Edit: Update Customer",
      text: "Update customer name to Mayo Clinic Central Pharmacy and complaint source to Clinical Ward."
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card flex flex-col h-full overflow-hidden">
      
      {/* Header matching screenshot with subtle palette */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80">
            <Sparkles className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              AI Complaint Intake Assistant
            </h2>
            <span className="text-[10px] text-slate-400 font-medium block">
              Autonomous QMS Co-Pilot • LangGraph Agentic
            </span>
          </div>
        </div>

        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70 uppercase">
          BETA
        </span>
      </div>

      {/* Upload Zone & Paste Trigger */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/40 space-y-2.5">
        
        {/* Dropzone Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-slate-800 bg-slate-100/60 scale-[0.99]' 
              : 'border-slate-300/80 hover:border-slate-400 hover:bg-white bg-slate-50/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".pdf,.docx,.txt,.eml"
            className="hidden"
          />
          <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-xs text-slate-700 font-medium">
            <span className="font-semibold text-slate-900 hover:underline">Drag & drop complaint document here</span> or click to browse
          </p>
        </div>

        {/* OR Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200/70 w-full" />
          <span className="bg-slate-50/90 px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
            OR
          </span>
        </div>

        {/* Paste Complaint Button */}
        <button
          type="button"
          onClick={() => dispatch(setPasteModalOpen(true))}
          className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Paste Complaint Text / Email</span>
        </button>

        {/* Supported Format Box matching screenshot */}
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-2.5 flex items-start gap-2 text-emerald-900 text-[11px] leading-tight">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Supported formats:</span> PDF, DOCX, TXT, EML<br />
            <span className="text-emerald-700 text-[10px]">Max file size: 10MB • Auto-extracts lot & customer telemetry</span>
          </div>
        </div>

      </div>

      {/* Extraction Progress Bar with Subtle Palette */}
      {isProcessing && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 tracking-wider uppercase mb-1">
            <span>EXTRACTION PROGRESS</span>
            <span>{extractionProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${extractionProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 font-medium flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-slate-700 shrink-0" />
            <span>{extractionStatusMessage || 'Analyzing document content and extracting key details...'}</span>
          </p>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/20">
        
        <div className="text-[10px] font-bold tracking-wider text-slate-300 uppercase text-center my-0.5">
          AI ASSISTANT
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs text-[10px] font-bold ${
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-slate-900'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-xs'
                  : msg.is_error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
              }`}
            >
              {/* Tool badge if present */}
              {msg.tool_used && (
                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {msg.tool_used === 'log_complaint' && 'Tool 1: Log Complaint'}
                    {msg.tool_used === 'edit_complaint' && 'Tool 2: Edit Complaint'}
                    {msg.tool_used === 'document_extraction' && 'Tool 3: Document Extraction'}
                    {msg.tool_used === 'system' && 'AIVOA Intake Bot'}
                  </span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Updated fields pill tags */}
              {msg.updated_fields && Object.keys(msg.updated_fields).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                    Updated QMS Fields:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(msg.updated_fields).map(([k, v]) => (
                      <span
                        key={k}
                        className="bg-emerald-50 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded border border-emerald-200/70"
                      >
                        {k}: {String(v).slice(0, 20)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk snapshot in assistant message */}
              {msg.risk_summary && (
                <div className="mt-2.5 p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-lg text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700">Triage Risk:</span>
                    <span className={msg.risk_summary.severity === 'Critical' ? 'text-rose-700 font-bold' : 'text-amber-700 font-bold'}>
                      {msg.risk_summary.severity} Severity ({msg.risk_summary.priority} Priority)
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] line-clamp-2">
                    {msg.risk_summary.regulatory_impact}
                  </p>
                </div>
              )}

              <span className="text-[9px] text-slate-300 block text-right mt-1.5">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-4 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendPrompt(qp.text)}
            className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded px-2.5 py-0.5 font-medium transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box matching screenshot */}
      <div className="p-3 border-t border-slate-200/80 bg-white space-y-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Ask me anything about this complaint..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-200/90 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 disabled:bg-slate-50 text-slate-800 placeholder:text-slate-400 bg-slate-50/20 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:bg-black disabled:opacity-40 transition-colors shadow-xs shrink-0"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>AI responses may contain errors. Verify with QA protocol.</span>
          <span className="hidden sm:inline flex items-center gap-0.5">
            Press <CornerDownLeft className="w-2.5 h-2.5 inline" /> to send
          </span>
        </div>
      </div>

    </div>
  );
}
