import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { toUTCISO, calcDurationMinutes } from '../utils/time'
import { DEFAULT_SETTINGS } from './seed'

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function recalcTaskHours(tasks, sessions, taskId) {
  const mins = sessions
    .filter((s) => s.tareaId === taskId && s.fin)
    .reduce((sum, s) => sum + (Number(s.duracionMinutos) || 0), 0)
  return tasks.map((t) =>
    t.id === taskId ? { ...t, horasReales: Math.round((mins / 60) * 10) / 10 } : t
  )
}

async function logActivity(tipo, entidadId, mensaje) {
  const activity = { id: uid('act'), tipo, entidadId, mensaje, fecha: toUTCISO() }
  await supabase.from('activities').insert(activity)
  return activity
}

export const useStore = create((set, get) => ({
  projects: [],
  tasks: [],
  sessions: [],
  activities: [],
  settings: JSON.parse(localStorage.getItem('timetracker_settings')) || DEFAULT_SETTINGS,
  activeTimer: null,
  hydrated: false,

  fetchData: async () => {
    const [pRes, tRes, sRes, aRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(200),
    ])

    set({
      projects: pRes.data || [],
      tasks: tRes.data || [],
      sessions: sRes.data || [],
      activities: aRes.data || [],
      hydrated: true
    })
  },

  setupSubscriptions: () => {
    supabase.channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') set((s) => ({ projects: [payload.new, ...s.projects] }))
        if (payload.eventType === 'UPDATE') set((s) => ({ projects: s.projects.map(p => p.id === payload.new.id ? payload.new : p) }))
        if (payload.eventType === 'DELETE') set((s) => ({ projects: s.projects.filter(p => p.id !== payload.old.id) }))
      })
      .subscribe()

    supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') set((s) => ({ tasks: [payload.new, ...s.tasks] }))
        if (payload.eventType === 'UPDATE') set((s) => ({ tasks: s.tasks.map(t => t.id === payload.new.id ? payload.new : t) }))
        if (payload.eventType === 'DELETE') set((s) => ({ tasks: s.tasks.filter(t => t.id !== payload.old.id) }))
      })
      .subscribe()

    supabase.channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
        if (payload.eventType === 'INSERT') set((s) => {
          const sessions = [payload.new, ...s.sessions]
          return { sessions, tasks: recalcTaskHours(s.tasks, sessions, payload.new.tareaId) }
        })
        if (payload.eventType === 'UPDATE') set((s) => {
          const sessions = s.sessions.map(sess => sess.id === payload.new.id ? payload.new : sess)
          return { sessions, tasks: recalcTaskHours(s.tasks, sessions, payload.new.tareaId) }
        })
        if (payload.eventType === 'DELETE') set((s) => {
          const session = s.sessions.find(x => x.id === payload.old.id)
          const sessions = s.sessions.filter(sess => sess.id !== payload.old.id)
          const tasks = session ? recalcTaskHours(s.tasks, sessions, session.tareaId) : s.tasks
          return { sessions, tasks }
        })
      })
      .subscribe()

    supabase.channel('public:activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, (payload) => {
        if (payload.eventType === 'INSERT') set((s) => ({ activities: [payload.new, ...s.activities].slice(0, 200) }))
      })
      .subscribe()
  },

  updateSettings: (partial) => {
    set((s) => {
      const settings = { ...s.settings, ...partial }
      if ('darkMode' in partial) document.documentElement.classList.toggle('dark', settings.darkMode)
      localStorage.setItem('timetracker_settings', JSON.stringify(settings))
      return { settings }
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
    }
  },

  importData: async (data) => {
    try {
      const { projects, tasks, sessions, activities, settings } = data

      if (settings) {
        localStorage.setItem('timetracker_settings', JSON.stringify(settings))
        if ('darkMode' in settings) document.documentElement.classList.toggle('dark', settings.darkMode)
        set({ settings })
      }

      if (projects?.length) {
        const { error } = await supabase.from('projects').upsert(projects)
        if (error) throw error
      }
      if (tasks?.length) {
        const { error } = await supabase.from('tasks').upsert(tasks)
        if (error) throw error
      }
      if (sessions?.length) {
        const { error } = await supabase.from('sessions').upsert(sessions)
        if (error) throw error
      }
      if (activities?.length) {
        const { error } = await supabase.from('activities').upsert(activities)
        if (error) throw error
      }

      await get().fetchData()
      alert('Datos importados correctamente.')
    } catch (e) {
      console.error(e)
      alert(`Error importando datos: ${e.message || 'Desconocido'}`)
    }
  },

  clearAllData: async () => {
    try {
      // Por cascade, si borramos projects, se borra casi todo. Pero activities va aparte.
      await supabase.from('projects').delete().neq('id', '0')
      await supabase.from('activities').delete().neq('id', '0')
      alert('Datos borrados')
    } catch (e) {
      alert('Error borrando datos')
    }
  },

  loadSeedData: async () => {
    alert('Función no disponible en versión Cloud (Supabase). Usa el import normal.')
  },

  addProject: async (data) => {
    const project = { id: uid('proj'), ...data }
    const { error } = await supabase.from('projects').insert(project)
    if (error) { alert('Error: No tienes permisos para crear proyectos.'); return }
    await logActivity('proyecto_creado', project.id, `Proyecto "${project.nombre}" creado`)
    return project
  },

  updateProject: async (id, data) => {
    const { error } = await supabase.from('projects').update(data).eq('id', id)
    if (error) alert('Error: Solo admins pueden actualizar proyectos.')
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) alert('Error: Solo admins pueden borrar proyectos.')
  },

  addTask: async (data) => {
    const task = { id: uid('task'), horasReales: 0, tags: [], estado: 'todo', prioridad: 'media', ...data }
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      proyectoId: task.proyectoId,
      titulo: task.titulo,
      descripcion: task.descripcion,
      estado: task.estado,
      prioridad: task.prioridad,
      estimacionHoras: task.estimacionHoras || 0,
      horasReales: task.horasReales,
      tags: task.tags,
      fechaLimite: task.fechaLimite
    })
    if (error) { alert('Error creando tarea'); return }
    await logActivity('tarea_creada', task.id, `Tarea "${task.titulo}" creada`)
    return task
  },

  updateTask: async (id, data) => {
    const { error } = await supabase.from('tasks').update(data).eq('id', id)
    if (error) alert('Error actualizando tarea')
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) alert('Error borrando tarea')
  },

  addSession: async (data) => {
    const session = { id: uid('sess'), pausasMinutos: 0, facturable: true, notas: '', ...data }
    if (session.fin && session.inicio) {
      session.duracionMinutos = calcDurationMinutes(session.inicio, session.fin, session.pausasMinutos)
    }
    const { error } = await supabase.from('sessions').insert({
      id: session.id,
      tareaId: session.tareaId,
      inicio: session.inicio,
      fin: session.fin,
      duracionMinutos: session.duracionMinutos || 0,
      pausasMinutos: session.pausasMinutos,
      notas: session.notas,
      facturable: session.facturable
    })
    if (error) { alert('Error creando sesión'); return }
    await logActivity('sesion_creada', session.id, 'Sesión manual registrada')
    return session
  },

  updateSession: async (id, data) => {
    const prevSession = get().sessions.find(s => s.id === id)
    let update = { ...data }
    if ((update.inicio || prevSession?.inicio) && (update.fin || prevSession?.fin)) {
      update.duracionMinutos = calcDurationMinutes(
        update.inicio || prevSession.inicio,
        update.fin || prevSession.fin,
        update.pausasMinutos ?? prevSession.pausasMinutos ?? 0
      )
    }
    const { error } = await supabase.from('sessions').update(update).eq('id', id)
    if (error) alert('Error actualizando sesión')
  },

  deleteSession: async (id) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) alert('Error borrando sesión')
  },

  setActiveTimer: (timer) => set({ activeTimer: timer }),

  startTimer: async (taskId) => {
    const state = get()
    if (state.activeTimer && state.activeTimer.taskId !== taskId) {
      await get().pauseTimer()
    }
    const existing = state.sessions.find((s) => s.tareaId === taskId && !s.fin)
    let sessionId
    if (existing) {
      sessionId = existing.id
      if (state.activeTimer?.isPaused) {
        const pauseDuration = state.activeTimer.pauseStartedAt
          ? (Date.now() - new Date(state.activeTimer.pauseStartedAt).getTime()) / 60000
          : 0
        await get().updateSession(sessionId, { pausasMinutos: (existing.pausasMinutos || 0) + Math.round(pauseDuration) })
      }
    } else {
      const session = { id: uid('sess'), tareaId: taskId, inicio: toUTCISO(), fin: null, duracionMinutos: 0, pausasMinutos: 0, notas: '', facturable: true }
      await supabase.from('sessions').insert({
        id: session.id, tareaId: session.tareaId, inicio: session.inicio, fin: session.fin,
        duracionMinutos: session.duracionMinutos, pausasMinutos: session.pausasMinutos,
        notas: session.notas, facturable: session.facturable
      })
      await supabase.from('tasks').update({ estado: 'doing' }).eq('id', taskId)
      await logActivity('sesion_iniciada', session.id, 'Sesión iniciada')
      sessionId = session.id
    }

    set({ activeTimer: { sessionId, taskId, startedAt: toUTCISO(), isPaused: false, pauseStartedAt: null, tick: Date.now() } })
    return sessionId
  },

  pauseTimer: async () => {
    const { activeTimer } = get()
    if (!activeTimer || activeTimer.isPaused) return
    set({ activeTimer: { ...activeTimer, isPaused: true, pauseStartedAt: toUTCISO(), tick: Date.now() } })
  },

  resumeTimer: async (taskId) => {
    await get().startTimer(taskId)
  },

  stopTimer: async () => {
    const { activeTimer, sessions } = get()
    if (!activeTimer) return
    const session = sessions.find((s) => s.id === activeTimer.sessionId)
    if (!session) { set({ activeTimer: null }); return }

    let pausasMinutos = session.pausasMinutos || 0
    if (activeTimer.isPaused && activeTimer.pauseStartedAt) {
      pausasMinutos += Math.round((Date.now() - new Date(activeTimer.pauseStartedAt).getTime()) / 60000)
    }
    const fin = toUTCISO()
    const duracionMinutos = calcDurationMinutes(session.inicio, fin, pausasMinutos)

    await supabase.from('sessions').update({ fin, pausasMinutos, duracionMinutos }).eq('id', session.id)
    set({ activeTimer: null })
    await logActivity('sesion_finalizada', session.id, 'Sesión de tiempo finalizada')
  },

  restoreActiveTimer: () => {
    const { sessions } = get()
    const openSession = sessions.find((s) => !s.fin)
    if (!openSession) return
    set({
      activeTimer: { sessionId: openSession.id, taskId: openSession.tareaId, startedAt: openSession.inicio, isPaused: true, pauseStartedAt: null, tick: Date.now() }
    })
  },
}))

if (typeof window !== 'undefined') {
  window.__timetrackerStore = useStore
}
