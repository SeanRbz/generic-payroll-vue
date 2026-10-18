const LOCALE = 'en-PH'

const pesoFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'PHP' })
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' })

export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount)
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/** Wall-clock time of an epoch-millisecond timestamp, e.g. "3:42 pm". */
export function formatTime(epochMs: number): string {
  return timeFormatter.format(epochMs)
}

/** Up to two initials from a display name, e.g. "Maria Clara Aquino" → "MA". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase() || '?'
}
