import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Layers, 
  Clock, 
  UserCheck, 
  Wrench,
  HelpCircle
} from 'lucide-react';

export default function RiskAssessmentView({ risk, form }) {
  if (!risk) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">No AI Risk Assessment Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Provide a complaint prompt or upload a document to the AI Co-pilot to generate automated ICH Q9 Quality Risk reasoning.
        </p>
      </div>
    );
  }

  const isCritical = risk.severity === 'Critical';

  return (
    <div className="space-y-6">
      
      {/* Header Risk Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
        isCritical ? 'bg-red-50/80 border-red-200 text-red-950' : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'} shrink-0`}>
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight">
              ICH Q9 Quality Risk Assessment: {risk.severity} Severity
            </h3>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isCritical ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
            }`}>
              Priority: {risk.priority}
            </span>
          </div>
          <p className="text-xs mt-1 text-slate-700 font-medium">
            Defect Classification: <span className="font-semibold text-slate-900">{risk.defect_classification || 'Critical Quality Attribute Deviation'}</span>
          </p>
        </div>
      </div>

      {/* Patient Hazard & Regulatory Evaluation */}
      <div className="grid grid-cols-1 gap-4">
        
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Health Hazard Evaluation (Patient Risk)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {risk.patient_risk}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Regulatory Impact (FDA 21 CFR 211.198 / EU Chapter 8)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {risk.regulatory_impact}
          </p>
        </div>

      </div>

      {/* Immediate Containment Actions */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immediate Containment Actions (QA Protocol)</span>
        </h4>
        <div className="space-y-2">
          {risk.containment_actions?.map((act, i) => (
            <div key={i} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-md text-xs text-emerald-950">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-snug">{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Analysis (Ishikawa 5M+E Categories) */}
      {risk.root_cause_categories && Object.keys(risk.root_cause_categories).length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preliminary Root Cause Analysis (Ishikawa 5M+E)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(risk.root_cause_categories).map(([cat, points]) => (
              <div key={cat} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider text-blue-700">
                  {cat}
                </span>
                <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                  {points.map((p, idx) => (
                    <li key={idx} className="leading-tight">{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAPA Recommendations Table */}
      {risk.capa_recommendations && risk.capa_recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommended CAPA (Corrective & Preventive Action)</span>
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-left">Action Plan</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {risk.capa_recommendations.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-900">{c.action}</td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.type === 'Corrective' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      {c.owner}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.target_days} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

