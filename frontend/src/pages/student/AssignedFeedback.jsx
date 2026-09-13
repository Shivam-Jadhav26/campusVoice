import React, { useState, useEffect } from 'react';
import { FileText, Loader2, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackRequestAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function AssignedFeedback() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await feedbackRequestAPI.getStudentRequests();
      setRequests(res.data.data.requests || []);
    } catch (error) {
      toast.error('Failed to load assigned feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRequest = (req) => {
    setActiveRequest(req);
    const initialResponses = {};
    req.fields.forEach(f => {
      initialResponses[f._id] = f.type === 'rating' ? 0 : '';
    });
    setResponses(initialResponses);
  };

  const handleResponseChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const formattedResponses = [];
    for (let f of activeRequest.fields) {
      const val = responses[f._id];
      if (f.required && (val === '' || val === 0 || val === null)) {
        return toast.error(`Please fill out the required field: ${f.label}`);
      }
      formattedResponses.push({ fieldId: f._id, value: val });
    }

    try {
      setIsSubmitting(true);
      await feedbackRequestAPI.submitResponse(activeRequest._id, formattedResponses);
      toast.success('Feedback submitted successfully!');
      setActiveRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field) => {
    const val = responses[field._id];
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={val}
            onChange={(e) => handleResponseChange(field._id, e.target.value)}
            required={field.required}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your response here..."
          />
        );
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleResponseChange(field._id, num)}
                className={`w-10 h-10 rounded-full font-bold transition-colors ${val >= num ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {num}
              </button>
            ))}
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={val}
            onChange={(e) => handleResponseChange(field._id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 max-w-xs"
            placeholder="0"
          />
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => handleResponseChange(field._id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Short response..."
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Feedback</h1>
          <p className="text-gray-600">Feedback forms assigned to you by faculty.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
            <p className="text-gray-500">You don't have any pending feedback requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* List */}
            <div className="md:col-span-1 space-y-3">
              {requests.map(req => (
                <div 
                  key={req._id}
                  onClick={() => handleOpenRequest(req)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${activeRequest?._id === req._id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-indigo-300 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${req.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{req.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-3">{req.description}</p>
                  <p className="text-xs font-medium text-indigo-700">From: {req.facultyId?.name}</p>
                </div>
              ))}
            </div>

            {/* Form View */}
            <div className="md:col-span-2">
              {activeRequest ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{activeRequest.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{activeRequest.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-700 mr-2">Assigned by:</span>
                      {activeRequest.facultyId?.name} ({activeRequest.facultyId?.role})
                    </div>
                  </div>

                  {activeRequest.status === 'Completed' ? (
                    <div className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Submitted</h3>
                      <p className="text-gray-500">You have already completed this feedback form.</p>
                      <p className="text-xs text-gray-400 mt-2">Submitted on: {new Date(activeRequest.submittedAt).toLocaleString()}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      {activeRequest.fields.map(field => (
                        <div key={field._id} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderFieldInput(field)}
                        </div>
                      ))}

                      <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                          Submit Answers
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <FileText className="w-12 h-12 mb-4 text-gray-300" />
                  <p>Select a feedback request from the list to view and fill it out.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
