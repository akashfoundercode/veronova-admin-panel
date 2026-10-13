export function exportCSV(name, columns, rows) {
  const cols = columns.filter((c) => c.key)
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  const csv = [cols.map((c) => esc(c.label)).join(','), ...rows.map((r) => cols.map((c) => esc(r[c.key])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `${name}.csv`
  a.click()
}

