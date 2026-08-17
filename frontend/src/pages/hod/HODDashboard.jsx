import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, AlertOctagon, CheckCircle, Clock, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];

export default function HODDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getHODDashboard();
        const payload = res.data?.data || res.data || {};
        setData(payload);
      } catch (error) {
        toast.error('Failed to load HOD dashboard');
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Total Complaints', value: data?.total || 0, icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending', value: data?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Resolved', value: data?.resolved || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Escalated', value: data?.escalated || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Avg Resolution', value: data?.avgResolutionTime || '24h', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Critical Priority', value: data?.critical || 0, icon: AlertOctagon, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const categoryChartData = (data?.categoryBreakdown || []).map(item => ({
    name: item._id || 'Other',
    value: item.count || 1
  }));

  const recentComplaints = data?.recentComplaints || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
            <p className="text-gray-500">HOD Analytics & Real-Time Grievance Monitoring</p>
          </div>
          <button
            onClick={() => navigate('/hod/complaints')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            Review All Complaints
          </button>
        </div>

        {/* 6 Metric KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center items-center text-center hover:shadow-md transition-all">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Complaints by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'General', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {(categoryChartData.length > 0 ? categoryChartData : [{ name: 'General', value: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Priority Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.priorityBreakdown || []).map(p => ({ priority: p._id || 'Standard', count: p.count || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="priority" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Unresolved Complaints Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Department Complaints</h2>
              <p className="text-xs text-gray-500">Live ticket queue for escalation review</p>
            </div>
            <button onClick={() => navigate('/hod/complaints')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View Department Queue →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3.5 text-left">Ticket Number</th>
                  <th className="px-6 py-3.5 text-left">Title</th>
                  <th className="px-6 py-3.5 text-left">Handler</th>
                  <th className="px-6 py-3.5 text-left">Priority</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{c.complaintNumber || c.number}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{c.title}</td>
                    <td className="px-6 py-4 text-gray-600">{c.currentHandlerName || c.assignedTo?.name || 'Assigned Officer'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        c.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        c.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentComplaints.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No complaints found for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
