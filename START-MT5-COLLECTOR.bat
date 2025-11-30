@echo off
chcp 65001 >nul
title iDeepX MT5 Collector

echo ================================================
echo 🤖 iDeepX MT5 Collector - Iniciador
echo ================================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo    Instale Python 3.8+ em: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verificar se MetaTrader5 está instalado
python -c "import MetaTrader5" 2>nul
if errorlevel 1 (
    echo ⚠️  MetaTrader5 library não encontrada!
    echo    Instalando dependências...
    echo.
    cd mt5-collector
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependências instaladas!
    echo.
)

REM Buscar ID da conta no banco de dados
echo 🔍 Buscando contas MT5 no banco de dados...
echo.

cd backend
node check-mt5-accounts.cjs > temp_accounts.txt 2>&1
if errorlevel 1 (
    echo ❌ Erro ao buscar contas!
    type temp_accounts.txt
    del temp_accounts.txt
    pause
    exit /b 1
)

REM Extrair ID da primeira conta (linha que contém "ID:")
for /f "tokens=2 delims=: " %%i in ('findstr /C:"ID:" temp_accounts.txt') do (
    set ACCOUNT_ID=%%i
    goto :found
)

:found
del temp_accounts.txt

if "%ACCOUNT_ID%"=="" (
    echo ❌ Nenhuma conta MT5 encontrada no banco de dados!
    echo.
    echo 💡 Conecte uma conta primeiro em: http://localhost:3001/mt5/connect
    pause
    exit /b 1
)

echo ✅ Conta encontrada: %ACCOUNT_ID%
echo.

cd ..

REM Iniciar coletor
echo 🚀 Iniciando coletor MT5...
echo ⏰ Coleta a cada 30 segundos
echo 🛑 Pressione Ctrl+C para parar
echo.
echo ================================================
echo.

python mt5-collector\mt5_collector.py %ACCOUNT_ID%

pause
