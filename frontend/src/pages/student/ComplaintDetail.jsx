import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, User, Calendar, MapPin, Tag, Download, MessageSquare, Reply, X, Check, Eye, FileText, Sparkles, Send } from 'lucide-react';
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
  const [postingComment, setPostingComment] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const [res, timeRes] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getTimeline(id).catch(() => ({ data: { data: { timeline: [] } } }))
      ]);
      
      const comp = res.data?.data?.complaint || res.data?.complaint || res.data;
      const historyList = timeRes.data?.data?.timeline || timeRes.data?.timeline || res.data?.data?.history || res.data?.history || [];
      
      setComplaint(comp);
      setTimeline(Array.isArray(historyList) ? historyList : []);
    } catch (error) {
      console.error('Failed to fetch complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      setPostingComment(true);
      await complaintAPI.reply(id, { message: replyText.trim() });
      toast.success('Comment posted successfully');
      setReplyText('');
      await fetchComplaint();
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleAction = async (action, payload = {}) => {
    try {
      if (action === 'resolve') {
        await complaintAPI.resolve(id, { resolutionNote: payload.note || resolveNote });
        toast.success('Complaint marked as resolved');
      } else if (action === 'reject') {
        await complaintAPI.reject(id, { reason: payload.reason || rejectReason });
        toast.success('Complaint rejected');
      } else if (action === 'escalate') {
        await complaintAPI.escalate(id, { reason: payload.reason || 'Escalated manually' });
        toast.success('Complaint escalated');
      }
      setShowResolveModal(false);
      setShowRejectModal(false);
      await fetchComplaint();
    } catch (err) {
      console.error('Action failed:', err);
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500">Loading complaint details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Complaint Not Found</h2>
          <p className="text-gray-500 mb-4">The requested complaint could not be loaded or does not exist.</p>
          <Link to="/student/complaints" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block text-sm font-medium">
            Back to Complaints
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user?.role === 'student';
  const isHandler = user?.role && user?.role !== 'student';
  const isOverdue = complaint.deadline && new Date(complaint.deadline) < new Date();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-lg tracking-wider">
                {complaint.complaintNumber}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                {complaint.status?.replace('_', ' ')}
              </span>
              {(complaint.priority?.toLowerCase() === 'high' || complaint.priority?.toLowerCase() === 'critical') && (
                <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {complaint.priority} Priority
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{complaint.title}</h1>
          </div>

          {/* Deadline Badge */}
          {complaint.deadline && (
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 min-w-[200px]">
              <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">SLA Deadline</p>
                <p className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {isOverdue ? 'OVERDUE' : new Date(complaint.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>
              
              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" /> Attachments ({complaint.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.attachments.map((file, idx) => {
                      const isImg = file.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.filename || file.originalName || file.url || '');
                      const fileUrl = file.url?.startsWith('http') ? file.url : `http://localhost:5000${file.url}`;
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg bg-white p-3 flex flex-col group relative hover:shadow-sm transition-all">
                          <div className="h-28 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                            {isImg ? (
                              <img src={fileUrl} alt={file.originalName || file.filename} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-10 h-10 text-indigo-500" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 truncate" title={file.originalName || file.filename}>
                            {file.originalName || file.filename}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Attached document'}
                          </span>
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            download={file.originalName || file.filename}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white font-medium text-xs gap-1.5"
                          >
                            <Download className="w-4 h-4" /> Download / View
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Communication / Action Panel */}
            {complaint.status?.toLowerCase() !== 'resolved' && complaint.status?.toLowerCase() !== 'rejected' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" /> Add Update / Comment
                </h2>
                <textarea 
                  rows={4} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                  placeholder="Type your reply or follow-up note here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div></div>
                  <button 
                    onClick={handleReply}
                    disabled={postingComment || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {postingComment ? 'Posting...' : 'Post Comment'}
                  </button>
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

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No activity recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                  {timeline.map((item, idx) => {
                    const actionName = item.action || item.title || 'Update';
                    const isEscalation = actionName.toLowerCase().includes('escalat') || item.type === 'escalation';
                    const isResolved = actionName.toLowerCase().includes('resolv') || item.type === 'resolved';
                    const isComment = actionName.toLowerCase().includes('comment') || actionName.toLowerCase().includes('repli');
                    const badgeColor = isResolved ? 'bg-green-500' : isEscalation ? 'bg-orange-500' : isComment ? 'bg-indigo-500' : 'bg-blue-500';

                    return (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute -left-2.5 mt-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${badgeColor}`}></div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-gray-900">{actionName}</h4>
                            {item.performedByName && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                {item.performedByName} {item.performedByRole ? `(${item.performedByRole})` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.description || item.message || ''}</p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {new Date(item.createdAt || item.date || Date.now()).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <p className="font-medium text-sm">{complaint.studentName || complaint.studentId?.name || complaint.student?.name || 'Student'}</p>
                  {(complaint.studentClass || complaint.studentRoll) && (
                    <p className="text-xs text-gray-400">{complaint.studentClass} • {complaint.studentRoll}</p>
                  )}
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
              <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">4-Tier Escalation Path</h3>
              <div className="space-y-4 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 z-0"></div>
                
                {['Teacher', 'TG', 'Class Incharge', 'HOD'].map((level, idx) => {
                  const currentTier = complaint.escalationLevel ?? 0;
                  const isActive = currentTier === idx;
                  const isPast = currentTier > idx;
                  
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
                        {isActive && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            Currently handling ({complaint.currentHandlerName || complaint.currentHandlerId?.name || complaint.currentHandler || level})
                          </p>
                        )}
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
