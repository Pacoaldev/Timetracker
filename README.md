<p align="center">
  <img src="public/images/Timetracker_logo.svg" alt="TimeTracker" width="300" />
</p>

# TimeTracker

Gestor de tiempo personal dedicado a tareas y sprints en proyectos. App web local (React + Vite) con persistencia en `localStorage`, cronómetro, timesheet y exportación CSV/PDF.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

El contenido de `dist/` se puede servir como sitio estático.

## Funcionalidades

- Gestión de proyectos y tareas (lista + kanban)
- Cronómetro con una sola sesión activa y autosave
- Timesheet diario y semanal
- Estadísticas y dashboard
- Exportación CSV/PDF por proyecto
- Backup/restore JSON y modo oscuro

## Stack

React, Vite, Tailwind CSS, Zustand, react-router-dom, @dnd-kit, recharts, jsPDF

## Licencia

Uso personal.
