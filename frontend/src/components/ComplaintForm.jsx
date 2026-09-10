import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateFormField, 
  resetForm, 
  setLastSavedComplaint,
  clearHighlights 
} from '../store/complaintSlice';
import { clearChat } from '../store/chatSlice';
import { saveComplaint } from '../services/api';
import { 
  RotateCcw, 
  Save, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Info,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import RiskAssessmentView from './RiskAssessmentView';
import CompletenessView from './CompletenessView';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const { form, riskAssessment, completeness, duplicates, highlightedFields, isDirty } = useSelector(
    (state) => state.complaint
  );
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'risk' | 'completeness'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleCopy = (field, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(field);
    setTimeout(() => setCopiedKey(''), 1500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields on this complaint form?')) {
      dispatch(resetForm());
      dispatch(clearChat());
      setSaveSuccessMessage('');
      setErrorMessage('');
    }
  };

  const handleSave = async () => {
    if (!form.product_name && !form.batch_number && !form.description) {
      alert('Cannot save an empty complaint. Please extract data via AI Co-Pilot first.');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        ...form,
        ai_risk_assessment: riskAssessment,
        completeness_score: completeness?.score || 85,
        status: form.status || 'Pending Triage'
      };

      const saved = await saveComplaint(payload);
      dispatch(setLastSavedComplaint(saved));
      setSaveSuccessMessage(`Complaint logged successfully as ${saved.complaint_number}! Stored in QMS Database.`);
      setTimeout(() => setSaveSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save complaint');
    } finally {
      setIsSaving(false);
    }
  };

  const isFieldHighlighted = (field) => highlightedFields.includes(field);

  const getFieldClass = (field) => {
    const base = "w-full text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all duration-200 outline-none";
    if (isFieldHighlighted(field)) {
      return `${base} border-emerald-500/80 bg-emerald-50/40 text-slate-900 ring-2 ring-emerald-500/10 animate-subtle-fade`;
    }
    return `${base} border-slate-200/90 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 hover:border-slate-300`;
  };

  const hasData = Boolean(form.batch_number || form.product_name);
  const currentStep = hasData ? (riskAssessment ? 2 : 1) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card flex flex-col h-full overflow-hidden">
      
      {/* Form Card Header with Subtle Palette */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Log Customer Complaint
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Form 211-A
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            API & FDF Quality Assurance Module • US FDA 21 CFR 211.198
          </p>
        </div>

        {/* Status Pill & Compliance Tag */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>ALCOA+ Traceable</span>
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            {form.status || 'Pending Triage'}
          </span>
        </div>
      </div>

      {/* 3-Stage Regulatory Triage Stepper */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
            hasData ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            1
          </span>
          <span className={`font-semibold ${hasData ? 'text-slate-800' : 'text-slate-400'}`}>
            Intake & AI Extraction
          </span>
        </div>

        <div className="h-px bg-slate-200 flex-1 mx-3" />

        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
            riskAssessment ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            2
          </span>
          <span className={`font-semibold ${riskAssessment ? 'text-slate-800' : 'text-slate-400'}`}>
            ICH Q9 Risk Assessment
          </span>
        </div>

        <div className="h-px bg-slate-200 flex-1 mx-3" />

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
            3
          </span>
          <span className="font-medium text-slate-400">
            QA Sign-Off
          </span>
        </div>
      </div>

      {/* Duplicate Warning Banner if detected */}
      {duplicates && duplicates.length > 0 && (
        <div className="bg-amber-50/80 border-b border-amber-200/70 px-4 py-2 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Potential Recurring Defect: </span>
            {duplicates[0].similarity_reason}
          </div>
        </div>
      )}

      {/* View Switcher Tabs (Form Fields vs AI Risk vs GMP Completeness) */}
      <div className="px-4 pt-1.5 border-b border-slate-100 flex items-center space-x-1 bg-white text-xs">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-3 py-2 font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'form' 
              ? 'text-slate-900 border-slate-900 font-semibold' 
              : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          Form Fields
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-2 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'risk' 
              ? 'text-slate-900 border-slate-900 font-semibold' 
              : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-3 h-3 text-slate-600" />
          <span>AI Risk Assessment</span>
          {riskAssessment && (
            <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded font-semibold ${
              riskAssessment.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {riskAssessment.severity}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completeness')}
          className={`px-3 py-2 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'completeness' 
              ? 'text-slate-900 border-slate-900 font-semibold' 
              : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          <FileCheck className="w-3 h-3 text-emerald-600" />
          <span>GMP Completeness</span>
          <span className="ml-1 text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
            {completeness?.score || 0}%
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-white">
        
        {activeTab === 'risk' ? (
          <RiskAssessmentView risk={riskAssessment} form={form} />
        ) : activeTab === 'completeness' ? (
          <CompletenessView completeness={completeness} form={form} />
        ) : (
          /* Form Fields View - matching screenshot sections with subtle borders */
          <div className="space-y-6">

            {/* 1. ORIGIN & CUSTOMER DETAILS */}
            <div className="p-3.5 rounded-lg bg-slate-50/40 border border-slate-100/90 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center justify-between">
                <span>1. Origin & Customer Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Complaint Source
                  </label>
                  <input
                    type="text"
                    value={form.complaint_source}
                    onChange={(e) => handleChange('complaint_source', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('complaint_source')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Customer Name</span>
                    {form.customer_name && (
                      <button
                        type="button"
                        onClick={() => handleCopy('customer', form.customer_name)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                      >
                        {copiedKey === 'customer' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'customer' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('customer_name')}
                  />
                </div>
              </div>
            </div>

            {/* 2. PRODUCT & BATCH IDENTIFICATION */}
            <div className="p-3.5 rounded-lg bg-slate-50/40 border border-slate-100/90 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center justify-between">
                <span>2. Product & Batch Identification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={form.product_name}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('product_name')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Product Strength/Grade
                  </label>
                  <input
                    type="text"
                    value={form.product_strength}
                    onChange={(e) => handleChange('product_strength', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('product_strength')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Batch/Lot Number</span>
                    {form.batch_number && (
                      <button
                        type="button"
                        onClick={() => handleCopy('batch', form.batch_number)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                      >
                        {copiedKey === 'batch' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'batch' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.batch_number}
                    onChange={(e) => handleChange('batch_number', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('batch_number')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Manufacturing Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.manufacturing_date}
                      onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className={`${getFieldClass('manufacturing_date')} pr-8`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.expiry_date}
                      onChange={(e) => handleChange('expiry_date', e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className={`${getFieldClass('expiry_date')} pr-8`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Quantity Affected
                  </label>
                  <div className="flex rounded-lg border border-slate-200/90 overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800/10">
                    <input
                      type="text"
                      value={form.quantity_affected}
                      onChange={(e) => handleChange('quantity_affected', e.target.value)}
                      placeholder="Awaiting AI extraction..."
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm outline-none ${
                        isFieldHighlighted('quantity_affected') ? 'bg-emerald-50/40' : 'bg-slate-50/20'
                      }`}
                    />
                    <select
                      value={form.quantity_unit}
                      onChange={(e) => handleChange('quantity_unit', e.target.value)}
                      className="bg-slate-50 text-slate-700 text-xs px-2.5 border-l border-slate-200 outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="bottles">bottles</option>
                      <option value="packs">packs</option>
                      <option value="vials">vials</option>
                      <option value="strips">strips</option>
                      <option value="drums">drums</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COMPLAINT DETAILS */}
            <div className="p-3.5 rounded-lg bg-slate-50/40 border border-slate-100/90 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                <span>3. Complaint Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Complaint Type
                  </label>
                  <input
                    type="text"
                    value={form.complaint_type}
                    onChange={(e) => handleChange('complaint_type', e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className={getFieldClass('complaint_type')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Complaint Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.complaint_date}
                      onChange={(e) => handleChange('complaint_date', e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className={`${getFieldClass('complaint_date')} pr-8`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed Complaint Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className={`${getFieldClass('description')} resize-y`}
                />
              </div>
            </div>

            {/* 4. INITIAL ASSESSMENT & PRIORITY */}
            <div className="p-3.5 rounded-lg bg-slate-50/40 border border-slate-100/90 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                <span>4. Initial Assessment & Priority</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Severity
                  </label>
                  <select
                    value={form.initial_severity}
                    onChange={(e) => handleChange('initial_severity', e.target.value)}
                    className={getFieldClass('initial_severity')}
                  >
                    <option value="Critical">Critical (Class I / Health Hazard)</option>
                    <option value="Major">Major (Quality / Specification OOS)</option>
                    <option value="Minor">Minor (Cosmetic / Packaging)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className={getFieldClass('priority')}
                  >
                    <option value="High">High (Immediate Containment)</option>
                    <option value="Medium">Medium (Standard 14-Day QA)</option>
                    <option value="Low">Low (30-Day Routine APQR)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Notification feedback messages */}
      {saveSuccessMessage && (
        <div className="mx-4 mb-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Actions Row with Midnight Slate Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Form</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-black disabled:opacity-50 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving to QMS...' : 'Save Complaint'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
