import { Link } from 'react-router-dom'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { formatDate, minutesToHours } from '../../utils/time'

export default function ProjectCard({ project, tasks, sessions, onEdit, onDelete, onExportCSV, onExportPDF }) {
  const projectTasks = tasks.filter((t) => t.proyectoId === project.id)
  const taskIds = projectTasks.map((t) => t.id)
  const totalMins = sessions
    .filter((s) => taskIds.includes(s.tareaId) && s.fin)
    .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
  const estimatedHours = projectTasks.reduce((sum, t) => sum + (t.estimacionHoras || 0), 0)
  const progress = estimatedHours > 0 ? Math.min(100, Math.round((totalMins / 60 / estimatedHours) * 100)) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link to={`/projects/${project.id}`} className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400">
            {project.nombre}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.cliente || 'Sin cliente'}</p>
        </div>
        <div className="flex gap-1">
          <Badge label={project.estado} />
          <Badge label={project.prioridad} type="priority" />
        </div>
      </div>

      {project.descripcion && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{project.descripcion}</p>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{minutesToHours(totalMins)}h / {estimatedHours}h estimadas</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{projectTasks.length} tareas</span>
        {project.fechaEntrega && <span>Entrega: {formatDate(project.fechaEntrega)}</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/projects/${project.id}`}>
          <Button size="sm">Ver tareas ({projectTasks.length})</Button>
        </Link>
        <Link to={`/projects/${project.id}?new=1`}>
          <Button size="sm" variant="secondary">+ Tarea</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={() => onEdit(project)}>Editar</Button>
        <Button size="sm" variant="ghost" onClick={() => onExportCSV(project)}>CSV</Button>
        <Button size="sm" variant="ghost" onClick={() => onExportPDF(project)}>PDF</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(project)}>Borrar</Button>
      </div>
    </div>
  )
}
