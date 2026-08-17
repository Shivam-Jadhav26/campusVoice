import React, { useState, useEffect } from 'react';
import { Search, Download, Shield, ShieldCheck, Clock, User, Filter } from 'lucide-react';
import { auditLogAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogAPI.getAll();
      const list = res.data?.data?.logs || res.data?.logs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setLogs(list);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const term = search.toLowerCase();
    return (l.action || '').toLowerCase().includes(term) ||
           (l.user?.name || l.user?.email || '').toLowerCase().includes(term) ||
           (l.entityType || '').toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
              <p className="text-xs text-slate-500">Immutable security event trails and role-action histories</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by action, user, or resource..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading audit trail...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Timestamp</th>
                    <th className="px-6 py-3.5 text-left">User</th>
                    <th className="px-6 py-3.5 text-left">Action</th>
                    <th className="px-6 py-3.5 text-left">Target Resource</th>
                    <th className="px-6 py-3.5 text-left">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map((log, i) => (
                    <tr key={log._id || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {log.user?.name || log.user?.email || 'System Engine'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.entityType} {log.entityId ? `(#${String(log.entityId).slice(-6)})` : ''}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
