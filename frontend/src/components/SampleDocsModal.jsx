import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSampleDocsOpen, 
  addMessage, 
  setIsProcessing, 
  setExtractionProgress, 
  resetProgress 
} from '../store/chatSlice';
import { populateFromAI } from '../store/complaintSlice';
import { getSampleDocuments, uploadComplaintDocument } from '../services/api';
import { X, FileText, Download, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function SampleDocsModal() {
  const dispatch = useDispatch();
  const { isSampleDocsOpen } = useSelector((state) => state.chat);
  const { apiKey, selectedModel } = useSelector((state) => state.settings);

  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractingId, setExtractingId] = useState(null);

  useEffect(() => {
    if (isSampleDocsOpen) {
      setLoading(true);
      getSampleDocuments()
        .then((data) => setSamples(data))
        .catch((err) => console.error('Failed to load samples', err))
        .finally(() => setLoading(false));
    }
  }, [isSampleDocsOpen]);

  if (!isSampleDocsOpen) return null;

  const handleRunSample = async (sample) => {
    setExtractingId(sample.id);
    dispatch(setSampleDocsOpen(false));

    dispatch(addMessage({
      sender: 'user',
      text: `Testing with preloaded sample file: ${sample.filename}`
    }));

    dispatch(setIsProcessing(true));
    dispatch(setExtractionProgress({ progress: 20, message: `Downloading and reading ${sample.filename}...` }));

    try {
      // Fetch file blob from backend
      const response = await fetch(`http://localhost:8000${sample.download_url}`);
      const blob = await response.blob();
      const file = new File([blob], sample.filename, { type: blob.type });

      dispatch(setExtractionProgress({ progress: 60, message: 'Extracting pharma attributes & risk...' }));

      const result = await uploadComplaintDocument({
        file,
        apiKey,
        model: selectedModel
      });

      dispatch(setExtractionProgress({ progress: 100, message: 'Populating QMS Complaint form...' }));

      dispatch(populateFromAI({
        form_data: result.form_data,
        risk_assessment: result.risk_assessment,
        completeness: result.completeness,
        duplicates: result.duplicates,
        updated_fields: result.updated_fields
      }));

      dispatch(addMessage({
        sender: 'assistant',
        text: result.summary_message,
        tool_used: 'document_extraction',
        updated_fields: result.updated_fields,
        risk_summary: result.risk_assessment
      }));

      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    } catch (err) {
      dispatch(addMessage({
        sender: 'assistant',
        text: `Failed to process sample document: ${err.message}`,
        is_error: true
      }));
      dispatch(resetProgress());
      dispatch(setIsProcessing(false));
    } finally {
      setExtractingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Preloaded Pharmaceutical Test Documents
              </h3>
              <p className="text-xs text-slate-500">
                Use for instant demonstration or download to test drag-and-drop
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setSampleDocsOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading sample files...</p>
            </div>
          ) : (
            samples.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{s.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {s.description}
                  </p>
                  <span className="font-mono text-[10px] text-slate-400 block">
                    File: {s.filename}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`http://localhost:8000${s.download_url}`}
                    download={s.filename}
                    className="p-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1"
                    title="Download file to test drag & drop"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => handleRunSample(s)}
                    disabled={extractingId === s.id}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    {extractingId === s.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Run Test</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Covers both API (Raw Bulk) and FDF (Finished Formulations)</span>
          <button
            type="button"
            onClick={() => dispatch(setSampleDocsOpen(false))}
            className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 rounded-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

