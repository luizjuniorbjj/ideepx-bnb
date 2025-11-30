@echo off
title iDeepX - Inicializacao Completa
color 0A

echo =========================================
echo    iDeepX - INICIALIZACAO COMPLETA
echo =========================================
echo.

:: Verificar se estamos no diretorio correto
if not exist "frontend" (
    echo ERRO: Execute este script de C:\ideepx-bnb
    pause
    exit /b 1
)

echo [1/4] Parando processos Node existentes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Processos parados!
echo.

echo [2/4] Limpando cache do Next.js...
cd frontend
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache limpo!
) else (
    echo Cache ja estava limpo
)
cd ..
echo.

echo [3/4] Iniciando BACKEND (porta 5001)...
echo.
echo Aguarde 5 segundos para o backend iniciar...
echo.
start "iDeepX Backend" cmd /k "cd /d C:\ideepx-bnb\backend && echo ========================================= && echo    BACKEND - Porta 5001 && echo ========================================= && npm run dev"
timeout /t 5 /nobreak >nul
echo ✓ Backend iniciado!
echo.

echo [4/4] Iniciando FRONTEND (porta 5000)...
echo.
echo Aguarde 10 segundos para compilar...
echo.
start "iDeepX Frontend" cmd /k "cd /d C:\ideepx-bnb\frontend && echo ========================================= && echo    FRONTEND - Porta 5000 && echo ========================================= && npm run dev"
timeout /t 10 /nobreak >nul
echo.

echo =========================================
echo         INICIALIZACAO COMPLETA!
echo =========================================
echo.
echo ✅ Backend rodando em:  http://localhost:5001
echo ✅ Frontend rodando em: http://localhost:5000
echo.
echo Aguarde mais 5 segundos e acesse:
echo.
echo    👉 http://localhost:5000/dashboard
echo.
echo =========================================
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:5000/dashboard

echo.
echo Sistema rodando! Para parar:
echo - Feche as janelas do Backend e Frontend
echo - OU pressione Ctrl+C em cada terminal
echo.
pause
