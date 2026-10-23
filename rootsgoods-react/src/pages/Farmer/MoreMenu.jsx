import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
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
  ChevronRight,
  LogOut
} from 'lucide-react';

export const MoreMenu = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isLayer = currentUser?.role === 'LAYER';

  const menuItems = [
    { title: 'Sheds & birds', desc: 'Flock capacity, age, breeds', icon: Home, path: '/farmer/sheds' },
    { title: 'Daily records', desc: 'Mortality, eggs, feed log history', icon: FileText, path: '/farmer/daily' },
    ...(isLayer
      ? [{ title: 'Feed deliveries', desc: 'Brand, batch, protein & calcium', icon: Package, path: '/farmer/deliveries' }]
      : [{ title: 'Maize at the gate', desc: 'Truck arrivals, moisture & weight', icon: Truck, path: '/farmer/loads' }]),
    { title: 'Health', desc: 'Vaccine due dates & withdrawal days', icon: HeartPulse, path: '/farmer/health' },
    { title: 'Eggs & sales', desc: 'Peti tracking, revenue, unpaid balances', icon: Egg, path: '/farmer/sales' },
    { title: 'Ledger', desc: 'Financial debits, credits, statement', icon: BookOpen, path: '/farmer/ledger' },
    { title: 'Workers & logins', desc: 'Manage farm phone worker PINs', icon: Users, path: '/farmer/workers' },
    { title: 'My vet', desc: 'Direct consultation & clinical history', icon: Stethoscope, path: '/farmer/vet' },
    { title: 'Farm settings', desc: 'Profile, location, language', icon: Settings, path: '/farmer/settings' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('More Modules')}</h2>
        <p className="text-xs text-ink-3">
          {t('Complete operations & management directory')}
        </p>
      </div>

      <Card className="divide-y divide-surface-line">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-bg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-ink leading-tight">{t(item.title)}</h4>
                  <p className="text-[11px] text-ink-3 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-4 flex-shrink-0" />
            </div>
          );
        })}
      </Card>

      <div className="pt-2">
        <button
          onClick={() => {
            if (window.confirm('Sign out of your farm account?')) {
              logout();
              navigate('/login');
            }
          }}
          className="w-full py-3 bg-red-50 text-status-danger hover:bg-red-100 rounded-btn text-xs font-bold flex items-center justify-center gap-2 border border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('Sign Out of Farm')}</span>
        </button>
      </div>
    </div>
  );
};
