import React from 'react';
import { formatRelativeTime, formatDate } from '../../utils/helpers';
import { User, MessageSquare, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ComplaintTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) return null;

  const getActionConfig = (action) => {
    switch (action?.toLowerCase()) {
      case 'created':
        return { color: 'bg-primary-500', icon: User };
      case 'escalated':
        return { color: 'bg-red-500', icon: AlertTriangle };
      case 'resolved':
      case 'closed':
        return { color: 'bg-emerald-500', icon: CheckCircle };
      case 'commented':
      case 'reply':
        return { color: 'bg-sky-500', icon: MessageSquare };
      default:
        return { color: 'bg-gray-400', icon: Info };
    }
  };

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 md:ml-4 py-2 space-y-8">
      {history.map((item, index) => {
        const isLast = index === 0; // Assuming sorted desc
        const config = getActionConfig(item.action);
        const Icon = config.icon;

        return (
          <div key={item.id || index} className="relative pl-8 md:pl-10 group">
            {/* Timeline dot/icon */}
            <span className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${config.color} text-white shadow-sm`}>
              <Icon className="w-4 h-4" />
            </span>
            
            {/* Content */}
            <div className={`bg-white border rounded-lg p-4 shadow-sm transition-shadow ${isLast ? 'border-primary-200 shadow-md ring-1 ring-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h5 className="font-semibold text-gray-900 text-sm">
                  {item.title || item.action}
                </h5>
                <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                  {formatDate(item.createdAt, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {item.description}
              </div>
              
              {item.performer && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {item.performer.name ? item.performer.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {item.performer.name || 'System'} 
                    {item.performer.role && (
                      <span className="text-gray-400 font-normal ml-1">({item.performer.role})</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
