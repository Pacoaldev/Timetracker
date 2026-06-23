@echo off
setlocal
cd /d "%~dp0.."

where npm >nul 2>&1
if errorlevel 1 (
  call :showError "Node.js/npm no esta instalado. Instala Node.js desde https://nodejs.org"
  exit /b 1
)

if not exist "node_modules\" (
  call npm install >nul 2>&1
  if errorlevel 1 (
    call :showError "No se pudieron instalar las dependencias. Ejecuta npm install en la carpeta del proyecto."
    exit /b 1
  )
)

npm run dev -- --open
if errorlevel 1 (
  call :showError "No se pudo arrancar el servidor de desarrollo."
  exit /b 1
)

endlocal
exit /b 0

:showError
mshta "javascript:var sh=new ActiveXObject('WScript.Shell'); sh.Popup('%1',0,'TimeTracker',16);close()"
exit /b 1
