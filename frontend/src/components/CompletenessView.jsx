import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  FileCheck, 
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

export default function CompletenessView({ completeness, form }) {
  const score = completeness?.score || 0;
  const isReady = completeness?.is_ready_for_gmp_submission;
  const missing = completeness?.missing_fields || [];

  const requiredAttributes = [
    { key: 'product_name', label: 'Product Name', present: Boolean(form.product_name) },
    { key: 'batch_number', label: 'Batch/Lot Number', present: Boolean(form.batch_number) },
    { key: 'manufacturing_date', label: 'Manufacturing Date', present: Boolean(form.manufacturing_date) },
    { key: 'expiry_date', label: 'Expiry Date', present: Boolean(form.expiry_date) },
    { key: 'quantity_affected', label: 'Quantity Affected', present: Boolean(form.quantity_affected) },
    { key: 'complaint_source', label: 'Complaint Source', present: Boolean(form.complaint_source) },
    { key: 'customer_name', label: 'Customer Name', present: Boolean(form.customer_name) },
    { key: 'complaint_type', label: 'Complaint Type', present: Boolean(form.complaint_type) },
    { key: 'description', label: 'Complaint Description', present: Boolean(form.description) },
    { key: 'initial_severity', label: 'Initial Severity', present: Boolean(form.initial_severity) }
  ];

  return (
    <div className="space-y-6">
      
      {/* Score Summary Card */}
      <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              GMP Complaint Completeness Score
            </h3>
            {isReady ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Audit Ready
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Incomplete GMP File
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            21 CFR 211.198 requires full traceability of lot, customer, and defect specifics.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {score}<span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <div className="w-24 bg-slate-200 h-2 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mandatory GMP Fields Checklist */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
          <span>Mandatory Regulatory Attributes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {requiredAttributes.map((attr) => (
            <div
              key={attr.key}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                attr.present
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="font-medium">{attr.label}</span>
              {attr.present ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Present
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Missing
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guidance */}
      {missing.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
          <span className="font-bold block mb-1">Co-Pilot Recommendation:</span>
          Ask the AI assistant to populate missing fields or provide them in your next prompt, e.g.:
          <p className="mt-1 font-mono text-[11px] bg-white/80 p-1.5 rounded border border-blue-200">
            "Set {missing[0]} to [value]"
          </p>
        </div>
      )}

    </div>
  );
}

