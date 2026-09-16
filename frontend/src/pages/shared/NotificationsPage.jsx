import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, MessageSquare, AlertTriangle, FileText, Info, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      const list = res.data?.data?.notifications || res.data?.notifications || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setNotifications(list);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      // silent
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'complaint') return ['complaint', 'resolution', 'escalation'].includes(n.type);
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'resolution':
      case 'complaint_resolved':
        return <Check className="w-5 h-5 text-emerald-600" />;
      case 'escalation':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;

      case 'feedback':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'resolution':
      case 'complaint_resolved':
        return 'bg-emerald-50 border-emerald-200';
      case 'escalation':
        return 'bg-rose-50 border-rose-200';

      case 'feedback':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-indigo-50 border-indigo-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-indigo-600" />
              Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Real-time status updates and SLA breaches</p>
          </div>
          
          <button 
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'unread', label: 'Unread' },
            { id: 'complaint', label: 'Complaints' },

          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading notifications...</div>
          ) : filtered.length > 0 ? (
            filtered.map(notif => (
              <div 
                key={notif._id}
                onClick={() => markAsRead(notif._id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  notif.isRead 
                    ? 'bg-white border-slate-200/90 text-slate-700 opacity-80' 
                    : 'bg-indigo-50/40 border-indigo-200 shadow-sm text-slate-900'
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${getBgColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold truncate">{notif.title}</h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  
                  {notif.link && (
                    <Link 
                      to={notif.link}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-800 text-sm">No notifications to show</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
