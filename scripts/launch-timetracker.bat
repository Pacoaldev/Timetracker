@echo off
setlocal
title TimeTracker

cd /d "%~dp0.."

where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js/npm no esta instalado o no esta en el PATH.
  echo Instala Node.js desde https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install fallo.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando TimeTracker en http://localhost:5173
echo Cierra esta ventana para detener la app.
echo.

npm run dev -- --open

if errorlevel 1 (
  echo.
  echo [ERROR] No se pudo arrancar el servidor de desarrollo.
  pause
)

endlocal
