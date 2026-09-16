import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Eye, Search, Loader2, Folder, ArrowLeft, Users, BarChart3, List as ListIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { feedbackRequestAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function FacultyFeedbackResults() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // selectedGroup stores the group of requests for a specific form title
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // selectedRequest stores the specific student's request for viewing the modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Dashboard vs List view toggle
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Group requests by title
  const groupedRequests = requests.reduce((acc, req) => {
    const key = req.title;
    if (!acc[key]) {
      acc[key] = {
        title: req.title,
        dateAssigned: req.createdAt,
        total: 0,
        completed: 0,
        requests: []
      };
    }
    acc[key].requests.push(req);
    acc[key].total += 1;
    if (req.status === 'Completed') acc[key].completed += 1;
    return acc;
  }, {});

  const groups = Object.values(groupedRequests)
    .sort((a, b) => new Date(b.dateAssigned) - new Date(a.dateAssigned))
    .filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  // Filter students if inside a group
  const groupStudents = selectedGroup?.requests.filter(req => 
    req.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    req.studentId?.rollNumber?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const renderDashboard = () => {
    const completedRequests = selectedGroup?.requests.filter(r => r.status === 'Completed') || [];
    if (completedRequests.length === 0) {
      return <div className="p-12 text-center text-gray-500">No completed responses yet to generate dashboard.</div>;
    }

    const fields = completedRequests[0].fields;

    return (
      <div className="p-6 space-y-8 bg-gray-50/30">
        {fields.map((field, idx) => {
          if (field.type === 'rating') {
            let sum = 0;
            let count = 0;
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            
            completedRequests.forEach(req => {
              const resp = req.responses.find(r => r.fieldId === field._id);
              if (resp && resp.value) {
                const val = Number(resp.value);
                sum += val;
                count++;
                if (distribution[val] !== undefined) distribution[val]++;
              }
            });
            const avg = count > 0 ? (sum / count).toFixed(1) : 0;
            const chartData = [
              { name: '5 Stars', count: distribution[5] },
              { name: '4 Stars', count: distribution[4] },
              { name: '3 Stars', count: distribution[3] },
              { name: '2 Stars', count: distribution[2] },
              { name: '1 Star', count: distribution[1] },
            ];

            return (
              <div key={field._id || idx} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-6">{idx + 1}. {field.label}</h3>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0 text-center flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-full w-40 h-40">
                    <span className="text-5xl font-bold text-indigo-600">{avg}</span>
                    <span className="text-xs text-indigo-400 mt-2 font-medium uppercase tracking-wider">Average</span>
                  </div>
                  <div className="flex-grow w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          } else {
            const textResponses = [];
            completedRequests.forEach(req => {
              const resp = req.responses.find(r => r.fieldId === field._id);
              if (resp && resp.value) {
                textResponses.push({ value: resp.value, student: req.studentId?.name });
              }
            });
            
            return (
              <div key={field._id || idx} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                 <h3 className="font-semibold text-lg text-gray-900 mb-4">{idx + 1}. {field.label}</h3>
                 {textResponses.length === 0 ? (
                   <p className="text-gray-500 text-sm italic">No responses yet.</p>
                 ) : (
                   <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                     {textResponses.map((tr, i) => (
                       <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                         <p className="text-gray-800 whitespace-pre-wrap">{tr.value}</p>
                         <p className="text-xs text-gray-400 mt-2 font-medium flex justify-end">- {tr.student}</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {selectedGroup && (
                <button 
                  onClick={() => { setSelectedGroup(null); setSearch(''); setActiveTab('dashboard'); }}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedGroup ? selectedGroup.title : 'Feedback Folders'}
              </h1>
            </div>
            <p className="text-gray-600">
              {selectedGroup 
                ? 'Review the individual feedback submitted by students.' 
                : 'View your assigned feedback forms grouped by title.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {selectedGroup && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <BarChart3 className="w-4 h-4" /> Overall
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ListIcon className="w-4 h-4" /> Students
                </button>
              </div>
            )}
            {(!selectedGroup || activeTab === 'students') && (
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder={selectedGroup ? "Search student..." : "Search form title..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : !selectedGroup ? (
            /* FOLDER VIEW */
            groups.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No feedback forms found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {groups.map(group => (
                  <div 
                    key={group.title}
                    onClick={() => { setSelectedGroup(group); setSearch(''); }}
                    className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Folder className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {new Date(group.dateAssigned).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg line-clamp-1" title={group.title}>
                      {group.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{group.total} Assigned</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{group.completed} Completed</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full" 
                        style={{ width: `${(group.completed / group.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* STUDENT LIST OR DASHBOARD VIEW */
            activeTab === 'dashboard' ? renderDashboard() : (
              groupStudents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No students found matching your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-semibold">Student</th>
                      <th className="p-4 font-semibold">Roll No & Class</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupStudents.map(req => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-gray-900">{req.studentId?.name}</p>
                          <p className="text-xs text-gray-500">{req.studentId?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-700">{req.studentId?.rollNumber}</p>
                          <p className="text-xs text-gray-500">{req.studentId?.class}</p>
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
                            className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-end ml-auto transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1.5" /> View Results
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>

        {/* MODAL VIEW */}
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
