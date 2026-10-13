export const formatCurrency = (amount) => {
  return `₹ ${Number(amount || 0).toLocaleString('en-IN')}`
}

export const money = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleString('en-GB')
}

