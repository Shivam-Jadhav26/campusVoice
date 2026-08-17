import React, { useState } from 'react';
import { Save } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [escalation, setEscalation] = useState({
    teacher: 48,
    tg: 72,
    classIncharge: 96,
    hod: 120
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Escalation Timers (Hours)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher to TG</label>
              <input type="number" value={escalation.teacher} onChange={e => setEscalation({...escalation, teacher: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TG to Class Incharge</label>
              <input type="number" value={escalation.tg} onChange={e => setEscalation({...escalation, tg: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Incharge to HOD</label>
              <input type="number" value={escalation.classIncharge} onChange={e => setEscalation({...escalation, classIncharge: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOD to Committee</label>
              <input type="number" value={escalation.hod} onChange={e => setEscalation({...escalation, hod: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> Save Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">General Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input type="text" defaultValue="Campus Voice" className="w-full max-w-md border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" defaultValue="support@campusvoice.edu" className="w-full max-w-md border rounded-lg p-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Update Preferences</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
