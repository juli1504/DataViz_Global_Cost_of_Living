import React from 'react';

const KpiCard = ({ title, value, subValue, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      {icon}
    </div>
    
    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
    <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
    {subValue && (
      <div className="text-sm font-medium flex items-center gap-1">
        {subValue}
      </div>
    )}
  </div>
);

export default KpiCard;