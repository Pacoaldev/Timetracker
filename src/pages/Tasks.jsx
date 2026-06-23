import { useState } from 'react'
import { useStore } from '../store'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import Select from '../components/shared/Select'

export default function Tasks() {
  const tasks = useStore((s) => s.tasks)
  const updateTask = useStore((s) => s.updateTask)
  const deleteTask = useStore((s) => s.deleteTask)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filterEstado, setFilterEstado] = useState('all')
  const [filterPrioridad, setFilterPrioridad] = useState('all')

  const filtered = tasks.filter((t) => {
    if (filterEstado !== 'all' && t.estado !== filterEstado) return false
    if (filterPrioridad !== 'all' && t.prioridad !== filterPrioridad) return false
    return true
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Todas las tareas</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <Select
          label="Estado"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'todo', label: 'Todo' },
            { value: 'doing', label: 'Doing' },
            { value: 'blocked', label: 'Blocked' },
            { value: 'done', label: 'Done' },
          ]}
          className="w-40"
        />
        <Select
          label="Prioridad"
          value={filterPrioridad}
          onChange={(e) => setFilterPrioridad(e.target.value)}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'alta', label: 'Alta' },
            { value: 'media', label: 'Media' },
            { value: 'baja', label: 'Baja' },
          ]}
          className="w-40"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            showProject
            onEdit={(t) => { setEditing(t); setFormOpen(true) }}
            onDelete={(t) => setConfirmDelete(t)}
          />
        ))}
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        onSave={(data) => updateTask(editing.id, data)}
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
