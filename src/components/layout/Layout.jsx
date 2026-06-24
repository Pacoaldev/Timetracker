import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Timer from '../timer/Timer'
import { useStore } from '../../store'
import { useTimer } from '../../hooks/useTimer'

export default function Layout() {
  const restoreActiveTimer = useStore((s) => s.restoreActiveTimer)
  const activeTimer = useStore((s) => s.activeTimer)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const resumeTimer = useStore((s) => s.resumeTimer)
  const fetchData = useStore((s) => s.fetchData)
  const setupSubscriptions = useStore((s) => s.setupSubscriptions)

  useTimer()

  useEffect(() => {
    fetchData().then(() => {
      setupSubscriptions()
      restoreActiveTimer()
    })
  }, [fetchData, setupSubscriptions, restoreActiveTimer])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      if (document.querySelector('[data-modal]')) return
      if (e.code === 'Space' && activeTimer) {
        e.preventDefault()
        if (activeTimer.isPaused) {
          resumeTimer(activeTimer.taskId)
        } else {
          pauseTimer()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTimer, pauseTimer, resumeTimer])

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="md:hidden font-bold text-gray-900 dark:text-gray-100 mr-4 shrink-0">TimeTracker</div>
          <div className="flex-1 min-w-0 flex justify-end">
            <Timer compact />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
