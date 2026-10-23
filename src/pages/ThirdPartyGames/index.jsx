import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  X,
  Globe,
  Play,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react'
import thirdPartyBannerImg from '@/assets/3rdpartygames.png'
import { FormModal, useToast, VeronovaLoader } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { GAME_CATEGORY_API, JILI_API } from '@/constants/api'
import { apiRequest } from '@/utils/apiClient'
import { PROVIDERS_DATA } from './providersData'

// Visual icon helper for game cards
const getGameEmoji = (type = '', name = '') => {
  const t = (type + ' ' + name).toLowerCase()
  if (t.includes('fish') || t.includes('hunter')) return '🐠'
  if (t.includes('crash') || t.includes('jet') || t.includes('balloon') || t.includes('fly')) return '🚀'
  if (t.includes('roulette') || t.includes('wheel')) return '🎡'
  if (t.includes('card') || t.includes('baccarat') || t.includes('poker') || t.includes('blackjack') || t.includes('teen patti') || t.includes('ace')) return '🃏'
  if (t.includes('dice') || t.includes('sic') || t.includes('7 up')) return '🎲'
  if (t.includes('soccer') || t.includes('football') || t.includes('cup') || t.includes('league')) return '⚽'
  if (t.includes('cricket')) return '🏏'
  if (t.includes('tennis')) return '🎾'
  if (t.includes('basket')) return '🏀'
  if (t.includes('racing') || t.includes('horse')) return '🏇'
  if (t.includes('plinko') || t.includes('mines') || t.includes('arcade')) return '💎'
  return '🎰'
}

export default function ThirdPartyGames() {
  const navigate = useNavigate()
  const [toast, toastNode] = useToast()
  const [providers, setProviders] = useState(PROVIDERS_DATA)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [activeProvider, setActiveProvider] = useState(null)
  const [providerGameSearch, setProviderGameSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [gamesByCat, setGamesByCat] = useState({})
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch live game categories from backend API: https://root.veronova.co.in/api/game-categories
  useEffect(() => {
    let isMounted = true
    const fetchApiCategories = async () => {
      try {
        setIsLoadingApi(true)
        const res = await fetch(GAME_CATEGORY_API.CATEGORIES)
        const json = await res.json()
        if (isMounted && json?.status && Array.isArray(json?.data) && json.data.length > 0) {
          const apiProviders = json.data.map((item) => {
            const existing = PROVIDERS_DATA.find(
              (p) =>
                p.title.toLowerCase().includes(item.cat_name.toLowerCase()) ||
                p.shortTitle?.toLowerCase() === item.cat_name.toLowerCase() ||
                item.cat_name.toLowerCase().includes(p.shortTitle?.toLowerCase() || '') ||
                p.id === item.id
            )
            return {
              id: item.id,
              title: item.cat_name,
              shortTitle: item.cat_name,
              image: item.img, // Live image URL from API
              fallbackImage: existing?.image,
              status: item.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
              category: existing?.category || 'Slots & Casino',
              isBanner: existing?.isBanner || false,
              isDarkLogo: existing?.isDarkLogo || false,
              accent: existing?.accent || '#2563eb',
              gamesCount: existing?.gamesCount || `${existing?.games?.length || 10}+ Games`,
              games: existing?.games || [
                { name: `${item.cat_name} Classic 1`, type: 'Slot', rtp: '97.2%', route: ROUTES.COLOUR_PREDICTION },
                { name: `${item.cat_name} Deluxe`, type: 'Table', rtp: '96.8%', route: ROUTES.COLOUR_PREDICTION },
                { name: `${item.cat_name} Multiplier`, type: 'Crash', rtp: '97.0%', route: ROUTES.COLOUR_PREDICTION },
                { name: `${item.cat_name} Megaways`, type: 'Jackpot', rtp: '96.5%', route: ROUTES.COLOUR_PREDICTION },
              ],
            }
          })
          setProviders(apiProviders)
        }
      } catch (err) {
        console.warn('Game categories API fetch failed, fallback to local providers:', err)
      } finally {
        if (isMounted) setIsLoadingApi(false)
      }
    }

    fetchApiCategories()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch games dynamically by category ID or provider API
  useEffect(() => {
    if (!activeProvider?.id) return
    const catId = activeProvider.id

    // Use cached games if already loaded
    if (gamesByCat[catId]) return

    let isMounted = true
    const fetchCategoryGames = async () => {
      try {
        setIsLoadingGames(true)

        // 1. Check if provider is JILI - try /getjilligame first
        const isJili =
          activeProvider?.shortTitle?.toLowerCase() === 'jili' ||
          activeProvider?.title?.toLowerCase().includes('jili') ||
          catId === 1

        if (isJili) {
          try {
            const jiliRes = await apiRequest(JILI_API.jiliGames)
            const list = Array.isArray(jiliRes) ? jiliRes : (jiliRes?.data || jiliRes?.games || [])
            if (Array.isArray(list) && list.length > 0) {
              const apiGames = list.map((item, idx) => ({
                id: item.id || item.gameId || idx + 1,
                name: item.name || item.game_name || `JILI Game ${idx + 1}`,
                cat_id: catId,
                gmId: item.gameId || item.gmId || String(item.id || idx + 1),
                image: item.image || item.img || item.icon,
                status: item.status?.toLowerCase() === 'active' ? 'Active' : (item.status || 'Active'),
                type: item.type || item.category || 'Slot',
                rtp: item.rtp || '97.2%',
                route: ROUTES.JILLI_BETS,
              }))
              if (isMounted) {
                setGamesByCat((prev) => ({
                  ...prev,
                  [catId]: apiGames,
                }))
                return
              }
            }
          } catch (jErr) {
            console.warn('JILI /getjilligame fetch, falling back to category service:', jErr.message)
          }
        }

        // 2. Fallback to external games-by-category API
        const res = await fetch(`${GAME_CATEGORY_API.GAMES_BY_CATEGORY}?cat_id=${catId}`)
        const json = await res.json()
        if (isMounted && json?.status && Array.isArray(json?.data)) {
          const apiGames = json.data.map((item) => ({
            id: item.id,
            name: item.name,
            cat_id: item.cat_id,
            gmId: item.gmId,
            image: item.img, // Live cloudinary image URL from API
            status: item.status?.toLowerCase() === 'active' ? 'Active' : (item.status || 'Active'),
            type: activeProvider.category?.includes('Casino')
              ? 'Live Casino'
              : activeProvider.category?.includes('Sports')
              ? 'Sports'
              : 'Slot',
            rtp: '97.2%',
            route: ROUTES.COLOUR_PREDICTION,
          }))

          setGamesByCat((prev) => ({
            ...prev,
            [catId]: apiGames,
          }))
        } else if (isMounted) {
          setGamesByCat((prev) => ({
            ...prev,
            [catId]: [],
          }))
        }
      } catch (err) {
        console.warn(`Failed to fetch games for category ${catId}:`, err)
        if (isMounted) {
          setGamesByCat((prev) => ({
            ...prev,
            [catId]: activeProvider.games || [],
          }))
        }
      } finally {
        if (isMounted) setIsLoadingGames(false)
      }
    }

    fetchCategoryGames()
    return () => {
      isMounted = false
    }
  }, [activeProvider?.id, activeProvider?.category, activeProvider?.games, activeProvider?.shortTitle, activeProvider?.title, gamesByCat])

  // Filtered providers for the logo grid
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All Categories' || p.category === selectedCategory
      const matchesStatus =
        selectedStatus === 'All Status' || p.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [providers, searchQuery, selectedCategory, selectedStatus])

  // Handle clicking a logo card: toggle dropdown
  const handleLogoClick = (provider) => {
    if (activeProvider?.id === provider.id) {
      setActiveProvider(null)
    } else {
      setActiveProvider(provider)
      setProviderGameSearch('')
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }

  // Selected category games (from API cache or provider fallback)
  const currentCategoryGames = useMemo(() => {
    if (!activeProvider) return []
    if (gamesByCat[activeProvider.id]) {
      return gamesByCat[activeProvider.id]
    }
    return activeProvider.games || []
  }, [activeProvider, gamesByCat])

  // Filter games inside the active dropdown based on search query
  const activeGames = useMemo(() => {
    if (!currentCategoryGames) return []
    if (!providerGameSearch.trim()) return currentCategoryGames
    const q = providerGameSearch.toLowerCase()
    return currentCategoryGames.filter(
      (g) =>
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.type && g.type.toLowerCase().includes(q)) ||
        (g.gmId && g.gmId.toLowerCase().includes(q)) ||
        (g.status && g.status.toLowerCase().includes(q))
    )
  }, [currentCategoryGames, providerGameSearch])

  const [launchingId, setLaunchingId] = useState(null)

  const handleLaunchGame = async (e, g) => {
    e.stopPropagation()
    const isJili =
      activeProvider?.shortTitle?.toLowerCase() === 'jili' ||
      activeProvider?.title?.toLowerCase().includes('jili') ||
      g.route === ROUTES.JILLI_BETS

    if (isJili) {
      try {
        setLaunchingId(g.id || g.gmId)
        toast(`Generating JILI launch URL for ${g.name}...`, 'info')
        const gameId = g.gmId || g.gameId || g.id || '49'
        const res = await apiRequest(JILI_API.jiliLaunchUrl('ADMIN_TEST', 100, gameId))
        const url = res?.data?.url || res?.url || (typeof res?.data === 'string' ? res.data : null)
        if (url && typeof url === 'string' && url.startsWith('http')) {
          toast(`Launching ${g.name}...`, 'success')
          window.open(url, '_blank')
        } else if (res?.success || res?.status === 200) {
          toast(`Session launched for ${g.name}`, 'success')
        } else {
          toast(`Launch response received for ${g.name}`, 'info')
        }
      } catch (err) {
        console.warn('JILI Launch Error:', err)
        toast(err.message || 'Game launch failed', 'error')
      } finally {
        setLaunchingId(null)
      }
    } else {
      navigate(g.route)
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
        <span className="text-slate-900 font-bold">Third-Party Games</span>
      </div>

      {/* Hero Banner with uploaded artwork 3rdpartygames.png */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] shadow-xl border border-blue-400/30 text-white min-h-[175px] sm:min-h-[195px] flex items-center justify-between p-6 sm:p-8">
        <img
          src={thirdPartyBannerImg}
          alt="Third-Party Games"
          className="absolute inset-0 w-full h-full object-cover object-[center_55%] pointer-events-none"
        />

        <div className="absolute inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-blue-950/85 via-blue-950/45 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-2 border border-white/30 shadow-xs">
            <Globe size={13} />
            <span>Top Tier Providers ({providers.length})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Third-Party <br />
            <span className="text-sky-300">Games</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] max-w-lg">
            Click any provider logo to drop down its games catalog and live bet ledger.
          </p>
        </div>

        <div className="relative z-10 hidden sm:block shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all"
          >
            <Plus size={16} /> Integrate Provider
          </button>
        </div>
      </div>

      {/* Search and Category Filter bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider logo by name..."
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

        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none rounded-xl bg-white border border-slate-200 px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All Categories">All Categories ({providers.length})</option>
              <option value="Slots & Arcade">Slots & Arcade</option>
              <option value="Live Casino">Live Casino</option>
              <option value="Crash & Turbo">Crash & Turbo</option>
              <option value="Sports & Esports">Sports & Esports</option>
              <option value="Table & Cards">Table & Cards</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

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

      {/* Pure Logo-Shape Grid (NO TEXT on cards) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-3.5">
        {filteredProviders.map((provider) => {
          const isSelected = activeProvider?.id === provider.id

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleLogoClick(provider)}
              title={provider.title}
              className={`group relative aspect-square rounded-2xl p-2.5 flex items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden border ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 ring-4 ring-blue-500/30 shadow-xl scale-105 z-10'
                  : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1'
              }`}
            >
              {/* Logo container matching logo shape */}
              {provider.isBanner ? (
                <img
                  src={provider.image}
                  alt={provider.title}
                  onError={(e) => {
                    if (provider.fallbackImage && e.currentTarget.src !== provider.fallbackImage) {
                      e.currentTarget.src = provider.fallbackImage
                    }
                  }}
                  className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full p-1">
                  <div className={`flex items-center justify-center ${provider.isDarkLogo ? 'bg-white rounded-xl p-1.5 shadow-2xs h-full w-full' : 'h-full w-full'}`}>
                    <img
                      src={provider.image}
                      alt={provider.title}
                      onError={(e) => {
                        if (provider.fallbackImage && e.currentTarget.src !== provider.fallbackImage) {
                          e.currentTarget.src = provider.fallbackImage
                        }
                      }}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Selected Dropdown Indicator Arrow */}
              {isSelected && (
                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                  <ChevronDown size={12} className="stroke-[3]" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Globe size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No game provider logo found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
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

      {/* Interactive Dropdown Section (Light Theme matching category logo cards) */}
      {activeProvider && (
        <div
          ref={dropdownRef}
          className="rounded-2xl border border-blue-200 bg-white p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          {/* Dropdown Header in Light Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 p-2 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={activeProvider.image}
                  alt={activeProvider.title}
                  onError={(e) => {
                    if (activeProvider.fallbackImage && e.currentTarget.src !== activeProvider.fallbackImage) {
                      e.currentTarget.src = activeProvider.fallbackImage
                    }
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {activeProvider.title}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={11} /> {activeProvider.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                    {activeProvider.category}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-600">
                    {isLoadingGames ? 'Loading games...' : `${currentCategoryGames.length} Games`}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
              {/* Search Inside this provider's games */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={providerGameSearch}
                  onChange={(e) => setProviderGameSearch(e.target.value)}
                  placeholder="Search games..."
                  className="input !pl-8 !py-2 !text-xs bg-slate-50 border-slate-200 text-slate-800 rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-blue-500 w-36 sm:w-48 shadow-2xs font-medium"
                />
              </div>

              <button
                onClick={() => navigate(activeProvider.route)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition"
              >
                <span>Open Bet Ledger</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => setActiveProvider(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                title="Close Dropdown"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Games Grid Inside Dropdown - Styled just like category logo cards */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 size={14} className="text-blue-600" />
                Games Inside {activeProvider.shortTitle || activeProvider.title} ({isLoadingGames ? '...' : activeGames.length}):
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
                Click any game to open bet ledger
              </span>
            </div>

            {isLoadingGames ? (
              <div className="py-8 my-2 rounded-2xl bg-slate-50/80 border border-blue-100/80 flex items-center justify-center shadow-inner">
                <VeronovaLoader
                  size="md"
                  text={`Loading ${activeProvider.shortTitle || activeProvider.title} Games...`}
                  subtitle="VERONOVA SEAMLESS GATEWAY"
                />
              </div>
            ) : activeGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
                {activeGames.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    onClick={() => navigate(g.route)}
                    className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
                  >
                    {/* Game Visual Tile with real API image */}
                    <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-2.5 border-b border-slate-100 overflow-hidden">
                      {g.image ? (
                        <img
                          src={g.image}
                          alt={g.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex'
                            }
                          }}
                          className="h-full w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-108"
                        />
                      ) : null}

                      <div
                        style={{ display: g.image ? 'none' : 'flex' }}
                        className="h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 text-2xl font-black text-blue-600"
                      >
                        <span>{getGameEmoji(g.type, g.name)}</span>
                      </div>

                      {/* Status / Active Badge */}
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-700 bg-emerald-50/95 backdrop-blur-xs border border-emerald-200 px-1.5 py-0.5 rounded-md shadow-2xs capitalize">
                        {g.status}
                      </span>
                    </div>

                    {/* Game Info Bottom */}
                    <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <h4
                          className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition truncate"
                          title={g.name}
                        >
                          {g.name}
                        </h4>
                        {g.gmId && (
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={`gmId: ${g.gmId}`}>
                            ID: {g.gmId.slice(0, 10)}...
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                          {g.type}
                        </span>
                        <div
                          onClick={(e) => handleLaunchGame(e, g)}
                          title={`Launch ${g.name}`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs"
                        >
                          {launchingId === (g.id || g.gmId) ? (
                            <span className="h-2.5 w-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                          ) : (
                            <Play size={10} fill="currentColor" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <Gamepad2 size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-extrabold text-slate-700">
                  {providerGameSearch ? `No games matching "${providerGameSearch}"` : `No games found in ${activeProvider.title}`}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {providerGameSearch ? 'Try a different search keyword.' : 'This category currently has no active games returned from the API.'}
                </p>
                {providerGameSearch && (
                  <button
                    onClick={() => setProviderGameSearch('')}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {isAddModalOpen && (
        <FormModal
          title="Integrate New Game Provider"
          values={{ title: '', gamesCount: '50+ Games', category: 'Slots & Arcade', status: 'Active', apiEndpoint: 'https://api.provider.com/v1' }}
          saveLabel="Add Provider"
          fields={[
            { key: 'title', label: 'Provider Brand Name', type: 'text' },
            { key: 'gamesCount', label: 'Initial Game Catalog Size', type: 'text' },
            {
              key: 'category',
              label: 'Primary Category',
              options: ['Slots & Arcade', 'Live Casino', 'Crash & Turbo', 'Sports & Esports', 'Table & Cards'],
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
              shortTitle: v.title || 'New',
              gamesCount: v.gamesCount || '50+ Games',
              category: v.category || 'Live Casino',
              status: v.status,
              route: ROUTES.JILLI_BETS,
              image: thirdPartyBannerImg,
              isBanner: true,
              games: [
                { name: `${v.title || 'New'} Game 1`, type: 'Standard', rtp: '96.5%', route: ROUTES.JILLI_BETS },
                { name: `${v.title || 'New'} Game 2`, type: 'Standard', rtp: '96.8%', route: ROUTES.JILLI_BETS },
              ],
            }
            setProviders([newProv, ...providers])
            toast(`Provider "${v.title}" successfully integrated!`)
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {toastNode}
    </div>
  )
}
