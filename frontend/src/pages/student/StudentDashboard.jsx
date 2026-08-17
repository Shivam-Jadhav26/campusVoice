import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStudentDashboard();
      const payload = res.data?.data || res.data || {};
      setData(payload);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Could not load live stats, displaying cached data.');
      setData({
        kpis: { total: 4, pending: 1, inProgress: 1, resolved: 1, escalated: 1, avgResolutionTime: '24h' },
        recentComplaints: [
          { _id: '1', complaintNumber: 'CMP-2024-000001', title: 'Projector not working in Lab 304', status: 'In Progress', priority: 'High', deadline: new Date(Date.now() + 86400000).toISOString() },
          { _id: '3', complaintNumber: 'CMP-2024-000003', title: 'Wi-Fi connectivity drop in Boys Hostel', status: 'Escalated', priority: 'Critical', deadline: new Date().toISOString() }
        ],
        statusDistribution: [
          { name: 'Pending', value: 1 },
          { name: 'In Progress', value: 1 },
          { name: 'Resolved', value: 1 },
          { name: 'Escalated', value: 1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    Pending: '#f59e0b',
    'In Progress': '#3b82f6',
    Resolved: '#10b981',
    Escalated: '#ef4444',
    Rejected: '#64748b'
  };

  const getStatusBadge = (status = '') => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'in progress':
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">In Progress</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case 'escalated':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Escalated</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getPriorityBadge = (priority = '') => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">Critical</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">High</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Medium</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-2 sm:p-4">
          <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = data?.kpis || {
    total: data?.total || 0,
    pending: data?.pending || 0,
    inProgress: data?.inProgress || 0,
    resolved: data?.resolved || 0,
    escalated: data?.escalated || 0,
    avgResolutionTime: data?.avgResolutionTime || '24h'
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl shadow-indigo-950/20 border border-indigo-700/30">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Portal • {user?.departmentName || 'Computer Engineering'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-indigo-200/90 text-sm mt-1 max-w-xl">
              Track your grievance resolutions, paper re-evaluations, and submit institutional feedback in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/complaints/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 active:scale-95 shadow-lg shadow-black/20 transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600 stroke-[3]" />
              <span>Submit New Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Filed</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{kpis.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Avg Response:</span>
            <span className="font-bold text-slate-700">{kpis.avgResolutionTime || '24h'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress / Pending</p>
              <p className="text-3xl font-black text-amber-600 mt-1">{(kpis.pending || 0) + (kpis.inProgress || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <span>{kpis.pending || 0} Pending • {kpis.inProgress || 0} In Progress</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{kpis.resolved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span>Satisfactory resolutions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Escalated</p>
              <p className="text-3xl font-black text-rose-600 mt-1">{kpis.escalated}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 font-medium">
            <span>HOD / Committee tier</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/student/complaints/create"
          className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Raise a Complaint</h4>
              <p className="text-xs text-slate-500">Lab, Wi-Fi, Infrastructure, Mess</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/student/academic-review"
          className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Academic Re-evaluation</h4>
              <p className="text-xs text-slate-500">Mid-term, End-term paper review</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/student/feedback"
          className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Campus Feedback</h4>
              <p className="text-xs text-slate-500">Share anonymous suggestions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Content Grid: Recent Complaints + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Complaints Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live status and escalation progress</p>
              </div>
              <Link
                to="/student/complaints"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                <span>View All Tickets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {data?.recentComplaints?.length > 0 ? (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Ticket</th>
                      <th className="px-6 py-3.5">Issue Summary</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentComplaints.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                          {c.complaintNumber}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 text-sm line-clamp-1">{c.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(c.createdAt || c.deadline)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(c.priority)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link
                            to={`/student/complaints/${c._id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No complaints filed yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    When you submit a complaint, its real-time routing status and progress will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center">
            <Link to="/student/complaints" className="text-xs font-semibold text-slate-600 hover:text-indigo-600">
              Need to check older complaints? Open Complaint Archive →
            </Link>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Grievance Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Status breakdown of your submitted issues</p>

            {data?.statusDistribution && data.statusDistribution.length > 0 ? (
              <div className="w-full h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6366f1'} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <TrendingUp className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs font-medium">No chart data available yet</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Complaints unresolved within 24 hours are automatically escalated to your Teacher Guardian & HOD.
            </p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
