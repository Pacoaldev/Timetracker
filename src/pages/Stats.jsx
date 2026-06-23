import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useStore } from '../store'
import Select from '../components/shared/Select'
import Input from '../components/shared/Input'
import {
  startOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  isDateInRange,
  minutesToHours,
  formatDate,
} from '../utils/time'

function getPeriodRange(period, customStart, customEnd) {
  const now = new Date()
  if (period === 'week') {
    const start = startOfWeek(now)
    return { start, end: addDays(start, 6) }
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return { start, end }
  }
  return {
    start: customStart ? new Date(customStart) : startOfWeek(now),
    end: customEnd ? new Date(customEnd) : now,
  }
}

export default function Stats() {
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)

  const [period, setPeriod] = useState('week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { start, end } = getPeriodRange(period, customStart, customEnd)

  const periodSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.fin &&
          isDateInRange(new Date(s.inicio), startOfDay(start), endOfDay(end))
      ),
    [sessions, start, end]
  )

  const hoursByProject = useMemo(() => {
    return projects
      .map((project) => {
        const projectTasks = tasks.filter((t) => t.proyectoId === project.id)
        const taskIds = projectTasks.map((t) => t.id)
        const mins = periodSessions
          .filter((s) => taskIds.includes(s.tareaId))
          .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
        return { name: project.nombre, horas: Math.round((mins / 60) * 10) / 10 }
      })
      .filter((p) => p.horas > 0)
      .sort((a, b) => b.horas - a.horas)
  }, [projects, tasks, periodSessions])

  const hoursByDay = useMemo(() => {
    const days = []
    let d = startOfDay(start)
    const endD = startOfDay(end)
    while (d <= endD) {
      const mins = periodSessions
        .filter((s) => {
          const sd = new Date(s.inicio)
          return (
            sd.getFullYear() === d.getFullYear() &&
            sd.getMonth() === d.getMonth() &&
            sd.getDate() === d.getDate()
          )
        })
        .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
      days.push({
        fecha: formatDate(d.toISOString(), { month: 'short', day: 'numeric' }),
        horas: Math.round((mins / 60) * 10) / 10,
      })
      d = addDays(d, 1)
    }
    return days
  }, [periodSessions, start, end])

  const topTasks = useMemo(() => {
    const map = {}
    periodSessions.forEach((s) => {
      map[s.tareaId] = (map[s.tareaId] || 0) + (s.duracionMinutos || 0)
    })
    return Object.entries(map)
      .map(([taskId, mins]) => {
        const task = tasks.find((t) => t.id === taskId)
        const project = projects.find((p) => p.id === task?.proyectoId)
        return {
          titulo: task?.titulo || 'Eliminada',
          proyecto: project?.nombre || '—',
          horas: Math.round((mins / 60) * 10) / 10,
        }
      })
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 5)
  }, [periodSessions, tasks, projects])

  const projectComparison = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.proyectoId === project.id)
      const estimated = projectTasks.reduce((sum, t) => sum + (t.estimacionHoras || 0), 0)
      const real = projectTasks.reduce((sum, t) => sum + (t.horasReales || 0), 0)
      const deviation = estimated > 0 ? Math.round(((real - estimated) / estimated) * 100) : 0
      return { nombre: project.nombre, estimado: estimated, real, deviation }
    }).filter((p) => p.estimado > 0 || p.real > 0)
  }, [projects, tasks])

  const totalHours = periodSessions.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0) / 60
  const activeProjects = projects.filter((p) => p.estado === 'activo').length
  const completedTasks = tasks.filter((t) => t.estado === 'done').length

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Estadísticas</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <Select
          label="Periodo"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: 'week', label: 'Esta semana' },
            { value: 'month', label: 'Este mes' },
            { value: 'custom', label: 'Rango personalizado' },
          ]}
          className="w-48"
        />
        {period === 'custom' && (
          <>
            <Input label="Desde" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <Input label="Hasta" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total horas</p>
          <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Proyectos activos</p>
          <p className="text-2xl font-bold">{activeProjects}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Tareas completadas</p>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold">Horas por proyecto</h2>
          {hoursByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hoursByProject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="horas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">Sin datos en el periodo.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold">Horas por día</h2>
          {hoursByDay.some((d) => d.horas > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hoursByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="horas" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">Sin datos en el periodo.</p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold">Top 5 tareas</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-2">Tarea</th>
                <th className="text-left p-2">Proyecto</th>
                <th className="text-right p-2">Horas</th>
              </tr>
            </thead>
            <tbody>
              {topTasks.map((t, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2">{t.titulo}</td>
                  <td className="p-2 text-gray-500">{t.proyecto}</td>
                  <td className="p-2 text-right font-medium">{t.horas}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold">Estimado vs real</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-2">Proyecto</th>
                <th className="text-right p-2">Est.</th>
                <th className="text-right p-2">Real</th>
                <th className="text-right p-2">Desv.</th>
              </tr>
            </thead>
            <tbody>
              {projectComparison.map((p) => (
                <tr key={p.nombre} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2 text-right">{p.estimado}h</td>
                  <td className="p-2 text-right">{p.real}h</td>
                  <td className={`p-2 text-right font-medium ${p.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {p.deviation > 0 ? '+' : ''}{p.deviation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
