import { useState } from 'react'
import { useStore } from '../store'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectForm from '../components/projects/ProjectForm'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import Button from '../components/shared/Button'
import Select from '../components/shared/Select'
import { generateCSV, generatePDF } from '../utils/export'

export default function Projects() {
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)
  const addProject = useStore((s) => s.addProject)
  const updateProject = useStore((s) => s.updateProject)
  const deleteProject = useStore((s) => s.deleteProject)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filterEstado, setFilterEstado] = useState('all')
  const [filterPrioridad, setFilterPrioridad] = useState('all')

  const filtered = projects.filter((p) => {
    if (filterEstado !== 'all' && p.estado !== filterEstado) return false
    if (filterPrioridad !== 'all' && p.prioridad !== filterPrioridad) return false
    return true
  })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }}>+ Nuevo proyecto</Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Select
          label="Estado"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'activo', label: 'Activo' },
            { value: 'pausado', label: 'Pausado' },
            { value: 'finalizado', label: 'Finalizado' },
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

      {filtered.length === 0 ? (
        <p className="text-gray-500">No hay proyectos. Crea uno para empezar.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              sessions={sessions}
              onEdit={(p) => { setEditing(p); setFormOpen(true) }}
              onDelete={(p) => setConfirmDelete(p)}
              onExportCSV={(p) => generateCSV(p, tasks, sessions)}
              onExportPDF={(p) => generatePDF(p, tasks, sessions)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
        onSave={(data) => {
          if (editing) updateProject(editing.id, data)
          else addProject(data)
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteProject(confirmDelete.id)}
        title="Borrar proyecto"
        message={`¿Seguro que quieres borrar "${confirmDelete?.nombre}"? Se eliminarán también sus tareas y sesiones.`}
      />
    </div>
  )
}
