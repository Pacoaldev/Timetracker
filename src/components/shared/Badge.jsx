const STATUS_COLORS = {
  activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pausado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  finalizado: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  todo: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  doing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

const PRIORITY_COLORS = {
  alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  baja: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

export default function Badge({ label, type = 'status', className = '' }) {
  const colors =
    type === 'priority' ? PRIORITY_COLORS[label] || PRIORITY_COLORS.media : STATUS_COLORS[label] || STATUS_COLORS.todo
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors} ${className}`}>
      {label}
    </span>
  )
}
