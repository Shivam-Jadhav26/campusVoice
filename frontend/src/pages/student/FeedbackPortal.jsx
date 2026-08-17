import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Star, MessageSquare, Send, CheckCircle, ShieldAlert, Sparkles, Loader2, HeartHandshake } from 'lucide-react';
import { feedbackAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function FeedbackPortal() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my-feedback'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      type: 'Academic',
      isAnonymous: false,
      comment: ''
    }
  });

  const feedbackTypes = ['Academic', 'Infrastructure', 'Library', 'Hostel', 'Mess', 'Faculty', 'General'];

  useEffect(() => {
    if (activeTab === 'my-feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const fetchFeedbacks = async () => {
    try {
      setLoadingList(true);
      const res = await feedbackAPI.getAll();
      const list = res.data?.data?.feedbacks || res.data?.feedbacks || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setFeedbackList(list);
    } catch (err) {
      toast.error('Failed to load feedback history');
    } finally {
      setLoadingList(false);
    }
  };

  const onSubmit = async (data) => {
    if (!rating) {
      toast.error('Please select a star rating');
      return;
    }

    try {
      const payload = {
        ...data,
        rating,
        type: data.type || 'General'
      };

      await feedbackAPI.create(payload);
      toast.success('Thank you! Your feedback has been submitted.');
      reset();
      setRating(5);
      setActiveTab('my-feedback');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback & Suggestions Portal</h1>
            <p className="text-gray-600 text-sm">Help improve campus facilities, academics, and services with your suggestions.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'submit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-feedback')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'my-feedback' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History & Insights
            </button>
          </div>
        </div>

        {activeTab === 'submit' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {feedbackTypes.map(type => (
                    <label
                      key={type}
                      className={`cursor-pointer px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                        watch('type') === type
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <input type="radio" value={type} {...register('type', { required: true })} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2 px-2.5 py-1 rounded-full bg-slate-100">
                    {rating === 1 && '1/5 - Poor'}
                    {rating === 2 && '2/5 - Fair'}
                    {rating === 3 && '3/5 - Average'}
                    {rating === 4 && '4/5 - Good'}
                    {rating === 5 && '5/5 - Excellent'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Detailed Suggestion / Review *
                </label>
                <textarea
                  {...register('comment', { required: 'Please provide feedback comments', minLength: { value: 10, message: 'Minimum 10 characters' } })}
                  rows={4}
                  placeholder="Share what went well or how the administration can improve facilities, academics, or campus life..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Submit Anonymously</p>
                    <p className="text-xs text-slate-500">Your name and roll number will be completely hidden from the reviewers.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('isAnonymous')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Campus Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {loadingList ? (
              <div className="p-8 text-center text-slate-400">Loading feedbacks...</div>
            ) : feedbackList.length > 0 ? (
              feedbackList.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-6">
                  <div className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{item.type}</span>
                    <div className="flex items-center gap-1 my-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            (item.rating || 5) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {item.isAnonymous && (
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      "{item.comment}"
                    </p>

                    {item.adminNote && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Admin Acknowledgment</p>
                          <p className="text-xs text-slate-600 mt-0.5">{item.adminNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-800 text-sm">No feedback submitted yet</p>
                <p className="text-xs text-slate-400 mt-1">Submit your first suggestion to see it tracked here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
