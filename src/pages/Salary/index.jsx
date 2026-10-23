import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Wallet, Calculator, Send, User, Users, FileSpreadsheet, Plus,
  Search, Check, Copy, Pencil, Trash2, ArrowUpRight, ArrowDownRight,
  TrendingUp, Award, Calendar, Receipt, Filter, RefreshCw, X,
  CheckCircle2, AlertCircle, Clock, Sparkles, SlidersHorizontal,
  ChevronRight, Printer, DollarSign
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { getSalaryRecords, saveSalaryRecords, normalizeSalaryRecord } from './salaryStore'

export default function Salary() {
  const [rows, setRows] = useState(getSalaryRecords)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, DAILY, MONTHLY, PENDING, PAID, NONE
  const [uid, setUid] = useState('')
  const [calcResult, setCalcResult] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSearchingUser, setIsSearchingUser] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)

  // Modals
  const [receiptModal, setReceiptModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [newSalary, setNewSalary] = useState({
    user_name: '',
    role: 'Direct Agent',
    active: 10,
    down: 50,
    dDep: 15000,
    dWd: 3000,
    mDep: 250000,
    mWd: 60000,
    amount: 5000,
    type: 'monthly',
    remarks: 'New agent performance onboarding'
  })

  const [toast, node] = useToast()

  // Persist Rows
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveSalaryRecords(next)
      return next
    })
  }

  // Row update helper
  const updateRow = (id, patch) => {
    persistRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // KPI Computations
  const totalSalarySum = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [rows])
  const paidSalarySum = useMemo(() => rows.filter((r) => r.status === 'Paid').reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [rows])
  const pendingSalarySum = useMemo(() => rows.filter((r) => r.status !== 'Paid').reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [rows])
  
  const dailyRows = useMemo(() => rows.filter((r) => r.type === 'daily'), [rows])
  const monthlyRows = useMemo(() => rows.filter((r) => r.type === 'monthly'), [rows])
  const noneRows = useMemo(() => rows.filter((r) => r.type === 'none'), [rows])
  const paidRows = useMemo(() => rows.filter((r) => r.status === 'Paid'), [rows])
  const pendingRows = useMemo(() => rows.filter((r) => r.status === 'Pending'), [rows])

  const dailySalarySum = useMemo(() => dailyRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [dailyRows])
  const monthlySalarySum = useMemo(() => monthlyRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [monthlyRows])

  const totalMonthlyPL = useMemo(() => rows.reduce((acc, r) => acc + ((Number(r.mDep) || 0) - (Number(r.mWd) || 0)), 0), [rows])
  const totalDailyPL = useMemo(() => rows.reduce((acc, r) => acc + ((Number(r.dDep) || 0) - (Number(r.dWd) || 0)), 0), [rows])

  const selectedRows = useMemo(() => rows.filter((r) => r.sel), [rows])
  const selectedCount = selectedRows.length
  const selectedTotalAmount = useMemo(() => selectedRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [selectedRows])

  // Filtered Rows for Table
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'DAILY' && r.type !== 'daily') return false
      if (filterTab === 'MONTHLY' && r.type !== 'monthly') return false
      if (filterTab === 'PENDING' && r.status !== 'Pending') return false
      if (filterTab === 'PAID' && r.status !== 'Paid') return false
      if (filterTab === 'NONE' && r.type !== 'none') return false
      return true
    })
  }, [rows, filterTab])

  // Fetch full salary records from /admin/salary-list
  const loadSalaryList = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Salary] Fetching salary list from: ${API_ENDPOINTS.SALARY_LIST_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.SALARY_LIST_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data)) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.salaries ||
          payload.history ||
          payload.records ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => normalizeSalaryRecord(item, idx))
          setRows(formatted)
          saveSalaryRecords(formatted)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Salary] Loaded ${formatted.length} salary records from backend`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Salary] Error fetching salary list, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadSalaryList()
  }, [loadSalaryList])

  // Select / Deselect All
  const toggleSelectAll = (checked) => {
    persistRows((prev) => prev.map((r) => ({ ...r, sel: checked })))
  }

  // Calculate & Search Salary via API: /admin/salary-list/:userId
  const handleCalculateSalary = async (e) => {
    if (e) e.preventDefault()
    const cleanUid = uid.trim()
    if (!cleanUid) {
      return toast('Please enter a User ID or Agent Name')
    }

    setIsSearchingUser(true)
    let target = null

    // 1. Live API Search: /admin/salary-list/:userId
    try {
      const searchEndpoint = API_ENDPOINTS.SALARY_USER_SEARCH_PROXY(cleanUid)
      console.log(`[Veronova Salary] Searching user salary via API: ${searchEndpoint}`)
      const res = await apiRequest(searchEndpoint, { method: 'GET' })

      if (res && (res.status === 200 || res.data)) {
        const payload = res.data || res
        const userObj =
          payload.user ||
          payload.agent ||
          payload.salary ||
          payload.data ||
          (Array.isArray(payload) ? payload[0] : payload)

        if (userObj && (userObj.user_id || userObj.user || userObj.username || userObj.id)) {
          target = normalizeSalaryRecord(userObj)
          // Add/update into table
          persistRows((prev) => {
            const exists = prev.some(
              (r) =>
                r.id === target.id ||
                (r.user_id && target.user_id && r.user_id.toLowerCase() === target.user_id.toLowerCase())
            )
            return exists ? prev.map((r) => (r.id === target.id ? { ...r, ...target } : r)) : [target, ...prev]
          })
          console.log(`[Veronova Salary] Found live user salary details from API for: ${cleanUid}`)
        }
      }
    } catch (apiErr) {
      console.warn(`[Veronova Salary] Live search /admin/salary-list/${cleanUid} error:`, apiErr.message)
    } finally {
      setIsSearchingUser(false)
    }

    // 2. Fallback to local table search
    if (!target) {
      const query = cleanUid.toLowerCase()
      target = rows.find(
        (x) =>
          String(x.id) === query ||
          (x.user_id && x.user_id.toLowerCase().includes(query)) ||
          (x.user && x.user.toLowerCase().includes(query))
      )
    }

    if (!target) {
      setCalcResult(null)
      return toast(`User "${cleanUid}" not found in salary directory`)
    }

    // Formula calculation
    const monthlyPL = (Number(target.mDep) || 0) - (Number(target.mWd) || 0)
    const dailyPL = (Number(target.dDep) || 0) - (Number(target.dWd) || 0)
    const recommendedMonthly = target.amount || Math.max(5000, Math.round(monthlyPL * 0.05 + (target.active || 0) * 500))
    const recommendedDaily = Math.max(500, Math.round(dailyPL * 0.08 + (target.active || 0) * 50))

    setCalcResult({
      agent: target,
      monthlyPL,
      dailyPL,
      recommendedMonthly,
      recommendedDaily,
    })
    toast(`Salary computed for ${target.user || target.user_id}`)
  }

  // Apply Calculated Salary
  const handleApplyCalculated = (cycleType, amount) => {
    if (!calcResult?.agent) return
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    updateRow(calcResult.agent.id, {
      type: cycleType,
      amount: amount,
      status: 'Pending',
      date: dateStr,
      remarks: `Updated via Salary Calculator (${cycleType} Tier)`
    })
    toast(`₹${amount.toLocaleString('en-IN')} ${cycleType} salary applied to ${calcResult.agent.user}!`)
    setCalcResult(null)
    setUid('')
  }

  // Bulk Disburse Selected
  const handleBulkDisburse = () => {
    if (selectedCount === 0) {
      return toast('Select at least one agent record first')
    }
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    persistRows((prev) =>
      prev.map((r) => (r.sel ? { ...r, status: 'Paid', date: dateStr, sel: false } : r))
    )
    toast(`₹${selectedTotalAmount.toLocaleString('en-IN')} disbursed successfully to ${selectedCount} agent(s)!`)
  }

  // Single Disburse Action
  const handleSingleDisburse = (row) => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    updateRow(row.id, { status: 'Paid', date: dateStr })
    toast(`Salary ₹${row.amount.toLocaleString('en-IN')} credited to ${row.user}!`)
  }

  // Add New Salary Record
  const handleCreateSalary = (e) => {
    e.preventDefault()
    if (!newSalary.user_name.trim()) {
      return toast('Please enter an Agent Name')
    }
    const randomId = 'VN_' + Math.floor(10000 + Math.random() * 90000)
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const record = {
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      user_id: randomId,
      user: newSalary.user_name,
      role: newSalary.role,
      avatar_color: 'from-blue-600 to-indigo-600',
      active: Number(newSalary.active) || 0,
      down: Number(newSalary.down) || 0,
      dDep: Number(newSalary.dDep) || 0,
      dWd: Number(newSalary.dWd) || 0,
      mDep: Number(newSalary.mDep) || 0,
      mWd: Number(newSalary.mWd) || 0,
      amount: Number(newSalary.amount) || 0,
      type: newSalary.type,
      status: 'Pending',
      date: dateStr,
      sel: false,
      remarks: newSalary.remarks || 'Directly configured'
    }

    persistRows((prev) => [record, ...prev])
    toast(`New salary record configured for ${newSalary.user_name}`)
    setAddModal(false)
    setNewSalary({
      user_name: '',
      role: 'Direct Agent',
      active: 10,
      down: 50,
      dDep: 15000,
      dWd: 3000,
      mDep: 250000,
      mWd: 60000,
      amount: 5000,
      type: 'monthly',
      remarks: ''
    })
  }

  // Delete Record
  const handleDeleteRecord = (id) => {
    if (confirm('Are you sure you want to remove this salary record?')) {
      persistRows((prev) => prev.filter((r) => r.id !== id))
      toast('Salary record deleted')
    }
  }

  // Role Badge Helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Master Agent':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Super Affiliate':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Senior Partner':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  // Export Columns Definition
  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'user', label: 'Agent Name' },
    { key: 'role', label: 'Role' },
    { key: 'active', label: 'Active Direct' },
    { key: 'down', label: 'Downline Network' },
    { key: 'dDep', label: 'Daily Deposit' },
    { key: 'dWd', label: 'Daily Withdrawal' },
    { key: 'mDep', label: 'Monthly Deposit' },
    { key: 'mWd', label: 'Monthly Withdrawal' },
    { key: 'amount', label: 'Salary Amount' },
    { key: 'type', label: 'Salary Cycle' },
    { key: 'status', label: 'Payment Status' },
    { key: 'date', label: 'Date' },
  ]

  // Columns Definition for DataTable
  const cols = [
    {
      label: (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={rows.length > 0 && rows.every((r) => r.sel)}
          onChange={(e) => toggleSelectAll(e.target.checked)}
          title="Select / Deselect All"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={!!r.sel}
          onChange={(e) => updateRow(r.id, { sel: e.target.checked })}
        />
      ),
    },
    {
      key: 'user',
      label: 'Agent / Recipient',
      render: (r) => {
        const initials = (r.user || 'AG').slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                r.avatar_color || 'from-blue-600 to-indigo-600'
              } font-extrabold text-white text-xs shadow-xs`}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                  {r.user}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                  {r.user_id || `ID_${r.id}`}
                </span>
                <button
                  onClick={() => handleCopy(r.user_id || `ID_${r.id}`, r.id)}
                  className="text-slate-400 hover:text-slate-600"
                  title="Copy ID"
                >
                  {copiedId === r.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                </button>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(r.role)}`}>
                  {r.role || 'Agent'}
                </span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'network',
      label: 'Team & Downlines',
      render: (r) => (
        <div className="min-w-[130px] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200">
              <User size={12} className="text-emerald-600" /> {r.active} Active
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-extrabold text-sky-700 border border-sky-200">
              <Users size={12} className="text-sky-600" /> {r.down} Total
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'dPL',
      label: 'Daily Performance',
      render: (r) => {
        const netDaily = (Number(r.dDep) || 0) - (Number(r.dWd) || 0)
        return (
          <div className="min-w-[155px] text-xs space-y-0.5">
            <div className="flex items-center justify-between text-slate-500">
              <span>Dep:</span>
              <span className="font-semibold text-slate-700">₹{(r.dDep || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>W/D:</span>
              <span className="font-semibold text-slate-700">₹{(r.dWd || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-bold">
              <span className="text-slate-600">Net P/L:</span>
              <span
                className={`flex items-center gap-0.5 font-extrabold ${
                  netDaily >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netDaily >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                ₹{Math.abs(netDaily).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'mPL',
      label: 'Monthly Performance',
      render: (r) => {
        const netMonthly = (Number(r.mDep) || 0) - (Number(r.mWd) || 0)
        return (
          <div className="min-w-[165px] text-xs space-y-0.5">
            <div className="flex items-center justify-between text-slate-500">
              <span>Dep:</span>
              <span className="font-semibold text-slate-700">₹{(r.mDep || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>W/D:</span>
              <span className="font-semibold text-slate-700">₹{(r.mWd || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-bold">
              <span className="text-slate-600">Net P/L:</span>
              <span
                className={`flex items-center gap-0.5 font-black ${
                  netMonthly >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netMonthly >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                ₹{Math.abs(netMonthly).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'amount',
      label: 'Salary Amount',
      render: (r) => (
        <div className="min-w-[140px]">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <span className="text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              className="w-full bg-transparent px-1.5 py-0.5 text-xs font-black text-slate-900 outline-none"
              value={r.amount}
              onChange={(e) => updateRow(r.id, { amount: Number(e.target.value) || 0 })}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-right">
            Auto-saves on change
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Salary Cycle',
      render: (r) => (
        <div className="min-w-[130px] space-y-1">
          {[
            ['daily', 'Daily Salary'],
            ['monthly', 'Monthly Salary'],
            ['none', 'Not Selected'],
          ].map(([val, label]) => (
            <label
              key={val}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                r.type === val
                  ? val === 'daily'
                    ? 'bg-amber-100/70 text-amber-900 font-bold'
                    : val === 'monthly'
                    ? 'bg-blue-100/70 text-blue-900 font-bold'
                    : 'bg-slate-200 text-slate-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name={`cycle_${r.id}`}
                checked={r.type === val}
                onChange={() => updateRow(r.id, { type: val })}
                className="h-3 w-3 text-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => {
            const next = r.status === 'Paid' ? 'Pending' : 'Paid'
            updateRow(r.id, { status: next })
            toast(`Status changed to ${next} for ${r.user}`)
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Paid'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : r.status === 'Processing'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
          title="Click to toggle Paid / Pending"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Paid'
                ? 'bg-emerald-500'
                : r.status === 'Processing'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
          {r.status || 'Pending'}
        </button>
      ),
    },
    {
      key: 'date',
      label: 'Last Disbursed',
      render: (r) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap block">
          {r.date}
        </span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status !== 'Paid' && (
            <button
              onClick={() => handleSingleDisburse(r)}
              title="Disburse Salary Now"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
            >
              <Send size={13} />
            </button>
          )}
          <button
            onClick={() => setReceiptModal(r)}
            title="View Salary Payslip"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          >
            <Receipt size={14} />
          </button>
          <button
            onClick={() => setEditModal(r)}
            title="Edit Salary Rules"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDeleteRecord(r.id)}
            title="Delete Record"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Agent Salary & Payroll Management"
        icon={Wallet}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Salary List' },
          { label: 'Affiliate Payroll' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white/90 font-medium">
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadSalaryList(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-xs cursor-pointer"
            title="Refresh Live Salary List from Server"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Add Salary Record
          </button>
        </div>
      </PageBanner>

      {/* Bespoke Agent Payroll & Salary Treasury Command Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero (7 cols): Central Agent Payroll Vault */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 text-white shadow-xl border border-indigo-900/50 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  Affiliate Payroll Vault
                </span>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-indigo-200 border border-white/10 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" /> Cycle Settlement Active
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200/80">Total Cycle Salary Volume</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-mono">
                  ₹{totalSalarySum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <span className="text-xs font-semibold text-indigo-300">Across {rows.length} enrolled agents</span>
              </div>
            </div>

            {/* Payout Progress Split Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-emerald-300 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Disbursed: ₹{paidSalarySum.toLocaleString('en-IN')}
                </span>
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-400" /> Pending Payout: ₹{pendingSalarySum.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(10, (paidSalarySum / (totalSalarySum || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Active Recipients</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {rows.length} Agents Enrolled
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total Monthly Downline P/L</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                ₹{totalMonthlyPL.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400">Settlement Status</p>
              <p className="text-sm font-extrabold text-indigo-300 mt-0.5 flex items-center gap-1">
                {((paidSalarySum / (totalSalarySum || 1)) * 100).toFixed(0)}% Disbursed
              </p>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Daily vs Monthly Cycle Telemetry */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Daily Performance Payroll */}
          <div className="card p-5 rounded-2xl border-t-4 border-t-amber-500 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Performance Cycle</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-amber-700">
                    ₹{dailySalarySum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Calendar size={22} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{dailyRows.length} Agents on Daily Payout</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 text-[11px]">
                Net P/L: ₹{totalDailyPL.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Monthly Fixed & Retainer Payroll */}
          <div className="card bg-white p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Award size={15} className="text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Monthly VIP Affiliate Retainer</p>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-blue-950">
                    ₹{monthlySalarySum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-xs">
                <Wallet size={20} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <span className="text-blue-800 font-semibold">{monthlyRows.length} Master & Super Agents</span>
              <span className="rounded-md bg-blue-200/80 px-2 py-0.5 text-[11px] font-black text-blue-900">
                Auto Monthly
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Calculate User Salary Console */}
      <div className="card p-5 sm:p-6 shadow-sm border border-slate-200 bg-white">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
              <Calculator size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Calculate User & Agent Salary</h3>
              <p className="text-xs text-slate-500">
                Evaluate downline net performance and compute tier-recommended salary
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCalculateSalary} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-12 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Search Agent ID or Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter User ID (e.g. 1, ADMIN_123, VN_78291, or name)"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={isSearchingUser}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSearchingUser ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Searching API...
                  </>
                ) : (
                  <>
                    <Search size={15} /> Search & Calculate
                  </>
                )}
              </button>
              {calcResult && (
                <button
                  type="button"
                  onClick={() => { setCalcResult(null); setUid('') }}
                  className="rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Live Calculation Preview Card */}
        {calcResult && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-extrabold text-slate-900 text-sm">
                  {calcResult.agent.user} ({calcResult.agent.user_id})
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                  {calcResult.agent.role}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Current Salary: <strong className="text-slate-800">₹{calcResult.agent.amount.toLocaleString('en-IN')}</strong> ({calcResult.agent.type})
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Active Directs</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{calcResult.agent.active} Members</p>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Total Downline</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{calcResult.agent.down} Network Size</p>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Daily Net P/L</span>
                <p className={`text-sm font-black mt-0.5 ${calcResult.dailyPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{calcResult.dailyPL.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Monthly Net P/L</span>
                <p className={`text-sm font-black mt-0.5 ${calcResult.monthlyPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{calcResult.monthlyPL.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">System Formula:</span> Base Retainer + 5% Net Turnover Yield
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyCalculated('daily', calcResult.recommendedDaily)}
                  className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-700 shadow-sm transition"
                >
                  Apply Daily (₹{calcResult.recommendedDaily.toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCalculated('monthly', calcResult.recommendedMonthly)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Apply Monthly (₹{calcResult.recommendedMonthly.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Sticky Bar (When rows selected) */}
      {selectedCount > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 border border-blue-700/60 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white font-extrabold text-sm">
              {selectedCount}
            </span>
            <div>
              <p className="text-xs text-blue-200 font-semibold">Selected Agents</p>
              <h4 className="text-lg font-black text-white">
                Total Payable: ₹{selectedTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleSelectAll(false)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Deselect All
            </button>
            <button
              onClick={handleBulkDisburse}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-600 transition"
            >
              <Send size={15} /> Disburse {selectedCount} Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card with Segmented Filter Tabs & Export */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Records', count: rows.length },
              { id: 'DAILY', label: 'Daily Salary', count: dailyRows.length },
              { id: 'MONTHLY', label: 'Monthly Salary', count: monthlyRows.length },
              { id: 'PENDING', label: 'Pending Payout', count: pendingRows.length },
              { id: 'PAID', label: 'Paid Vouchers', count: paidRows.length },
              { id: 'NONE', label: 'Unassigned', count: noneRows.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Export to Excel */}
          <button
            onClick={() => exportCSV('agent_salary_records', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          unit="salary records"
          placeholder="Filter by agent name, ID, or role..."
        />
      </div>

      {/* View Payslip Voucher Modal */}
      {receiptModal && (
        <Modal
          isOpen={!!receiptModal}
          onClose={() => setReceiptModal(null)}
          title="Veronova Affiliate Payroll Payslip"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            {/* Voucher Header Strip */}
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Official Payroll Voucher
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Voucher #SLR-2026-00{receiptModal.id}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${
                    receiptModal.status === 'Paid'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-amber-950'
                  }`}
                >
                  {receiptModal.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Date: {receiptModal.date}</p>
            </div>

            {/* Agent Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Recipient Name</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{receiptModal.user}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">User ID</span>
                <p className="font-mono font-bold text-slate-700 mt-0.5">{receiptModal.user_id}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Role</span>
                <p className="font-bold text-blue-700 mt-0.5">{receiptModal.role}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Cycle Type</span>
                <p className="font-bold text-indigo-700 mt-0.5 capitalize">{receiptModal.type} Salary</p>
              </div>
            </div>

            {/* Performance Breakdown Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                Network Performance Audit
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-[11px]">
                    <tr>
                      <th className="p-2">Metric</th>
                      <th className="p-2 text-right">Daily</th>
                      <th className="p-2 text-right">Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2 text-slate-600">Total Deposits</td>
                      <td className="p-2 text-right">₹{receiptModal.dDep?.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right">₹{receiptModal.mDep?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Total Withdrawals</td>
                      <td className="p-2 text-right">₹{receiptModal.dWd?.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right">₹{receiptModal.mWd?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-slate-50 font-extrabold">
                      <td className="p-2 text-slate-800">Net Network P/L</td>
                      <td className="p-2 text-right text-emerald-600">
                        ₹{(receiptModal.dDep - receiptModal.dWd).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right text-emerald-600">
                        ₹{(receiptModal.mDep - receiptModal.mWd).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount Payable Box */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Total Disbursed Amount
                </span>
                <p className="text-2xl font-black text-blue-950 mt-0.5">
                  ₹{Number(receiptModal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <DollarSign size={24} />
              </div>
            </div>

            {/* Remarks */}
            {receiptModal.remarks && (
              <p className="text-xs text-slate-500 italic">
                Remark: {receiptModal.remarks}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Printer size={14} /> Print Voucher
              </button>
              <button
                onClick={() => setReceiptModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Salary Modal */}
      {editModal && (
        <Modal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          title={`Edit Salary Rules: ${editModal.user}`}
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateRow(editModal.id, editModal)
              toast('Salary settings updated successfully')
              setEditModal(null)
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Salary Amount (₹)
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                value={editModal.amount}
                onChange={(e) => setEditModal({ ...editModal, amount: Number(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Salary Cycle Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                value={editModal.type}
                onChange={(e) => setEditModal({ ...editModal, type: e.target.value })}
              >
                <option value="daily">Daily Salary Cycle</option>
                <option value="monthly">Monthly Salary Cycle</option>
                <option value="none">Not Selected (Hold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Disbursement Status
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                value={editModal.status}
                onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
              >
                <option value="Pending">Pending Payout</option>
                <option value="Paid">Paid / Settled</option>
                <option value="Processing">In Processing Queue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Remarks / Incentive Note
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                rows={2}
                value={editModal.remarks || ''}
                onChange={(e) => setEditModal({ ...editModal, remarks: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Salary Record Modal */}
      {addModal && (
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          title="Configure New Agent Salary Record"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateSalary} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sameer Kapoor"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.user_name}
                  onChange={(e) => setNewSalary({ ...newSalary, user_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Agent Role
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={newSalary.role}
                  onChange={(e) => setNewSalary({ ...newSalary, role: e.target.value })}
                >
                  <option value="Direct Agent">Direct Agent</option>
                  <option value="Senior Partner">Senior Partner</option>
                  <option value="Super Affiliate">Super Affiliate</option>
                  <option value="Master Agent">Master Agent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Active Directs
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.active}
                  onChange={(e) => setNewSalary({ ...newSalary, active: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Total Downline
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.down}
                  onChange={(e) => setNewSalary({ ...newSalary, down: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Daily Deposit (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.dDep}
                  onChange={(e) => setNewSalary({ ...newSalary, dDep: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Daily Withdrawal (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.dWd}
                  onChange={(e) => setNewSalary({ ...newSalary, dWd: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Monthly Deposit (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.mDep}
                  onChange={(e) => setNewSalary({ ...newSalary, mDep: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Monthly Withdrawal (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.mWd}
                  onChange={(e) => setNewSalary({ ...newSalary, mWd: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Salary Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                  value={newSalary.amount}
                  onChange={(e) => setNewSalary({ ...newSalary, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Salary Cycle
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={newSalary.type}
                  onChange={(e) => setNewSalary({ ...newSalary, type: e.target.value })}
                >
                  <option value="monthly">Monthly Cycle</option>
                  <option value="daily">Daily Cycle</option>
                  <option value="none">Not Selected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                Create Salary Entry
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
