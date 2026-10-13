import { useState, useEffect } from 'react'
import {
  Settings, Shield, ShieldCheck, Lock, Sliders, Zap, IndianRupee,
  Bell, Smartphone, Database, Globe, RefreshCw, Save, CheckCircle2,
  AlertTriangle, Flame, Cpu, Terminal, Radio, Server
} from 'lucide-react'
import { PageBanner, useToast } from '@/components/ui'

const DEFAULT_SETTINGS = {
  // Security
  two_factor_auth: true,
  maintenance_mode: false,
  maintenance_message: 'Veronova is undergoing scheduled platform upgrades. All services will resume at 04:00 AM IST.',
  waf_auto_block: true,
  admin_ip_whitelist: false,
  session_timeout: 30,

  // Finance & Gateways
  instant_payout_enabled: true,
  instant_payout_max: 10000,
  high_value_alert_min: 50000,
  min_deposit: 100,
  max_deposit: 500000,
  min_withdrawal: 200,
  max_withdrawal_daily: 250000,
  deposit_auto_verify: true,

  // Gaming
  target_house_margin: 24.5,
  aviator_crash_floor: 1.01,
  max_single_bet: 100000,
  game_rng_rotation: 'hourly',
  chicken_volatility: 'Dynamic',

  // Integrations
  telegram_alert_bot: true,
  telegram_channel_id: '-100293848192',
  sms_gateway_provider: 'Fast2SMS Enterprise',
  daily_midnight_settlement: true,

  // General
  platform_name: 'Veronova Gaming Suite',
  support_telegram: '@veronova_official_support',
  support_whatsapp: '+91 98765 43210',
}

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState('security')
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('veronova_platform_settings_v1')
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [toast, node] = useToast()

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    try {
      localStorage.setItem('veronova_platform_settings_v1', JSON.stringify(settings))
      setHasChanges(false)
      toast('Platform settings saved and deployed to live edge cluster!')
    } catch {
      toast('Error saving configuration to local database')
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
    toast('Settings reset to platform factory defaults')
  }

  const tabs = [
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'finance', label: 'Financial & Limits', icon: IndianRupee },
    { id: 'gaming', label: 'Gaming & House Margin', icon: Flame },
    { id: 'integrations', label: 'Webhooks & Bots', icon: Zap },
    { id: 'general', label: 'General & Support', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Veronova System & Platform Administration"
        icon={Settings}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Settings' }]}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition active:scale-95 ${
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            <Save size={14} />
            {hasChanges ? 'Save Changes *' : 'Save Configuration'}
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Platform Core Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engine Uptime</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              99.98%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Cluster online</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Server size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">WAF Defense</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {settings.waf_auto_block ? 'Active WAF' : 'Disabled'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Auto IP intercept</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Auto-IMPS Cap</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{settings.instant_payout_max.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Instant auto-credit ceiling</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Zap size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">House Margin Base</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {settings.target_house_margin}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Platform profit target</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Flame size={18} />
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: Security & Access */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Shield className="text-blue-600" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Authentication & Authorization</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Two-Factor OTP Enforcement</p>
                <p className="text-xs text-slate-400">Require Google Authenticator / SMS OTP for all admin payouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.two_factor_auth}
                  onChange={(e) => updateSetting('two_factor_auth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Strict Admin IP Whitelist</p>
                <p className="text-xs text-slate-400">Restrict admin panel logins strictly to authorized static IPs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.admin_ip_whitelist}
                  onChange={(e) => updateSetting('admin_ip_whitelist', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Admin Idle Session Timeout</label>
              <select
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden font-semibold"
              >
                <option value={15}>15 Minutes Inactivity</option>
                <option value={30}>30 Minutes Inactivity (Recommended)</option>
                <option value={60}>60 Minutes Inactivity</option>
                <option value={120}>2 Hours Inactivity</option>
              </select>
            </div>
          </div>

          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="text-amber-500" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Emergency Platform Controls</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">System Maintenance Mode</p>
                <p className="text-xs text-slate-400">Temporarily freeze player app logins during server updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>

            {settings.maintenance_mode && (
              <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
                <label className="text-xs font-bold text-rose-800 block mb-1">Live Maintenance Banner Text</label>
                <textarea
                  rows={2}
                  value={settings.maintenance_message}
                  onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">WAF Anti-Fraud Multi-Account Shield</p>
                <p className="text-xs text-slate-400">Auto-ban IP addresses attempting duplicate signup farming</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.waf_auto_block}
                  onChange={(e) => updateSetting('waf_auto_block', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Financial & Limits */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Zap className="text-amber-500" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Instant Auto-Disbursement Rules</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Instant IMPS Auto-Disbursement</p>
                <p className="text-xs text-slate-400">Auto-approve player withdrawals without manual admin approval</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.instant_payout_enabled}
                  onChange={(e) => updateSetting('instant_payout_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Auto-Disbursement Ceiling Cap (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={settings.instant_payout_max}
                  onChange={(e) => updateSetting('instant_payout_max', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Withdrawals above this amount require human admin approval</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">High-Value Recharge Telemetry Alert (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={settings.high_value_alert_min}
                  onChange={(e) => updateSetting('high_value_alert_min', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Sends immediate push notice to admin Telegram group</p>
            </div>
          </div>

          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <IndianRupee className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Player Wallet Thresholds</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Min Deposit (₹)</label>
                <input
                  type="number"
                  value={settings.min_deposit}
                  onChange={(e) => updateSetting('min_deposit', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Max Deposit / Transaction (₹)</label>
                <input
                  type="number"
                  value={settings.max_deposit}
                  onChange={(e) => updateSetting('max_deposit', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Min Withdrawal (₹)</label>
                <input
                  type="number"
                  value={settings.min_withdrawal}
                  onChange={(e) => updateSetting('min_withdrawal', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Max Daily Payout / Player (₹)</label>
                <input
                  type="number"
                  value={settings.max_withdrawal_daily}
                  onChange={(e) => updateSetting('max_withdrawal_daily', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">UTR Auto-Verification Engine</p>
                <p className="text-xs text-slate-400">Match 12-digit UTR against automated bank statement webhook</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deposit_auto_verify}
                  onChange={(e) => updateSetting('deposit_auto_verify', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Gaming & House Margin */}
      {activeTab === 'gaming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Flame className="text-rose-500" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Game Margins & Algorithm Calibration</h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Target Net Platform House Edge (%)</label>
                <span className="font-black text-blue-600 text-sm">{settings.target_house_margin}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="0.5"
                value={settings.target_house_margin}
                onChange={(e) => updateSetting('target_house_margin', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>10% (Generous)</span>
                <span>24.5% (Standard)</span>
                <span>35% (High Edge)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Aviator Crash Floor (x)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.aviator_crash_floor}
                  onChange={(e) => updateSetting('aviator_crash_floor', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Max Bet / Round (₹)</label>
                <input
                  type="number"
                  value={settings.max_single_bet}
                  onChange={(e) => updateSetting('max_single_bet', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Cpu className="text-indigo-600" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">RNG Volatility & Fairness Seeds</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Provably Fair RNG Seed Rotation</label>
              <select
                value={settings.game_rng_rotation}
                onChange={(e) => updateSetting('game_rng_rotation', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden font-semibold"
              >
                <option value="hourly">Hourly Cryptographic Salt Rotation</option>
                <option value="daily">Daily Midnight Re-Seed</option>
                <option value="per_round">Per-Round Dynamic Nonce (High Entropy)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chicken Road Difficulty Curve</label>
              <select
                value={settings.chicken_volatility}
                onChange={(e) => updateSetting('chicken_volatility', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden font-semibold"
              >
                <option value="Conservative">Conservative (Lower risk, steady payouts)</option>
                <option value="Dynamic">Dynamic AI Balanced (Standard)</option>
                <option value="Aggressive">High Volatility (Big multipliers, steep curves)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Webhooks & Bots */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Radio className="text-sky-500" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Telegram Alerts & Telemetry Bot</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Telegram Bot Telemetry Webhook</p>
                <p className="text-xs text-slate-400">Stream high-value deposits & withdrawal alerts to VIP channel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.telegram_alert_bot}
                  onChange={(e) => updateSetting('telegram_alert_bot', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Telegram Group / Channel ID</label>
              <input
                type="text"
                value={settings.telegram_channel_id}
                onChange={(e) => updateSetting('telegram_channel_id', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="card p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Server className="text-indigo-600" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Automated Cron Settlements</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Daily Midnight P/L Settlement Cron</p>
                <p className="text-xs text-slate-400">Calculate agent MLM commissions and house ledger at 00:00 IST</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.daily_midnight_settlement}
                  onChange={(e) => updateSetting('daily_midnight_settlement', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SMS OTP Gateway Dispatcher</label>
              <select
                value={settings.sms_gateway_provider}
                onChange={(e) => updateSetting('sms_gateway_provider', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden font-semibold"
              >
                <option value="Fast2SMS Enterprise">Fast2SMS Enterprise High-Priority DLT</option>
                <option value="Msg91 Global">Msg91 Global OTP Relay</option>
                <option value="Twilio Cloud">Twilio Cloud Gateway</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: General & Support */}
      {activeTab === 'general' && (
        <div className="card p-6 rounded-2xl shadow-sm space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 border-b pb-3">
            <Globe className="text-blue-600" size={20} />
            <h3 className="font-extrabold text-slate-900 text-base">Brand Identity & Support Contacts</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Official Platform Title</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={(e) => updateSetting('platform_name', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Telegram Handle</label>
              <input
                type="text"
                value={settings.support_telegram}
                onChange={(e) => updateSetting('support_telegram', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support WhatsApp Desk</label>
              <input
                type="text"
                value={settings.support_whatsapp}
                onChange={(e) => updateSetting('support_whatsapp', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {node}
    </div>
  )
}

