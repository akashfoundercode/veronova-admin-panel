  import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  X,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react'
import inhouseBannerImg from '@/assets/inhousegames.png'
import wingoImg from '@/assets/games/wingo.png'
import horseRacingImg from '@/assets/games/horseracing.png'
import aviatorImg from '@/assets/games/aviatorgames.png'
import chickenRoadImg from '@/assets/games/chickenroad.png'

// High-res authentic category icons from assets 2
import lotteryCatImg from '@/assets/assets 2/gamecategoryLottery-DFM6XaoK.png'
import popularCatImg from '@/assets/assets 2/gamecategorypopular-DafU8yqo.png'
import originalCatImg from '@/assets/assets 2/gamecategoryminigames-BNh40PbI.png'
import casinoCatImg from '@/assets/assets 2/casinoicon-CL4uQygQ.png'
import slotsCatImg from '@/assets/assets 2/sloticon--c-26RUj.png'
import sportsCatImg from '@/assets/assets 2/sportsicon-P9PIyEjH.png'
import rummyCatImg from '@/assets/assets 2/rummyicon-CIslnG31.png'
import fishingCatImg from '@/assets/assets 2/fishingicon-M51pHW8e.png'

// Authentic 100% solid cropped category background images (no transparent margins)
import lotteryBg from '@/assets/categories_bg/lotterybg-Dbl-eMPh.png'
import popularBg from '@/assets/categories_bg/popularbg-8_UUQbeo.png'
import originalBg from '@/assets/categories_bg/originalbg-DT4CLv66.png'
import casinoBg from '@/assets/categories_bg/casinobg-CepDEnWM.png'
import slotsBg from '@/assets/categories_bg/slotbg-DM52Kkhg.png'
import sportsBg from '@/assets/categories_bg/sportsbg-CFnl9BGk.png'
import rummyBg from '@/assets/categories_bg/pokerbg-Dg5bPKcx.png'
import fishingBg from '@/assets/categories_bg/fishbg-D0liGLFa.png'

import { FormModal, useToast } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

// 4 In-House Games exclusively under the Lottery category
const LOTTERY_GAMES = [
  {
    id: 1,
    title: 'Wingo',
    category: 'Lottery',
    status: 'Active',
    route: ROUTES.COLOUR_PREDICTION,
    rtp: '97.5%',
    type: 'Color Prediction',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    image: wingoImg,
  },
  {
    id: 2,
    title: 'Horse Racing',
    category: 'Lottery',
    status: 'Active',
    route: ROUTES.HORSE_RIDING,
    rtp: '96.8%',
    type: 'Derby Race 20s',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    image: horseRacingImg,
  },
  {
    id: 3,
    title: 'Chicken Road',
    category: 'Lottery',
    status: 'Active',
    route: ROUTES.CHICKEN_MULTIPLIER,
    rtp: '97.2%',
    type: 'Multiplier Cross',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    image: chickenRoadImg,
  },
  {
    id: 4,
    title: 'Aviator',
    category: 'Lottery',
    status: 'Active',
    route: ROUTES.AVIATOR,
    rtp: '97.0%',
    type: 'Crash Multiplier',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    image: aviatorImg,
  },
]

// 8 Platform Categories matching the reference with custom bg, gradient and icons
const CATEGORIES_DATA = [
  {
    id: 'lottery',
    name: 'Lottery',
    image: lotteryCatImg,
    bg: lotteryBg,
    gradient: 'from-[#9333ea] via-[#a855f7] to-[#d946ef]',
    games: LOTTERY_GAMES,
    description: 'Platform in-house games including Wingo, Horse Racing, Chicken Road, and Aviator.',
  },
  {
    id: 'popular',
    name: 'Popular',
    image: popularCatImg,
    bg: popularBg,
    gradient: 'from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]',
    games: [],
    description: 'Trending and most played games across the platform.',
  },
  {
    id: 'original',
    name: 'Original',
    image: originalCatImg,
    bg: originalBg,
    gradient: 'from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]',
    games: [],
    description: 'In-house provably fair original platform games.',
  },
  {
    id: 'casino',
    name: 'Casino',
    image: casinoCatImg,
    bg: casinoBg,
    gradient: 'from-[#db2777] via-[#e11d48] to-[#f43f5e]',
    games: [],
    description: 'Live casino and table games managed via Third-Party Providers.',
  },
  {
    id: 'slots',
    name: 'Slots',
    image: slotsCatImg,
    bg: slotsBg,
    gradient: 'from-[#7c3aed] via-[#8b5cf6] to-[#a855f7]',
    games: [],
    description: 'Video slots and jackpots managed via Third-Party Providers.',
  },
  {
    id: 'sports',
    name: 'Sports',
    image: sportsCatImg,
    bg: sportsBg,
    gradient: 'from-[#d97706] via-[#ea580c] to-[#f59e0b]',
    games: [],
    description: 'Sports betting, virtual derbies and matches.',
  },
  {
    id: 'rummy',
    name: 'Rummy',
    image: rummyCatImg,
    bg: rummyBg,
    gradient: 'from-[#4338ca] via-[#4f46e5] to-[#6366f1]',
    games: [],
    description: 'Card games and Indian table games.',
  },
  {
    id: 'fishing',
    name: 'Fishing',
    image: fishingCatImg,
    bg: fishingBg,
    gradient: 'from-[#e11d48] via-[#f43f5e] to-[#fb7185]',
    games: [],
    description: 'Arcade fish hunter games.',
  },
]

export default function InHouseGames() {
  const navigate = useNavigate()
  const [toast, toastNode] = useToast()
  const [activeCategory, setActiveCategory] = useState('lottery') // Defaults to Lottery with the 4 games open
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedCategoryData = useMemo(() => {
    return CATEGORIES_DATA.find((c) => c.id === activeCategory) || CATEGORIES_DATA[0]
  }, [activeCategory])

  const filteredGames = useMemo(() => {
    if (!selectedCategoryData?.games) return []
    if (!searchQuery) return selectedCategoryData.games
    return selectedCategoryData.games.filter(
      (g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [selectedCategoryData, searchQuery])

  const handleCategoryClick = (catId) => {
    if (activeCategory === catId) {
      // Toggle collapse/expand or keep active
      setActiveCategory(null)
    } else {
      setActiveCategory(catId)
      setSearchQuery('')
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }

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
        <img
          src={inhouseBannerImg}
          alt="In-House Games"
          className="absolute inset-0 w-full h-full object-cover object-[center_right] pointer-events-none opacity-90"
        />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-3 border border-white/30 shadow-xs">
            <Gamepad2 size={13} />
            <span>Platform In-House Games</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
            In-House Games
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 leading-relaxed drop-shadow-sm max-w-lg">
            Select any category card to drop down its platform games. The 4 in-house games are organized under <strong className="text-white underline">Lottery</strong>.
          </p>
        </div>

        <div className="relative z-10 hidden sm:block shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all"
          >
            <Plus size={16} /> Add Game
          </button>
        </div>
      </div>

      {/* Category Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <span>Game Categories</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click on any category card to open its game catalog dropdown
          </p>
        </div>

        {activeCategory && (
          <span className="text-xs text-blue-600 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            Selected: {selectedCategoryData?.name}
          </span>
        )}
      </div>

      {/* 8 Category Cards Grid (5 cards per row) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-3.5 max-w-5xl">
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = activeCategory === cat.id

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`group relative h-18 sm:h-20 rounded-2xl overflow-hidden p-3 flex items-center justify-between transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'border-white ring-4 ring-blue-500/60 shadow-xl scale-[1.02] z-10'
                  : 'border-white/10 shadow-md hover:shadow-xl hover:scale-[1.01]'
              }`}
            >
              {/* Single background image filling 100% without any secondary background or lines */}
              <img
                src={cat.bg}
                alt=""
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* 3D Category Icon on Left */}
              <div className="relative z-10 h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center -ml-1">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Category Name beside the icon (Right side) */}
              <div className="relative z-10 flex flex-col items-end text-right pr-1">
                <span className="font-serif font-black text-white text-base sm:text-lg lg:text-xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] leading-tight">
                  {cat.name}
                </span>
                {cat.games.length > 0 && (
                  <span className="text-[10px] font-extrabold text-white/95 bg-white/25 backdrop-blur-xs px-2 py-0.5 rounded-full mt-1 border border-white/30 shadow-2xs leading-tight">
                    {cat.games.length} Games
                  </span>
                )}
              </div>

              {/* Selected Category Indicator (Translucent glass badge, no harsh white circle) */}
              {isSelected && (
                <div className="absolute bottom-1 left-2 flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white border border-white/30 shadow-xs z-20">
                  <span>Open</span>
                  <ChevronDown size={11} className="stroke-[3]" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Interactive Dropdown Section (Light Theme with matching game cards) */}
      {activeCategory && selectedCategoryData && (
        <div
          ref={dropdownRef}
          className="rounded-2xl border border-blue-200 bg-white p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          {/* Dropdown Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="relative h-14 w-28 sm:h-16 sm:w-32 rounded-2xl overflow-hidden shadow-md shrink-0 flex items-center justify-between px-2.5">
                <img
                  src={selectedCategoryData.bg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
                <img
                  src={selectedCategoryData.image}
                  alt={selectedCategoryData.name}
                  className="relative z-10 h-10 w-10 sm:h-12 sm:w-12 object-contain filter drop-shadow-md"
                />
                <span className="relative z-10 font-serif font-black text-white text-xs sm:text-sm drop-shadow-md pr-1">
                  {selectedCategoryData.name}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {selectedCategoryData.name} Games
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={11} /> {selectedCategoryData.games.length} In-House
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {selectedCategoryData.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
              {/* Search Inside this category's games */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter games..."
                  className="input !pl-8 !py-2 !text-xs bg-slate-50 border-slate-200 text-slate-800 rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-blue-500 w-36 sm:w-48 shadow-2xs font-medium"
                />
              </div>

              {selectedCategoryData.id !== 'lottery' && (
                <button
                  onClick={() => setActiveCategory('lottery')}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 px-3.5 py-2 text-xs font-bold transition"
                >
                  <span>Go to Lottery (4)</span>
                </button>
              )}

              <button
                onClick={() => setActiveCategory(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                title="Close Dropdown"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Games Grid Inside Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 size={14} className="text-blue-600" />
                Games Inside {selectedCategoryData.name} ({filteredGames.length}):
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
                Click any game to launch live bet ledger
              </span>
            </div>

            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => navigate(game.route)}
                    className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 flex flex-col"
                  >
                    {/* Visual Thumbnail Area */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-xs">
                        RTP {game.rtp}
                      </span>
                    </div>

                    {/* Game Info Bottom Row */}
                    <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base tracking-tight group-hover:text-blue-600 transition truncate">
                            {game.title}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">{game.type}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {game.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          Open Game
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs">
                          <Play size={13} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Gamepad2 size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-extrabold text-slate-700">
                  No In-House Games in {selectedCategoryData.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  All 4 in-house games (Wingo, Horse Racing, Chicken Road, Aviator) are hosted under the Lottery category.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveCategory('lottery')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-xs transition"
                  >
                    <span>Open Lottery Category (4 Games)</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.THIRD_PARTY_GAMES)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 transition"
                  >
                    <span>View Third-Party Games</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Game Modal */}
      {isAddModalOpen && (
        <FormModal
          title="Add New In-House Game"
          values={{ title: '', category: 'Lottery', route: '/colour-prediction', status: 'Active' }}
          saveLabel="Create Game"
          fields={[
            { key: 'title', label: 'Game Title', type: 'text' },
            {
              key: 'category',
              label: 'Category',
              options: ['Lottery', 'Original', 'Popular', 'Casino', 'Slots', 'Sports', 'Rummy', 'Fishing'],
            },
            {
              key: 'status',
              label: 'Status',
              options: ['Active', 'Maintenance', 'Disabled'],
            },
          ]}
          onSave={(v) => {
            toast(`Game "${v.title}" successfully added under ${v.category}!`)
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {toastNode}
    </div>
  )
}
