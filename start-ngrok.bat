@echo off
echo Iniciando túneis ngrok...
echo.

cd C:\ngrok-v3-stable-windows-amd64

echo Iniciando túnel FRONTEND (porta 3000)...
start "ngrok-frontend" ngrok.exe http 3000

timeout /t 3 /nobreak > nul

echo Iniciando túnel BACKEND (porta 3001)...
start "ngrok-backend" ngrok.exe http 3001

echo.
echo ✅ Túneis ngrok iniciados!
echo.
echo Para ver as URLs públicas:
echo 1. Acesse: http://localhost:4040 (Frontend)
echo 2. Acesse: http://localhost:4041 (Backend)
echo.
echo Ou execute: curl http://localhost:4040/api/tunnels
echo.
pause
