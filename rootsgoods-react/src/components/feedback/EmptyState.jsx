import React from 'react';

export const EmptyState = ({ title = 'No records found', description, action, icon: Icon }) => {
  return (
    <div className="border border-dashed border-surface-line rounded-card p-8 text-center flex flex-col items-center justify-center my-4 bg-white/60">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      {description && <p className="text-xs text-ink-3 max-w-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
