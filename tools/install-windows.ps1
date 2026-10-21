$ErrorActionPreference = 'Stop'
$neonSaver = Join-Path $PSScriptRoot 'NeonStrip.scr'
if (-not (Test-Path -LiteralPath $neonSaver)) { throw 'Extract the whole Windows package first.' }
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name 'SCRNSAVE.EXE' -Value $neonSaver
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name 'ScreenSaveActive' -Value '1'
Start-Process control.exe -ArgumentList 'desk.cpl,,@screensaver'
Write-Output 'Neon Strip selected. Choose a wait time in Screen Saver Settings. Keep this folder in its final location.'
