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
  Info
} from 'lucide-react';
import RiskAssessmentView from './RiskAssessmentView';
import CompletenessView from './CompletenessView';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const { form, riskAssessment, completeness, duplicates, highlightedFields, isDirty } = useSelector(
    (state) => state.complaint
  );
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'risk' | 'capa' | 'completeness'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
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
    const base = "w-full text-xs sm:text-sm px-3 py-2 rounded border transition-all duration-200 outline-none";
    if (isFieldHighlighted(field)) {
      return `${base} border-emerald-500 bg-emerald-50/40 text-slate-900 ring-2 ring-emerald-400/30`;
    }
    return `${base} border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-slate-300`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Form Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-start justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Log Customer Complaint
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            API & FDF Quality Assurance Module
          </p>
        </div>

        {/* Status Pill matching screenshot */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            {form.status || 'Pending Triage'}
          </span>
        </div>
      </div>

      {/* Duplicate Warning Banner if detected */}
      {duplicates && duplicates.length > 0 && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Potential Recurring Defect: </span>
            {duplicates[0].similarity_reason}
          </div>
        </div>
      )}

      {/* View Switcher Tabs (Form Fields vs AI Risk Reasoning vs GMP Completeness) */}
      <div className="px-4 pt-2 border-b border-slate-100 flex items-center space-x-1 bg-slate-50/50 text-xs">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-3 py-2 font-medium rounded-t-md transition-colors border-b-2 ${
            activeTab === 'form' 
              ? 'text-blue-600 border-blue-600 bg-white shadow-xs font-semibold' 
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          Form Fields
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-2 font-medium rounded-t-md transition-colors border-b-2 flex items-center gap-1 ${
            activeTab === 'risk' 
              ? 'text-blue-600 border-blue-600 bg-white shadow-xs font-semibold' 
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>AI Risk Assessment</span>
          {riskAssessment && (
            <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
              riskAssessment.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {riskAssessment.severity}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completeness')}
          className={`px-3 py-2 font-medium rounded-t-md transition-colors border-b-2 flex items-center gap-1 ${
            activeTab === 'completeness' 
              ? 'text-blue-600 border-blue-600 bg-white shadow-xs font-semibold' 
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-3 h-3 text-emerald-500" />
          <span>GMP Completeness</span>
          <span className="ml-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
            {completeness?.score || 0}%
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        
        {activeTab === 'risk' ? (
          <RiskAssessmentView risk={riskAssessment} form={form} />
        ) : activeTab === 'completeness' ? (
          <CompletenessView completeness={completeness} form={form} />
        ) : (
          /* Form Fields View - exactly matching screenshot */
          <div className="space-y-6">

            {/* 1. ORIGIN & CUSTOMER DETAILS */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <span>1. Origin & Customer Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Customer Name
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
            <div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <span>2. Product & Batch Identification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Batch/Lot Number
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
                      placeholder="YYYY-MM-DD or Awaiting AI..."
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
                      placeholder="YYYY-MM-DD or Awaiting AI..."
                      className={`${getFieldClass('expiry_date')} pr-8`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Quantity Affected
                  </label>
                  <div className="flex rounded border border-slate-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                      type="text"
                      value={form.quantity_affected}
                      onChange={(e) => handleChange('quantity_affected', e.target.value)}
                      placeholder="Awaiting AI extraction..."
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm outline-none ${
                        isFieldHighlighted('quantity_affected') ? 'bg-emerald-50/50' : 'bg-white'
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
            <div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <span>3. Complaint Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                      placeholder="YYYY-MM-DD or Awaiting AI..."
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
            <div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <span>4. Initial Assessment & Priority</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="mx-4 mb-2 p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Actions Row matching screenshot */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Form</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving to QMS...' : 'Save Complaint'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}

