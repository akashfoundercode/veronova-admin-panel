import React from 'react';

export const Input = ({
  label,
  error,
  hint,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-ink-2 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-status-danger">*</span>}
          </span>
          {hint && <span className="text-[11px] font-normal text-ink-3">{hint}</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border rounded-btn text-ink placeholder:text-ink-4 transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          ${error ? 'border-status-danger focus:ring-status-danger' : 'border-surface-line'}`}
        {...props}
      />
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  options = [],
  error,
  hint,
  id,
  className = '',
  required = false,
  children,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-ink-2 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-status-danger">*</span>}
          </span>
          {hint && <span className="text-[11px] font-normal text-ink-3">{hint}</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full min-h-[44px] px-3 py-2 text-sm bg-white border rounded-btn text-ink transition-colors cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          ${error ? 'border-status-danger focus:ring-status-danger' : 'border-surface-line'}`}
        {...props}
      >
        {children || options.map(opt => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 3,
  ...props
}) => {
  const areaId = id || props.name || Math.random().toString(36).substring(2);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={areaId} className="text-xs font-semibold text-ink-2 flex items-center justify-between">
          <span>{label}</span>
          {hint && <span className="text-[11px] font-normal text-ink-3">{hint}</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        className={`w-full p-3 text-sm bg-white border rounded-btn text-ink placeholder:text-ink-4 transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          ${error ? 'border-status-danger focus:ring-status-danger' : 'border-surface-line'}`}
        {...props}
      />
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  );
};
