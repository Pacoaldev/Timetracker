<p align="center">
  <img src="public/images/Timetracker_logo.svg" alt="TimeTracker" width="300" />
</p>

# TimeTracker

Gestor de tiempo dedicado a tareas y sprints en proyectos. Aplicación web moderna (React + Vite) con base de datos remota en Supabase, sincronización en tiempo real (Realtime) y sistema de usuarios con roles.

## Funcionalidades

- **Autenticación y Roles:** Sistema de login (email y contraseña). Roles de Administrador y Colaborador.
  - Administradores: Acceso total. Creación, edición y borrado de tareas, proyectos y sesiones manuales.
  - Colaboradores: Solo pueden interactuar con el cronómetro en vivo y gestionar estados de tareas (kanban).
- **Gestión de Proyectos y Tareas:** Organización mediante lista y tablero Kanban.
- **Cronómetro:** Registro de tiempo en vivo, pausa y reanudación, con sincronización instantánea para otros colaboradores usando el proyecto.
- **Timesheet:** Vistas diaria y semanal de las horas trabajadas.
- **Estadísticas y Dashboard:** Gráficos de horas trabajadas y resumen de productividad.
- **Exportación:** Generación de reportes en PDF y exportación de datos CSV.
- **Modo Oscuro:** Personalizable desde las configuraciones.

## Requisitos

- Node.js 18+
- npm
- Cuenta de Supabase (Free Tier) para la base de datos

## Instalación

1. Clona el repositorio e instala las dependencias:

```bash
npm install
```

2. Configura Supabase en tu cuenta:
- Crea un nuevo proyecto en Supabase.
- Abre la configuración del proyecto y busca la URL de la API y la clave `anon_key`.
- Si necesitas usar tu propia instancia de Supabase, sustituye las credenciales en el archivo `.env.local` basándote en el archivo `.env.example`.

3. Configura el esquema de la base de datos:
- En Supabase, ve al "SQL Editor" y ejecuta el contenido del script de la base de datos (puedes encontrar un resumen de la estructura en los archivos del sistema original o aplicar el script proporcionado). Asegúrate de renombrar las columnas usando mayúsculas para conservar camelCase si es necesario:
```sql
ALTER TABLE projects RENAME COLUMN fechainicio TO "fechaInicio";
ALTER TABLE projects RENAME COLUMN fechaentrega TO "fechaEntrega";
ALTER TABLE projects RENAME COLUMN presupuestoestimado TO "presupuestoEstimado";
ALTER TABLE tasks RENAME COLUMN proyectoid TO "proyectoId";
ALTER TABLE tasks RENAME COLUMN estimacionhoras TO "estimacionHoras";
ALTER TABLE tasks RENAME COLUMN horasreales TO "horasReales";
ALTER TABLE tasks RENAME COLUMN fechalimite TO "fechaLimite";
ALTER TABLE sessions RENAME COLUMN tareaid TO "tareaId";
ALTER TABLE sessions RENAME COLUMN duracionminutos TO "duracionMinutos";
ALTER TABLE sessions RENAME COLUMN pausasminutos TO "pausasMinutos";
ALTER TABLE activities RENAME COLUMN entidadid TO "entidadId";
```

## Uso

Para arrancar el programa, puedes usar el script incluido:

```bash
# Entorno Windows
scripts\launch-timetracker.bat
```

**Para macOS, Linux o Raspberry Pi:**
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm run dev
```

La aplicación se abrirá en [http://localhost:5173](http://localhost:5173).

## Proceso de Login

- La primera vez que accedas, haz clic en **Registrarse** en la pantalla de Login con un email y contraseña.
- Tu cuenta se creará como `collaborator` por defecto.
- **Para hacerte administrador:** Ve al panel de Supabase > *Table Editor* > `profiles` y cambia tu columna `role` a `admin`.
- Luego, puedes invitar a tus compañeros; ellos serán colaboradores por defecto al registrarse.

## Build para Producción

```bash
npm run build
npm run preview
```

El contenido compilado se encontrará en la carpeta `dist/` y puede servirse en cualquier host estático (Vercel, Netlify, etc.).

## Tecnologías Utilizadas

React, Vite, Tailwind CSS, Zustand, Supabase (PostgreSQL, Auth, Realtime), react-router-dom, @dnd-kit, recharts, jsPDF.

## Licencia

Uso personal.
