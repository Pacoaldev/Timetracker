export function toUTCISO(date = new Date()) {
  return date.toISOString()
}

export function parseUTC(iso) {
  return iso ? new Date(iso) : null
}

export function formatDate(iso, options = {}) {
  const d = parseUTC(iso)
  if (!d) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatDateTime(iso) {
  const d = parseUTC(iso)
  if (!d) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatHHMMSS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
}

export function minutesToHours(minutes) {
  return (minutes / 60).toFixed(1)
}

export function calcDurationMinutes(inicio, fin, pausasMinutos = 0) {
  const start = parseUTC(inicio)
  const end = fin ? parseUTC(fin) : new Date()
  if (!start || !end) return 0
  const gross = Math.max(0, (end - start) / 60000 - pausasMinutos)
  return Math.round(gross)
}

export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isDateInRange(date, start, end) {
  const t = date.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

export function formatWeekLabel(weekStart) {
  const end = addDays(weekStart, 6)
  return `${formatDate(weekStart.toISOString())} – ${formatDate(end.toISOString())}`
}
