import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, UserX, UserCheck, Edit2, Loader2, AlertTriangle } from 'lucide-react';
import { userAPI, departmentAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'tg', label: 'Tutor Guardian' },
  { value: 'class_incharge', label: 'Class Incharge' },
  { value: 'hod', label: 'HOD' },
  { value: 'admin', label: 'Admin' },
];

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  department: '',
  phone: '',
  class: '',
};

// ─── User Form Modal ────────────────────────────────────────────────────────

function UserFormModal({ isOpen, onClose, onSubmit, editingUser, departments, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setForm({
          name: editingUser.name || '',
          email: editingUser.email || '',
          password: '', // never pre-fill password
          role: editingUser.role || 'student',
          department: editingUser.department?._id || editingUser.department || '',
          phone: editingUser.phone || '',
          class: editingUser.class || '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editingUser]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    // Build payload — exclude empty password on edit
    const payload = { ...form };
    if (editingUser && !payload.password) {
      delete payload.password;
    }
    // Send department as ObjectId string or empty
    if (!payload.department) {
      delete payload.department;
    }

    onSubmit(payload);
  };

  const isEditing = !!editingUser;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit User' : 'Add New User'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Prof. Rajesh Kulkarni"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isEditing}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="user@campus.edu"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEditing ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!isEditing}
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder={isEditing ? '••••••••' : 'Min 6 characters'}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">— Select Department —</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Class (for students) */}
        {(form.role === 'student') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input
              type="text"
              name="class"
              value={form.class}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. SE-A"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────────

function ConfirmDialog({ isOpen, onClose, onConfirm, user, saving }) {
  if (!isOpen || !user) return null;
  const willDeactivate = user.isActive;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={willDeactivate ? 'Deactivate User' : 'Activate User'} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full shrink-0 ${willDeactivate ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              {willDeactivate
                ? <>Are you sure you want to <strong>deactivate</strong> <strong>{user.name}</strong>? They will not be able to log in.</>
                : <>Are you sure you want to <strong>reactivate</strong> <strong>{user.name}</strong>? They will regain access.</>
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">{user.email} — {user.role}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              willDeactivate ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {willDeactivate ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Role Badge ─────────────────────────────────────────────────────────────

const roleBadgeColors = {
  student: 'bg-blue-50 text-blue-700 border-blue-200',
  teacher: 'bg-purple-50 text-purple-700 border-purple-200',
  tg: 'bg-amber-50 text-amber-700 border-amber-200',
  class_incharge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  hod: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  admin: 'bg-red-50 text-red-700 border-red-200',
};

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  tg: 'TG',
  class_incharge: 'Class Incharge',
  hod: 'HOD',
  admin: 'Admin',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // Confirm dialog
  const [confirmUser, setConfirmUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      const list = res.data?.data?.users || res.data?.users || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAll();
      const list = res.data?.data?.departments || res.data?.departments || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setDepartments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = () => {
    setEditingUser(null);
    setShowFormModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowFormModal(true);
  };

  const handleToggleStatus = (user) => {
    setConfirmUser(user);
    setShowConfirm(true);
  };

  const handleFormSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
        toast.success(`User "${formData.name}" updated successfully`);
      } else {
        await userAPI.create(formData);
        toast.success(`User "${formData.name}" created successfully`);
      }
      setShowFormModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmUser) return;
    setSaving(true);
    try {
      await userAPI.toggleStatus(confirmUser._id);
      toast.success(`User "${confirmUser.name}" ${confirmUser.isActive ? 'deactivated' : 'activated'} successfully`);
      setShowConfirm(false);
      setConfirmUser(null);
      await fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update user status';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">{users.length} total users</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none sm:w-48"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="ml-3 text-gray-500">Loading users...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <UserX className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                            {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                            <div className="text-sm text-gray-500 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${roleBadgeColors[u.role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.department?.name || u.departmentName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          u.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingUser(null); }}
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        departments={departments}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setConfirmUser(null); }}
        onConfirm={handleConfirmToggle}
        user={confirmUser}
        saving={saving}
      />
    </DashboardLayout>
  );
}
