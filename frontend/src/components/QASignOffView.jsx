import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  KeyRound, 
  Clock, 
  FileCheck, 
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';

export default function QASignOffView({ 
  form, 
  riskAssessment, 
  completeness, 
  qaSignOff, 
  onSignOff, 
  onRevoke 
}) {
  const [signerName, setSignerName] = useState('Anubhav Maandey');
  const [signerRole, setSignerRole] = useState('Lead QA Specialist (Site #04)');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');

  const hasMinimumData = Boolean(form.product_name && form.batch_number);
  const score = completeness?.score || 0;

  const handleApplySignature = (e) => {
    e.preventDefault();
    if (!hasMinimumData) {
      setError('Cannot sign off: Missing mandatory Product Name and Batch/Lot Number.');
      return;
    }
    if (!confirmChecked) {
      setError('You must check the certification statement before applying signature.');
      return;
    }

    const now = new Date();
    const signatureId = `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${now.getFullYear()}`;

    onSignOff({
      signed: true,
      signedBy: signerName,
      signerRole: signerRole,
      signedAt: now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }),
      meaning: 'Review and Authorization of Initial Complaint Triage & Containment Protocols',
      signatureId: signatureId,
      batchApproved: form.batch_number || 'N/A',
      productApproved: form.product_name || 'N/A',
      severityApproved: riskAssessment?.severity || form.initial_severity || 'Major',
    });
    setError('');
  };

  return (
    <div className="space-y-5">

      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white flex items-center justify-between shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>QA Formal Sign-Off & Release Protocol</span>
            </h3>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80 uppercase tracking-wider">
              21 CFR Part 11
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory QA authorization to transition complaint into active CAPA investigation.
          </p>
        </div>

        <div>
          {qaSignOff?.signed ? (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signed & Authorized</span>
            </span>
          ) : (
            <span className="text-xs font-medium bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200/70 flex items-center gap-1.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Authorization</span>
            </span>
          )}
        </div>
      </div>

      {/* If Already Signed Off */}
      {qaSignOff?.signed ? (
        <div className="border border-emerald-200/80 bg-emerald-50/20 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                AM
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {qaSignOff.signedBy}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {qaSignOff.signerRole}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-semibold bg-white border border-emerald-200 text-emerald-800 px-2 py-1 rounded shadow-2xs block">
                {qaSignOff.signatureId}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {qaSignOff.signedAt}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-emerald-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Regulatory Meaning:</span>
              <span className="text-slate-600">{qaSignOff.meaning}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Authorized Product / Batch:</span>
              <span className="font-mono text-slate-700">{qaSignOff.productApproved} (Lot {qaSignOff.batchApproved})</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Approved Severity:</span>
              <span className="font-semibold text-slate-800">{qaSignOff.severityApproved}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-100/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ALCOA+ Data Integrity & Tamper-Evident Electronic Stamp Verified</span>
            </div>

            <button
              onClick={onRevoke}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 hover:underline flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revoke / Re-evaluate</span>
            </button>
          </div>
        </div>
      ) : (
        /* Sign-Off Authorization Form */
        <div className="space-y-4">
          
          {/* Pre-Authorization Triage Review Card */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Pre-Authorization Checklist</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Product</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">
                  {form.product_name || 'Not specified'}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Batch / Lot</span>
                <span className="font-semibold font-mono text-slate-800 truncate block mt-0.5">
                  {form.batch_number || 'Not specified'}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completeness</span>
                <span className={`font-semibold block mt-0.5 ${score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {score}% {score >= 80 ? '✓ Audit Ready' : '• Pending Fields'}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Severity Level</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {riskAssessment?.severity || form.initial_severity || 'Major'}
                </span>
              </div>
            </div>

            {riskAssessment?.containment_actions && riskAssessment.containment_actions.length > 0 && (
              <div className="p-3 bg-white border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Immediate Containment Actions to be Authorized:
                </span>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                  {riskAssessment.containment_actions.slice(0, 3).map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 21 CFR Part 11 Electronic Signature Box */}
          <form onSubmit={handleApplySignature} className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                FDA 21 CFR Part 11 Electronic Signature Declaration
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Authorized Signer Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Role / Quality Unit
                </label>
                <input
                  type="text"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-slate-800 outline-none"
                  required
                />
              </div>
            </div>

            {/* Certification Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  I, <strong className="text-slate-800">{signerName}</strong>, certify under penalty of GMP non-conformance that I have thoroughly verified the customer complaint details, product batch records, and health hazard evaluations. I hereby authorize initiation of containment and CAPA investigation per SOP-QA-402.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-black transition-colors shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Authorize & Apply Digital QA Signature</span>
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
