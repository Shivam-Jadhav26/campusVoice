import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackRequestAPI, userAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function AssignFeedback() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fields, setFields] = useState([
    { label: 'Overall Performance', type: 'rating', required: true }
  ]);

  const handleAddString = (type) => {
    setFields([...fields, { label: '', type, required: false }]);
  };

  const removeField = (index) => {
    if (fields.length === 1) return toast.error('You need at least one field');
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleSearch = async () => {
    if (!studentSearch.trim()) return toast.error('Enter a roll number or name');
    try {
      setIsSearching(true);
      // We assume userAPI.getAll allows searching by string
      const res = await userAPI.getAll({ search: studentSearch, role: 'student' });
      setStudents(res.data.data.users || res.data.data || []);
      if ((res.data.data.users || res.data.data || []).length === 0) {
        toast.info('No students found matching your search');
      }
    } catch (error) {
      toast.error('Failed to search students');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!selectedStudent) return toast.error('Please select a student');
    
    // Validate fields
    for (let f of fields) {
      if (!f.label.trim()) return toast.error('All fields must have a label');
    }

    try {
      setIsSubmitting(true);
      await feedbackRequestAPI.createRequest({
        title,
        description,
        studentId: selectedStudent._id,
        fields
      });
      toast.success('Feedback request assigned successfully!');
      navigate('/teacher/dashboard'); // redirect to dashboard or wherever appropriate
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign feedback request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Feedback Form</h1>
          <p className="text-gray-600">Create a dynamic feedback form and assign it to a student.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Form Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">1. Form Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Mid-semester Performance Review"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Instructions for the student..."
                  rows={3}
                />
              </div>
            </div>

            {/* Select Student */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-800">2. Assign to Student *</h2>
              
              {!selectedStudent ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Search student by Name or Roll Number"
                    />
                    <button 
                      type="button" 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 flex items-center"
                    >
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {students.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                      {students.map(s => (
                        <div key={s._id} className="flex justify-between items-center p-3 border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.rollNumber} • {s.class} • {s.departmentName}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => { setSelectedStudent(s); setStudents([]); }}
                            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-900">{selectedStudent.name}</p>
                      <p className="text-xs text-indigo-700">{selectedStudent.rollNumber} • {selectedStudent.departmentName}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Form Builder */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">3. Form Fields</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleAddString('text')} className="text-xs flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300">
                    <Plus className="w-3 h-3 mr-1" /> Text
                  </button>
                  <button type="button" onClick={() => handleAddString('textarea')} className="text-xs flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300">
                    <Plus className="w-3 h-3 mr-1" /> Text Area
                  </button>
                  <button type="button" onClick={() => handleAddString('rating')} className="text-xs flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300">
                    <Plus className="w-3 h-3 mr-1" /> Rating
                  </button>
                  <button type="button" onClick={() => handleAddString('number')} className="text-xs flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300">
                    <Plus className="w-3 h-3 mr-1" /> Number
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Field Label *</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => updateField(idx, 'label', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                          placeholder="e.g. Communication Skills"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded capitalize">{field.type} Field</span>
                        
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e => updateField(idx, 'required', e.target.checked)}
                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeField(idx)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting || !selectedStudent || fields.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Assign Feedback Form
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
