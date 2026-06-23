import { useStore } from '../../store'
import { addDays, isSameDay, minutesToHours } from '../../utils/time'

export default function TimesheetWeek({ weekStart }) {
  const sessions = useStore((s) => s.sessions)
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dayLabels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }))

  const projectRows = projects
    .filter((p) => p.estado !== 'finalizado')
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.proyectoId === project.id)
      const taskIds = projectTasks.map((t) => t.id)
      const dayHours = days.map((day) => {
        const mins = sessions
          .filter(
            (s) =>
              taskIds.includes(s.tareaId) &&
              s.fin &&
              isSameDay(new Date(s.inicio), day)
          )
          .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
        return mins
      })
      const total = dayHours.reduce((a, b) => a + b, 0)
      return { project, dayHours, total }
    })
    .filter((row) => row.total > 0)

  const dayTotals = days.map((day) =>
    sessions
      .filter((s) => s.fin && isSameDay(new Date(s.inicio), day))
      .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
  )
  const weekTotal = dayTotals.reduce((a, b) => a + b, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-2 font-medium">Proyecto</th>
            {dayLabels.map((label) => (
              <th key={label} className="p-2 font-medium text-center min-w-[60px]">{label}</th>
            ))}
            <th className="p-2 font-medium text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {projectRows.map(({ project, dayHours, total }) => (
            <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="p-2 font-medium">{project.nombre}</td>
              {dayHours.map((mins, i) => (
                <td key={i} className="p-2 text-center text-gray-600 dark:text-gray-400">
                  {mins > 0 ? minutesToHours(mins) : '—'}
                </td>
              ))}
              <td className="p-2 text-center font-medium">{minutesToHours(total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold bg-gray-50 dark:bg-gray-800">
            <td className="p-2">Total día</td>
            {dayTotals.map((mins, i) => (
              <td key={i} className="p-2 text-center">{mins > 0 ? minutesToHours(mins) : '—'}</td>
            ))}
            <td className="p-2 text-center">{minutesToHours(weekTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
