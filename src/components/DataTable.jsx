import { useMemo, useState } from 'react'
import { ArrowUpDown, Download, Search } from 'lucide-react'

export function exportCSV(name, columns, rows) {
  const cols = columns.filter((c) => c.key)
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  const csv = [cols.map((c) => esc(c.label)).join(','), ...rows.map((r) => cols.map((c) => esc(r[c.key])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `${name}.csv`
  a.click()
}

export default function DataTable({
  columns, rows, placeholder = 'Search...', left = null, exportName, exportLabel = 'Export Excel',
  unit = 'entries', hideSearch = false, hideSize = false, rowKey = 'id', sizes = [10, 25, 50, 100], defaultSize = 10,
  stripe = true, extraRight = null,
}) {
  const [q, setQ] = useState('')
  const [size, setSize] = useState(defaultSize)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: null, dir: 1 })

  const filtered = useMemo(() => {
    let r = rows
    if (q.trim()) {
      const s = q.toLowerCase()
      r = r.filter((row) => Object.values(row).some((v) => typeof v !== 'object' && String(v ?? '').toLowerCase().includes(s)))
    }
    if (sort.key) {
      r = [...r].sort((a, b) => {
        const x = a[sort.key], y = b[sort.key]
        const nx = parseFloat(x), ny = parseFloat(y)
        const bothNum = !isNaN(nx) && !isNaN(ny) && /^[-\d.,₹\s]+$/.test(String(x)) && /^[-\d.,₹\s]+$/.test(String(y))
        return (bothNum ? nx - ny : String(x ?? '').localeCompare(String(y ?? ''))) * sort.dir
      })
    }
    return r
  }, [rows, q, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const cur = Math.min(page, pages)
  const view = filtered.slice((cur - 1) * size, cur * size)
  const start = filtered.length ? (cur - 1) * size + 1 : 0
  const end = Math.min(cur * size, filtered.length)

  const pageList = () => {
    if (pages <= 6) return Array.from({ length: pages }, (_, i) => i + 1)
    const s = new Set([1, 2, 3, cur, pages])
    const arr = [...s].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
    const out = []
    arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push('…'); out.push(p) })
    return out
  }

  return (
    <div className="card w-full min-w-0 max-w-full overflow-hidden p-3.5 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {!hideSize && (
            <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
              Show
              <select className="input !w-auto !py-1.5 sm:!py-2 text-xs sm:text-sm" value={size} onChange={(e) => { setSize(+e.target.value); setPage(1) }}>
                {sizes.map((s) => <option key={s}>{s}</option>)}
              </select>
              {unit}
            </label>
          )}
          {exportName && (
            <button className="btn !py-2 text-xs sm:text-sm" onClick={() => exportCSV(exportName, columns, filtered)}><Download size={15} /> {exportLabel}</button>
          )}
          {left}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {extraRight}
          {!hideSearch && (
            <div className="relative w-full sm:w-64 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input !pl-9 !py-2 text-xs sm:text-sm" placeholder={placeholder} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-xl border border-blue-50">
        <table className="w-full min-w-max">
          <thead className="bg-blue-50/80">
            <tr>
              {columns.map((c, i) => (
                <th key={i} className="th">
                  <button
                    className="flex items-center gap-1.5"
                    disabled={!c.key || c.sortable === false}
                    onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? -s.dir : 1 }))}
                  >
                    {c.label}
                    {c.key && c.sortable !== false && <ArrowUpDown size={12} className="text-slate-400" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr><td colSpan={columns.length} className="td py-10 text-center text-slate-400">No matching records found</td></tr>
            )}
            {view.map((r, i) => (
              <tr key={r[rowKey] ?? i} className={stripe && i % 2 === 1 ? 'bg-blue-50/40' : ''}>
                {columns.map((c, j) => (
                  <td key={j} className="td">{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
        <span>Showing {start} to {end} of {filtered.length} {unit}</span>
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button disabled={cur === 1} onClick={() => setPage(cur - 1)} className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-slate-500 disabled:opacity-50 text-xs sm:text-sm">Previous</button>
          {pageList().map((p, i) =>
            p === '…' ? <span key={i} className="px-1">…</span> : (
              <button key={i} onClick={() => setPage(p)} className={`h-7 w-7 sm:h-8 sm:min-w-8 rounded-lg px-1.5 sm:px-2 font-semibold text-xs sm:text-sm ${p === cur ? 'bg-blue-600 text-white' : 'border border-blue-100 bg-white text-blue-600'}`}>{p}</button>
            )
          )}
          <button disabled={cur === pages} onClick={() => setPage(cur + 1)} className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-slate-500 disabled:opacity-50 text-xs sm:text-sm">Next</button>
        </div>
      </div>
    </div>
  )
}
