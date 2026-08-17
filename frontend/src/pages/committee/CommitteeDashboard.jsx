import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function CommitteeDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getCommitteeDashboard();
        setData(res.data?.data || res.data || {});
      } catch (error) {
        toast.error('Failed to load committee dashboard');
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Pending Final Review', value: data?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Reviewed This Month', value: data?.reviewed || 0, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Resolved (Level 4)', value: data?.resolved || 0, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Rejected', value: data?.rejected || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Grievance Committee Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mr-4`}><stat.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Level-4 Escalations</h2>
            <button onClick={() => navigate('/committee/complaints')} className="text-sm text-indigo-600 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Pending</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data?.escalatedComplaints || data?.recentComplaints || data?.escalations || []).map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-bold text-indigo-600 font-mono">{c.complaintNumber || c.number}</div>
                      <div className="text-gray-900 font-semibold">{c.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.department?.name || c.department || 'General'}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-semibold flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-500"/> Level 4 Escalation
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => navigate(`/committee/complaints/${c._id}`)} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700">Final Decision</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
