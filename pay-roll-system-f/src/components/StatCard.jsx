import React from 'react';

export const StatCard = ({ label, value, sub, icon: Icon, color = 'indigo' }) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className={`stat-icon ${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value mono">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
};
