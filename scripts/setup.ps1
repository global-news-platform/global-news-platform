# Setup: install scheduled task for automated news ingestion
# Run as Administrator

$Name = "GlobalNewsPipeline"
$Script = Join-Path (Get-Location) "scripts\run.bat"

if (-not (Test-Path $Script)) {
    Write-Host "ERROR: run.bat not found" -ForegroundColor Red
    exit 1
}

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$Script`""
$trigger = New-ScheduledTaskTrigger -Daily -At "00:00" -RepetitionInterval (New-TimeSpan -Hours 2) -RepetitionDuration (New-TimeSpan -Days 365)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Unregister-ScheduledTask -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask -TaskName $Name -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Global News — automated ingestion every 2 hours" -Force

Write-Host "✓ Scheduled task '$Name' installed (every 2 hours)" -ForegroundColor Green
Write-Host "  Script: $Script"
