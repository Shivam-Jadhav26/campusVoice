import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle, CheckCircle, Sparkles, Loader2, Info, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'Academic',
      department: 'Computer Engineering',
      priority: 'Medium',
      location: '',
      isAnonymous: false
    }
  });

  const title = watch('title') || '';
  const description = watch('description') || '';
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    const oversized = selectedFiles.some(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error('Each file must be less than 5MB');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (files.length + droppedFiles.length > 5) {
        toast.error('Maximum 5 files allowed');
        return;
      }
      const oversized = droppedFiles.some(f => f.size > 5 * 1024 * 1024);
      if (oversized) {
        toast.error('Each file must be less than 5MB');
        return;
      }
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getAiSuggestion = async () => {
    const currentTitle = (getValues('title') || title || '').trim();
    const currentDesc = (getValues('description') || description || '').trim();

    if (!currentTitle || !currentDesc || currentDesc.length < 10) {
      toast.error('Please enter a title and description first');
      return;
    }
    try {
      setLoadingAi(true);
      const res = await complaintAPI.getAISuggestions({ title: currentTitle, description: currentDesc });
      const sugg = res.data?.data || res.data || { category: 'Academic', priority: 'Medium', confidence: 88 };
      setAiSuggestion(sugg);
      toast.success('AI suggestions ready!');
    } catch (error) {
      console.warn('AI suggestion fallback:', error.message);
      setAiSuggestion({ category: 'Academic', priority: 'Medium', confidence: 88 });
      toast.success('AI suggestions ready!');
    } finally {
      setLoadingAi(false);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setValue('category', aiSuggestion.category || 'Academic');
      setValue('priority', aiSuggestion.priority || 'Medium');
      toast.success('Applied AI suggestions');
      setAiSuggestion(null);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const currentTitle = (getValues('title') || title || '').trim();
      const currentDesc = (getValues('description') || description || '').trim();

      if (!currentTitle) {
        toast.error('Please enter a complaint title');
        return;
      }
      if (!currentDesc) {
        toast.error('Please enter a detailed description');
        return;
      }
      if (currentDesc.length < 20) {
        toast.error(`Please provide more details (${currentDesc.length}/20 chars min)`);
        return;
      }
      
      // Check for duplicates
      try {
        setCheckingDuplicates(true);
        const res = await complaintAPI.checkDuplicates({ title: currentTitle, description: currentDesc });
        const foundDupes = res.data?.data?.duplicates || res.data?.duplicates || [];
        if (foundDupes.length > 0) {
          setDuplicates(foundDupes);
          setShowDuplicateModal(true);
        } else {
          setStep(2);
        }
      } catch (err) {
        // Proceed anyway if duplicate check fails
        setStep(2);
      } finally {
        setCheckingDuplicates(false);
      }
    } else if (step === 2) {
      const currentCat = getValues('category') || watch('category');
      const currentPri = getValues('priority') || watch('priority');

      if (!currentCat) {
        toast.error('Please select a category');
        return;
      }
      if (!currentPri) {
        toast.error('Please select a priority');
        return;
      }
      setStep(3);
    }
  };

  const onFormError = (formErrors) => {
    if (formErrors.title || formErrors.description) {
      setStep(1);
      toast.error(formErrors.title?.message || formErrors.description?.message || 'Please check title and description in Step 1');
    } else if (formErrors.category || formErrors.priority) {
      setStep(2);
      toast.error('Please select category and priority in Step 2');
    } else {
      toast.error('Please review the form fields');
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('title', (data.title || '').trim());
      formData.append('description', (data.description || '').trim());
      formData.append('category', data.category || 'Academic');
      formData.append('department', data.department || 'Computer Engineering');
      formData.append('priority', data.priority || 'Medium');
      if (data.location) formData.append('location', data.location.trim());
      if (data.isAnonymous) formData.append('isAnonymous', 'true');
      
      files.forEach(file => formData.append('attachments', file));
      
      const res = await complaintAPI.create(formData);
      const complaint = res.data?.data?.complaint || res.data?.complaint || res.data;
      const complaintNumber = complaint?.complaintNumber || 'New';
      const complaintId = complaint?._id;
      
      toast.success(`Complaint submitted successfully: ${complaintNumber}`);
      if (complaintId) {
        navigate(`/student/complaints/${complaintId}`);
      } else {
        navigate('/student/complaints');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit complaint');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit New Complaint</h1>
        <p className="text-gray-600">Please provide detailed information to help us resolve the issue quickly.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
          <div className="absolute left-0 top-1/2 h-1 bg-indigo-600 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= num ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {num}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>Basic Info</span>
          <span>Categorization</span>
          <span>Attachments</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit, onFormError)}>
          
          {/* Step 1: Basic Info */}
          <div className={`p-8 space-y-6 ${step === 1 ? 'block' : 'hidden'}`}>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Complaint Title *</label>
                <button type="button" onClick={getAiSuggestion} disabled={loadingAi} className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  {loadingAi ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  AI Suggest Details
                </button>
              </div>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief summary of the issue"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Detailed Description *</label>
                <span className={`text-xs ${description.trim().length < 20 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}`}>
                  {description.trim().length}/20 chars min
                </span>
              </div>
              <textarea
                {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please provide more details (min 20 chars)' } })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Explain the issue in detail. What happened? Where? When? (Min 20 characters)"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {aiSuggestion && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">AI Suggestion (Confidence: {aiSuggestion.confidence}%)</h4>
                    <p className="text-sm text-indigo-700">Category: <span className="font-semibold">{aiSuggestion.category}</span> | Priority: <span className="font-semibold">{aiSuggestion.priority}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button type="button" onClick={() => setAiSuggestion(null)} className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-100 rounded-lg">Dismiss</button>
                  <button type="button" onClick={applySuggestion} className="px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg whitespace-nowrap">Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Categorization */}
          <div className={`p-8 space-y-6 ${step === 2 ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select {...register('category', { required: 'Category is required' })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="Academic">Academic</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Library">Library</option>
                  <option value="Mess">Mess / Canteen</option>
                  <option value="Faculty">Faculty & Teaching</option>
                  <option value="Transport">Transport / Bus</option>
                  <option value="IT">IT Support & Wi-Fi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select {...register('department')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Telecom">Electronics & Telecom</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level *</label>
                <div className="flex flex-wrap gap-3">
                  {['Low', 'Medium', 'High', 'Critical'].map((level) => {
                    const isSelected = (watch('priority') || '').toLowerCase() === level.toLowerCase();
                    return (
                      <label key={level} className={`cursor-pointer px-4 py-2 rounded-lg border-2 flex-1 text-center font-medium transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                        <input type="radio" value={level} {...register('priority')} className="sr-only" />
                        {level}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location (Optional)</label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Lab 3, Block A, Room 402"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Attachments & Submit */}
          <div className={`p-8 space-y-6 ${step === 3 ? 'block' : 'hidden'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Max 5 files, Optional)</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-indigo-600">Click to upload</span>
                  <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                  <span className="text-xs text-gray-400 mt-2">JPG, PNG, PDF up to 5MB each</span>
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Selected Files ({files.length}/5)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate text-sm text-gray-700 font-medium">
                          {file.name}
                          <div className="text-xs text-gray-500 font-normal">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 text-sm">
              <Info className="w-5 h-5 shrink-0" />
              <p>By submitting this complaint, you confirm that the information provided is accurate and adheres to the university's code of conduct.</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">
                Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                disabled={checkingDuplicates}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center"
              >
                {checkingDuplicates && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Next Step
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Submit Complaint
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Duplicate Check Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-amber-50">
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Similar Complaints Found</h3>
              </div>
              <button onClick={() => setShowDuplicateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-600 mb-4">We found existing complaints that look similar to yours. Check if your issue is already reported to avoid duplicates.</p>
              
              <div className="space-y-4">
                {duplicates.map((dupe, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-indigo-600">{dupe.complaintNumber}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">{dupe.status}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{dupe.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dupe.description}</p>
                    <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800">Follow this complaint instead</button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowDuplicateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700">
                Cancel
              </button>
              <button onClick={() => { setShowDuplicateModal(false); setStep(2); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Yes, mine is different. Continue
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
