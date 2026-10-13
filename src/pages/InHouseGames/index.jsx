import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  X,
} from 'lucide-react'
import inhouseBannerImg from '@/assets/inhousegames.png'
import wingoImg from '@/assets/games/wingo.png'
import horseRacingImg from '@/assets/games/horseracing.png'
import aviatorImg from '@/assets/games/aviatorgames.png'
import chickenRoadImg from '@/assets/games/chickenroad.png'
import { FormModal, useToast } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

// 4 In-House Games data
const INITIAL_GAMES = [
  {
    id: 1,
    title: 'Wingo',
    category: 'Lottery',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: '#8b5cf6',
    customGradient: 'from-[#1a1040] via-[#3b1261] to-[#701a75]',
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-slate-900">
        <img
          src={wingoImg}
          alt="Wingo"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    ),
  },
  {
    id: 2,
    title: 'Horse Racing',
    category: 'Racing',
    status: 'Active',
    route: ROUTES.HORSE_RIDING,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: '#f59e0b',
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-slate-900">
        <img
          src={horseRacingImg}
          alt="Horse Racing"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    ),
  },
  {
    id: 3,
    title: 'Chicken Road',
    category: 'Casual',
    status: 'Active',
    route: ROUTES.CHICKEN_MULTIPLIER,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: '#ef4444',
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-slate-900">
        <img
          src={chickenRoadImg}
          alt="Chicken Road"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    ),
  },
  {
    id: 4,
    title: 'Aviator',
    category: 'Crash',
    status: 'Active',
    route: ROUTES.AVIATOR,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: '#e11d48',
    graphic: (
      <div className="relative flex items-center justify-center h-full w-full overflow-hidden bg-slate-900">
        <img
          src={aviatorImg}
          alt="Aviator"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    ),
  },
]

export default function InHouseGames() {
  const navigate = useNavigate()
  const [toast, toastNode] = useToast()
  const [games, setGames] = useState(INITIAL_GAMES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtered games based on search, category and status
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All Categories' || game.category === selectedCategory
      const matchesStatus =
        selectedStatus === 'All Status' || game.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [games, searchQuery, selectedCategory, selectedStatus])

  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to={ROUTES.DASHBOARD} className="hover:text-blue-600 transition flex items-center gap-1">
          <span className="text-slate-400">🏠</span> Dashboard
        </Link>
        <span>›</span>
        <span>Games</span>
        <span>›</span>
        <span className="text-slate-900 font-bold">In-House Games</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] shadow-xl border border-blue-400/30 text-white min-h-[170px] sm:min-h-[190px] flex items-center justify-between p-6 sm:p-8">
        {/* Background artwork */}
        <img
          src={inhouseBannerImg}
          alt="In-House Games"
          className="absolute inset-0 w-full h-full object-cover object-[center_right] pointer-events-none opacity-90"
        />

        {/* Content on the left */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-3 border border-white/30 shadow-xs">
            <Gamepad2 size={13} />
            <span>In-House Games</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
            In-House Games
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 leading-relaxed drop-shadow-sm max-w-lg">
            Manage your platform games like Wingo, Horse Racing, Chicken Road, and Aviator.
          </p>
        </div>

        {/* Right CTA button */}
        <div className="relative z-10 hidden sm:block shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all"
          >
            <Plus size={16} /> Add Game
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search game by name..."
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

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Categories dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none rounded-xl bg-white border border-slate-200 px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Categories">All Categories</option>
              <option value="Lottery">Lottery</option>
              <option value="Racing">Racing</option>
              <option value="Casual">Casual</option>
              <option value="Crash">Crash</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none rounded-xl bg-white border border-slate-200 px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Disabled">Disabled</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Mobile Add Game Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="sm:hidden flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* 4-Column Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => navigate(game.route)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-200 flex flex-col"
          >
            {/* Visual Thumbnail Area (16:9 ratio) */}
            <div className="relative h-36 w-full overflow-hidden bg-slate-900 group-hover:scale-[1.02] transition-transform duration-300">
              {game.graphic}
            </div>

            {/* Game Info Bottom Row */}
            <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight group-hover:text-blue-600 transition truncate">
                  {game.title}
                </h3>
                {game.status === 'Active' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 size={11} /> Active
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                {/* Category tag */}
                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold border ${game.badgeColor}`}>
                  {game.category}
                </span>

                {/* Arrow round button */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs">
                  <ArrowRight size={15} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State if filter yields 0 games */}
      {filteredGames.length === 0 && (
        <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Gamepad2 size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No games found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
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

      {/* Add Game Modal */}
      {isAddModalOpen && (
        <FormModal
          title="Add New In-House Game"
          values={{ title: '', category: 'Casual', route: '/colour-prediction', status: 'Active' }}
          saveLabel="Create Game"
          fields={[
            { key: 'title', label: 'Game Title', type: 'text' },
            {
              key: 'category',
              label: 'Category',
              options: ['Lottery', 'Racing', 'Casual', 'Crash'],
            },
            {
              key: 'status',
              label: 'Status',
              options: ['Active', 'Maintenance', 'Disabled'],
            },
          ]}
          onSave={(v) => {
            const newGame = {
              id: games.length + 1,
              title: v.title || 'Custom Game',
              category: v.category,
              status: v.status,
              route: ROUTES.COLOUR_PREDICTION,
              badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
              accent: '#3b82f6',
              graphic: (
                <div className="relative flex items-center justify-center h-full w-full bg-gradient-to-br from-indigo-950 to-blue-900 text-white font-black text-sm">
                  {v.title || 'New Game'}
                </div>
              ),
            }
            setGames([newGame, ...games])
            toast(`Game "${v.title}" successfully added!`)
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {toastNode}
    </div>
  )
}
