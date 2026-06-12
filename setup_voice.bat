@echo off
REM SODA v2 - Voice Setup for Python 3.11
REM This script creates a virtual environment with Python 3.11 for voice support

echo ========================================
echo   SODA v2 - Voice Feature Setup
echo ========================================
echo.

REM Step 1: Check for Python 3.11
echo [1/4] Checking for Python 3.11...
py -3.11 --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python 3.11 not found!
    echo.
    echo Please install Python 3.11 from:
    echo   https://www.python.org/downloads/release/python-31110/
    echo.
    echo During installation, CHECK "Add python.exe to PATH"
    echo.
    pause
    exit /b 1
)

py -3.11 --version
echo [OK] Python 3.11 found
echo.

REM Step 2: Create virtual environment
echo [2/4] Creating virtual environment...
if exist "venv" (
    echo [INFO] venv already exists. Delete it to recreate? (y/n)
    set /p choice=Choice:
    if /i "%choice%"=="y" (
        rmdir /s /q venv
        py -3.11 -m venv venv
    )
) else (
    py -3.11 -m venv venv
)
echo [OK] Virtual environment ready
echo.

REM Step 3: Activate and install dependencies
echo [3/4] Installing Python packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Some packages failed to install
    echo.
    echo If PyAudio failed, try:
    echo   pip install PyAudio‑0.2.14‑cp311‑cp311‑win_amd64.whl
    echo   (Download from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio)
    echo.
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 4: Verify PyAudio
echo [4/4] Verifying voice support...
pip show pyaudio >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PyAudio is installed!
    echo.
    echo ========================================
    echo   Voice Setup Complete!
    echo ========================================
    echo.
    echo Now run: npm run dev
    echo Then open: http://localhost:5173
    echo.
    echo Your voice features are enabled!
) else (
    echo [WARNING] PyAudio not detected
    echo Voice may not work. Try reinstalling:
    echo   pip install pyaudio
)
echo.
pause
