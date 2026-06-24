import { useStore } from '../../store'
import { useTimer } from '../../hooks/useTimer'
import { formatHHMMSS } from '../../utils/time'
import Button from '../shared/Button'

export default function Timer({ compact = false }) {
  const { activeTimer, elapsedSeconds } = useTimer()
  const tasks = useStore((s) => s.tasks)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const resumeTimer = useStore((s) => s.resumeTimer)
  const stopTimer = useStore((s) => s.stopTimer)

  const task = activeTimer ? tasks.find((t) => t.id === activeTimer.taskId) : null

  if (!activeTimer) {
    return compact ? (
      <span className="text-sm text-gray-500 dark:text-gray-400">Sin sesión activa</span>
    ) : null
  }

  return (
    <div className={`flex items-center gap-4 min-w-0 w-full max-w-full ${compact ? '' : 'rounded-xl bg-gray-100 dark:bg-gray-800 p-4'}`}>
      <div className="font-mono text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400 shrink-0">
        {formatHHMMSS(elapsedSeconds)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{task?.titulo || 'Sin tarea'}</p>
        <p className="truncate text-xs text-gray-500">{activeTimer.isPaused ? 'Pausado' : 'En curso'}</p>
      </div>
      <div className="flex gap-1 md:gap-2 shrink-0">
        {activeTimer.isPaused ? (
          <Button size="sm" onClick={() => resumeTimer(activeTimer.taskId)} className="px-2 md:px-4">
            <span className="hidden sm:inline">▶ Reanudar</span>
            <span className="sm:hidden">▶</span>
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pauseTimer} className="px-2 md:px-4">
            <span className="hidden sm:inline">⏸ Pausar</span>
            <span className="sm:hidden">⏸</span>
          </Button>
        )}
        <Button size="sm" variant="danger" onClick={stopTimer} className="px-2 md:px-4">
          <span className="hidden sm:inline">⏹ Parar</span>
          <span className="sm:hidden">⏹</span>
        </Button>
      </div>
    </div>
  )
}
