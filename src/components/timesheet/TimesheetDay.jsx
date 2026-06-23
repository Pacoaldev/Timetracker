import { useStore } from '../../store'
import { formatDateTime, minutesToHours, isSameDay } from '../../utils/time'
import Button from '../shared/Button'
import { useAuth } from '../../contexts/AuthContext'

export default function TimesheetDay({ date, onEditSession }) {
  const sessions = useStore((s) => s.sessions)
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const daySessions = sessions
    .filter((s) => s.fin && isSameDay(new Date(s.inicio), date))
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))

  const grouped = {}
  daySessions.forEach((sess) => {
    const task = tasks.find((t) => t.id === sess.tareaId)
    const project = projects.find((p) => p.id === task?.proyectoId)
    const key = project?.nombre || 'Sin proyecto'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push({ sess, task, project })
  })

  const totalMins = daySessions.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)

  if (daySessions.length === 0) {
    return <p className="text-gray-500 text-sm">No hay sesiones este día.</p>
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([projectName, items]) => (
        <div key={projectName}>
          <h3 className="font-semibold text-sm mb-2">{projectName}</h3>
          <div className="space-y-2">
            {items.map(({ sess, task }) => (
              <div
                key={sess.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-sm">{task?.titulo || 'Tarea eliminada'}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(sess.inicio)} – {formatDateTime(sess.fin)}
                    {sess.facturable ? ' · Facturable' : ' · No facturable'}
                  </p>
                  {sess.notas && <p className="text-xs text-gray-400 mt-1">{sess.notas}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{minutesToHours(sess.duracionMinutos)}h</span>
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => onEditSession(sess)}>Editar</Button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-right font-semibold text-sm">
        Total del día: {minutesToHours(totalMins)} horas
      </div>
    </div>
  )
}
