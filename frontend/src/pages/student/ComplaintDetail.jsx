import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, User, Calendar, MapPin, Tag, Download, MessageSquare, Reply, X, Check, Eye, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  
  // Modals state
  const [replyText, setReplyText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchComplaint();
    
    // Setup Socket.IO listener
    /*
    socket.on('complaint_updated', (data) => {
      if (data.complaintId === id) {
        fetchComplaint();
        toast('Complaint was updated!', { icon: '🔄' });
      }
    });
    return () => socket.off('complaint_updated');
    */
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      // Fetch complaint details and timeline simultaneously
      const [res, timeRes] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getTimeline(id).catch(() => ({ data: [] }))
      ]);
      const comp = res.data?.data?.complaint || res.data?.complaint || res.data?.data || res.data;
      const historyList = timeRes.data?.data?.history || timeRes.data?.history || timeRes.data?.data || (Array.isArray(timeRes.data) ? timeRes.data : []);
      setComplaint(comp);
      setTimeline(historyList);
    } catch (error) {
      toast.error('Failed to load complaint details');
      // Mock data for display
      setComplaint({
        _id: id,
        complaintNumber: 'C-2023-145',
        title: 'Projector not working in Room 304',
        description: 'The projector bulb seems to be fused. We have a presentation tomorrow and it is urgently needed. I have already informed the lab assistant but no action was taken.',
        status: 'in_progress',
        priority: 'high',
        category: 'Infrastructure',
        department: 'Computer Science',
        location: 'Room 304, Block B',
        student: { name: 'Rahul Sharma', email: 'rahul@student.edu' },
        currentHandler: { name: 'Dr. Smith (HOD)' },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        deadline: new Date(Date.now() + 86400000).toISOString(),
        attachments: [{ filename: 'photo1.jpg', url: '#', type: 'image/jpeg' }],
        escalationLevel: 3 // 0:Teacher, 1:TG, 2:ClassIncharge, 3:HOD, 4:Committee
      });
      setTimeline([
        { id: 1, type: 'status_change', title: 'Complaint Created', description: 'Submitted by Rahul Sharma', date: new Date(Date.now() - 172800000).toISOString() },
        { id: 2, type: 'escalation', title: 'Escalated to HOD', description: 'Automatically escalated due to SLA breach by Teacher', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, type: 'comment', title: 'Note added by Dr. Smith', description: 'I have requested the maintenance team to procure a new bulb.', date: new Date(Date.now() - 3600000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, payload = {}) => {
    try {
      // API calls would go here
      // await complaintAPI[action](id, payload);
      toast.success(`Action '${action}' successful (Mock)`);
      setShowResolveModal(false);
      setShowRejectModal(false);
      fetchComplaint(); // Refresh
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-gray-500">Complaint not found</div>
      </DashboardLayout>
    );
  }

  const isStudent = user?.role === 'student' || true;
  const isHandler = user?.role !== 'student' || false;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-lg tracking-wider">
              {complaint.complaintNumber}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
              {complaint.status.replace('_', ' ')}
            </span>
            {complaint.priority === 'high' && (
              <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> High Priority
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{complaint.title}</h1>
        </div>

        {/* Deadline Badge */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 min-w-[200px]">
          <div className={`p-2 rounded-full ${new Date(complaint.deadline) < new Date() ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Deadline</p>
            <p className={`font-bold ${new Date(complaint.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
              {new Date(complaint.deadline) < new Date() ? 'OVERDUE' : new Date(complaint.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>
            
            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="p-6 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" /> Attachments
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.attachments.map((file, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg bg-white p-3 flex flex-col group relative">
                      <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {file.type?.includes('image') ? (
                          <div className="text-xs text-gray-400">Image Preview</div>
                        ) : (
                          <FileText className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate" title={file.filename}>{file.filename}</span>
                      <a href={file.url} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white">
                        <Download className="w-6 h-6" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Communication / Action Panel */}
          {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Add Update / Comment
              </h2>
              <textarea 
                rows={4} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                placeholder="Type your message here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-between items-center">
                {isHandler && (
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> AI Suggest Reply
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2">
                    <Reply className="w-4 h-4" /> Post Comment
                  </button>
                </div>
              </div>

              {isHandler && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                  <button onClick={() => setShowResolveModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Mark as Resolved
                  </button>
                  <button onClick={() => handleAction('escalate')} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Escalate Manually
                  </button>
                  <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                    Reject Complaint
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timeline component */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className={`absolute -left-2.5 mt-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                    item.type === 'status_change' ? 'bg-blue-500' :
                    item.type === 'escalation' ? 'bg-orange-500' :
                    item.type === 'resolved' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Info & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Information</h3>
            
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="font-medium text-sm">{complaint.student?.name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Category & Dept</p>
                <p className="font-medium text-sm">{complaint.category} • {complaint.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium text-sm">{complaint.location || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Submitted On</p>
                <p className="font-medium text-sm">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Escalation Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Escalation Path</h3>
            <div className="space-y-4 relative">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 z-0"></div>
              
              {['Teacher', 'TG', 'Class Incharge', 'HOD', 'Committee'].map((level, idx) => {
                const isActive = complaint.escalationLevel === idx;
                const isPast = complaint.escalationLevel > idx;
                
                return (
                  <div key={level} className="flex items-center gap-3 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isActive ? 'bg-indigo-100 border-indigo-600 text-indigo-600' :
                      isPast ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-300'
                    }`}>
                      {isPast ? <Check className="w-3 h-3" /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-transparent'}`}></div>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-indigo-900 font-bold' : isPast ? 'text-gray-900' : 'text-gray-500'}`}>{level}</p>
                      {isActive && <p className="text-xs text-indigo-600 mt-0.5">Currently handling ({complaint.currentHandler?.name})</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Resolve Complaint</h3>
              <button onClick={() => setShowResolveModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Note (visible to student)</label>
              <textarea 
                rows={4} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500"
                placeholder="Explain how the issue was resolved..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
              <button onClick={() => handleAction('resolve', { note: resolveNote })} className="px-4 py-2 bg-green-600 text-white rounded-lg">Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Reject Complaint</h3>
              <button onClick={() => setShowRejectModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
              <textarea 
                rows={4} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-red-500"
                placeholder="Why is this complaint being rejected? (Duplicate, Invalid, etc.)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
              <button onClick={() => handleAction('reject', { reason: rejectReason })} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
