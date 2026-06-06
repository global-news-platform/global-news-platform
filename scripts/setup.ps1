<#
.SYNOPSIS
    Installs a scheduled task to run the news pipeline every 4 hours.
.DESCRIPTION
    Creates a Windows Scheduled Task that runs scripts/run.bat
    every 4 hours. Requires Administrator privileges.

    For Facebook auto-posting, set these environment variables:
      FB_PAGE_ID=<your-facebook-page-id>
      FB_PAGE_ACCESS_TOKEN=<your-page-access-token>

    Or run separately: node scripts/post-social.js --page-id=... --token=... --site-url=https://pakistan-news.news
#>

$TaskName = "PakistanNewsHubPipeline"
$ScriptPath = Join-Path $PSScriptRoot "run.bat"
$TaskPath = "\PakistanNewsHub\"

# Ensure we're running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warning "This script must be run as Administrator."
    Write-Warning "Please restart PowerShell as Administrator and try again."
    exit 1
}

# Create task if it doesn't exist
$existing = Get-ScheduledTask -TaskPath $TaskPath -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Updating existing task: $TaskName"
    Unregister-ScheduledTask -TaskPath $TaskPath -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At "00:00" -RepetitionInterval (New-TimeSpan -Hours 4) -RepetitionDuration (New-TimeSpan -Days 365)

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

try {
    Register-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force
    Write-Host "✓ Task '$TaskName' installed successfully."
    Write-Host "  Schedule: Every 4 hours"
    Write-Host "  Script: $ScriptPath"
    Write-Host "  To view: Get-ScheduledTask -TaskPath '$TaskPath' |fl"
    Write-Host ""
    Write-Host "  To enable Facebook auto-posting:"
    Write-Host "    setx FB_PAGE_ID ""your-page-id"""
    Write-Host "    setx FB_PAGE_ACCESS_TOKEN ""your-token"""
    Write-Host "  Or run standalone: node scripts/post-social.js --page-id=... --token=... --site-url=https://pakistan-news.news"
} catch {
    Write-Error "Failed to register task: $_"
    exit 1
}
