@echo off
REM ============================================
REM  Global News Platform - Pipeline Runner
REM  Schedule via Windows Task Scheduler
REM ============================================

cd /d "%~dp0.."

echo [%date% %time%] Starting news pipeline...
echo.

REM Ingest new articles
node scripts\pipeline.js --max=5
if %errorlevel% neq 0 (
    echo [ERROR] Pipeline failed with exit code %errorlevel%
    exit /b %errorlevel%
)

echo.
echo [%date% %time%] Pipeline complete.
