export const STORAGE_KEY = 'timetracker-data'
export const SETTINGS_KEY = 'timetracker-settings'
export const ACTIVE_TIMER_KEY = 'timetracker-active-timer'
export const STORAGE_VERSION = 1

export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('[TimeTracker] No se pudieron guardar los datos:', error)
    return false
  }
}

export function hasStoredData() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('[TimeTracker] Datos locales corruptos:', error)
    return null
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('[TimeTracker] No se pudieron guardar los ajustes:', error)
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveActiveTimer(timer) {
  try {
    if (timer) {
      localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(timer))
    } else {
      localStorage.removeItem(ACTIVE_TIMER_KEY)
    }
  } catch (error) {
    console.error('[TimeTracker] No se pudo guardar el cronómetro activo:', error)
  }
}

export function loadActiveTimer() {
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `timetracker-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
