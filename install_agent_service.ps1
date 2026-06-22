# SODA Local Agent - Windows Scheduled Task installer
# Run as Administrator:  powershell -ExecutionPolicy Bypass -File install_agent_service.ps1

$taskName = "SODA Local Agent"
$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $repoDir "run_agent_hidden.vbs"

Write-Host "=== SODA Local Agent Service Installer ===" -ForegroundColor Cyan
Write-Host "Repository: $repoDir"
Write-Host ""

# Check if VBS launcher exists
if (-not (Test-Path $vbsPath)) {
    Write-Host "ERROR: run_agent_hidden.vbs not found at: $vbsPath" -ForegroundColor Red
    exit 1
}

# Check if Python works
try {
    $version = py -3.11 --version
    Write-Host "Python OK: $version" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python 3.11 not found. Is it installed?" -ForegroundColor Red
    exit 1
}

# Remove existing task if present
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the scheduled task
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`""
$trigger = New-ScheduledTaskTrigger -AtLogon -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Limited -User $env:USERNAME -Force

Write-Host ""
Write-Host "Task '$taskName' installed successfully!" -ForegroundColor Green
Write-Host "The agent will start automatically at your next logon." -ForegroundColor Green
Write-Host ""
Write-Host "To start NOW without logging out, run:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host ""
Write-Host "To check status:" -ForegroundColor Yellow
Write-Host "  Get-ScheduledTask -TaskName '$taskName' | fl" -ForegroundColor White
Write-Host "  Get-ScheduledTaskInfo -TaskName '$taskName'" -ForegroundColor White
