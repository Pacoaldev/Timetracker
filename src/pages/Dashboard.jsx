import { Link } from 'react-router-dom'
import { useStore } from '../store'
import Timer from '../components/timer/Timer'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { isSameDay, minutesToHours, formatDate } from '../utils/time'

export default function Dashboard() {
  const settings = useStore((s) => s.settings)
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)
  const startTimer = useStore((s) => s.startTimer)

  const today = new Date()
  const todaySessions = sessions.filter((s) => s.fin && isSameDay(new Date(s.inicio), today))
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
  const todayCompleted = tasks.filter(
    (t) => t.estado === 'done' && t.fechaLimite && isSameDay(new Date(t.fechaLimite), today)
  ).length

  const doingTasks = tasks.filter((t) => t.estado === 'doing')
  const upcomingDeadlines = tasks
    .filter((t) => t.estado !== 'done' && t.fechaLimite)
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
    .slice(0, 5)

  const projectSummary = projects
    .filter((p) => p.estado === 'activo')
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.proyectoId === project.id)
      const taskIds = projectTasks.map((t) => t.id)
      const mins = todaySessions
        .filter((s) => taskIds.includes(s.tareaId))
        .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
      return { project, mins }
    })
    .filter((p) => p.mins > 0)

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Hola, {settings.userName}</h1>
      <p className="mb-8 text-gray-500">Resumen de tu día</p>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Cronómetro</h2>
        <Timer />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Horas hoy</p>
          <p className="text-2xl font-bold text-blue-600">{minutesToHours(todayMinutes)}h</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Sesiones hoy</p>
          <p className="text-2xl font-bold">{todaySessions.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Tareas en progreso</p>
          <p className="text-2xl font-bold">{doingTasks.length}</p>
        </div>
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">En progreso</h2>
          {doingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No hay tareas en progreso.</p>
          ) : (
            <div className="space-y-2">
              {doingTasks.map((task) => {
                const project = projects.find((p) => p.id === task.proyectoId)
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-sm">{task.titulo}</p>
                      <p className="text-xs text-gray-500">{project?.nombre}</p>
                    </div>
                    <Button size="sm" onClick={() => startTimer(task.id)}>▶ Iniciar</Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Próximas fechas límite</h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500">Sin fechas límite próximas.</p>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((task) => {
                const project = projects.find((p) => p.id === task.proyectoId)
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-sm">{task.titulo}</p>
                      <p className="text-xs text-gray-500">{project?.nombre}</p>
                    </div>
                    <div className="text-right">
                      <Badge label={task.prioridad} type="priority" />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(task.fechaLimite)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {projectSummary.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Horas por proyecto hoy</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projectSummary.map(({ project, mins }) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="font-medium text-sm">{project.nombre}</p>
                <p className="text-lg font-bold text-blue-600">{minutesToHours(mins)}h</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
