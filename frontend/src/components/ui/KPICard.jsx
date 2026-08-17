import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'primary' 
}) => {
  
  const colorStyles = {
    primary: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${style.bg} ${style.text}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          </div>
        </div>
      </div>
      
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {subtitle && (
            <span className="text-gray-500">{subtitle}</span>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 font-medium ${
              trend === 'up' ? 'text-emerald-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
               trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;
