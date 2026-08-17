import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, AlertTriangle } from 'lucide-react';
import { complaintAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function CommitteeComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getAll();
      const list = res.data?.data?.complaints || res.data?.complaints || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setComplaints(list);
    } catch (error) {
      toast.error('Failed to load committee complaints');
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(c => {
    const term = search.toLowerCase();
    return (c.complaintNumber || c.number || '').toLowerCase().includes(term) ||
           (c.title || '').toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Level 4 Escalations (Grievance Committee Review)</h1>
          <p className="text-sm text-slate-500">Unresolved complaints escalated past Teacher, TG, Class Incharge, and HOD</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search escalations by ticket or title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500 text-sm" 
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading cases...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Ticket & Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Escalation Stage</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-indigo-600">{c.complaintNumber || c.number}</div>
                      <div className="font-semibold text-gray-900">{c.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.department?.name || c.department || 'General'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Committee Final Review
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <button 
                        onClick={() => navigate(`/committee/complaints/${c._id}`)} 
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Review Case
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                      No active Level-4 escalations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
