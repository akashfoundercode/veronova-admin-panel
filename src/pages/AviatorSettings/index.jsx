import { useState } from 'react'
import { Plane, Settings, Send, Check, Rocket } from 'lucide-react'
import { PageBanner, useToast } from '@/components/ui'

const modes = [
  { id: 'simple', icon: Plane, title: 'Simple Aviator', desc: 'Fast, lightweight and stable aviator gameplay mode with simplified logic and smooth performance.', tags: ['Fast', 'Lightweight', 'Stable'] },
  { id: 'advance', icon: Rocket, title: 'Advance Aviator', desc: 'Advanced gameplay system with enhanced controls, animations and premium game mechanics.', tags: ['Premium', 'Advanced Logic', 'Dynamic'] },
]

export default function AviatorSettings() {
  const [mode, setMode] = useState('advance')
  const [toast, node] = useToast()
  return (
    <div>
      <PageBanner title="Aviator Settings" icon={Plane} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Aviator Settings' }]} />
      <div className="grid gap-5 md:grid-cols-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`card relative p-6 text-left transition ${mode === m.id ? '!border-blue-500 ring-1 ring-blue-500' : ''}`}>
            <span className={`absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 ${mode === m.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>{mode === m.id && <Check size={16} />}</span>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><m.icon size={32} /></div>
            <h3 className="text-2xl font-extrabold">{m.title}</h3>
            <p className="mt-2 text-slate-500">{m.desc}</p>
            <div className="mt-4 flex gap-2">{m.tags.map((t) => <span key={t} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">{t}</span>)}</div>
          </button>
        ))}
      </div>
      <div className="card mt-5 p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Settings size={22} /></div>
          <div><h3 className="font-extrabold tracking-wide">SAVE CONFIGURATION</h3><p className="text-sm text-slate-500">Selected game mode will be applied instantly on the live Aviator system.</p></div>
        </div>
        <button className="btn w-full !py-3.5 text-base" onClick={() => toast('Game mode saved')}><Send size={18} /> Save Game Mode</button>
      </div>
      {node}
    </div>
  )
}

