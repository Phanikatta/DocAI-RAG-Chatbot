@echo off
title RAG Chatbot — Setup
color 0C
echo.
echo  ██████╗  ██████╗  ██████╗     █████╗ ██╗
echo  ██╔══██╗██╔═══██╗██╔════╝    ██╔══██╗██║
echo  ██║  ██║██║   ██║██║         ███████║██║
echo  ██║  ██║██║   ██║██║         ██╔══██║██║
echo  ██████╔╝╚██████╔╝╚██████╗    ██║  ██║██║
echo  ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝  ╚═╝╚═╝
echo.
echo  RAG Chatbot Setup Script
echo  ========================
echo.

:: ── Step 1: Python dependencies ──────────────────────────────────────────────
echo [1/3] Installing Python dependencies...
echo.
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: pip install failed. Make sure Python 3.10+ is installed and in PATH.
    pause
    exit /b 1
)
echo.
echo  Python dependencies installed!
echo.

:: ── Step 2: Node.js dependencies ─────────────────────────────────────────────
echo [2/3] Installing Node.js dependencies...
echo.
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: npm install failed. Make sure Node.js 18+ is installed and in PATH.
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo  Node.js dependencies installed!
echo.

:: ── Step 3: .env setup ────────────────────────────────────────────────────────
echo [3/3] Setting up environment...
if not exist .env (
    copy .env.example .env >nul
    echo  Created .env from template.
) else (
    echo  .env already exists — skipping.
)
echo.

:: ── Done ─────────────────────────────────────────────────────────────────────
echo  ============================================================
echo   Setup complete!
echo  ============================================================
echo.
echo   NEXT STEPS:
echo   1. Edit .env and add your GROQ_API_KEY
echo      Get a free key at: https://console.groq.com
echo.
echo   2. (Optional) Install Tesseract for scanned PDF OCR:
echo      https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo   3. Run start.bat to launch the application
echo  ============================================================
echo.
pause
