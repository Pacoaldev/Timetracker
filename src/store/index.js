import { create } from 'zustand'
import { toUTCISO, calcDurationMinutes } from '../utils/time'
import { saveToLocalStorage, loadSettings, saveSettings, STORAGE_VERSION, STORAGE_KEY } from '../utils/storage'
import {
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_SESSIONS,
  SEED_ACTIVITIES,
  DEFAULT_SETTINGS,
} from './seed'

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function recalcTaskHours(tasks, sessions, taskId) {
  const mins = sessions
    .filter((s) => s.tareaId === taskId && s.fin)
    .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
  return tasks.map((t) =>
    t.id === taskId ? { ...t, horasReales: Math.round((mins / 60) * 10) / 10 } : t
  )
}

function logActivity(activities, tipo, entidadId, mensaje) {
  return [
    { id: uid('act'), tipo, entidadId, mensaje, fecha: toUTCISO() },
    ...activities,
  ].slice(0, 200)
}

function buildPersistPayload(state) {
  return {
    version: STORAGE_VERSION,
    projects: state.projects,
    tasks: state.tasks,
    sessions: state.sessions,
    activities: state.activities,
    settings: state.settings,
    savedAt: toUTCISO(),
  }
}

function persist(state) {
  saveToLocalStorage(buildPersistPayload(state))
  saveSettings(state.settings)
}

export function persistCurrentState() {
  persist(useStore.getState())
}

function hydrate() {
  const legacySettings = loadSettings()
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null

  if (raw !== null) {
    try {
      const stored = JSON.parse(raw)
      const settings = {
        ...DEFAULT_SETTINGS,
        ...legacySettings,
        ...(stored.settings || {}),
      }
      return {
        projects: stored.projects ?? [],
        tasks: stored.tasks ?? [],
        sessions: stored.sessions ?? [],
        activities: stored.activities ?? [],
        settings,
        hydrated: true,
      }
    } catch (error) {
      console.error('[TimeTracker] Error al leer datos guardados:', error)
    }
  }

  const settings = { ...DEFAULT_SETTINGS, ...legacySettings }
  const empty = {
    projects: [],
    tasks: [],
    sessions: [],
    activities: [],
    settings,
    hydrated: true,
  }
  persist(empty)
  return empty
}

const initial = hydrate()

export const useStore = create((set, get) => ({
  projects: initial.projects,
  tasks: initial.tasks,
  sessions: initial.sessions,
  activities: initial.activities,
  settings: initial.settings,
  activeTimer: null,

  // Settings
  updateSettings: (partial) => {
    set((s) => {
      const settings = { ...s.settings, ...partial }
      const next = { ...s, settings }
      persist(next)
      if ('darkMode' in partial) {
        document.documentElement.classList.toggle('dark', settings.darkMode)
      }
      return next
    })
  },

  importData: (data) => {
    set((s) => {
      const next = {
        ...s,
        projects: data.projects || [],
        tasks: data.tasks || [],
        sessions: data.sessions || [],
        activities: data.activities || [],
        settings: { ...DEFAULT_SETTINGS, ...(data.settings || s.settings) },
      }
      persist(next)
      document.documentElement.classList.toggle('dark', next.settings.darkMode)
      return next
    })
  },

  clearAllData: () => {
    set((s) => {
      const next = {
        ...s,
        projects: [],
        tasks: [],
        sessions: [],
        activities: [],
        activeTimer: null,
      }
      persist(next)
      return next
    })
  },

  loadSeedData: () => {
    set((s) => {
      const next = {
        ...s,
        projects: [...SEED_PROJECTS],
        tasks: [...SEED_TASKS],
        sessions: [...SEED_SESSIONS],
        activities: [...SEED_ACTIVITIES],
        activeTimer: null,
      }
      persist(next)
      return next
    })
  },

  getExportData: () => {
    const s = get()
    return {
      projects: s.projects,
      tasks: s.tasks,
      sessions: s.sessions,
      activities: s.activities,
      settings: s.settings,
      exportedAt: toUTCISO(),
    }
  },

  // Projects CRUD
  addProject: (data) => {
    const project = { id: uid('proj'), ...data }
    set((s) => {
      const next = {
        ...s,
        projects: [...s.projects, project],
        activities: logActivity(s.activities, 'proyecto_creado', project.id, `Proyecto "${project.nombre}" creado`),
      }
      persist(next)
      return next
    })
    return project
  },

  updateProject: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }
      persist(next)
      return next
    })
  },

  deleteProject: (id) => {
    set((s) => {
      const taskIds = s.tasks.filter((t) => t.proyectoId === id).map((t) => t.id)
      const next = {
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
        tasks: s.tasks.filter((t) => t.proyectoId !== id),
        sessions: s.sessions.filter((sess) => !taskIds.includes(sess.tareaId)),
      }
      persist(next)
      return next
    })
  },

  // Tasks CRUD
  addTask: (data) => {
    const task = {
      id: uid('task'),
      horasReales: 0,
      tags: [],
      estado: 'todo',
      prioridad: 'media',
      ...data,
    }
    set((s) => {
      const next = {
        ...s,
        tasks: [...s.tasks, task],
        activities: logActivity(s.activities, 'tarea_creada', task.id, `Tarea "${task.titulo}" creada`),
      }
      persist(next)
      return next
    })
    return task
  },

  updateTask: (id, data) => {
    set((s) => {
      const prev = s.tasks.find((t) => t.id === id)
      let activities = s.activities
      if (data.estado === 'done' && prev?.estado !== 'done') {
        activities = logActivity(activities, 'tarea_completada', id, `Tarea "${prev.titulo}" completada`)
      }
      const next = {
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        activities,
      }
      persist(next)
      return next
    })
  },

  deleteTask: (id) => {
    set((s) => {
      const next = {
        ...s,
        tasks: s.tasks.filter((t) => t.id !== id),
        sessions: s.sessions.filter((sess) => sess.tareaId !== id),
        activeTimer: s.activeTimer?.taskId === id ? null : s.activeTimer,
      }
      persist(next)
      return next
    })
  },

  // Sessions
  addSession: (data) => {
    const session = {
      id: uid('sess'),
      pausasMinutos: 0,
      facturable: true,
      notas: '',
      ...data,
    }
    if (session.fin && session.inicio) {
      session.duracionMinutos = calcDurationMinutes(session.inicio, session.fin, session.pausasMinutos)
    }
    set((s) => {
      let tasks = recalcTaskHours(s.tasks, [...s.sessions, session], session.tareaId)
      const next = {
        ...s,
        sessions: [...s.sessions, session],
        tasks,
        activities: logActivity(s.activities, 'sesion_creada', session.id, 'Sesión manual registrada'),
      }
      persist(next)
      return next
    })
    return session
  },

  updateSession: (id, data) => {
    set((s) => {
      const sessions = s.sessions.map((sess) => {
        if (sess.id !== id) return sess
        const updated = { ...sess, ...data }
        if (updated.inicio && updated.fin) {
          updated.duracionMinutos = calcDurationMinutes(
            updated.inicio,
            updated.fin,
            updated.pausasMinutos || 0
          )
        }
        return updated
      })
      const session = sessions.find((sess) => sess.id === id)
      let tasks = s.tasks
      if (session) {
        tasks = recalcTaskHours(tasks, sessions, session.tareaId)
      }
      const next = { ...s, sessions, tasks }
      persist(next)
      return next
    })
  },

  deleteSession: (id) => {
    set((s) => {
      const session = s.sessions.find((sess) => sess.id === id)
      const sessions = s.sessions.filter((sess) => sess.id !== id)
      let tasks = s.tasks
      if (session) {
        tasks = recalcTaskHours(tasks, sessions, session.tareaId)
      }
      const next = {
        ...s,
        sessions,
        tasks,
        activeTimer: s.activeTimer?.sessionId === id ? null : s.activeTimer,
      }
      persist(next)
      return next
    })
  },

  setActiveTimer: (timer) => {
    set((s) => ({ ...s, activeTimer: timer }))
  },

  // Timer actions
  startTimer: (taskId) => {
    const state = get()
    if (state.activeTimer && state.activeTimer.taskId !== taskId) {
      get().pauseTimer()
    }

    const existing = state.sessions.find((s) => s.tareaId === taskId && !s.fin)
    let sessionId

    if (existing) {
      sessionId = existing.id
      if (state.activeTimer?.isPaused) {
        const pauseDuration = state.activeTimer.pauseStartedAt
          ? (Date.now() - new Date(state.activeTimer.pauseStartedAt).getTime()) / 60000
          : 0
        get().updateSession(sessionId, {
          pausasMinutos: (existing.pausasMinutos || 0) + Math.round(pauseDuration),
        })
      }
    } else {
      const session = {
        id: uid('sess'),
        tareaId: taskId,
        inicio: toUTCISO(),
        fin: null,
        duracionMinutos: 0,
        pausasMinutos: 0,
        notas: '',
        facturable: true,
      }
      set((s) => {
        const next = {
          ...s,
          sessions: [...s.sessions, session],
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, estado: t.estado === 'done' ? 'done' : 'doing' } : t
          ),
          activities: logActivity(s.activities, 'sesion_iniciada', session.id, 'Sesión de tiempo iniciada'),
        }
        persist(next)
        return next
      })
      sessionId = session.id
    }

    const timer = {
      sessionId,
      taskId,
      startedAt: toUTCISO(),
      isPaused: false,
      pauseStartedAt: null,
      tick: Date.now(),
    }
    set((s) => ({ ...s, activeTimer: timer }))
    return sessionId
  },

  pauseTimer: () => {
    const { activeTimer } = get()
    if (!activeTimer || activeTimer.isPaused) return

    set((s) => ({
      ...s,
      activeTimer: {
        ...activeTimer,
        isPaused: true,
        pauseStartedAt: toUTCISO(),
        tick: Date.now(),
      },
    }))
  },

  resumeTimer: (taskId) => {
    get().startTimer(taskId)
  },

  stopTimer: () => {
    const { activeTimer, sessions } = get()
    if (!activeTimer) return

    const session = sessions.find((s) => s.id === activeTimer.sessionId)
    if (!session) {
      set((s) => ({ ...s, activeTimer: null }))
      return
    }

    let pausasMinutos = session.pausasMinutos || 0
    if (activeTimer.isPaused && activeTimer.pauseStartedAt) {
      pausasMinutos += Math.round(
        (Date.now() - new Date(activeTimer.pauseStartedAt).getTime()) / 60000
      )
    }

    const fin = toUTCISO()
    const duracionMinutos = calcDurationMinutes(session.inicio, fin, pausasMinutos)

    set((s) => {
      const updatedSessions = s.sessions.map((sess) =>
        sess.id === session.id
          ? { ...sess, fin, pausasMinutos, duracionMinutos }
          : sess
      )
      const tasks = recalcTaskHours(s.tasks, updatedSessions, session.tareaId)
      const next = {
        ...s,
        sessions: updatedSessions,
        tasks,
        activeTimer: null,
        activities: logActivity(s.activities, 'sesion_finalizada', session.id, 'Sesión de tiempo finalizada'),
      }
      persist(next)
      return next
    })
  },

  autosaveActiveSession: () => {
    const { activeTimer, sessions } = get()
    if (!activeTimer || activeTimer.isPaused) return

    const session = sessions.find((s) => s.id === activeTimer.sessionId)
    if (!session || session.fin) return

    let pausasMinutos = session.pausasMinutos || 0
    const duracionMinutos = calcDurationMinutes(session.inicio, toUTCISO(), pausasMinutos)

    set((s) => {
      const updatedSessions = s.sessions.map((sess) =>
        sess.id === session.id ? { ...sess, duracionMinutos } : sess
      )
      const tasks = recalcTaskHours(s.tasks, updatedSessions, session.tareaId)
      const next = { ...s, sessions: updatedSessions, tasks }
      persist(next)
      return next
    })
  },

  restoreActiveTimer: () => {
    const { sessions } = get()
    const openSession = sessions.find((s) => !s.fin)
    if (!openSession) return

    set((s) => ({
      ...s,
      activeTimer: {
        sessionId: openSession.id,
        taskId: openSession.tareaId,
        startedAt: openSession.inicio,
        isPaused: true,
        pauseStartedAt: null,
        tick: Date.now(),
      },
    }))
  },
}))

let persistTimer
useStore.subscribe((state) => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => persist(state), 150)
})

// Init dark mode
if (initial.settings.darkMode) {
  document.documentElement.classList.add('dark')
}

// Expose store on window for dev console demo
if (typeof window !== 'undefined') {
  window.__timetrackerStore = useStore
}
