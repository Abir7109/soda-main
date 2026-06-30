# SODA Local Agent — Auto-Start Installer
# Run as Administrator:  powershell -ExecutionPolicy Bypass -File install_agent_service.ps1
#
# Options:
#   .\install_agent_service.ps1            — Install as Scheduled Task (auto-start at logon)
#   .\install_agent_service.ps1 -Action remove  — Remove the Scheduled Task
#   .\install_agent_service.ps1 -Action start   — Start the agent right now (no admin needed)
#   .\install_agent_service.ps1 -Action status  — Check if installed

param(
    [string]$Action = "install"
)

$taskName = "SODA Local Agent"
$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $repoDir "run_agent_hidden.vbs"
$agentPy = Join-Path $repoDir "backend\local_agent.py"

function Write-Step($msg) { Write-Host "  $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "  ✗ $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }

switch ($Action.ToLower()) {
    "install" {
        Write-Host "`n=== SODA Local Agent Auto-Start Installer ===" -ForegroundColor Cyan
        Write-Host ""

        # Check admin
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        if (-not $isAdmin) {
            Write-Err "Administrator privileges required."
            Write-Host "  Right-click PowerShell and select 'Run as Administrator', then re-run:" -ForegroundColor Yellow
            Write-Host "    .\install_agent_service.ps1`n"
            exit 1
        }

        # Check VBS launcher
        Write-Step "Checking files..."
        if (-not (Test-Path $vbsPath)) {
            Write-Err "run_agent_hidden.vbs not found at: $vbsPath"
            exit 1
        }
        Write-Ok "VBS launcher found: $vbsPath"

        if (-not (Test-Path $agentPy)) {
            Write-Err "backend\local_agent.py not found at: $agentPy"
            exit 1
        }
        Write-Ok "Agent script found: $agentPy"

        # Check Python
        Write-Step "Checking Python 3.11..."
        try {
            $version = py -3.11 --version
            Write-Ok "Python OK: $version"
        } catch {
            Write-Err "Python 3.11 not found. Is it installed?"
            Write-Host "  Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
            exit 1
        }

        # Remove existing task
        $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        if ($existing) {
            Write-Step "Removing existing task..."
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
            Write-Ok "Old task removed"
        }

        # Create the scheduled task
        Write-Step "Creating Scheduled Task..."
        $action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`""
        $trigger = New-ScheduledTaskTrigger -AtLogon -User $env:USERNAME
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)

        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Limited -User $env:USERNAME -Force | Out-Null
        Write-Ok "Scheduled Task '$taskName' created"

        Write-Host ""
        Write-Host "=== INSTALLATION COMPLETE ===" -ForegroundColor Green
        Write-Host "  The agent will start automatically at your next logon." -ForegroundColor Green
        Write-Host ""

        # Offer to start now
        Write-Host "  Start the agent NOW without logging out?" -ForegroundColor Yellow
        Write-Host "  Run this command (no admin needed):" -ForegroundColor Yellow
        Write-Host "    .\install_agent_service.ps1 -Action start" -ForegroundColor White
        Write-Host ""
        Write-Host "  Alternative — add to startup folder (no admin):" -ForegroundColor Yellow
        Write-Host '    $lnk = "$([Environment]::GetFolderPath(''Startup''))\SODA Agent.lnk"' -ForegroundColor White
        Write-Host '    $ws = New-Object -ComObject WScript.Shell' -ForegroundColor White
        Write-Host '    $s = $ws.CreateShortcut($lnk); $s.TargetPath = "wscript.exe"; $s.Arguments = "'"$vbsPath"'"; $s.Save()' -ForegroundColor White
        Write-Host ""
        Write-Host "  To check status:" -ForegroundColor Yellow
        Write-Host "    .\install_agent_service.ps1 -Action status" -ForegroundColor White
    }

    "start" {
        Write-Step "Starting SODA Local Agent right now..."
        $python = "py -3.11"
        try {
            $p = Start-Process -FilePath "py" -ArgumentList "-3.11", "`"$agentPy`"" -WindowStyle Hidden -PassThru
            Write-Ok "Agent started (PID: $($p.Id))"
            Write-Host "  Script: $agentPy" -ForegroundColor Gray
            Write-Host "  Log:    $repoDir\agent_$($p.Id).log" -ForegroundColor Gray
        } catch {
            Write-Err "Failed to start: $_"
            # Try direct python path
            try {
                $p = Start-Process -FilePath "python" -ArgumentList "`"$agentPy`"" -WindowStyle Hidden -PassThru
                Write-Ok "Agent started (PID: $($p.Id)) via 'python'"
            } catch {
                Write-Err "Could not start agent. Check Python installation."
                exit 1
            }
        }
    }

    "remove" {
        Write-Host "`nRemoving SODA Local Agent auto-start..." -ForegroundColor Cyan
        $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        if ($existing) {
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
            Write-Ok "Task '$taskName' removed"
        } else {
            Write-Warn "No task found to remove"
        }

        # Also remove startup folder shortcut if it exists
        $startupLnk = Join-Path ([Environment]::GetFolderPath('Startup')) "SODA Agent.lnk"
        if (Test-Path $startupLnk) {
            Remove-Item $startupLnk -Force
            Write-Ok "Startup shortcut removed"
        }
        Write-Host ""
    }

    "status" {
        Write-Host "`n=== SODA Local Agent Status ===" -ForegroundColor Cyan
        $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        if ($task) {
            Write-Ok "Scheduled Task: INSTALLED"
            Write-Host "    State:    $($task.State)" -ForegroundColor Gray
            Write-Host "    Next Run: $($task.NextRunTime)" -ForegroundColor Gray
        } else {
            Write-Warn "Scheduled Task: NOT INSTALLED"
            Write-Host "    Run as Admin: .\install_agent_service.ps1 install" -ForegroundColor Yellow
        }

        $startupLnk = Join-Path ([Environment]::GetFolderPath('Startup')) "SODA Agent.lnk"
        if (Test-Path $startupLnk) {
            Write-Ok "Startup Folder: shortcut exists"
        } else {
            Write-Warn "Startup Folder: no shortcut"
        }

        # Check if agent is running now
        $agentProcesses = Get-Process -Name "python*" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "local_agent" -or $_.CommandLine -match "local_agent.py" }
        $running = $agentProcesses | Select-Object -First 1
        if ($running) {
            Write-Ok "Agent is RUNNING (PID: $($running.Id))"
        } else {
            Write-Warn "Agent is NOT running"
            Write-Host "    Start it: .\install_agent_service.ps1 -Action start" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    default {
        Write-Host "`nUsage:" -ForegroundColor Cyan
        Write-Host "  install   — Register agent to auto-start on Windows logon (requires admin)" -ForegroundColor White
        Write-Host "  start     — Start the agent right now (no admin needed)" -ForegroundColor White
        Write-Host "  remove    — Unregister the auto-start task" -ForegroundColor White
        Write-Host "  status    — Check if auto-start is installed and agent is running" -ForegroundColor White
        Write-Host ""
    }
}