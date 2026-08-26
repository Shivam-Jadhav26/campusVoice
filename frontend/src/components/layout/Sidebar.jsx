import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/helpers';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  MessageSquare, 
  BookOpen, 
  Bell, 
  User, 
  Users, 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  Settings,
  LogOut,
  X,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const role = user.role;
  
  const getNavItems = (role) => {
    const common = [
      { label: 'Notifications', path: `/${role}/notifications`, icon: Bell },
      { label: 'Profile', path: `/${role}/profile`, icon: User },
    ];
    
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'My Complaints', path: '/student/complaints', icon: FileText },
          { label: 'Submit Complaint', path: '/student/complaints/create', icon: PlusCircle },
          { label: 'Feedback', path: '/student/feedback', icon: MessageSquare },
          { label: 'Academic Review', path: '/student/academic-review', icon: BookOpen },
          ...common
        ];
      case 'teacher':
        return [
          { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Complaints', path: '/teacher/complaints', icon: FileText },
          ...common
        ];
      case 'tg':
        return [
          { label: 'Dashboard', path: '/tg/dashboard', icon: LayoutDashboard },
          { label: 'Complaints', path: '/tg/complaints', icon: FileText },
          ...common
        ];
      case 'class_incharge':
        return [
          { label: 'Dashboard', path: '/class-incharge/dashboard', icon: LayoutDashboard },
          { label: 'Complaints', path: '/class-incharge/complaints', icon: FileText },
          ...common
        ];
      case 'hod':
        return [
          { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
          { label: 'Complaints', path: '/hod/complaints', icon: FileText },
          { label: 'Analytics', path: '/hod/analytics', icon: BarChart3 },
          ...common
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
          { label: 'Audit Logs', path: '/admin/logs', icon: ShieldAlert },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
          { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-primary-600">
            <Shield className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">Campus Voice</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
