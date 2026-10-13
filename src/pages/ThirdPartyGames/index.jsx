import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  Flame,
  Award,
  Layers,
  Sparkles,
  Play,
} from 'lucide-react'
import thirdPartyBannerImg from '@/assets/3rdpartygames.png'
import { FormModal, useToast, Modal } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

// 9 Major 3rd-Party Providers matching the user screenshot with rich game catalog
const PROVIDERS_DATA = [
  {
    id: 1,
    title: 'JILI',
    gamesCount: '120+ Games',
    category: 'Slots & Table',
    status: 'Active',
    route: ROUTES.JILLI_BETS,
    accent: '#f59e0b',
    games: [
      { name: 'Fortune Gems 2', type: 'Slot', rtp: '97.2%', route: ROUTES.JILLI_BETS },
      { name: 'Boxing King', type: 'Slot', rtp: '96.8%', route: ROUTES.JILLI_BETS },
      { name: 'Super Ace', type: 'Cards', rtp: '97.0%', route: ROUTES.JILLI_BETS },
      { name: 'Mega Ace', type: 'Cards', rtp: '96.9%', route: ROUTES.JILLI_BETS },
      { name: 'Crazy Hunter', type: 'Fish', rtp: '96.5%', route: ROUTES.JILLI_BETS },
      { name: 'Golden Empire', type: 'Slot', rtp: '97.1%', route: ROUTES.JILLI_BETS },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#ffe4be] via-[#fff4e3] to-[#ffe9c9]">
        <div className="flex items-center justify-center gap-2 z-10 scale-105">
          <span className="text-3xl font-black tracking-tight text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]">
            JILI
          </span>
          <span className="text-2xl filter drop-shadow">👑</span>
        </div>
        <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-amber-400/20 blur-md" />
        <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-amber-400/20 blur-md" />
      </div>
    ),
  },
  {
    id: 2,
    title: 'Spribe',
    gamesCount: '80+ Games',
    category: 'Crash & Turbo',
    status: 'Active',
    route: ROUTES.AVIATOR,
    accent: '#ef4444',
    games: [
      { name: 'Aviator', type: 'Crash', rtp: '97.0%', route: ROUTES.AVIATOR },
      { name: 'Mines', type: 'Turbo', rtp: '97.0%', route: ROUTES.CHICKEN_MULTIPLIER },
      { name: 'Plinko', type: 'Arcade', rtp: '98.0%', route: ROUTES.CHICKEN_MULTIPLIER },
      { name: 'Dice', type: 'Casino', rtp: '97.0%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Hilo', type: 'Cards', rtp: '97.0%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Goal', type: 'Arcade', rtp: '97.0%', route: ROUTES.CHICKEN_MULTIPLIER },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#eef2f6] via-[#ffffff] to-[#e2e8f0]">
        <div className="flex items-center justify-center gap-3 z-10">
          <span className="text-2xl font-black tracking-widest text-slate-900 font-mono">
            SPRIBE
          </span>
          <div className="flex items-center text-rose-500">
            <span className="text-2xl filter drop-shadow">✈️</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'InOut',
    gamesCount: '60+ Games',
    category: 'Casual & Table',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    accent: '#f97316',
    games: [
      { name: 'In Out Andar Bahar', type: 'Table', rtp: '97.5%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Speed Baccarat', type: 'Cards', rtp: '98.9%', route: ROUTES.COLOUR_PREDICTION },
      { name: '7 Up 7 Down', type: 'Dice', rtp: '96.5%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Dragon Tiger Super', type: 'Cards', rtp: '96.2%', route: ROUTES.COLOUR_PREDICTION },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#fef3c7] via-[#fffbeb] to-[#fef9c3]">
        <div className="flex items-center justify-center gap-2 z-10">
          <div className="flex items-center rounded-lg bg-black px-2.5 py-1 text-white font-black text-sm tracking-wider shadow-sm">
            <span className="text-amber-400">IN</span>
            <span className="text-white ml-0.5">OUT</span>
          </div>
          <span className="text-xl filter drop-shadow">🎲</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Evolution Live',
    gamesCount: '200+ Games',
    category: 'Live Casino',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    accent: '#0f172a',
    games: [
      { name: 'Crazy Time', type: 'Game Show', rtp: '96.08%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Lightning Roulette', type: 'Roulette', rtp: '97.30%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Monopoly Live', type: 'Game Show', rtp: '96.23%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Dream Catcher', type: 'Wheel', rtp: '96.58%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Mega Ball 100x', type: 'Lottery', rtp: '95.40%', route: ROUTES.COLOUR_PREDICTION },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#e2e8f0] via-[#f8fafc] to-[#cbd5e1]">
        <div className="flex items-center justify-center gap-2 z-10">
          <span className="text-xl filter drop-shadow">🃏</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest leading-none">
              LIVE
            </span>
            <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
              Evolution
            </span>
          </div>
          <span className="text-xl filter drop-shadow">🎡</span>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Evolution Live (Asia)',
    gamesCount: '150+ Games',
    category: 'Live Casino',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    accent: '#e11d48',
    games: [
      { name: 'Super Sic Bo Live', type: 'Dice', rtp: '97.22%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Fan Tan Live', type: 'Classic', rtp: '98.75%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Speed Baccarat Asia', type: 'Baccarat', rtp: '98.94%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Bac Bo Live', type: 'Dice', rtp: '98.87%', route: ROUTES.COLOUR_PREDICTION },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#ffedd5] via-[#fef2f2] to-[#fee2e2]">
        <div className="flex items-center justify-center gap-2 z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest leading-none">
              LIVE ASIA
            </span>
            <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
              Evolution
            </span>
          </div>
          <span className="text-2xl filter drop-shadow">⛩️</span>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: 'Ezugi',
    gamesCount: '100+ Games',
    category: 'Live Casino',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    accent: '#e11d48',
    games: [
      { name: 'Unlimited 21 Blackjack', type: 'Blackjack', rtp: '99.5%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Cricket War Live', type: 'Cards', rtp: '96.2%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Lucky 7 Live', type: 'Cards', rtp: '96.5%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Teen Patti 3 Card', type: 'Indian Table', rtp: '97.5%', route: ROUTES.COLOUR_PREDICTION },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#f1f5f9] via-[#ffffff] to-[#e2e8f0]">
        <div className="flex items-center justify-center gap-2 z-10">
          <span className="text-xl filter drop-shadow">🎰</span>
          <div className="flex flex-col items-start">
            <span className="text-xl font-black text-rose-600 tracking-tight leading-none">
              Ezugi
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              Smart Move
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: 'Bgaming',
    gamesCount: '80+ Games',
    category: 'Slots & Crypto',
    status: 'Active',
    route: ROUTES.JILLI_BETS,
    accent: '#eab308',
    games: [
      { name: 'Bonanza Billion', type: 'Slot', rtp: '96.0%', route: ROUTES.JILLI_BETS },
      { name: 'Elvis Frog in Vegas', type: 'Slot', rtp: '96.0%', route: ROUTES.JILLI_BETS },
      { name: 'Aloha King Elvis', type: 'Slot', rtp: '94.9%', route: ROUTES.JILLI_BETS },
      { name: 'Plinko XY', type: 'Arcade', rtp: '99.0%', route: ROUTES.CHICKEN_MULTIPLIER },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#fef08a]/30 via-[#fffbeb] to-[#fef9c3]">
        <div className="flex items-center justify-center gap-2 z-10">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
            B
          </span>
          <span className="text-base font-black tracking-widest text-slate-900 font-mono">
            GAMING
          </span>
          <span className="text-xl font-black text-rose-600 drop-shadow">
            7
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: 'SABASports (IBC)',
    gamesCount: '120+ Games',
    category: 'Sports Betting',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    accent: '#2563eb',
    games: [
      { name: 'SABA Cricket Premier League', type: 'Cricket', rtp: '95.5%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Virtual Football Cup', type: 'Soccer', rtp: '95.0%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'Virtual Basketball NBA', type: 'Basketball', rtp: '95.2%', route: ROUTES.COLOUR_PREDICTION },
      { name: 'SABA Tennis Grand Slam', type: 'Tennis', rtp: '95.8%', route: ROUTES.COLOUR_PREDICTION },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#bae6fd]/50">
        <div className="flex items-center justify-center gap-2 z-10">
          <span className="text-2xl filter drop-shadow">⚽</span>
          <div className="flex flex-col items-center">
            <span className="text-base font-black text-rose-600 tracking-tight leading-none">
              沙巴体育
            </span>
            <span className="text-[10px] font-black text-slate-900 tracking-wider">
              SABA SPORTS
            </span>
          </div>
          <span className="text-2xl filter drop-shadow">🏀</span>
        </div>
      </div>
    ),
  },
  {
    id: 9,
    title: 'PGSoft',
    gamesCount: '300+ Games',
    category: 'Video Slots',
    status: 'Active',
    route: ROUTES.JILLI_BETS,
    accent: '#f97316',
    games: [
      { name: 'Mahjong Ways 2', type: 'Video Slot', rtp: '96.95%', route: ROUTES.JILLI_BETS },
      { name: 'Fortune Ox', type: 'Video Slot', rtp: '96.75%', route: ROUTES.JILLI_BETS },
      { name: 'Fortune Tiger', type: 'Video Slot', rtp: '96.81%', route: ROUTES.JILLI_BETS },
      { name: 'Treasures of Aztec', type: 'Video Slot', rtp: '96.71%', route: ROUTES.JILLI_BETS },
      { name: 'Lucky Neko', type: 'Video Slot', rtp: '96.73%', route: ROUTES.JILLI_BETS },
    ],
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-gradient-to-r from-[#fef3c7] via-[#fff7ed] to-[#fed7aa]/50">
        <div className="flex items-center justify-center gap-3 z-10">
          <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            PG<span className="text-xs font-bold text-slate-500 block -mt-1">SOFT</span>
          </span>
          <span className="text-3xl filter drop-shadow">🐒</span>
        </div>
      </div>
    ),
  },
]

export default function ThirdPartyGames() {
  const navigate = useNavigate()
  const [toast, toastNode] = useToast()
  const [providers, setProviders] = useState(PROVIDERS_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedProviderModal, setSelectedProviderModal] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All Categories' || p.category === selectedCategory
      const matchesStatus =
        selectedStatus === 'All Status' || p.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [providers, searchQuery, selectedCategory, selectedStatus])

  return (
    <div className="space-y-5">
      {/* Breadcrumbs matching image */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to={ROUTES.DASHBOARD} className="hover:text-blue-600 transition flex items-center gap-1">
          <span className="text-slate-400">🏠</span> Dashboard
        </Link>
        <span>›</span>
        <span>Games</span>
        <span>›</span>
        <span className="text-slate-900 font-bold">Third-Party Games</span>
      </div>

      {/* Hero Banner with actual uploaded artwork 3rdpartygames.png */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] shadow-xl border border-blue-400/30 text-white min-h-[175px] sm:min-h-[195px] flex items-center justify-between p-6 sm:p-8">
        {/* Full background artwork 3rdpartygames.png */}
        <img
          src={thirdPartyBannerImg}
          alt="Third-Party Games"
          className="absolute inset-0 w-full h-full object-cover object-[center_55%] pointer-events-none"
        />

        {/* Subtle dark gradient overlay on left for sharp text contrast */}
        <div className="absolute inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-blue-950/80 via-blue-950/40 to-transparent pointer-events-none" />

        {/* Content on the left */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-2 border border-white/30 shadow-xs">
            <Globe size={13} />
            <span>Top Tier Providers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Third-Party <br />
            <span className="text-sky-300">Games</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] max-w-lg">
            Manage and integrate top game providers to offer a diverse gaming experience on your platform.
          </p>
        </div>

        {/* Right CTA button */}
        <div className="relative z-10 hidden sm:block shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all"
          >
            <Plus size={16} /> Integrate Provider
          </button>
        </div>
      </div>

      {/* Search, Category and Status Filter bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name..."
            className="input !pl-10 !py-2.5 !w-full bg-white text-xs sm:text-sm rounded-xl border-slate-200 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none rounded-xl bg-white border border-slate-200 px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Categories">All Categories</option>
              <option value="Slots & Table">Slots & Table</option>
              <option value="Crash & Turbo">Crash & Turbo</option>
              <option value="Casual & Table">Casual & Table</option>
              <option value="Live Casino">Live Casino</option>
              <option value="Slots & Crypto">Slots & Crypto</option>
              <option value="Sports Betting">Sports Betting</option>
              <option value="Video Slots">Video Slots</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none rounded-xl bg-white border border-slate-200 px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="sm:hidden flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* 4-Columns Grid matching the user screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            onClick={() => setSelectedProviderModal(provider)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col"
          >
            {/* Provider Logo / Graphic Container (16:9 ratio) */}
            <div className="relative h-32 w-full overflow-hidden bg-slate-100 group-hover:scale-[1.02] transition-transform duration-300 border-b border-slate-100">
              {provider.graphic}
            </div>

            {/* Provider Bottom Info Row */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition">
                  {provider.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                    <Gamepad2 size={12} />
                    <span>{provider.gamesCount}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {provider.category}
                  </span>
                </div>
              </div>

              {/* Arrow Round Button */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs">
                <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Globe size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No game provider found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All Categories')
              setSelectedStatus('All Status')
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Games Catalog Modal (Opens when clicking any 3rd party provider card) */}
      {selectedProviderModal && (
        <Modal
          title={`${selectedProviderModal.title} - Integrated Game Catalog`}
          onClose={() => setSelectedProviderModal(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50/70 p-3 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-xs">
                  {selectedProviderModal.title.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {selectedProviderModal.title} Gateway
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedProviderModal.gamesCount} · {selectedProviderModal.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate(selectedProviderModal.route)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span>Open Bet Ledger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Popular Games Available In This Provider:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedProviderModal.games?.map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(g.route)
                  }}
                  className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-blue-500 hover:bg-blue-50/30 transition shadow-2xs"
                >
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition truncate">
                      {g.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                      <span>{g.type}</span> • <span className="text-emerald-600 font-bold">RTP {g.rtp}</span>
                    </div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Play size={12} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Provider Modal */}
      {isAddModalOpen && (
        <FormModal
          title="Integrate New Game Provider"
          values={{ title: '', gamesCount: '50+ Games', category: 'Live Casino', status: 'Active', apiEndpoint: 'https://api.provider.com/v1' }}
          saveLabel="Add Provider"
          fields={[
            { key: 'title', label: 'Provider Brand Name', type: 'text' },
            { key: 'gamesCount', label: 'Initial Game Catalog Size', type: 'text' },
            {
              key: 'category',
              label: 'Primary Category',
              options: ['Slots & Table', 'Crash & Turbo', 'Casual & Table', 'Live Casino', 'Sports Betting', 'Video Slots'],
            },
            { key: 'apiEndpoint', label: 'Seamless API Endpoint', type: 'text' },
            {
              key: 'status',
              label: 'Gateway Status',
              options: ['Active', 'Maintenance', 'Inactive'],
            },
          ]}
          onSave={(v) => {
            const newProv = {
              id: providers.length + 1,
              title: v.title || 'New Provider',
              gamesCount: v.gamesCount || '50+ Games',
              category: v.category || 'Live Casino',
              status: v.status,
              route: ROUTES.JILLI_BETS,
              accent: '#3b82f6',
              games: [
                { name: `${v.title} Classic 1`, type: 'Live', rtp: '97.0%', route: ROUTES.JILLI_BETS },
                { name: `${v.title} Turbo 2`, type: 'Slots', rtp: '96.5%', route: ROUTES.JILLI_BETS },
              ],
              graphic: (
                <div className="relative flex items-center justify-center h-full w-full bg-slate-100 text-slate-900 font-black text-sm">
                  {v.title || 'New Provider'}
                </div>
              ),
            }
            setProviders([...providers, newProv])
            toast(`Provider "${v.title}" successfully integrated!`)
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {toastNode}
    </div>
  )
}
