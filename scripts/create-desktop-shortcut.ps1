$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$launcher = Join-Path $projectRoot "scripts\launch-timetracker-hidden.vbs"
$stopper = Join-Path $projectRoot "scripts\stop-timetracker.vbs"
$icon = Join-Path $projectRoot "public\images\Timetracker_logo.png"
$desktop = [Environment]::GetFolderPath("Desktop")

function New-AppShortcut($name, $target, $description) {
  $shortcutPath = Join-Path $desktop "$name.lnk"
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($shortcutPath)
  $shortcut.TargetPath = $target
  $shortcut.WorkingDirectory = $projectRoot
  $shortcut.WindowStyle = 1
  $shortcut.Description = $description
  if (Test-Path $icon) {
    $shortcut.IconLocation = "$icon,0"
  }
  $shortcut.Save()
  return $shortcutPath
}

$start = New-AppShortcut "TimeTracker" $launcher "Arrancar TimeTracker Personal (sin consola)"
$stop = New-AppShortcut "TimeTracker - Detener" $stopper "Detener TimeTracker Personal"

Write-Host ""
Write-Host "Accesos directos creados en el escritorio:" -ForegroundColor Green
Write-Host "  - $start"
Write-Host "  - $stop"
Write-Host ""
Write-Host "Iniciar: doble clic en TimeTracker"
Write-Host "Detener: doble clic en TimeTracker - Detener"
