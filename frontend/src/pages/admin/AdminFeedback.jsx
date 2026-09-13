import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, Star, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { feedbackAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Infrastructure', 'Library', 'Hostel', 'Mess', 'Faculty', 'General'];
const PAGE_SIZE = 15;

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Review Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (typeFilter) params.type = typeFilter;
      if (ratingFilter) {
        params.minRating = ratingFilter;
        params.maxRating = ratingFilter;
      }

      const res = await feedbackAPI.getAll(params);
      const data = res.data?.data || res.data || {};
      const list = data.feedbacks || (Array.isArray(data) ? data : []);
      
      setFeedbacks(Array.isArray(list) ? list : []);
      setTotal(data.total || list.length || 0);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, typeFilter, ratingFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, ratingFilter]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewNote.trim()) {
      toast.error('Review note cannot be empty');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await feedbackAPI.review(selectedFeedback._id, { note: reviewNote });
      toast.success('Feedback marked as reviewed');
      setSelectedFeedback(null);
      setReviewNote('');
      fetchFeedbacks(); // refresh list
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Oversight</h1>
            <p className="text-sm text-gray-500">Review student feedback across all departments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={ratingFilter} 
            onChange={e => setRatingFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : feedbacks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No feedback found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feedbacks.map(f => (
                <div key={f._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                  {/* Left Column - Meta */}
                  <div className="w-full md:w-64 shrink-0 space-y-4">
                    <div>
                      <div className="flex text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < f.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                        {f.type}
                      </span>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        {f.isAnonymous ? 'Anonymous Student' : (f.studentId?.name || f.studentName || 'Unknown Student')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 ml-5">
                        {f.department || f.departmentId?.name || 'No Dept'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Content */}
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      "{f.comment}"
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          f.sentiment === 'Positive' ? 'bg-green-50 text-green-700 border-green-200' :
                          f.sentiment === 'Negative' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {f.sentiment} Sentiment
                        </span>
                        {f.isReviewed && (
                          <span className="flex items-center text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Reviewed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {f.isReviewed && f.adminNote && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200 mt-2">
                        <span className="font-semibold text-gray-700">Admin Note:</span> {f.adminNote || f.reviewNote}
                      </div>
                    )}
                    
                    {!f.isReviewed && (
                      <button 
                        onClick={() => setSelectedFeedback(f)}
                        className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 mt-2"
                      >
                        Add Review Note
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="space-x-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal 
        isOpen={!!selectedFeedback} 
        onClose={() => { setSelectedFeedback(null); setReviewNote(''); }} 
        title="Review Feedback"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Add your review notes here..."
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">This note is for admin use only and will not be visible to the student.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSelectedFeedback(null)}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 flex items-center"
            >
              {submittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Review
            </button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
}
