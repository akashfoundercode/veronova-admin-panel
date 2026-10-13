import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function PageBanner({ title, crumbs = [], icon: Icon, bgImage, children }) {
  if (bgImage) {
    return (
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-blue-200/50 shadow-lg min-h-[160px] sm:min-h-[185px] p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4 bg-[#0a4897]">
        {/* Full background illustration */}
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-[center_55%] pointer-events-none"
        />

        {/* Subtle shadow on the left behind text for crisp readability */}
        <div className="absolute inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-blue-950/80 via-blue-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
          {Icon && (
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-blue-600 shadow-md">
              <Icon size={26} className="sm:h-7 sm:w-7" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-2xl md:text-3xl">
              {title}
            </h1>
            <div className="mt-1 text-xs sm:text-sm text-blue-100 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] truncate">
              {crumbs.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1.5 sm:mx-2 text-blue-200">/</span>}
                  {c.to ? <Link to={c.to} className="text-white hover:underline font-semibold">{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        {children && <div className="relative z-10">{children}</div>}
      </div>
    )
  }

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-white bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 px-4 sm:px-6 py-4 sm:py-6 shadow-sm">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="absolute right-24 top-4 h-24 w-24 rounded-full bg-sky-300/30 blur-xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {Icon && (
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-blue-600 shadow">
              <Icon size={24} className="sm:h-7 sm:w-7" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold text-ink sm:text-2xl md:text-3xl">{title}</h1>
            <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 truncate">
              {crumbs.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1.5 sm:mx-2">/</span>}
                  {c.to ? <Link to={c.to} className="text-blue-500 hover:underline">{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ color = 'green', children, dot }) {
  const map = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-600',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    teal: 'bg-cyan-100 text-cyan-700',
    gray: 'bg-slate-100 text-slate-600',
    solidRed: 'bg-rose-600 text-white',
    solidGreen: 'bg-emerald-600 text-white',
    solidPurple: 'bg-purple-600 text-white',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${map[color]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const Active = () => <Badge color="green" dot>Active</Badge>

export function Modal({ title, onClose, children, width = 'max-w-lg', maxWidth, open, isOpen }) {
  if (open === false || isOpen === false) return null

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const modalWidth = maxWidth || width

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`card w-full ${modalWidth} max-h-[90vh] overflow-y-auto bg-white p-6 shadow-2xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Generic edit/add modal. fields: [{key,label,type?,options?}]
export function FormModal({ title, fields, values = {}, onSave, onClose, saveLabel = 'Save changes' }) {
  const [v, setV] = useState(values)
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(v); onClose() }} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            {f.options ? (
              <select className="input" value={v[f.key] ?? ''} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input className="input" type={f.type || 'text'} value={v[f.key] ?? ''} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn">{saveLabel}</button>
        </div>
      </form>
    </Modal>
  )
}

export function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">{Icon && <Icon size={14} className="text-blue-600" />}{label}</label>
      {children}
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 2200); return () => clearTimeout(t) } }, [msg])
  const node = msg && (
    <div className="fixed bottom-6 right-6 z-[60] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">{msg}</div>
  )
  return [setMsg, node]
}

export const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
