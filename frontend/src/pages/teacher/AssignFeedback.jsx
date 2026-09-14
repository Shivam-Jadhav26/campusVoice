import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackRequestAPI, userAPI, departmentAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function AssignFeedback() {
  useEffect(() => {
    departmentAPI.getAll().then(res => {
      setDepartments(res.data?.data?.departments || res.data?.departments || res.data || []);
    }).catch(err => console.error('Failed to load departments', err));
  }, []);

  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [departments, setDepartments] = useState([]);
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
    if (!studentSearch.trim() && !departmentFilter && !yearFilter && !classFilter) return toast.error('Enter a search term or select a filter');
    try {
      setIsSearching(true);
      // We assume userAPI.getAll allows searching by string
      const query = { role: 'student' };
      if (studentSearch.trim()) query.search = studentSearch.trim();
      if (departmentFilter) query.department = departmentFilter;
      if (yearFilter) query.currentYear = yearFilter;
      if (classFilter) query.userClass = classFilter;
      
      const res = await userAPI.getAll(query);
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
    if (!departmentFilter && !yearFilter && !classFilter) return toast.error('Please select at least one filter to assign students');
    
    // Validate fields
    for (let f of fields) {
      if (!f.label.trim()) return toast.error('All fields must have a label');
    }

    try {
      setIsSubmitting(true);
      
      const query = { role: 'student', limit: 500 };
      if (departmentFilter) query.department = departmentFilter;
      if (yearFilter) query.currentYear = yearFilter;
      if (classFilter) query.userClass = classFilter;
      
      const res = await userAPI.getAll(query);
      const fetchedStudents = res.data.data.users || res.data.data || [];
      
      if (fetchedStudents.length === 0) {
        toast.error('No students found matching these filters');
        setIsSubmitting(false);
        return;
      }
      
      const studentIds = fetchedStudents.map(s => s._id);

      await feedbackRequestAPI.createRequest({
        title,
        description,
        studentIds,
        fields
      });
      toast.success(`Feedback request assigned to ${fetchedStudents.length} students successfully!`);
      navigate('/teacher/dashboard');
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
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select 
                      value={departmentFilter} 
                      onChange={e => setDepartmentFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                    >
                      <option value="">All Departments</option>
                      {departments.map(d => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={yearFilter} 
                      onChange={e => setYearFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                    >
                      <option value="">All Years</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                    
                    <select 
                      value={classFilter} 
                      onChange={e => setClassFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                    >
                      <option value="">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>

                </div>
                <p className="text-xs text-gray-500 mt-2">The feedback form will be assigned to all students matching these filters.</p>
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
                disabled={isSubmitting || fields.length === 0}
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
