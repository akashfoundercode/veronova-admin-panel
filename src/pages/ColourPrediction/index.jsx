import { useEffect, useState } from 'react'
import { Palette, Timer, Zap, Clock, Trophy, Users, Coins, BarChart3, User } from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, money } from '@/components/ui'

const games = ['Wingo 30 Second', 'Wingo 1 Minute', 'Wingo 3 Minute', 'Wingo 5 Minute']
const ball = ['bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500']

const history = [
  { id: 5, period: '20250822108977', num: 9, colour: 'Green', created: '2026-09-26 23:36:45' },
  { id: 4, period: '20250822108977', num: 1, colour: 'Green', created: '2026-09-26 23:36:20' },
  { id: 3, period: '1', num: 9, colour: 'Green', created: '2026-09-26 23:14:20' },
  { id: 2, period: '20250822108960', num: 9, colour: 'Green', created: '2026-09-26 23:13:20' },
  { id: 1, period: '20250822108959', num: 9, colour: 'Green', created: '2026-09-26 23:13:12' },
]

const Gradient = ({ icon: Icon, label, value, cls }) => (
  <div className={`flex items-center gap-3 rounded-2xl p-4 text-white shadow-lg ${cls}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><Icon size={24} /></div>
    <div><div className="text-[11px] font-bold uppercase opacity-90">{label}</div><div className="text-2xl font-extrabold">{value}</div></div>
  </div>
)

export default function ColourPrediction() {
  const [game, setGame] = useState(0)
  const [tab, setTab] = useState('history')
  const [sec, setSec] = useState(19)
  useEffect(() => { const t = setInterval(() => setSec((s) => (s <= 0 ? 29 : s - 1)), 1000); return () => clearInterval(t) }, [])

  const cols = [
    { key: 'id', label: 'ID' }, { key: 'period', label: 'Period No' },
    { key: 'num', label: 'Result', render: (r) => <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{r.num} ({r.colour})</span> },
    { key: 'created', label: 'Created' },
  ]
  const betCols = [{ key: 'id', label: 'ID' }, { key: 'user', label: 'User' }, { key: 'pick', label: 'Pick' }, { key: 'amount', label: 'Amount', render: (r) => money(r.amount) }]

  return (
    <div>
      <PageBanner title="Colour Prediction" icon={Palette} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Colour Prediction' }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Gradient icon={Coins} label="Total Admin Profit" value={money(97828.67)} cls="bg-gradient-to-r from-green-600 to-green-500" />
        <Gradient icon={User} label="Total User Profit" value={money(43520.33)} cls="bg-gradient-to-r from-red-600 to-rose-500" />
        <Gradient icon={BarChart3} label="Today Admin Profit" value={money(10.22)} cls="bg-gradient-to-r from-blue-600 to-sky-400" />
        <Gradient icon={Users} label="Today User Profit" value={money(10.78)} cls="bg-gradient-to-r from-amber-500 to-orange-400" />
      </div>
      <div className="card mt-4 flex items-center justify-between px-5 py-3 font-bold"><span>Period No – 20250822213502</span><span className="flex items-center gap-2"><Users size={17} />Total Users Playing - 0</span></div>
      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20"><Timer size={34} /></div>
        <div><div className="text-sm font-semibold">{games[game].toUpperCase()} GAME COUNTDOWN</div><div className="text-4xl font-extrabold">00 : {String(sec).padStart(2, '0')}</div></div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {games.map((g, i) => (
          <button key={g} onClick={() => setGame(i)} className={`card flex items-center justify-center gap-2 py-3 font-bold ${game === i ? '!border-blue-500 bg-blue-50' : ''}`}>
            {i === 0 ? <Zap size={18} className="text-blue-600" /> : <Clock size={18} className="text-slate-500" />}{g}
          </button>
        ))}
      </div>
      <div className="card mt-4 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-extrabold tracking-wide"><Trophy size={18} className="text-blue-600" />GAME RESULTS · BET TOTALS</h3>
        <div className="grid grid-cols-3 gap-3 text-center font-bold text-white">
          <div className="rounded-lg bg-green-500 py-2">GREEN<div>₹0</div></div><div className="rounded-lg bg-purple-600 py-2">VIOLET<div>₹0</div></div><div className="rounded-lg bg-red-500 py-2">RED<div>₹0</div></div>
        </div>
        <div className="my-3 flex flex-wrap justify-around gap-3">
          {ball.map((c, i) => <div key={i} className="text-center text-xs"><div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${c}`}>{i}</div>₹0</div>)}
        </div>
        <div className="grid grid-cols-2 gap-3 text-center font-bold text-white"><div className="rounded-lg bg-yellow-400 py-2">BIG<div>₹0</div></div><div className="rounded-lg bg-blue-500 py-2">SMALL<div>₹0</div></div></div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex gap-2">{[['history', 'Result History'], ['bets', 'User Bets']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === k ? 'bg-blue-600 text-white' : 'bg-white text-ink'}`}>{l}</button>))}</div>
        <DataTable columns={tab === 'history' ? cols : betCols} rows={tab === 'history' ? history : [{ id: 1, user: 'User_L13HY', pick: 'Green', amount: 10 }]} hideSize />
      </div>
    </div>
  )
}

