import React, { useState, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
import { departmentAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentAPI.getAll()
      .then(res => {
        const list = res.data?.data?.departments || res.data?.departments || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <div key={dept._id} className="bg-white rounded-lg shadow p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600"><Edit className="w-4 h-4"/></button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{dept.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Code: {dept.code}</p>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">HOD:</span>
                  <span className="font-medium text-gray-900">{dept.hod?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Users:</span>
                  <span className="font-medium text-gray-900">{dept.totalUsers || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
