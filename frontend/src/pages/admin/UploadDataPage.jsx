import React, { useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Upload, Database, Users, Building2, HardDrive, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadDataPage() {
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success('Data uploaded successfully!');
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      toast.success('Data uploaded successfully!');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Management Hub</h1>
          <p className="text-gray-500">Overview and bulk upload of system data.</p>
        </div>

        {/* Dummy Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">62</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">62</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Departments</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">300 KB</p>
            </div>
          </div>
        </div>

        {/* Main Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload New Data</h2>
              <p className="text-sm text-gray-500 mt-1">Upload CSV or Excel files to bulk import students, faculty, or department data.</p>
            </div>

            <div 
              className="mt-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload} 
                accept=".csv, .xlsx, .xls"
              />
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-50 text-primary-600 rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Click or drag file to this area to upload</h3>
              <p className="text-sm text-gray-500 mt-2">Support for a single or bulk upload. Strictly prohibited from uploading company data or other band files.</p>
              
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> CSV</span>
                <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Excel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads Dummy Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Recent Uploads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">File Name</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    students_batch_2026.csv
                  </td>
                  <td className="px-6 py-4 text-gray-500">Today, 09:41 AM</td>
                  <td className="px-6 py-4 text-gray-500">2.4 MB</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Success
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    departments_update.xlsx
                  </td>
                  <td className="px-6 py-4 text-gray-500">Yesterday, 14:20 PM</td>
                  <td className="px-6 py-4 text-gray-500">1.1 MB</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Success
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
