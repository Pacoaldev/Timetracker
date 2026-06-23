import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { formatDate, formatHoursMinutes, formatHoursMinutesFromHours, getTaskWorkedMinutes } from '../../utils/time'
import { useStore } from '../../store'

export default function TaskCard({ task, onEdit, onDelete, showProject }) {
  const projects = useStore((s) => s.projects)
  const sessions = useStore((s) => s.sessions)
  const settings = useStore((s) => s.settings)
  const startTimer = useStore((s) => s.startTimer)
  const activeTimer = useStore((s) => s.activeTimer)

  const project = projects.find((p) => p.id === task.proyectoId)
  const workedMins = getTaskWorkedMinutes(task.id, sessions)
  const estimatedMins = (task.estimacionHoras || 0) * 60
  const alertPercent = settings.estimationAlertPercent || 80
  const usagePercent = estimatedMins > 0 ? Math.round((workedMins / estimatedMins) * 100) : 0
  const isOverEstimate = usagePercent >= 100
  const isNearLimit = usagePercent >= alertPercent && !isOverEstimate
  const isActive = activeTimer?.taskId === task.id

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800 ${
        isOverEstimate
          ? 'border-red-400 dark:border-red-600'
          : isNearLimit
            ? 'border-yellow-400 dark:border-yellow-600'
            : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium truncate">{task.titulo}</h3>
          {showProject && project && (
            <p className="text-xs text-gray-500">{project.nombre}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Badge label={task.estado} />
          <Badge label={task.prioridad} type="priority" />
        </div>
      </div>

      {task.descripcion && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{task.descripcion}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`font-medium font-mono ${isOverEstimate ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400'}`}>
          {formatHoursMinutes(workedMins)}h / {formatHoursMinutesFromHours(task.estimacionHoras)}h ({usagePercent}%)
        </span>
        {isOverEstimate && <span className="text-red-600 font-medium">⚠ Supera estimación</span>}
        {task.fechaLimite && <span className="text-gray-500">Límite: {formatDate(task.fechaLimite)}</span>}
      </div>

      {task.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {task.estado !== 'done' && (
          <Button size="sm" onClick={() => startTimer(task.id)} disabled={isActive && !activeTimer?.isPaused}>
            ▶ {isActive ? 'Activa' : 'Iniciar'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onEdit(task)}>Editar</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(task)}>Borrar</Button>
      </div>
    </div>
  )
}
