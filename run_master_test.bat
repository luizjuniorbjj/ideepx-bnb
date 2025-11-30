@echo off
REM ====================================================================
REM  Master Test Bot V10 - Script de Execução
REM ====================================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║       🤖 MASTER TEST BOT V10 - iDeepXCoreV10               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar se .env existe
if not exist ".env" (
    echo ❌ Arquivo .env nao encontrado!
    echo.
    echo Por favor crie um arquivo .env com:
    echo   CONTRACT_V10_ADDRESS=0x...
    echo   USDT_ADDRESS=0x...
    echo   RPC_URL=https://...
    echo   PRIVATE_KEY=0x...
    echo   CHAIN_ID=97
    echo.
    pause
    exit /b 1
)

echo 📋 Carregando configuração do .env...
echo.

REM Executar bot
python master_test_bot_v10.py

echo.
echo ====================================================================
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Testes concluídos com sucesso!
    echo 📄 Relatórios salvos em test_logs/
) else (
    echo ❌ Testes falharam ou vulnerabilidades encontradas!
    echo 📄 Verifique os logs em test_logs/
)
echo.
pause
