import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useState } from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { useStore } from '../../store'
import { formatHoursMinutes, formatHoursMinutesFromHours, getTaskWorkedMinutes } from '../../utils/time'

const COLUMNS = [
  { id: 'todo', label: 'Todo' },
  { id: 'doing', label: 'Doing' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'done', label: 'Done' },
]

function KanbanCard({ task, sessions, onStart }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const workedMins = getTaskWorkedMinutes(task.id, sessions)
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700 ${isDragging ? 'opacity-50' : ''}`}
    >
      <p className="text-sm font-medium">{task.titulo}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge label={task.prioridad} type="priority" />
        <span className="text-xs font-mono text-gray-500">
          {formatHoursMinutes(workedMins)}h / {formatHoursMinutesFromHours(task.estimacionHoras)}h
        </span>
      </div>
      {task.estado !== 'done' && (
        <Button size="sm" className="mt-2 w-full" onClick={(e) => { e.stopPropagation(); onStart(task.id) }}>
          ▶ Iniciar
        </Button>
      )}
    </div>
  )
}

function KanbanColumn({ column, tasks, sessions, onStart }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const columnTasks = tasks.filter((t) => t.estado === column.id)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col rounded-xl bg-gray-100 p-3 dark:bg-gray-900 min-w-[200px] ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{column.label}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">{columnTasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {columnTasks.map((task) => (
          <KanbanCard key={task.id} task={task} sessions={sessions} onStart={onStart} />
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks }) {
  const updateTask = useStore((s) => s.updateTask)
  const startTimer = useStore((s) => s.startTimer)
  const sessions = useStore((s) => s.sessions)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const activeTask = tasks.find((t) => t.id === activeId)

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const columnIds = COLUMNS.map((c) => c.id)
    let newStatus = columnIds.includes(over.id) ? over.id : null

    if (!newStatus) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) newStatus = overTask.estado
    }

    if (newStatus) {
      const activeTask = tasks.find((t) => t.id === active.id)
      if (activeTask && activeTask.estado !== newStatus) {
        updateTask(active.id, { estado: newStatus })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} tasks={tasks} sessions={sessions} onStart={startTimer} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-700">
            <p className="text-sm font-medium">{activeTask.titulo}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
