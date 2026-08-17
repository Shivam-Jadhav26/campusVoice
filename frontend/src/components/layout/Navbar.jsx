import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatRole, getInitials } from '../../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Mock notifications for UI purposes
  const mockNotifications = [
    { id: 1, text: 'New complaint assigned to you', time: '5m ago', read: false },
    { id: 2, text: 'Complaint #1234 has been resolved', time: '1h ago', read: false },
    { id: 3, text: 'Reminder: Update status for #5678', time: '3h ago', read: true },
  ];
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex-1 max-w-lg hidden md:block px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search complaints, users..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative focus:outline-none"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Notifications</span>
                <button className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {mockNotifications.map(notif => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                    <p className="text-sm text-gray-800">{notif.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <Link to={`/${user?.role}/notifications`} className="text-xs font-medium text-primary-600 hover:text-primary-800">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700 leading-tight">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">{formatRole(user?.role)}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{formatRole(user?.role)}</p>
              </div>
              
              <Link 
                to={`/${user?.role}/profile`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4 mr-3 text-gray-400" />
                Your Profile
              </Link>
              
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3 text-red-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
