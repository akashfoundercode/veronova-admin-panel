import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Alert = ({
  tone = 'neutral',
  title,
  description,
  action,
  className = '',
}) => {
  const tones = {
    ok: { bar: 'bg-status-ok', bg: 'bg-green-50/50', border: 'border-green-200', icon: CheckCircle2, text: 'text-green-900', iconColor: 'text-status-ok' },
    warn: { bar: 'bg-status-warn', bg: 'bg-amber-50/50', border: 'border-amber-200', icon: AlertTriangle, text: 'text-amber-900', iconColor: 'text-status-warn' },
    danger: { bar: 'bg-status-danger', bg: 'bg-red-50/50', border: 'border-red-200', icon: AlertCircle, text: 'text-red-900', iconColor: 'text-status-danger' },
    neutral: { bar: 'bg-ink-4', bg: 'bg-white', border: 'border-surface-line', icon: Info, text: 'text-ink', iconColor: 'text-ink-3' },
  };

  const current = tones[tone] || tones.neutral;
  const IconComponent = current.icon;

  return (
    <div className={`relative overflow-hidden pl-4 pr-3 py-3 border rounded-btn flex items-center justify-between gap-3 ${current.bg} ${current.border} ${className}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${current.bar}`} />
      <div className="flex items-start gap-2.5 min-w-0">
        <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.iconColor}`} />
        <div className="min-w-0">
          {title && <h4 className={`text-sm font-bold ${current.text} leading-tight`}>{title}</h4>}
          {description && <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-2">{action}</div>}
    </div>
  );
};
