@echo off
echo ========================================
echo  REINICIANDO NGROK
echo ========================================
echo.

echo [1/3] Parando ngrok existente...
taskkill /F /IM ngrok.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Ngrok parado
) else (
    echo ⚠️  Nenhum ngrok rodando
)

timeout /t 2 /nobreak >nul

echo.
echo [2/3] Iniciando novo tunel na porta 5000...
start /B C:\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Verificando status...
curl -s http://localhost:4040/api/tunnels >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Túnel iniciado com sucesso!
    echo.
    echo 🌐 Dashboard: http://localhost:4040
    echo.
    powershell -Command "& {$data = Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels'; Write-Host '🔗 URL Pública:' $data.tunnels[0].public_url}"
) else (
    echo ❌ Erro ao iniciar túnel
)

echo.
echo ========================================
pause
