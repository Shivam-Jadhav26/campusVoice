import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TrendingUp, TrendingDown, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getComplaintAnalytics({ period: '12m' })
      .then(res => {
        setData(res.data?.data || res.data || {});
      })
      .catch(() => toast.error('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  // Format monthly trend data
  const monthlyTrend = (data?.monthlyTrend || []).map(item => ({
    month: MONTHS[item._id.month],
    count: item.count
  }));

  // Format category breakdown
  const categoryBreakdown = (data?.categoryStats || []).map(item => ({ 
    name: item._id || 'Unknown', 
    value: item.count 
  }));

  // KPI Data from API
  const kpis = data?.kpis || { avgResTime: 0, inflowChange: 0, escalationRate: 0 };
  
  const inflowIsPositive = kpis.inflowChange >= 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System-Wide Analytics & Metrics</h1>
          <p className="text-sm text-slate-500">Cross-departmental grievances, SLA compliance velocity, and resolution trends</p>
        </div>
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${inflowIsPositive ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
              {inflowIsPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Monthly Inflow Change</p>
              <p className="text-2xl font-black text-slate-900">
                {inflowIsPositive ? '+' : ''}{kpis.inflowChange.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Avg SLA Resolution</p>
              <p className="text-2xl font-black text-slate-900">
                {kpis.avgResTime.toFixed(1)} hrs
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Escalation Rate</p>
              <p className="text-2xl font-black text-slate-900">
                {kpis.escalationRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Ticket Inflow Trend (Last 12 Months)
            </h2>
            <div className="h-72">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No trend data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Distribution by Grievance Category
            </h2>
            <div className="h-72">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No category data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
