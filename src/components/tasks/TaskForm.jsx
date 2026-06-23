import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Select from '../shared/Select'
import Button from '../shared/Button'

const EMPTY = {
  titulo: '',
  descripcion: '',
  estado: 'todo',
  prioridad: 'media',
  estimacionHoras: '',
  tags: '',
  fechaLimite: '',
}

function taskToForm(task, proyectoId) {
  if (!task) return { ...EMPTY, proyectoId }
  return {
    titulo: task.titulo || '',
    descripcion: task.descripcion || '',
    estado: task.estado || 'todo',
    prioridad: task.prioridad || 'media',
    estimacionHoras: task.estimacionHoras ?? '',
    tags: (task.tags || []).join(', '),
    fechaLimite: task.fechaLimite ? task.fechaLimite.slice(0, 10) : '',
    proyectoId: task.proyectoId || proyectoId,
  }
}

export default function TaskForm({ open, onClose, task, proyectoId, onSave }) {
  const [form, setForm] = useState(() => taskToForm(task, proyectoId))

  useEffect(() => {
    if (open) setForm(taskToForm(task, proyectoId))
  }, [open, task, proyectoId])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      proyectoId: form.proyectoId || proyectoId,
      estimacionHoras: Number(form.estimacionHoras) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      fechaLimite: form.fechaLimite ? new Date(form.fechaLimite).toISOString() : null,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Editar tarea' : 'Nueva tarea'} size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Título *" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} required className="sm:col-span-2" />
        <Select
          label="Estado"
          value={form.estado}
          onChange={(e) => set('estado', e.target.value)}
          options={[
            { value: 'todo', label: 'Todo' },
            { value: 'doing', label: 'Doing' },
            { value: 'blocked', label: 'Blocked' },
            { value: 'done', label: 'Done' },
          ]}
        />
        <Select
          label="Prioridad"
          value={form.prioridad}
          onChange={(e) => set('prioridad', e.target.value)}
          options={[
            { value: 'alta', label: 'Alta' },
            { value: 'media', label: 'Media' },
            { value: 'baja', label: 'Baja' },
          ]}
        />
        <Input label="Estimación (horas)" type="number" min="0" step="0.5" value={form.estimacionHoras} onChange={(e) => set('estimacionHoras', e.target.value)} />
        <Input label="Fecha límite" type="date" value={form.fechaLimite} onChange={(e) => set('fechaLimite', e.target.value)} />
        <Input label="Tags (separados por coma)" value={form.tags} onChange={(e) => set('tags', e.target.value)} className="sm:col-span-2" />
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Descripción</span>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            rows={3}
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
