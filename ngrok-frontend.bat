@echo off
echo ========================================
echo   NGROK - DASHBOARD FRONTEND (porta 3000)
echo ========================================
echo.

cd C:\ngrok-v3-stable-windows-amd64
ngrok.exe http 3000

pause
