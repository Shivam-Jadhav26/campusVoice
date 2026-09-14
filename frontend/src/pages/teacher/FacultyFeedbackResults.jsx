import React, { useState, useEffect } from 'react';
import { feedbackRequestAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { Loader2, FileText, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyFeedbackResults() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await feedbackRequestAPI.getFacultyRequests();
      setRequests(res.data?.data?.requests || res.data?.requests || []);
    } catch (error) {
      toast.error('Failed to load feedback results');
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(req => 
    req.title.toLowerCase().includes(search.toLowerCase()) || 
    req.studentId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Results</h1>
            <p className="text-gray-600">Review the feedback submitted by students for your assigned forms.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by title or student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No feedback requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">Form Title</th>
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold">Date Assigned</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{req.title}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{req.studentId?.name}</p>
                        <p className="text-xs text-gray-500">{req.studentId?.rollNumber} • {req.studentId?.class}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {req.status === 'Completed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          disabled={req.status !== 'Completed'}
                          className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-end ml-auto"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Feedback Results"
          maxWidth="max-w-2xl"
        >
          {selectedRequest && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedRequest.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Submitted by: <span className="font-medium text-gray-900">{selectedRequest.studentId?.name}</span> ({selectedRequest.studentId?.rollNumber})</p>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedRequest.submittedAt && new Date(selectedRequest.submittedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-6">
                {selectedRequest.fields.map((field, idx) => {
                  const response = selectedRequest.responses?.find(r => r.fieldId === field._id)?.value;
                  return (
                    <div key={field._id || idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <p className="font-medium text-gray-800 mb-2">{idx + 1}. {field.label}</p>
                      
                      {field.type === 'rating' ? (
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className={`w-5 h-5 ${response >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 font-medium">{response || 0}/5</span>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                          {response || <span className="text-gray-400 italic">No response provided</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
