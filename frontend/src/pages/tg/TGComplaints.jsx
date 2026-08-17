import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert } from 'lucide-react';
import { complaintAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function TGComplaints() {
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
      toast.error('Failed to load TG complaints');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const term = search.toLowerCase();
    return (c.complaintNumber || c.number || '').toLowerCase().includes(term) ||
           (c.title || '').toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutor Guardian (TG) Grievance Queue</h1>
          <p className="text-sm text-slate-500">Manage student complaints and handle Level-1 escalated cases</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ticket or issue..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Loading TG complaints...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Ticket & Issue</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-indigo-600">{c.complaintNumber || c.number}</div>
                      <div className="font-semibold text-gray-900">{c.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        c.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        c.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <button onClick={() => navigate(`/tg/complaints/${c._id}`)} className="text-indigo-600 hover:text-indigo-900 font-bold">
                        Review
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No TG complaints assigned.</td>
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
