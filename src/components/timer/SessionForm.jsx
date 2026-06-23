import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Select from '../shared/Select'
import Button from '../shared/Button'

export default function SessionForm({ open, onClose, taskId, session, tasks = [], onSave }) {
  const [form, setForm] = useState({
    inicio: session?.inicio?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    fin: session?.fin?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    pausasMinutos: session?.pausasMinutos || 0,
    notas: session?.notas || '',
    facturable: session?.facturable ?? true,
    tareaId: session?.tareaId || taskId || tasks[0]?.id || '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        inicio: session?.inicio?.slice(0, 16) || new Date().toISOString().slice(0, 16),
        fin: session?.fin?.slice(0, 16) || new Date().toISOString().slice(0, 16),
        pausasMinutos: session?.pausasMinutos || 0,
        notas: session?.notas || '',
        facturable: session?.facturable ?? true,
        tareaId: session?.tareaId || taskId || tasks[0]?.id || '',
      })
    }
  }, [open, session, taskId, tasks])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await onSave({
      tareaId: form.tareaId,
      inicio: new Date(form.inicio).toISOString(),
      fin: new Date(form.fin).toISOString(),
      pausasMinutos: Number(form.pausasMinutos),
      notas: form.notas,
      facturable: form.facturable,
    })

    if (result?.ok === false) {
      alert(result.error)
      return
    }

    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={session ? 'Editar sesión' : 'Sesión manual'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {tasks.length > 0 && !session && (
          <Select
            label="Tarea"
            value={form.tareaId}
            onChange={(e) => set('tareaId', e.target.value)}
            options={tasks.map((t) => ({ value: t.id, label: t.titulo }))}
          />
        )}
        <Input
          label="Inicio"
          type="datetime-local"
          value={form.inicio}
          onChange={(e) => set('inicio', e.target.value)}
          required
        />
        <Input
          label="Fin"
          type="datetime-local"
          value={form.fin}
          onChange={(e) => set('fin', e.target.value)}
          required
        />
        <Input
          label="Pausas (minutos)"
          type="number"
          min="0"
          value={form.pausasMinutos}
          onChange={(e) => set('pausasMinutos', e.target.value)}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Notas</span>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            rows={3}
            value={form.notas}
            onChange={(e) => set('notas', e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.facturable}
            onChange={(e) => set('facturable', e.target.checked)}
          />
          Facturable
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
