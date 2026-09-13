import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return 'Dashboard';
  
  const page = parts[1];
  
  const titles = {
    'dashboard': 'Dashboard',
    'complaints': 'Complaints',
    'submit': 'Submit Complaint',
    'feedback': 'Feedback',
    'academic-review': 'Academic Review',
    'users': 'User Management',
    'departments': 'Departments',
    'analytics': 'Analytics',
    'logs': 'Audit Logs',
    'audit-logs': 'Audit Logs',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'profile': 'Profile'
  };

  return titles[page] || 'Dashboard';
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={title}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
