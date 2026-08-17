import React from 'react';
import { 
  Clock, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  const config = {
    'Pending': { 
      colors: 'bg-amber-50 text-amber-700 border-amber-200', 
      dot: 'bg-amber-500',
      icon: Clock
    },
    'In Progress': { 
      colors: 'bg-sky-50 text-sky-700 border-sky-200', 
      dot: 'bg-sky-500 animate-pulse',
      icon: Activity
    },
    'Resolved': { 
      colors: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      dot: 'bg-emerald-500',
      icon: CheckCircle2
    },
    'Rejected': { 
      colors: 'bg-slate-100 text-slate-700 border-slate-300', 
      dot: 'bg-slate-500',
      icon: XCircle
    },
    'Escalated': { 
      colors: 'bg-red-50 text-red-700 border-red-200', 
      dot: 'bg-red-500',
      icon: AlertTriangle
    },
    'Reopened': { 
      colors: 'bg-orange-50 text-orange-700 border-orange-200', 
      dot: 'bg-orange-500',
      icon: RefreshCw
    },
    'Closed': { 
      colors: 'bg-gray-100 text-gray-700 border-gray-300', 
      dot: 'bg-gray-500',
      icon: CheckCircle2
    },
  };

  const style = config[status] || config['Pending'];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.colors} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const config = {
    'Critical': {
      colors: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    },
    'High': {
      colors: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: ArrowUp,
      iconColor: 'text-orange-600'
    },
    'Medium': {
      colors: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Minus,
      iconColor: 'text-amber-600'
    },
    'Low': {
      colors: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ArrowDown,
      iconColor: 'text-emerald-600'
    }
  };

  const style = config[priority] || config['Medium'];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${style.colors} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
      {priority}
    </span>
  );
};
