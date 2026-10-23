import { useState, useEffect, Suspense } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  Crown, ChevronDown, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Search, CalendarDays, Bell, Maximize, LogOut,
} from 'lucide-react'
import { sidebarMenus } from '@/constants/navigation'
import VeronovaLoader from '@/components/ui/VeronovaLoader'
import auth from '@/utils/auth'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
    isActive ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30' : 'text-slate-700 hover:bg-blue-50'
  }`

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const loc = useLocation()
  const currentUser = auth.getUser()

  // Route protection: If unauthenticated, redirect immediately to login
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: loc }} />
  }

  // Handle Logout (calls backend logout endpoints and clears local session)
  const handleLogout = async () => {
    try {
      console.log('[Veronova] Logging out session from server...')
      await apiRequest(API_ENDPOINTS.LOGOUT_PROXY, { method: 'POST' }).catch(() => null)
    } catch {
      // Ignore network errors on logout
    } finally {
      auth.clearAuth()
      navigate('/login', { replace: true })
    }
  }

  const isItemActive = (item) => {
    if (!item) return false
    if (item.to) {
      if (item.to === '/') return loc.pathname === '/'
      if (item.children) {
        return loc.pathname === item.to || loc.pathname.startsWith(item.to + '/')
      }
      return loc.pathname === item.to
    }
    if (item.children) {
      return item.children.some(isItemActive)
    }
    return false
  }

  const [openMenus, setOpenMenus] = useState(() => {
    const initial = { games: true, 'in-house-games': true, '3rd-party-games': true }
    sidebarMenus.forEach((m) => {
      if (m.children) {
        if (isItemActive(m)) {
          initial[m.key] = true
        }
        m.children.forEach((c) => {
          if (c.children && isItemActive(c)) {
            initial[c.key] = true
          }
        })
      }
    })
    return initial
  })

  // Close mobile drawer on route change or when resizing to desktop
  useEffect(() => {
    setMobileOpen(false)
  }, [loc.pathname])

  useEffect(() => {
    sidebarMenus.forEach((m) => {
      if (m.children && isItemActive(m)) {
        setOpenMenus((prev) => ({ ...prev, [m.key]: true }))
        m.children.forEach((c) => {
          if (c.children && isItemActive(c)) {
            setOpenMenus((prev) => ({ ...prev, [c.key]: true }))
          }
        })
      }
    })
  }, [loc.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => {
        const next = !prev
        try { localStorage.setItem('sidebar_collapsed', String(next)) } catch {}
        return next
      })
    }
  }

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false)
    } else {
      setCollapsed(true)
      try { localStorage.setItem('sidebar_collapsed', 'true') } catch {}
    }
  }

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#f4f7fb]">
      {/* Mobile backdrop overlay only for screens < 1024px */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating edge slider handle when sidebar is collapsed on desktop */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Sidebar Kholein"
          className="fixed left-0 top-20 z-30 hidden items-center justify-center rounded-r-xl border border-l-0 border-blue-200 bg-white/95 px-2.5 py-3 text-blue-600 shadow-md backdrop-blur transition-all hover:bg-blue-50 hover:px-3 lg:flex group"
        >
          <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* Sidebar: Fixed height, independent scroll, NEVER scrolls when page scrolls */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out lg:static lg:z-0 lg:shadow-none shrink-0 ${
          mobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed
            ? 'lg:w-0 lg:border-r-0 lg:overflow-hidden pointer-events-none'
            : 'lg:w-64 lg:border-r lg:border-blue-100 lg:pointer-events-auto'
        }`}
      >
        <div className="w-64 max-w-full flex flex-col h-full shrink-0">
          <div className="flex items-center justify-between border-b border-blue-50/80 px-5 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <Crown className="text-blue-600" size={32} fill="currentColor" />
              <div className="leading-tight">
                <div className="text-xl font-extrabold tracking-wide">VERONOVA</div>
                <div className="text-[10px] font-semibold tracking-[0.2em] text-blue-400">ADMIN PANEL</div>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              title="Sidebar Band Karein"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2">
            {sidebarMenus.map((n) =>
              n.children ? (
                <div key={n.key || n.label}>
                  <button
                    onClick={() => toggleMenu(n.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${
                      isItemActive(n) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    <n.icon size={18} />
                    <span className="flex-1 text-left">{n.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${openMenus[n.key] ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMenus[n.key] && (
                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-blue-100 pl-2">
                      {n.children.map((c) =>
                        c.children ? (
                          <div key={c.key || c.label}>
                            <button
                              onClick={() => toggleMenu(c.key)}
                              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition ${
                                isItemActive(c) ? 'bg-blue-100/70 text-blue-700 font-bold' : 'text-slate-600 hover:bg-blue-50'
                              }`}
                            >
                              <c.icon size={16} />
                              <span className="flex-1 text-left">{c.label}</span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${openMenus[c.key] ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {openMenus[c.key] && (
                              <div className="ml-2.5 mt-1 space-y-1 border-l-2 border-blue-200 pl-2">
                                {c.children.map((sub) => (
                                  <NavLink
                                    key={sub.to}
                                    to={sub.to}
                                    end
                                    onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
                                    className={linkCls}
                                  >
                                    <sub.icon size={15} />
                                    <span className="flex-1">{sub.label}</span>
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <NavLink
                            key={c.to}
                            to={c.to}
                            end
                            onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
                            className={linkCls}
                          >
                            <c.icon size={16} />
                            <span className="flex-1">{c.label}</span>
                          </NavLink>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
                  className={linkCls}
                >
                  <n.icon size={18} /> <span className="flex-1">{n.label}</span>
                  {n.chevron && <ChevronDown size={15} className="opacity-60" />}
                  {n.badge && <span className="rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{n.badge}</span>}
                </NavLink>
              )
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
            >
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Page Area: Independent scrollable container, sidebar never scrolls with page */}
      <div className="min-w-0 flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-20 flex items-center gap-2 sm:gap-3 border-b border-blue-50 bg-white/80 px-3 sm:px-4 md:px-6 py-3 backdrop-blur shrink-0">
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Sidebar Kholein (Expand)' : 'Sidebar Band Karein (Full Page)'}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border p-2 transition shrink-0 ${
              collapsed
                ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm hover:bg-blue-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            <span className="hidden text-xs font-semibold md:inline">
              {collapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>

          <div className="relative hidden w-64 md:block lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input !pl-9 !pr-14" placeholder="Search anything..." />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border bg-white px-1.5 text-[11px] text-slate-500">⌘ K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs sm:text-sm font-semibold lg:flex">
              <CalendarDays size={15} /> 09 Oct 2026 – 10 Oct 2026 <ChevronDown size={13} />
            </div>
            <button className="relative rounded-lg p-2 hover:bg-blue-50">
              <Bell size={19} />
              <span className="absolute right-0.5 top-0 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">3</span>
            </button>
            <button className="hidden rounded-lg p-2 hover:bg-blue-50 sm:block" onClick={() => document.documentElement.requestFullscreen?.()}>
              <Maximize size={18} />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 font-bold text-white text-sm uppercase">
                {(currentUser?.username || 'A')[0]}
              </div>
              <div className="hidden leading-tight md:block">
                <div className="text-sm font-bold truncate max-w-[120px]">{currentUser?.username || 'Admin'}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.role || 'Super Admin'}</div>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-slate-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 w-full max-w-full p-3.5 sm:p-5 md:p-6 overflow-x-hidden">
          <Suspense fallback={<VeronovaLoader variant="section" size="lg" text="Loading Page..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
