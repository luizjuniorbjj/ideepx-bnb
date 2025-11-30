@echo off
echo ========================================
echo   NGROK - BACKEND API (porta 3001)
echo ========================================
echo.

cd C:\ngrok-v3-stable-windows-amd64
ngrok.exe http 3001

pause
