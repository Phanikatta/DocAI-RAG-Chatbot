@echo off
title RAG Chatbot — Launcher
color 0C
echo.
echo  Starting RAG Chatbot...
echo  =======================
echo.

:: Check .env exists
if not exist .env (
    echo  WARNING: .env file not found!
    echo  Run setup.bat first, then add your GROQ_API_KEY to .env
    echo.
    pause
    exit /b 1
)

:: ── Launch FastAPI backend ─────────────────────────────────────────────────
echo  [1/2] Starting Backend  ^(FastAPI on port 8000^)...
start "DocAI Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload && pause"

:: Wait a moment for backend to initialise
timeout /t 3 /nobreak >nul

:: ── Launch React frontend ─────────────────────────────────────────────────
echo  [2/2] Starting Frontend ^(React on port 3000^)...
start "DocAI Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev && pause"

echo.
echo  ============================================================
echo   Both services are starting in separate windows.
echo.
echo   Backend API :  http://localhost:8000
echo   Frontend UI :  http://localhost:3000
echo   API Docs    :  http://localhost:8000/docs
echo  ============================================================
echo.
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo  Close this window or press any key to exit launcher.
pause >nul
