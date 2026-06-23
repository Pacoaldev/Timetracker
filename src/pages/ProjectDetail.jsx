import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { useAuth } from '../contexts/AuthContext'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import KanbanBoard from '../components/tasks/KanbanBoard'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import Button from '../components/shared/Button'
import Select from '../components/shared/Select'
import SessionForm from '../components/timer/SessionForm'
import { generateCSV, generatePDF } from '../utils/export'

export default function ProjectDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const addSession = useStore((s) => s.addSession)

  const project = projects.find((p) => p.id === id)
  const projectTasks = tasks.filter((t) => t.proyectoId === id)

  const [view, setView] = useState('list')
  const [formOpen, setFormOpen] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filterEstado, setFilterEstado] = useState('all')
  const [filterPrioridad, setFilterPrioridad] = useState('all')
  const [filterTag, setFilterTag] = useState('all')

  const allTags = [...new Set(projectTasks.flatMap((t) => t.tags || []))]

  const filtered = projectTasks.filter((t) => {
    if (filterEstado !== 'all' && t.estado !== filterEstado) return false
    if (filterPrioridad !== 'all' && t.prioridad !== filterPrioridad) return false
    if (filterTag !== 'all' && !(t.tags || []).includes(filterTag)) return false
    return true
  })

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (!project) {
    return (
      <div>
        <p className="text-gray-500">Proyecto no encontrado.</p>
        <Link to="/projects" className="text-blue-600 hover:underline text-sm">← Volver a proyectos</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2">
        <Link to="/projects" className="text-sm text-blue-600 hover:underline">← Proyectos</Link>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.nombre}</h1>
          <p className="text-gray-500">{project.cliente}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => generateCSV(project, tasks, sessions)}>Export CSV</Button>
          <Button variant="secondary" onClick={() => generatePDF(project, tasks, sessions)}>Export PDF</Button>
          {isAdmin && <Button variant="secondary" onClick={() => setSessionOpen(true)}>+ Sesión manual</Button>}
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>+ Nueva tarea</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setView('list')}
          >
            Lista
          </button>
          <button
            className={`px-4 py-2 text-sm ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setView('kanban')}
          >
            Kanban
          </button>
        </div>
        <Select
          label=""
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          options={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'todo', label: 'Todo' },
            { value: 'doing', label: 'Doing' },
            { value: 'blocked', label: 'Blocked' },
            { value: 'done', label: 'Done' },
          ]}
          className="w-44"
        />
        <Select
          label=""
          value={filterPrioridad}
          onChange={(e) => setFilterPrioridad(e.target.value)}
          options={[
            { value: 'all', label: 'Todas las prioridades' },
            { value: 'alta', label: 'Alta' },
            { value: 'media', label: 'Media' },
            { value: 'baja', label: 'Baja' },
          ]}
          className="w-44"
        />
        {allTags.length > 0 && (
          <Select
            label=""
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[{ value: 'all', label: 'Todos los tags' }, ...allTags.map((t) => ({ value: t, label: t }))]}
            className="w-40"
          />
        )}
      </div>

      {view === 'list' ? (
        projectTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-600 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-300">Este proyecto aún no tiene tareas.</p>
            <p className="mt-1 text-sm text-gray-500">Crea la primera para empezar a registrar tiempo.</p>
            <Button className="mt-4" onClick={() => { setEditing(null); setFormOpen(true) }}>
              + Nueva tarea
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">Ninguna tarea coincide con los filtros.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setEditing(t); setFormOpen(true) }}
                onDelete={(t) => setConfirmDelete(t)}
              />
            ))}
          </div>
        )
      ) : (
        <KanbanBoard tasks={filtered} />
      )}

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        task={editing}
        proyectoId={id}
        onSave={(data) => {
          if (editing) updateTask(editing.id, data)
          else addTask({ ...data, proyectoId: id })
        }}
      />

      <SessionForm
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        tasks={projectTasks}
        onSave={(data) => addSession(data)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteTask(confirmDelete.id)}
        title="Borrar tarea"
        message={`¿Seguro que quieres borrar "${confirmDelete?.titulo}"?`}
      />
    </div>
  )
}
