import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, AlertTriangle, CheckCircle, Activity, Clock } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ClassInchargeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getStaffDashboard();
        setData(res.data?.data || res.data || {});
      } catch (error) {
        toast.error('Failed to load class incharge dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Assigned Complaints', value: data?.assigned || data?.total || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Action', value: data?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Resolved Tickets', value: data?.resolved || data?.resolvedWeek || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Escalated to HOD', value: data?.escalated || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const recentList = data?.recentComplaints || data?.recent || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Incharge Dashboard</h1>
          <p className="text-sm text-slate-500">Monitor cohort grievance velocity and respond to Level-2 class escalations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
            <h2 className="text-base font-bold text-slate-900 mb-4">Category Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.categoryBreakdown || [{name:'Academic', value:4}, {name:'Facility', value:2}]}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value"
                  >
                    {(data?.categoryBreakdown || [1,2]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Class Grievances</h2>
              <button onClick={() => navigate('/class-incharge/complaints')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Ticket Number</th>
                    <th className="px-4 py-3 text-left">Issue Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recentList.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.complaintNumber || c.number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentList.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No recent issues found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
