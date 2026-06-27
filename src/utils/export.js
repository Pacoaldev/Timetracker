import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatDateTime, minutesToHours } from './time'

function sanitizeFilename(str) {
  return (str || 'proyecto').replace(/[^a-zA-Z0-9-_áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '-')
}

function getProjectTasks(tasks, projectId) {
  return tasks.filter((t) => t.proyectoId === projectId)
}

function getTaskSessions(sessions, taskId) {
  return sessions.filter((s) => s.tareaId === taskId)
}

export function generateCSV(project, tasks, sessions, settings) {
  const projectTasks = getProjectTasks(tasks, project.id)
  const lines = []

  lines.push('RESUMEN POR TAREA')
  lines.push('Tarea,Sesiones,Horas Totales,Horas Facturables,Horas No Facturables')
  let totalMinutes = 0
  let totalBillable = 0
  const pricePerHour = settings?.pricePerHour || 0

  projectTasks.forEach((task) => {
    const taskSessions = getTaskSessions(sessions, task.id)
    const mins = taskSessions.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    const billable = taskSessions
      .filter((s) => s.facturable)
      .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    totalMinutes += mins
    totalBillable += billable
    lines.push(
      `"${task.titulo}",${taskSessions.length},${minutesToHours(mins)},${minutesToHours(billable)},${minutesToHours(mins - billable)}`
    )
  })

  lines.push('')
  lines.push('DETALLE DE SESIONES')
  lines.push('Tarea,Fecha,Inicio,Fin,Duración (min),Pausas (min),Notas,Facturable')

  projectTasks.forEach((task) => {
    getTaskSessions(sessions, task.id).forEach((s) => {
      lines.push(
        `"${task.titulo}","${formatDate(s.inicio)}","${formatDateTime(s.inicio)}","${s.fin ? formatDateTime(s.fin) : 'En curso'}",${s.duracionMinutos || 0},${s.pausasMinutos || 0},"${(s.notas || '').replace(/"/g, '""')}",${s.facturable ? 'Sí' : 'No'}`
      )
    })
  })

  lines.push('')
  lines.push(`TOTAL PROYECTO,,${minutesToHours(totalMinutes)} h,${minutesToHours(totalBillable)} h facturables,`)
  const totalNet = (totalBillable / 60) * pricePerHour
  const totalVAT = totalNet * 0.21
  const totalWithVAT = totalNet + totalVAT
  lines.push(`IMPORTE NETO (sin IVA),${totalNet.toFixed(2)} ${settings.currency}`)
  lines.push(`IVA 21%,${totalVAT.toFixed(2)} ${settings.currency}`)
  lines.push(`TOTAL FACTURABLE (con IVA),${totalWithVAT.toFixed(2)} ${settings.currency}`)
  // lines.push(`IVA 21%`,${totalVAT.toFixed(2)} ${settings.currency}`)
  // lines.push(`TOTAL FACTURABLE (con IVA)`,${totalWithVAT.toFixed(2)} ${settings.currency}`)

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `${sanitizeFilename(project.nombre)}-${sanitizeFilename(project.cliente)}-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function generatePDF(project, tasks, sessions, settings) {
  const doc = new jsPDF()
  const projectTasks = getProjectTasks(tasks, project.id)
  const date = new Date().toISOString().slice(0, 10)

  doc.setFontSize(18)
  doc.text(project.nombre, 14, 20)
  doc.setFontSize(11)
  doc.text(`Cliente: ${project.cliente || '—'}`, 14, 28)
  doc.text(`Exportado: ${formatDate(new Date().toISOString())}`, 14, 34)

  const summaryRows = projectTasks.map((task) => {
    const taskSessions = getTaskSessions(sessions, task.id)
    const mins = taskSessions.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    const billable = taskSessions
      .filter((s) => s.facturable)
      .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    const net = (billable / 60) * (settings?.pricePerHour || 0)
    const vat = net * 0.21
    const total = net + vat
    return [task.titulo, taskSessions.length, `${minutesToHours(mins)} h`, `${minutesToHours(billable)} h`, `${total.toFixed(2)} ${settings.currency}`]
  })

autoTable(doc, {
  startY: 42,
  head: [['Tarea', 'Sesiones', 'Horas', 'Facturables', 'Importe (con IVA)']],
  body: summaryRows,
  theme: 'striped',
  headStyles: { fillColor: [59, 130, 246] },
})

  // Compute total billable minutes for the project
  let totalBillable = 0
  projectTasks.forEach((task) => {
    const taskSessions = getTaskSessions(sessions, task.id)
    const billable = taskSessions.filter((s) => s.facturable)
      .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    totalBillable += billable
  })
  const totalNet = (totalBillable / 60) * (settings?.pricePerHour || 0)
  const totalVAT = totalNet * 0.21
  const totalWithVAT = totalNet + totalVAT

  const detailRows = []
  projectTasks.forEach((task) => {
    getTaskSessions(sessions, task.id).forEach((s) => {
      detailRows.push([
        task.titulo,
        formatDate(s.inicio),
        formatDateTime(s.inicio).split(', ')[1] || '',
        s.fin ? formatDateTime(s.fin).split(', ')[1] || '' : '—',
        String(s.duracionMinutos || 0),
        String(s.pausasMinutos || 0),
        s.facturable ? 'Sí' : 'No',
        (s.notas || '').slice(0, 40),
      ])
    })
  })

  const finalY = doc.lastAutoTable?.finalY || 80
  doc.setFontSize(14)
  doc.text('Detalle de sesiones', 14, finalY + 12)

  autoTable(doc, {
    startY: finalY + 16,
    head: [['Tarea', 'Fecha', 'Inicio', 'Fin', 'Min', 'Pausas', 'Fact.', 'Notas']],
    body: detailRows,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  const totalMins = sessions
    .filter((s) => projectTasks.some((t) => t.id === s.tareaId))
    .reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)

const footerY = doc.lastAutoTable?.finalY || 200
doc.setFontSize(11)
doc.text(`Total del proyecto: ${minutesToHours(totalMins)} horas`, 14, footerY + 10)
doc.text(`IMPORTE NETO (sin IVA): ${totalNet.toFixed(2)} ${settings.currency}`, 14, footerY + 16)
doc.text(`IVA 21%: ${totalVAT.toFixed(2)} ${settings.currency}`, 14, footerY + 22)
doc.text(`TOTAL FACTURABLE (con IVA): ${totalWithVAT.toFixed(2)} ${settings.currency}`, 14, footerY + 28)
doc.setFontSize(9)
doc.text('TimeTracker Personal', 14, doc.internal.pageSize.height - 10)

  doc.save(`${sanitizeFilename(project.nombre)}-${sanitizeFilename(project.cliente)}-${date}.pdf`)
}
