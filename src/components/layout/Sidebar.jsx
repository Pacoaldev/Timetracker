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
    <aside className="flex w-full md:w-56 flex-row md:flex-col border-t md:border-t-0 md:border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 z-10 relative">
      <div className="hidden md:block border-b border-gray-200 px-4 py-5 dark:border-gray-700">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90">
          <Logo className="h-11 w-11" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">TimeTracker</h1>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">Hola, {settings.userName}</p>
          </div>
        </NavLink>
      </div>
      <nav className="flex flex-1 md:flex-col overflow-x-auto overflow-y-hidden md:overflow-visible space-x-1 md:space-x-0 md:space-y-1 p-2 md:p-3 scrollbar-hide">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-2 rounded-lg px-0.5 md:px-3 py-2 text-[10px] md:text-sm font-medium transition-colors min-w-0 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <span className="text-lg md:text-base">{item.icon}</span>
            <span className="truncate w-full text-center md:text-left">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
