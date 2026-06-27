import { useRef } from 'react'
import { useStore } from '../store'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'
import Select from '../components/shared/Select'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { useState } from 'react'
import { exportBackup, importBackup } from '../utils/storage'

export default function Settings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const getExportData = useStore((s) => s.getExportData)
  const importData = useStore((s) => s.importData)
  const clearAllData = useStore((s) => s.clearAllData)
  const loadSeedData = useStore((s) => s.loadSeedData)
  const { role } = useAuth()

  const fileRef = useRef(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmSeed, setConfirmSeed] = useState(false)
  const [importError, setImportError] = useState('')

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importBackup(file)
      importData(data)
      setImportError('')
    } catch {
      setImportError('Error al leer el archivo. Verifica que sea un backup válido.')
    }
    e.target.value = ''
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Ajustes</h1>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Perfil</h2>
        <div className="space-y-4">
          <Input
            label="Nombre de usuario"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
          />
          <Input
            label="Alerta de estimación (%)"
            type="number"
            min="1"
            max="200"
            value={settings.estimationAlertPercent}
            onChange={(e) => updateSettings({ estimationAlertPercent: Number(e.target.value) })}
          />
            <Select
              label="Moneda"
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              options={[
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'USD', label: 'USD ($)' },
                { value: 'GBP', label: 'GBP (£)' },
              ]}
            />
            {role === 'admin' && (
              <Input
                label="Precio por hora"
                type="number"
                min="0"
                value={settings.pricePerHour}
                onChange={(e) => updateSettings({ pricePerHour: Number(e.target.value) })}
              />
            )}
          </div>
      </section>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Apariencia</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => updateSettings({ darkMode: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm">Modo oscuro</span>
        </label>
      </section>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Backup y restauración</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Los datos se guardan automáticamente en este navegador. Usa siempre la misma URL:
          <strong className="text-gray-700 dark:text-gray-200"> http://localhost:5173</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => exportBackup(getExportData())}>Exportar backup</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Restaurar backup
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="secondary" onClick={() => setConfirmSeed(true)}>Cargar datos de ejemplo</Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>Borrar todos los datos</Button>
        </div>
        {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Atajos de teclado</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><kbd className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">Espacio</kbd> — Iniciar/pausar sesión activa</li>
          <li><kbd className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">Escape</kbd> — Cerrar modales</li>
        </ul>
      </section>

      <ConfirmDialog
        open={confirmSeed}
        onClose={() => setConfirmSeed(false)}
        onConfirm={loadSeedData}
        title="Cargar datos de ejemplo"
        message="Se reemplazarán todos los proyectos, tareas y sesiones actuales por datos de demostración."
      />

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAllData}
        title="Borrar todos los datos"
        message="¿Seguro? Se eliminarán todos los proyectos, tareas y sesiones. Esta acción no se puede deshacer."
      />
    </div>
  )
}
