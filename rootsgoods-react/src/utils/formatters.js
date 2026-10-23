export const inr = (n) => {
  if (n == null || isNaN(n)) return '₹0';
  const val = Math.round(Number(n));
  return (val < 0 ? '−' : '') + '₹' + Math.abs(val).toLocaleString('en-IN');
};

export const nf = (n) => {
  if (n == null || n === '' || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN');
};

export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d) => {
  if (!d) return '—';
  const x = new Date(d.length <= 10 ? d + 'T00:00:00' : d.replace(' ', 'T') + 'Z');
  return isNaN(x.getTime()) ? d : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const fmtTime = (d) => {
  if (!d) return '';
  const x = new Date(d.replace(' ', 'T') + 'Z');
  return isNaN(x.getTime()) ? '' : x.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const initials = (s) => {
  return String(s || '?')
    .replace(/^(Dr\.?|Pilot)\s*/i, '')
    .split(/\s+/)
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
};

export const capCode = (c) => String(c || '').charAt(0).toUpperCase() + String(c || '').slice(1);
