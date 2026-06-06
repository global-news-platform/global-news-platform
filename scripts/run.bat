@echo off
REM ============================================
REM  Pakistan News Hub - Pipeline Runner
REM  Schedule via Windows Task Scheduler
REM  Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN env vars to enable Facebook posting
REM ============================================

cd /d "%~dp0.."

echo [%date% %time%] Starting news pipeline...
echo.

REM Ingest new articles (max 5 per source)
node scripts\pipeline.js --max=5
if %errorlevel% neq 0 (
    echo [ERROR] Pipeline failed with exit code %errorlevel%
    exit /b %errorlevel%
)

echo.
echo [%date% %time%] Pipeline complete.
