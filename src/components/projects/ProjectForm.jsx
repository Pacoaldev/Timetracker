import { useState } from 'react'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Select from '../shared/Select'
import Button from '../shared/Button'

const EMPTY = {
  nombre: '',
  cliente: '',
  descripcion: '',
  estado: 'activo',
  prioridad: 'media',
  fechaInicio: '',
  fechaEntrega: '',
  presupuestoEstimado: '',
}

export default function ProjectForm({ open, onClose, project, onSave }) {
  const [form, setForm] = useState(project ? { ...EMPTY, ...project } : { ...EMPTY })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      presupuestoEstimado: Number(form.presupuestoEstimado) || 0,
      fechaInicio: form.fechaInicio ? new Date(form.fechaInicio).toISOString() : null,
      fechaEntrega: form.fechaEntrega ? new Date(form.fechaEntrega).toISOString() : null,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Editar proyecto' : 'Nuevo proyecto'} size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre *" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required className="sm:col-span-2" />
        <Input label="Cliente" value={form.cliente} onChange={(e) => set('cliente', e.target.value)} />
        <Select
          label="Estado"
          value={form.estado}
          onChange={(e) => set('estado', e.target.value)}
          options={[
            { value: 'activo', label: 'Activo' },
            { value: 'pausado', label: 'Pausado' },
            { value: 'finalizado', label: 'Finalizado' },
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
        <Input label="Fecha inicio" type="date" value={form.fechaInicio?.slice(0, 10) || ''} onChange={(e) => set('fechaInicio', e.target.value)} />
        <Input label="Fecha entrega" type="date" value={form.fechaEntrega?.slice(0, 10) || ''} onChange={(e) => set('fechaEntrega', e.target.value)} />
        <Input label="Presupuesto estimado" type="number" min="0" value={form.presupuestoEstimado} onChange={(e) => set('presupuestoEstimado', e.target.value)} />
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
