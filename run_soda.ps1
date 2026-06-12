param(
    [string]$Action = "start"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendLog = Join-Path $ScriptDir "logs\soda_backend.log"
$FrontendLog = Join-Path $ScriptDir "logs\soda_frontend.log"
$PidFile = Join-Path $ScriptDir "logs\soda.pids"
$ShutdownFlag = Join-Path $ScriptDir "logs\soda_shutdown.flag"

# Ensure logs directory exists
$null = New-Item -ItemType Directory -Path (Join-Path $ScriptDir "logs") -Force

function Start-SODAProcesses {
    Write-Host "[SODA] Starting backend server..."
    $backend = Start-Process -FilePath "py" -ArgumentList "-3.11 server.py" -WorkingDirectory $ScriptDir -WindowStyle Hidden -PassThru -RedirectStandardOutput $BackendLog -RedirectStandardError $BackendLog
    
    Write-Host "[SODA] Starting frontend (Vite + Electron)..."
    $frontend = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $ScriptDir -WindowStyle Hidden -PassThru -RedirectStandardOutput $FrontendLog -RedirectStandardError $FrontendLog
    
    # Save PIDs
    @{
        backend_pid = $backend.Id
        frontend_pid = $frontend.Id
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json | Set-Content -Path $PidFile
    
    Write-Host "[SODA] Backend PID: $($backend.Id)"
    Write-Host "[SODA] Frontend PID: $($frontend.Id)"
    Write-Host "[SODA] Logs: $BackendLog , $FrontendLog"
    
    return @{ backend = $backend; frontend = $frontend }
}

function Stop-SODAProcesses {
    if (Test-Path $PidFile) {
        $pids = Get-Content $PidFile | ConvertFrom-Json
        if ($pids.backend_pid) {
            Write-Host "[SODA] Stopping backend (PID $($pids.backend_pid))..."
            Stop-Process -Id $pids.backend_pid -Force -ErrorAction SilentlyContinue
        }
        if ($pids.frontend_pid) {
            Write-Host "[SODA] Stopping frontend (PID $($pids.frontend_pid))..."
            Stop-Process -Id $pids.frontend_pid -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
    # Clean up any orphan server processes
    Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*server.py*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "[SODA] All processes stopped"
}

function Watchdog-Loop {
    param($procs)
    Write-Host "[SODA] Watchdog active — monitoring processes every 5 seconds"
    while ($true) {
        # Check for shutdown flag (set by shutdown_soda tool or manual)
        if (Test-Path $ShutdownFlag) {
            Write-Host "[SODA] Shutdown flag detected — stopping..."
            Remove-Item $ShutdownFlag -Force -ErrorAction SilentlyContinue
            return $false
        }
        
        # Check backend
        if (-not $procs.backend.HasExited) {
            # Check if process is actually alive
            try { $null = Get-Process -Id $procs.backend.Id } catch {
                Write-Host "[SODA] Backend died — restarting..."
                $procs = Start-SODAProcesses
            }
        }
        
        # Check frontend
        if (-not $procs.frontend.HasExited) {
            try { $null = Get-Process -Id $procs.frontend.Id } catch {
                Write-Host "[SODA] Frontend died — restarting..."
                # Kill old backend too in case it's orphaned
                Stop-SODAProcesses
                $procs = Start-SODAProcesses
            }
        }
        
        Start-Sleep -Seconds 5
    }
    return $true
}

# ── Entry point ──────────────────────────────────────────────────
switch ($Action.ToLower()) {
    "start" {
        Write-Host "========== SODA Launcher =========="
        $procs = Start-SODAProcesses
        $running = Watchdog-Loop $procs
        if (-not $running) {
            Stop-SODAProcesses
            Write-Host "[SODA] Exiting launcher"
        }
    }
    "stop" {
        Stop-SODAProcesses
        New-Item -ItemType File -Path $ShutdownFlag -Force | Out-Null
    }
    "restart" {
        Stop-SODAProcesses
        Start-Sleep -Seconds 2
        & $MyInvocation.MyCommand.Path -Action start
    }
    default {
        Write-Host "Usage: .\run_soda.ps1 [start|stop|restart]"
        Write-Host "  start   — Launch SODA backend + frontend with watchdog"
        Write-Host "  stop    — Stop all SODA processes"
        Write-Host "  restart — Restart everything"
    }
}
