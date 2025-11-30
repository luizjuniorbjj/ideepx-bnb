@echo off
chcp 65001 >nul
title iDeepX - Iniciar Coletor MT5
color 0A

echo ===============================================================================
echo                   🤖 iDeepX - SISTEMA DE COLETA MT5
echo ===============================================================================
echo.
echo 📋 CHECKLIST PRÉ-EXECUÇÃO:
echo.
echo    [ ] MetaTrader 5 está ABERTO em: C:\mt5_terminal1\terminal64.exe
echo    [ ] "Allow automated trading" está HABILITADO
echo    [ ] "Allow DLL imports" está HABILITADO
echo    [ ] Pelo menos 1 conta MT5 conectada no banco de dados
echo.
echo ===============================================================================
echo.

pause

echo.
echo 🔍 Verificando disponibilidade do MT5...
echo.

cd C:\ideepx-bnb\mt5-collector
python test_mt5_disponibilidade.py

if errorlevel 1 (
    echo.
    echo ❌ MT5 não está disponível! Leia as instruções acima.
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo 🚀 INICIANDO COLETOR MULTI-CONTA
echo ===============================================================================
echo.
echo ⏰ Intervalo de coleta: 30 segundos
echo 🔄 O coletor irá coletar dados de TODAS as contas no banco
echo 🛑 Pressione Ctrl+C para parar
echo.
echo ===============================================================================
echo.

python collect_all_accounts.py

echo.
echo ===============================================================================
echo 🛑 Coletor encerrado
echo ===============================================================================
echo.

pause
