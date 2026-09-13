import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    escalationTeacher: 24,
    escalationTG: 48,
    escalationClassIncharge: 72,
    escalationHOD: 120,
    appName: 'Campus Voice',
    supportEmail: 'support@campusvoice.edu'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.get();
      if (res.data?.data?.settings) {
        setSettings(res.data.data.settings);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Escalation Timers (Hours)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher to TG</label>
              <input 
                type="number" 
                value={settings.escalationTeacher} 
                onChange={e => handleChange('escalationTeacher', parseInt(e.target.value) || 0)} 
                className="w-full border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TG to Class Incharge</label>
              <input 
                type="number" 
                value={settings.escalationTG} 
                onChange={e => handleChange('escalationTG', parseInt(e.target.value) || 0)} 
                className="w-full border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Incharge to HOD</label>
              <input 
                type="number" 
                value={settings.escalationClassIncharge} 
                onChange={e => handleChange('escalationClassIncharge', parseInt(e.target.value) || 0)} 
                className="w-full border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOD Resolution SLA</label>
              <input 
                type="number" 
                value={settings.escalationHOD} 
                onChange={e => handleChange('escalationHOD', parseInt(e.target.value) || 0)} 
                className="w-full border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">General Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input 
                type="text" 
                value={settings.appName} 
                onChange={e => handleChange('appName', e.target.value)} 
                className="w-full max-w-md border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={e => handleChange('supportEmail', e.target.value)} 
                className="w-full max-w-md border rounded-lg p-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
