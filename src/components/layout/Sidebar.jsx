import { NavLink } from 'react-router-dom'
import { useStore } from '../../store'
import Logo from '../shared/Logo'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/projects', label: 'Proyectos', icon: '📁' },
  { to: '/tasks', label: 'Tareas', icon: '✅' },
  { to: '/timesheet', label: 'Timesheet', icon: '📅' },
  { to: '/stats', label: 'Estadísticas', icon: '📊' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
]

export default function Sidebar() {
  const settings = useStore((s) => s.settings)

  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90">
          <Logo className="h-11 w-11" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">TimeTracker</h1>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">Hola, {settings.userName}</p>
          </div>
        </NavLink>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
