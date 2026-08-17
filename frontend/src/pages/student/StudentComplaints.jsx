import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { complaintAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchComplaints();
  }, [filters.page, filters.status, filters.priority, filters.category]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getAll(filters);
      const payload = res.data?.data || res.data || {};
      const list = payload.complaints || (Array.isArray(payload) ? payload : []);
      setComplaints(list);
      setTotalPages(payload.totalPages || payload.pages || 1);
      setTotalCount(payload.total || list.length);
    } catch (error) {
      toast.error('Failed to load complaints');
      // Dummy data fallback
      setComplaints([
        { _id: '1', complaintNumber: 'C-2023-001', title: 'Wifi not working in block A', status: 'pending', priority: 'high', category: 'IT', createdAt: new Date().toISOString() },
        { _id: '2', complaintNumber: 'C-2023-002', title: 'Water leakage in lab 3', status: 'resolved', priority: 'medium', category: 'Infrastructure', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchComplaints();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600">Track and manage your submitted complaints</p>
        </div>
        <Link 
          to="/student/complaints/create" 
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Complaint
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by ID, Title or Keyword..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <select name="status" value={filters.status} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="rejected">Rejected</option>
            </select>
            <select name="priority" value={filters.priority} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Hostel">Hostel</option>
              <option value="IT">IT</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-6 animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : complaints.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID & Details</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Status & Priority</th>
                    <th className="px-6 py-4 font-medium">Submitted On</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 mb-1">{complaint.complaintNumber}</div>
                        <div className="text-gray-900 font-medium truncate max-w-xs">{complaint.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{complaint.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-2">
                        <span className={`block w-max px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`block w-max px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          complaint.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' : 
                          complaint.priority === 'medium' ? 'border-orange-200 text-orange-700 bg-orange-50' : 
                          'border-green-200 text-green-700 bg-green-50'
                        }`}>
                          {complaint.priority} priority
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(complaint.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link to={`/student/complaints/${complaint._id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-medium">{Math.min(filters.page * filters.limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't submitted any complaints yet, or none match your current filters.
            </p>
            <Link 
              to="/student/complaints/create" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit your first complaint
            </Link>
          </div>
        )}
      </div>
    </div>
  </DashboardLayout>
  );
}
