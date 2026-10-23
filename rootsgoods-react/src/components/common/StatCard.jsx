import React from 'react';

export const StatCard = ({ label, value, sub, tone, className = '' }) => {
  const tones = {
    ok: 'text-status-ok',
    warn: 'text-status-warn',
    danger: 'text-status-danger',
    brand: 'text-brand-800',
  };

  return (
    <div className={`bg-white border border-surface-line rounded-card p-3 sm:p-4 shadow-card flex flex-col justify-between ${className}`}>
      <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider truncate mb-1">
        {label}
      </span>
      <span className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${tones[tone] || 'text-ink'}`}>
        {value}
      </span>
      {sub && <span className="text-[11.5px] text-ink-4 mt-1 truncate">{sub}</span>}
    </div>
  );
};
