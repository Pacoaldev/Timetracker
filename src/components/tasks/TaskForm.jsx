import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import Input from '../shared/Input'
import Select from '../shared/Select'
import Button from '../shared/Button'
import { useStore } from '../../store'
import { formatHoursMinutes, getTaskWorkedMinutes, toUTCISO } from '../../utils/time'
import { validateMasterPin } from '../../utils/pin'

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
  const sessions = useStore((s) => s.sessions)
  const addManualSession = useStore((s) => s.addManualSession)

  const [form, setForm] = useState(() => taskToForm(task, proyectoId))
  const [manualTime, setManualTime] = useState({ pin: '', hours: '0', minutes: '0', notas: '' })
  const [pinError, setPinError] = useState('')
  const [manualSuccess, setManualSuccess] = useState('')

  useEffect(() => {
    if (open) {
      setForm(taskToForm(task, proyectoId))
      setManualTime({ pin: '', hours: '0', minutes: '0', notas: '' })
      setPinError('')
      setManualSuccess('')
    }
  }, [open, task, proyectoId])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setManual = (key, val) => setManualTime((m) => ({ ...m, [key]: val }))

  const workedMins = task ? getTaskWorkedMinutes(task.id, sessions) : 0

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

  const handleAddManualTime = async (e) => {
    e.preventDefault()
    setPinError('')
    setManualSuccess('')

    const error = await validateMasterPin(manualTime.pin)
    if (error) {
      setPinError(error)
      return
    }

    const hours = Math.max(0, Number(manualTime.hours) || 0)
    const minutes = Math.max(0, Math.min(59, Number(manualTime.minutes) || 0))
    const durationMins = hours * 60 + minutes

    if (durationMins <= 0) {
      setPinError('Indica al menos 1 minuto de tiempo a añadir.')
      return
    }

    const end = new Date()
    const start = new Date(end.getTime() - durationMins * 60000)

    const result = await addManualSession(
      {
        tareaId: task.id,
        inicio: toUTCISO(start),
        fin: toUTCISO(end),
        duracionMinutos: durationMins,
        pausasMinutos: 0,
        notas: manualTime.notas.trim()
          ? `Manual: ${manualTime.notas.trim()}`
          : 'Tiempo añadido manualmente',
        facturable: true,
      },
      manualTime.pin
    )

    if (!result.ok) {
      setPinError(result.error)
      return
    }

    setManualTime({ pin: '', hours: '0', minutes: '0', notas: '' })
    setManualSuccess(`Se añadieron ${formatHoursMinutes(durationMins)}h a la tarea.`)
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

        {task && (
          <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/50">
            <h3 className="mb-1 text-sm font-semibold">Añadir tiempo manual</h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Tiempo registrado: <span className="font-mono font-medium">{formatHoursMinutes(workedMins)}h</span>
              {' · '}Solo tú (con PIN) puedes añadir tiempo manual aquí
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="PIN maestro *"
                type="password"
                value={manualTime.pin}
                onChange={(e) => setManual('pin', e.target.value)}
                autoComplete="off"
                className="sm:col-span-2"
              />
              <Input
                label="Horas"
                type="number"
                min="0"
                value={manualTime.hours}
                onChange={(e) => setManual('hours', e.target.value)}
              />
              <Input
                label="Minutos"
                type="number"
                min="0"
                max="59"
                value={manualTime.minutes}
                onChange={(e) => setManual('minutes', e.target.value)}
              />
              <Input
                label="Notas (opcional)"
                value={manualTime.notas}
                onChange={(e) => setManual('notas', e.target.value)}
                className="sm:col-span-2"
              />
            </div>
            {pinError && <p className="mt-2 text-sm text-red-500">{pinError}</p>}
            {manualSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{manualSuccess}</p>}
            <Button type="button" variant="secondary" className="mt-3" onClick={handleAddManualTime}>
              Añadir tiempo
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
