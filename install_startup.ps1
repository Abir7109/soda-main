param(
    [string]$Action = "install"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LauncherPath = Join-Path $ScriptDir "run_soda.ps1"
$TaskName = "SODA"

# Require admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Administrator privileges required." -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run:"
    Write-Host "  .\install_startup.ps1"
    exit 1
}

switch ($Action.ToLower()) {
    "install" {
        Write-Host "Installing SODA auto-start on Windows login..."
        
        # Create task action — runs PowerShell hidden, launches the launcher
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$LauncherPath`" -Action start"
        
        # Trigger on user logon
        $trigger = New-ScheduledTaskTrigger -AtLogOn
        
        # Run with highest privileges
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
        
        # Register the task
        Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force
        
        Write-Host "SUCCESS: SODA will start automatically when you log in." -ForegroundColor Green
        Write-Host "  Task Name: $TaskName"
        Write-Host "  Launcher: $LauncherPath"
        Write-Host ""
        Write-Host "To remove: .\install_startup.ps1 -Action remove"
    }
    
    "remove" {
        Write-Host "Removing SODA auto-start..."
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
        Write-Host "SUCCESS: SODA auto-start removed." -ForegroundColor Green
    }
    
    "status" {
        $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($task) {
            Write-Host "SODA auto-start: INSTALLED" -ForegroundColor Green
            Write-Host "  State: $($task.State)"
            Write-Host "  Next Run: $($task.NextRunTime)"
        } else {
            Write-Host "SODA auto-start: NOT INSTALLED" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Usage: .\install_startup.ps1 [install|remove|status]"
        Write-Host "  install — Register SODA to start on Windows logon (requires admin)"
        Write-Host "  remove  — Unregister the auto-start task"
        Write-Host "  status  — Check if auto-start is installed"
    }
}
