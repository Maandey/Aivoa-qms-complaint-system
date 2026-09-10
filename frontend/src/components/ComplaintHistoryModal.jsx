import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRegistryOpen } from '../store/chatSlice';
import { populateFromAI } from '../store/complaintSlice';
import { getComplaints, updateComplaintStatus } from '../services/api';
import { 
  X, 
  Database, 
  Search, 
  Eye, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function ComplaintHistoryModal() {
  const dispatch = useDispatch();
  const { isRegistryOpen } = useSelector((state) => state.chat);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRegistryOpen) {
      loadComplaints();
    }
  }, [isRegistryOpen]);

  if (!isRegistryOpen) return null;

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleViewDetails = (c) => {
    dispatch(populateFromAI({
      form_data: {
        complaint_source: c.complaint_source,
        customer_name: c.customer_name,
        product_name: c.product_name,
        product_strength: c.product_strength,
        batch_number: c.batch_number,
        manufacturing_date: c.manufacturing_date,
        expiry_date: c.expiry_date,
        quantity_affected: c.quantity_affected,
        quantity_unit: c.quantity_unit,
        complaint_type: c.complaint_type,
        complaint_date: c.complaint_date,
        description: c.description,
        initial_severity: c.initial_severity,
        priority: c.priority,
        status: c.status
      },
      risk_assessment: c.ai_risk_assessment,
      completeness: { score: c.completeness_score, is_ready_for_gmp_submission: c.completeness_score >= 80, missing_fields: [] },
      duplicates: [],
      updated_fields: {}
    }));
    dispatch(setRegistryOpen(false));
  };

  const exportRegistryJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(complaints, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `aivoa_qms_complaints_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch = 
      (c.complaint_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.batch_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                QMS Customer Complaint Registry
              </h3>
              <p className="text-xs text-slate-500">
                Traceable electronic complaint records compliant with FDA 21 CFR 211.198
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportRegistryJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => dispatch(setRegistryOpen(false))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by complaint #, product, batch number, or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending Triage">Pending Triage</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="CAPA Initiated">CAPA Initiated</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Querying complaints database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No complaint records found. Log a complaint using the AI Co-pilot and click "Save Complaint" to store it here.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Complaint #</th>
                    <th className="px-3 py-2.5 text-left">Product & Batch</th>
                    <th className="px-3 py-2.5 text-left">Customer</th>
                    <th className="px-3 py-2.5 text-left">Defect / Type</th>
                    <th className="px-3 py-2.5 text-left">Severity</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-blue-600">
                        {c.complaint_number}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-slate-900 block">{c.product_name || 'N/A'}</span>
                        <span className="text-[11px] text-slate-500 font-mono">Lot: {c.batch_number || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {c.customer_name || 'N/A'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-xs truncate">
                        {c.complaint_type || c.description || 'N/A'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.initial_severity === 'Critical' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.initial_severity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className="text-[11px] border border-slate-200 rounded px-2 py-1 bg-white font-medium text-slate-700"
                        >
                          <option value="Pending Triage">Pending Triage</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="CAPA Initiated">CAPA Initiated</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Load Form</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Records: {filtered.length} complaints</span>
          <button
            onClick={() => dispatch(setRegistryOpen(false))}
            className="px-3.5 py-1.5 font-medium text-slate-700 hover:text-slate-900 rounded-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

