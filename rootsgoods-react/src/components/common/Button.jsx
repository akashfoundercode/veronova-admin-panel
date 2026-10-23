import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-800 hover:bg-brand-900 text-white focus:ring-brand-500 shadow-sm',
    secondary: 'bg-white hover:bg-surface-bg text-ink border border-surface-line focus:ring-brand-500',
    lime: 'bg-brand-500 hover:bg-brand-600 text-brand-950 font-bold focus:ring-brand-600',
    outline: 'bg-transparent border border-brand-800 text-brand-800 hover:bg-brand-50 focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-black/5 text-ink-3 hover:text-ink focus:ring-brand-500',
    danger: 'bg-status-danger hover:bg-red-700 text-white focus:ring-red-400',
    dangerGhost: 'bg-transparent hover:bg-red-50 text-status-danger border border-red-200',
  };

  const sizes = {
    sm: 'text-xs min-h-[36px] px-3 py-1.5 gap-1.5',
    md: 'text-sm min-h-[44px] px-4 py-2 gap-2',
    lg: 'text-base min-h-[50px] px-5 py-3 gap-2.5',
    xl: 'text-lg min-h-[56px] px-6 py-3.5 gap-3 font-bold',
  };

  const blockClass = block ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${blockClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
