import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { ROLE_NAVIGATION } from '../../constants/navigation';
import { ROLE_LABELS } from '../../constants/roles';
import { initials } from '../../utils/formatters';
import {
  Menu,
  X,
  LogOut,
  Globe,
  Calendar,
  AlertCircle,
  CheckSquare,
  Home,
  FileText,
  Truck,
  Package,
  HeartPulse,
  Egg,
  BookOpen,
  Users,
  Stethoscope,
  Settings,
  UserCheck,
  Factory,
  Building2,
  Shield,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import logo from '../../assets/logos/logo.png';

export const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const { lang, setLang, t, supportedLanguages } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const iconMap = {
    Calendar,
    AlertCircle,
    CheckSquare,
    Home,
    FileText,
    Truck,
    Package,
    HeartPulse,
    Egg,
    BookOpen,
    Users,
    Stethoscope,
    Settings,
    UserCheck,
    Factory,
    Building2,
    Shield,
    AlertTriangle,
    Edit3
  };

  const navItems = ROLE_NAVIGATION[currentUser?.role] || [];
  const roleTitle = ROLE_LABELS[currentUser?.role] || 'RootsGoods Portal';

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-line flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Header */}
          <div className="p-4 border-b border-surface-line flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="RootsGoods" className="h-8 w-auto object-contain" />
              <div>
                <span className="text-xs font-bold text-ink block leading-tight">{roleTitle}</span>
                <span className="text-[10px] text-ink-3">Pilot Workspace</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-ink-3 hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon] || FileText;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 font-extrabold'
                        : 'text-ink-2 hover:bg-surface-bg hover:text-ink'
                    }`
                  }
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{t(item.label)}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-line space-y-3">
          {/* Language selector */}
          <div className="flex items-center gap-2 px-2.5 py-2 bg-surface-bg rounded-btn border border-surface-line text-xs font-semibold text-ink-2">
            <Globe className="w-4 h-4 text-brand-800 flex-shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {initials(currentUser?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-ink-3 truncate">{currentUser?.email}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-ink-3 hover:text-status-danger hover:bg-red-50 rounded-btn transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for Desktop/Tablet */}
        <header className="sticky top-0 z-30 bg-white border-b border-surface-line px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-ink-3 hover:text-ink hover:bg-surface-bg rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-ink">{roleTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-surface-bg px-2.5 py-1 rounded border border-surface-line text-ink-3">
              {currentUser?.email}
            </span>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
