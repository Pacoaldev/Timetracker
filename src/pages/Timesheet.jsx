import { useState } from 'react'
import { useStore } from '../store'
import TimesheetDay from '../components/timesheet/TimesheetDay'
import TimesheetWeek from '../components/timesheet/TimesheetWeek'
import SessionForm from '../components/timer/SessionForm'
import Button from '../components/shared/Button'
import { startOfWeek, addDays, formatWeekLabel } from '../utils/time'

export default function Timesheet() {
  const updateManualSession = useStore((s) => s.updateManualSession)

  const [view, setView] = useState('week')
  const [weekStart, setWeekStart] = useState(startOfWeek())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [editingSession, setEditingSession] = useState(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Timesheet</h1>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setView('day')}
          >
            Día
          </button>
          <button
            className={`px-4 py-2 text-sm ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setView('week')}
          >
            Semana
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              ← Semana anterior
            </Button>
            <span className="text-sm font-medium">{formatWeekLabel(weekStart)}</span>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Semana siguiente →
            </Button>
          </div>
          <TimesheetWeek weekStart={weekStart} />
        </>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="date"
              value={selectedDay.toISOString().slice(0, 10)}
              onChange={(e) => setSelectedDay(new Date(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <TimesheetDay date={selectedDay} onEditSession={setEditingSession} />
        </>
      )}

      <SessionForm
        open={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        taskId={editingSession?.tareaId}
        onSave={(data, pin) => updateManualSession(editingSession.id, data, pin)}
      />
    </div>
  )
}
