import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { WORKER_MOBILE_TABS } from '../../constants/navigation';
import { CheckSquare, Edit3, AlertTriangle, Lock, Home, ChevronDown } from 'lucide-react';

export const WorkerShell = () => {
  const { currentUser, activeShed, setActiveShed, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shedDropdownOpen, setShedDropdownOpen] = useState(false);

  const icons = {
    wtasks: CheckSquare,
    wdaily: Edit3,
    wreport: AlertTriangle,
  };

  const availableSheds = currentUser?.sheds || [];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between max-w-lg mx-auto sm:border-x sm:border-surface-line shadow-sm relative">
      {/* Worker Phone Top Bar */}
      <header className="sticky top-0 z-30 bg-ink text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          {/* Shed Switcher Chip */}
          <div className="relative">
            <button
              onClick={() => setShedDropdownOpen(!shedDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-btn text-xs font-bold transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-brand-500" />
              <span>{activeShed ? activeShed.name : 'Select Shed'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {shedDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white text-ink border border-surface-line rounded-card shadow-modal p-1.5 z-40">
                <span className="block px-2 py-1 text-[10px] font-bold text-ink-3 uppercase">
                  Assigned Sheds
                </span>
                {availableSheds.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveShed(s);
                      setShedDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-2 rounded text-xs font-semibold flex items-center justify-between ${
                      activeShed?.id === s.id ? 'bg-brand-50 text-brand-800 font-bold' : 'hover:bg-surface-bg'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-ink-3">{s.birds} birds</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs font-bold text-ink-5 pl-1">
            Worker: <span className="text-white">{currentUser?.name}</span>
          </div>
        </div>

        {/* Lock Phone / Next Worker button */}
        <button
          onClick={() => {
            logout();
            navigate('/pin-login');
          }}
          className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-2.5 py-1.5 rounded-btn text-xs font-bold transition-colors active:scale-95"
          title="Lock phone for next worker"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Worker Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-surface-line shadow-bar max-w-lg mx-auto">
        <div className="grid grid-cols-3 h-16">
          {WORKER_MOBILE_TABS.map((tab) => {
            const Icon = icons[tab.id] || CheckSquare;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors select-none ${
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
