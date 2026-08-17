import React from 'react';
import { Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatRelativeTime, truncate } from '../../utils/helpers';

const ComplaintCard = ({ complaint, onClick }) => {
  const { 
    id, 
    complaintId,
    title, 
    category, 
    status, 
    priority, 
    createdAt,
    handler,
    isEscalated
  } = complaint;

  return (
    <div 
      onClick={() => onClick && onClick(complaint)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer overflow-hidden group relative"
    >
      {isEscalated && (
        <div className="bg-red-50 px-4 py-1.5 border-b border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Escalated</span>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-700">
              #{complaintId || id}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {category?.name || category}
            </span>
            <PriorityBadge priority={priority} />
          </div>
          <StatusBadge status={status} />
        </div>

        <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {title}
        </h4>

        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
            {handler && (
              <div className="hidden sm:flex items-center gap-1.5 text-gray-600">
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>Assigned to: {handler.name || handler}</span>
              </div>
            )}
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
