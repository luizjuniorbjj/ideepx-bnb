@echo off
chcp 65001 >nul
title Iniciar MT5 Terminal em Background

echo ================================================
echo 🚀 iDeepX - Iniciar MT5 Terminal
echo ================================================
echo.

REM Caminho do MT5
set MT5_PATH=C:\mt5_terminal1\terminal64.exe

echo 📂 Verificando MT5 em: %MT5_PATH%
echo.

if not exist "%MT5_PATH%" (
    echo ❌ MT5 não encontrado em: %MT5_PATH%
    echo    Verifique o caminho e tente novamente.
    pause
    exit /b 1
)

echo ✅ MT5 encontrado!
echo.

echo 🔌 Iniciando MT5 em background (minimizado)...
echo.

REM Iniciar MT5 minimizado
start /min "" "%MT5_PATH%"

echo ✅ MT5 iniciado com sucesso!
echo.
echo 💡 O MT5 está rodando em background.
echo    Você pode minimizar este terminal.
echo.
echo ⚠️  IMPORTANTE:
echo    - NÃO feche o MT5 (ele precisa estar rodando)
echo    - Faça login com sua conta MT5
echo    - Depois conecte a conta em: http://localhost:3001/mt5/connect
echo.

pause
