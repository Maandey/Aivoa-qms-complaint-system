import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSettingsOpen } from '../store/chatSlice';
import { setApiKey, setSelectedModel } from '../store/settingsSlice';
import { X, Settings, Key, Cpu, CheckCircle2, ExternalLink } from 'lucide-react';

export default function SettingsModal() {
  const dispatch = useDispatch();
  const { isSettingsOpen } = useSelector((state) => state.chat);
  const { apiKey, selectedModel } = useSelector((state) => state.settings);

  const [inputKey, setInputKey] = useState(apiKey);
  const [model, setModel] = useState(selectedModel);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    dispatch(setApiKey(inputKey.trim()));
    dispatch(setSelectedModel(model));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      dispatch(setSettingsOpen(false));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Engine & LLM Settings
              </h3>
              <p className="text-xs text-slate-500">
                Groq API & Model Configuration
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setSettingsOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Groq API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Groq API Key</span>
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Get API Token</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none font-mono text-slate-800"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: If left blank, the system automatically uses the intelligent autonomous QMS fallback engine for smooth offline demoing.
            </p>
          </div>

          {/* Model Selector per Assignment Mandate */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mandatory Groq Model</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-slate-800 bg-white"
            >
              <option value="gemma2-9b-it">gemma2-9b-it (Mandatory Assignment Model)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Context Model)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
            </select>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved successfully!</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => dispatch(setSettingsOpen(false))}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}

