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
  HelpCircle,
  Activity,
  History
} from 'lucide-react';

export default function RiskAssessmentView({ risk, form }) {
  if (!risk) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50/40 rounded-xl border border-dashed border-slate-200/80">
        <ShieldAlert className="w-9 h-9 text-slate-300 mx-auto mb-2" />
        <h3 className="text-xs font-semibold text-slate-700">No AI Risk Assessment Generated Yet</h3>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
          Provide a complaint prompt or upload a document to the AI Co-pilot to generate automated ICH Q9 Quality Risk reasoning.
        </p>
      </div>
    );
  }

  const isCritical = risk.severity === 'Critical';

  return (
    <div className="space-y-5">
      
      {/* Header Risk Banner with Subtle Tones */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 shadow-2xs ${
        isCritical ? 'bg-rose-50/70 border-rose-200/80 text-rose-950' : 'bg-amber-50/60 border-amber-200/70 text-amber-950'
      }`}>
        <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'} shrink-0 shadow-xs`}>
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm tracking-tight">
              ICH Q9 Quality Risk Assessment: {risk.severity} Severity
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              Priority: {risk.priority}
            </span>
          </div>
          <p className="text-[11px] mt-1 text-slate-600 font-medium">
            Defect Classification: <span className="font-semibold text-slate-900">{risk.defect_classification || 'Critical Quality Attribute Deviation'}</span>
          </p>
          
          {/* Real-time Shelf-life & Traceability Telemetry from LangGraph */}
          {(risk.shelf_life_evaluation || risk.traceability_status) && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px]">
              {risk.shelf_life_evaluation && (
                <span className="bg-white/80 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-medium">
                  <Activity className="w-3 h-3 text-slate-500" />
                  {risk.shelf_life_evaluation}
                </span>
              )}
              {risk.traceability_status && (
                <span className="bg-white/80 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {risk.traceability_status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Hazard & Regulatory Evaluation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/70 text-xs shadow-2xs">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Health Hazard Evaluation (HHE)</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {risk.patient_risk}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/70 text-xs shadow-2xs">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <FileCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Regulatory Impact (21 CFR 211.198)</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {risk.regulatory_impact}
          </p>
        </div>

      </div>

      {/* Immediate Containment Actions */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immediate Containment Actions (QA Protocol)</span>
        </h4>
        <div className="space-y-1.5">
          {risk.containment_actions?.map((act, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50/80 border border-slate-200/70 p-2.5 rounded-lg text-xs text-slate-800">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-snug text-[11px]">{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Analysis (Ishikawa 5M+E Categories) */}
      {risk.root_cause_categories && Object.keys(risk.root_cause_categories).length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Preliminary Root Cause Analysis (Ishikawa 5M+E)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(risk.root_cause_categories).map(([cat, points]) => (
              <div key={cat} className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs shadow-2xs">
                <span className="font-bold text-slate-800 block mb-1 text-[10px] uppercase tracking-wider text-slate-500">
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
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-700" />
            <span>Recommended CAPA (Corrective & Preventive Action)</span>
          </h4>
          <div className="border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
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
                    <td className="px-3 py-2 font-medium text-slate-800 text-[11px]">{c.action}</td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                        c.type === 'Corrective' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-[11px] flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      {c.owner}
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-[11px]">
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
