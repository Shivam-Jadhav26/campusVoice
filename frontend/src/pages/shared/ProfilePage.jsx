import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Building, Calendar, Shield, Save, KeyRound, CheckCircle } from 'lucide-react';
import { userAPI, authAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [tgList, setTgList] = useState([]);
  const [classInchargeList, setClassInchargeList] = useState([]);
  
  React.useEffect(() => {
    if (user?.role === 'student') {
      userAPI.getAll({ role: 'tg', limit: 100 }).then(res => setTgList(res.data.data.users || res.data.data || []));
      userAPI.getAll({ role: 'class_incharge', limit: 100 }).then(res => setClassInchargeList(res.data.data.users || res.data.data || []));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 98201 10002',
    class: user?.class || 'SE-A',
    rollNumber: user?.rollNumber || 'CE2024001',

    currentYear: user?.currentYear || '2nd Year',
    batch: user?.batch || '2023-2027',
    teacherGuardian: user?.teacherGuardian || '',
    classIncharge: user?.classIncharge || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await userAPI.updateProfile(formData);
      if (refreshUser) await refreshUser();
      toast.success('Profile information updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setSavingPassword(true);
      await authAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Profile & Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your personal credentials, contact details, and institutional role info.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-sky-400 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border-4 border-white shadow-lg shadow-indigo-500/20">
                {getInitials(user?.name || formData.name)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || 'User'}</h2>
              <div className="mt-1">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {user?.role?.replace('_', ' ') || 'Student'}
                </span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-left">
                <div className="flex items-center text-slate-600">
                  <Mail className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email || 'user@demo.com'}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Building className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span>{user?.departmentName || 'Computer Engineering'}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span>Active Member • {user?.batch || '2024-2025'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Profile Details Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  Personal & Academic Information
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  {isEditing ? 'Cancel' : 'Edit Information'}
                </button>
              </div>

              <form onSubmit={handleProfileSave} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                    />
                  </div>
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Class / Section</label>
                        <input 
                          type="text" 
                          disabled={!isEditing} 
                          value={formData.class} 
                          onChange={e => setFormData({...formData, class: e.target.value})} 
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Roll Number</label>
                        <input 
                          type="text" 
                          disabled={!isEditing} 
                          value={formData.rollNumber} 
                          onChange={e => setFormData({...formData, rollNumber: e.target.value})} 
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current Year</label>
                        <input 
                          type="text" 
                          disabled={!isEditing} 
                          value={formData.currentYear} 
                          onChange={e => setFormData({...formData, currentYear: e.target.value})} 
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Batch</label>
                        <input 
                          type="text" 
                          disabled={!isEditing} 
                          value={formData.batch} 
                          onChange={e => setFormData({...formData, batch: e.target.value})} 
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm" 
                        />
                      </div>
                    </>
                  )}
                  
                  {user?.role !== 'student' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Department</label>
                      <input 
                        type="text" 
                        disabled={true} 
                        value={user?.departmentName || 'Computer Engineering'} 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-500 text-sm" 
                      />
                    </div>
                  )}
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tutor Guardian</label>
                        <select
                          disabled={!isEditing}
                          value={formData.teacherGuardian}
                          onChange={e => setFormData({...formData, teacherGuardian: e.target.value})}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm"
                        >
                          <option value="">Select TG</option>
                          {tgList.map(t => (
                            <option key={t._id} value={t._id}>{t.name} ({t.departmentName})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Class Incharge</label>
                        <select
                          disabled={!isEditing}
                          value={formData.classIncharge}
                          onChange={e => setFormData({...formData, classIncharge: e.target.value})}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm"
                        >
                          <option value="">Select Class Incharge</option>
                          {classInchargeList.map(c => (
                            <option key={c._id} value={c._id}>{c.name} ({c.departmentName})</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={savingProfile}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-bold text-xs shadow-md shadow-indigo-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Security & Password
                </h3>
              </div>

              <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter current password"
                    value={passwordData.oldPassword} 
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                    className="w-full max-w-md px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required 
                    minLength={6} 
                    placeholder="Min 6 characters"
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    className="w-full max-w-md px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    minLength={6} 
                    placeholder="Re-type new password"
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    className="w-full max-w-md px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={savingPassword}
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl hover:bg-black font-bold text-xs shadow-sm"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
