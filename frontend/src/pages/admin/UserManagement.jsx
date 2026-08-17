import React, { useState, useEffect } from 'react';
import { Search, Plus, UserX, Edit2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      const list = res.data?.data?.users || res.data?.users || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500" 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{u.role}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.department?.name || '-'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4 text-sm font-medium flex gap-3">
                    <button className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4"/></button>
                    <button className="text-red-600 hover:text-red-900"><UserX className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
