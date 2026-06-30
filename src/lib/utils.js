/** Merge Tailwind class names, filtering falsy values */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Format INR amounts — e.g. 25000 → "₹25,000" */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

/** Format ISO date string to readable — e.g. "2026-06-26T10:30:00Z" → "26 Jun 2026" */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format relative time — e.g. "2 hours ago" */
export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/** Get avatar color from name — deterministic pastel */
const AVATAR_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-green-100',  text: 'text-green-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700' },
  { bg: 'bg-rose-100',   text: 'text-rose-700' },
  { bg: 'bg-teal-100',   text: 'text-teal-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
]
export function getAvatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

/** Get user initials — "Arjun Singh" → "AS" */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}
