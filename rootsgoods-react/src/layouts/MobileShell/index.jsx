import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { FARMER_MOBILE_TABS } from '../../constants/navigation';
import { initials } from '../../utils/formatters';
import { Calendar, AlertCircle, CheckSquare, Menu, Globe, LogOut } from 'lucide-react';
import logo from '../../assets/logos/logo.png';

export const MobileShell = () => {
  const { currentUser, logout } = useAuth();
  const { lang, setLang, t, supportedLanguages } = useTranslation();
  const navigate = useNavigate();

  const icons = {
    today: Calendar,
    reports: AlertCircle,
    tasks: CheckSquare,
    more: Menu,
  };

  const farmCode = currentUser?.farm?.code || 'farmer01';
  const farmName = currentUser?.farm?.name || 'RootsGoods Farm';

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between max-w-lg mx-auto sm:border-x sm:border-surface-line shadow-sm relative">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-surface-line px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="RootsGoods" className="h-7 w-auto object-contain flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-ink truncate leading-tight">{farmName}</h1>
            <span className="text-[10px] font-mono text-ink-3">ID: {farmCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language dropdown */}
          <div className="flex items-center gap-1 bg-surface-bg border border-surface-line px-2 py-1 rounded-btn text-xs text-ink-2 font-medium">
            <Globe className="w-3.5 h-3.5 text-brand-800" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* User profile / Logout */}
          <button
            onClick={() => {
              if (window.confirm('Sign out of your farm account?')) {
                logout();
                navigate('/login');
              }
            }}
            title="Sign out"
            className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold flex items-center justify-center hover:bg-brand-100 transition-colors"
          >
            {initials(currentUser?.name)}
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-surface-line shadow-bar max-w-lg mx-auto">
        <div className="grid grid-cols-4 h-16">
          {FARMER_MOBILE_TABS.map((tab) => {
            const Icon = icons[tab.id] || Menu;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors select-none ${
                    isActive ? 'text-brand-800' : 'text-ink-3 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-full ${isActive ? 'bg-brand-50 text-brand-800' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{t(tab.label)}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
