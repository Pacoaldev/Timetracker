import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { calcDurationMinutes } from '../utils/time'

export function useTimer() {
  const activeTimer = useStore((s) => s.activeTimer)
  const autosaveActiveSession = useStore((s) => s.autosaveActiveSession)
  const sessions = useStore((s) => s.sessions)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [activeTimer])

  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return
    const interval = setInterval(() => autosaveActiveSession(), 30000)
    return () => clearInterval(interval)
  }, [activeTimer, autosaveActiveSession])

  const session = activeTimer
    ? sessions.find((s) => s.id === activeTimer.sessionId)
    : null

  const elapsedSeconds = (() => {
    if (!activeTimer || !session) return 0
    const mins = calcDurationMinutes(
      session.inicio,
      activeTimer.isPaused ? activeTimer.pauseStartedAt : null,
      session.pausasMinutos || 0
    )
    return mins * 60
  })()

  return { activeTimer, session, elapsedSeconds }
}
