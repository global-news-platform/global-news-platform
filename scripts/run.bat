@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "LOG_DIR=%PROJECT_DIR%\logs"
set "TIMESTAMP=%DATE:/=-%_%TIME::=-%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "LOG_FILE=%LOG_DIR%\pipeline-!TIMESTAMP!.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

cd /d "%PROJECT_DIR%"
echo [%DATE% %TIME%] Starting pipeline... > "%LOG_FILE%"

call npx node scripts\pipeline.js >> "%LOG_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"

if !EXIT_CODE! equ 0 (
    echo [%DATE% %TIME%] Pipeline OK >> "%LOG_FILE%"
) else (
    echo [%DATE% %TIME%] Pipeline FAILED (code !EXIT_CODE!) >> "%LOG_FILE%"
)

REM keep last 20 logs
for /f "skip=20" %%f in ('dir /b /o-d "%LOG_DIR%\pipeline-*.log" 2^>nul') do del "%LOG_DIR%\%%f"

exit /b !EXIT_CODE!
