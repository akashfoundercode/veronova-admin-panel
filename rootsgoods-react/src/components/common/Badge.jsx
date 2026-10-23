import React from 'react';

export const Badge = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    ok: 'bg-green-50 text-status-ok border-green-200',
    warn: 'bg-amber-50 text-status-warn border-amber-200',
    danger: 'bg-red-50 text-status-danger border-red-200',
    blue: 'bg-blue-50 text-status-blue border-blue-200',
    neutral: 'bg-surface-bg text-ink-3 border-surface-line',
    brand: 'bg-brand-50 text-brand-800 border-brand-200 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
        tones[tone] || tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};
