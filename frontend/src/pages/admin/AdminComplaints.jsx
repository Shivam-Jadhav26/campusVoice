import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, AlertCircle, Clock, ChevronLeft, ChevronRight, Eye, ArrowUpRight } from 'lucide-react';
import { complaintAPI, departmentAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated', 'Reopened', 'Closed'];
const CATEGORIES = ['Academic', 'Infrastructure', 'Laboratory', 'Hostel', 'Library', 'Mess', 'Faculty', 'Transport', 'IT', 'Other'];
const ESCALATION_LABELS = ['L0 · Teacher', 'L1 · TG', 'L2 · Class Incharge', 'L3 · HOD'];
const TERMINAL_STATUSES = ['Resolved', 'Rejected', 'Closed'];
const PAGE_SIZE = 15;

// ─── Status Badge ───────────────────────────────────────────────────────────

const statusColors = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Escalated': 'bg-purple-50 text-purple-700 border-purple-200',
  'Reopened': 'bg-orange-50 text-orange-700 border-orange-200',
  'Closed': 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityColors = {
  'Low': 'bg-slate-50 text-slate-600 border-slate-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
};

function isOverdue(complaint) {
  if (!complaint.deadline) return false;
  if (TERMINAL_STATUSES.includes(complaint.status)) return false;
  return new Date(complaint.deadline) < new Date();
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminComplaints() {
  const navigate = useNavigate();

  // Data
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch departments for filter dropdown
  useEffect(() => {
    departmentAPI.getAll()
      .then(res => {
        const list = res.data?.data?.departments || res.data?.departments || res.data?.data || [];
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  // Fetch complaints with server-side filters
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (departmentFilter) params.department = departmentFilter;

      const res = await complaintAPI.getAll(params);
      const data = res.data?.data || res.data || {};
      const list = data.complaints || (Array.isArray(data) ? data : []);

      setComplaints(Array.isArray(list) ? list : []);
      setTotal(data.total || list.length || 0);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, categoryFilter, departmentFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter, departmentFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const overdueCount = complaints.filter(isOverdue).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Oversight</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              System-wide monitoring — {total} total complaint{total !== 1 ? 's' : ''}
              {overdueCount > 0 && (
                <span className="ml-2 text-red-600 font-semibold">
                  · {overdueCount} overdue on this page
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search ticket, title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <span className="ml-3 text-gray-500 text-sm">Loading complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No complaints found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket & Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dept / Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Escalation & Handler</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {complaints.map(c => {
                    const overdue = isOverdue(c);
                    return (
                      <tr key={c._id} className={`hover:bg-gray-50/60 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                        {/* Ticket & Title */}
                        <td className="px-4 py-3.5 max-w-[220px]">
                          <div className="font-mono text-xs font-bold text-indigo-600">{c.complaintNumber}</div>
                          <div className="text-sm font-medium text-gray-900 truncate" title={c.title}>{c.title}</div>
                        </td>

                        {/* Student */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{c.studentName || c.studentId?.name || '—'}</div>
                          {c.studentRoll && (
                            <div className="text-xs text-gray-400">{c.studentRoll}</div>
                          )}
                        </td>

                        {/* Department / Category */}
                        <td className="px-4 py-3.5">
                          <div className="text-sm text-gray-700">{c.department || '—'}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {c.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${priorityColors[c.priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {c.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[c.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {c.status}
                          </span>
                        </td>

                        {/* Escalation & Handler */}
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-medium text-gray-500">
                            {ESCALATION_LABELS[c.escalationLevel] || `L${c.escalationLevel || 0}`}
                          </div>
                          <div className="text-sm text-gray-800 mt-0.5">
                            {c.currentHandlerName || c.currentHandlerId?.name || '—'}
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.deadline ? (
                            <div className="flex items-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                              <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                                {new Date(c.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {overdue && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 border border-red-200 uppercase">
                                  Overdue
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => navigate(`/admin/complaints/${c._id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs font-medium text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
