import { useState, useMemo } from 'react'
import {
  Info, Users, ShieldCheck, CheckCircle2, Clock, BookOpen,
  UserCheck, Award, Plus, Pencil, Trash2, FileSpreadsheet, Headphones
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'

const SEED_STAFF = [
  { id: 1, name: 'Ananya Sharma', role: 'Senior Support Lead', shift: 'Morning (06:00 - 14:00)', active_tickets: 4, resolved_today: 48, status: 'Online', rating: '4.9★' },
  { id: 2, name: 'Rahul Verma', role: 'Escalations Specialist', shift: 'Morning (06:00 - 14:00)', active_tickets: 2, resolved_today: 34, status: 'Online', rating: '4.8★' },
  { id: 3, name: 'Rohit Joshi', role: 'Support Executive', shift: 'Evening (14:00 - 22:00)', active_tickets: 0, resolved_today: 22, status: 'Offline', rating: '4.7★' },
  { id: 4, name: 'Priya Mehra', role: 'VIP Concierge Desk', shift: 'Evening (14:00 - 22:00)', active_tickets: 1, resolved_today: 19, status: 'Offline', rating: '5.0★' },
  { id: 5, name: 'Vikram Singh', role: 'Night Operations Lead', shift: 'Night (22:00 - 06:00)', active_tickets: 0, resolved_today: 41, status: 'Offline', rating: '4.9★' },
]

export default function Support() {
  const [rows, setRows] = useState(SEED_STAFF)
  const [modal, setModal] = useState(null)
  const [toast, node] = useToast()

  const onlineCount = useMemo(() => rows.filter((r) => r.status === 'Online').length, [rows])

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'name',
      label: 'Staff Officer Details',
      render: (r) => (
        <div className="min-w-[170px]">
          <span className="font-extrabold text-slate-900 text-sm block">{r.name}</span>
          <span className="text-[11px] text-blue-700 font-semibold">{r.role}</span>
        </div>
      ),
    },
    {
      key: 'shift',
      label: 'Working Shift',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.shift}</span>,
    },
    {
      key: 'tickets',
      label: 'Performance Today',
      render: (r) => (
        <div className="text-xs">
          <span className="text-slate-500 font-medium">{r.resolved_today} Solved</span> • <span className="font-bold text-emerald-600">{r.rating} CSAT</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Shift Status',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${r.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Support Roster & Staff Training Settings"
        icon={Info}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Support Setting' }]}
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Staff Shift Center</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">24/7 Coverage</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white font-mono">
              {onlineCount} OFFICERS ONLINE
            </h2>
            <p className="text-xs text-blue-200 mt-1">Active customer assistance staff currently logged into helpdesk portal</p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span>{rows.length} Total Registered Personnel</span>
            <span className="text-emerald-400 font-bold">100% Scheduled Shift Attendance</span>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="card p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Training Modules</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">6 SOP Guides</h3>
              <p className="text-xs text-slate-500 mt-0.5">Anti-Collusion & Payout policies</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="border-b pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Active Staff Roster & Assigned Shift Cycles
          </h4>
        </div>
        <DataTable columns={cols} rows={rows} unit="officers" placeholder="Search staff members..." />
      </div>
      {node}
    </div>
  )
}

