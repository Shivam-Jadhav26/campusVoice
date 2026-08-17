import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Upload, FileText, CheckCircle, Clock, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { academicReviewAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function AcademicReview() {
  const [activeTab, setActiveTab] = useState('submit');
  const [file, setFile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => {
    if (activeTab === 'my-reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoadingList(true);
      const res = await academicReviewAPI.getAll();
      const list = res.data?.data?.reviews || res.data?.reviews || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setReviews(list);
    } catch (err) {
      toast.error('Failed to load academic reviews');
    } finally {
      setLoadingList(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('subjectName', data.subjectName || data.subject);
      formData.append('subjectCode', data.subjectCode);
      formData.append('examType', data.examType);
      formData.append('semester', data.semester || 3);
      formData.append('originalMarks', data.originalMarks || data.marks || 0);
      formData.append('maxMarks', data.maxMarks || 40);
      formData.append('reason', data.reason);
      if (file) {
        formData.append('attachments', file);
      }

      await academicReviewAPI.create(formData);
      toast.success('Academic review request submitted successfully!');
      reset();
      setFile(null);
      setActiveTab('my-reviews');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review request');
    }
  };

  const getStatusBadge = (status = '') => {
    switch (status) {
      case 'Pending':
      case 'Under Faculty Review':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Faculty Review</span>;
      case 'Under HOD Review':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Sparkles className="w-3 h-3 mr-1" /> HOD Endorsement</span>;
      case 'Accepted':
      case 'Marks Updated':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" /> Marks Updated</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Review & Re-evaluation</h1>
            <p className="text-gray-600 text-sm">Request question paper re-checking, mark verification, and view faculty moderation remarks.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'submit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submit Request
            </button>
            <button
              onClick={() => setActiveTab('my-reviews')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'my-reviews' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Re-evaluations
            </button>
          </div>
        </div>

        {activeTab === 'submit' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject Name *</label>
                  <input
                    type="text"
                    {...register('subjectName', { required: 'Subject name is required' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    placeholder="e.g. Data Structures & Algorithms"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject Code</label>
                  <input
                    type="text"
                    {...register('subjectCode')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    placeholder="e.g. CS201"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Exam Type *</label>
                  <select
                    {...register('examType', { required: 'Please select exam type' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="Mid-Term">Mid-Term Assessment</option>
                    <option value="End-Term">End-Term / Semester Exam</option>
                    <option value="Internal">Internal Practical / Quiz</option>
                    <option value="Assignment">Assignment Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Semester</label>
                  <select
                    {...register('semester')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Marks Awarded *</label>
                    <input
                      type="number"
                      {...register('originalMarks', { required: true })}
                      placeholder="e.g. 24"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Maximum Marks *</label>
                    <input
                      type="number"
                      {...register('maxMarks', { required: true })}
                      placeholder="e.g. 40"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Scanned Copy (Optional)</label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" onChange={handleFileChange} className="hidden" id="sheet-upload" accept=".pdf,.jpg,.jpeg,.png" />
                    <label htmlFor="sheet-upload" className="cursor-pointer text-xs flex items-center justify-center gap-2 text-indigo-600 font-semibold">
                      <Upload className="w-4 h-4" />
                      <span>{file ? file.name : 'Upload PDF or photo'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Discrepancy Details & Justification *</label>
                <textarea 
                  {...register('reason', { required: 'Please explain the marking discrepancy', minLength: { value: 15, message: 'Minimum 15 characters required' } })} 
                  rows={4} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" 
                  placeholder="Mention specific questions, formula deductions, or step marks that need to be rechecked..." 
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Submit Re-evaluation Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loadingList ? (
              <div className="p-8 text-center text-slate-400">Loading requests...</div>
            ) : reviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Request ID</th>
                      <th className="px-6 py-4">Subject & Exam</th>
                      <th className="px-6 py-4">Original Marks</th>
                      <th className="px-6 py-4">Status & Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviews.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-indigo-600 text-xs">
                          {req.requestId}
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{req.subjectName}</div>
                          <div className="text-xs text-slate-500">{req.subjectCode || 'CS'} • {req.examType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{req.originalMarks}</span> / {req.maxMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div>{getStatusBadge(req.status)}</div>
                            {req.facultyDecision?.revisedMarks && (
                              <div className="text-xs font-bold text-emerald-700">
                                Revised: {req.facultyDecision.revisedMarks} / {req.maxMarks}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-800 text-sm">No re-evaluation requests filed yet</p>
                <p className="text-xs text-slate-400 mt-1">When you submit an academic review, it will be tracked here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
