import React from 'react';

export const Card = ({ children, className = '', onClick, hover = false }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-surface-line rounded-card shadow-card overflow-hidden ${
        hover ? 'hover:border-brand-500 hover:shadow-md transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`p-4 sm:p-5 border-b border-surface-line flex items-center justify-between gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-ink leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-ink-3 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-3 sm:px-5 bg-surface-bg/50 border-t border-surface-line flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};
