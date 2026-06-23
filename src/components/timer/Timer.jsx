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
    <div className={`flex items-center gap-4 ${compact ? '' : 'rounded-xl bg-gray-100 dark:bg-gray-800 p-4'}`}>
      <div className="font-mono text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
        {formatHHMMSS(elapsedSeconds)}
      </div>
      {task && (
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{task.titulo}</p>
          <p className="text-xs text-gray-500">{activeTimer.isPaused ? 'Pausado' : 'En curso'}</p>
        </div>
      )}
      <div className="flex gap-2">
        {activeTimer.isPaused ? (
          <Button size="sm" onClick={() => resumeTimer(activeTimer.taskId)}>
            ▶ Reanudar
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pauseTimer}>
            ⏸ Pausar
          </Button>
        )}
        <Button size="sm" variant="danger" onClick={stopTimer}>
          ⏹ Parar
        </Button>
      </div>
    </div>
  )
}
