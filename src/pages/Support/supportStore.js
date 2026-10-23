export const SEED_SUPPORT_SETTINGS = [
  {
    id: 1,
    title: 'WhatsApp VIP Support',
    channel: 'whatsapp',
    value: '+91 98765 43210',
    link: 'https://wa.me/919876543210',
    working_hours: '24/7 Instant Response',
    status: 'Active',
    description: 'Direct priority resolution for deposit, withdrawal & gameplay queries.',
    updated_at: '15 Oct 2026',
  },
  {
    id: 2,
    title: 'Official Telegram Channel',
    channel: 'telegram',
    value: '@VeronovaOfficialDesk',
    link: 'https://t.me/VeronovaOfficialDesk',
    working_hours: '24 Hours Open',
    status: 'Active',
    description: 'Broadcast bonuses, daily redeem codes, and agent support.',
    updated_at: '15 Oct 2026',
  },
  {
    id: 3,
    title: '24/7 Live Chat Widget',
    channel: 'livechat',
    value: 'https://chat.veronova.com/widget',
    link: 'https://chat.veronova.com/widget',
    working_hours: 'Real-time Bot + Human Lead',
    status: 'Active',
    description: 'Embedded in-app floating support widget for all active players.',
    updated_at: '14 Oct 2026',
  },
  {
    id: 4,
    title: 'Official Escalation Email',
    channel: 'email',
    value: 'support@veronova.com',
    link: 'mailto:support@veronova.com',
    working_hours: 'Reply within 2 Hours',
    status: 'Active',
    description: 'Account recovery, KYC appeals, and high-value dispute tickets.',
    updated_at: '12 Oct 2026',
  },
  {
    id: 5,
    title: 'Player Helpline Phone',
    channel: 'phone',
    value: '1800-202-9900',
    link: 'tel:18002029900',
    working_hours: '08:00 AM - 11:00 PM',
    status: 'Inactive',
    description: 'Toll-free telephonic voice helpline for tier 1 issues.',
    updated_at: '10 Oct 2026',
  },
]

const STORAGE_KEY = 'veronova_support_settings_v1'

export function deduplicateSettings(list) {
  if (!Array.isArray(list)) return []
  const seenIds = new Set()
  const result = []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const idKey = item.id !== undefined && item.id !== null ? String(item.id) : null
    if (idKey && seenIds.has(idKey)) continue
    if (idKey) seenIds.add(idKey)
    result.push(item)
  }

  return result
}

export function normalizeStatus(raw) {
  if (raw === undefined || raw === null) return 'Active'
  const s = String(raw).trim().toLowerCase()
  if (s === '1' || s === 'active' || s === 'true' || s === 'enabled' || s === 'on') {
    return 'Active'
  }
  return 'Inactive'
}

export function normalizeSupportSetting(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw['#'] ?? index + 1
  const title = raw.title || raw.name || raw.channel_name || raw.label || `Support Channel #${id}`
  const channel = (raw.channel || raw.type || raw.category || 'helpdesk').toLowerCase()
  const value = raw.value || raw.url || raw.link || raw.contact || raw.phone || raw.email || 'N/A'
  const link = raw.link || raw.url || (channel === 'email' ? `mailto:${value}` : channel === 'whatsapp' ? `https://wa.me/${String(value).replace(/\D/g, '')}` : value)
  const working_hours = raw.working_hours || raw.hours || raw.timing || '24/7'
  const status = normalizeStatus(raw.status ?? raw.is_active ?? raw.active ?? 1)
  const description = raw.description || raw.desc || raw.notes || 'Configured customer assistance channel'
  const updated_at = raw.updated_at || raw.updatedAt || raw.date || raw.created_at || new Date().toLocaleDateString()

  return {
    id,
    title: String(title),
    channel: String(channel),
    value: String(value),
    link: String(link),
    working_hours: String(working_hours),
    status,
    description: String(description),
    updated_at: String(updated_at),
    raw,
  }
}

export function getSupportSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_SUPPORT_SETTINGS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return deduplicateSettings(parsed.map((item, idx) => normalizeSupportSetting(item, idx)))
    }
    return SEED_SUPPORT_SETTINGS
  } catch {
    return SEED_SUPPORT_SETTINGS
  }
}

export function saveSupportSettings(list) {
  try {
    const clean = deduplicateSettings(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  } catch {}
}

