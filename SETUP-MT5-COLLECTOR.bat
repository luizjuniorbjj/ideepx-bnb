@echo off
REM ============================================================================
REM SETUP MT5 COLLECTOR - Configuracao Completa
REM ============================================================================

echo.
echo ================================================================================
echo  SETUP MT5 COLLECTOR - Configuracao Automatica
echo ================================================================================
echo.

cd /d "%~dp0"

REM ============================================================================
REM 1. Instalar dependencias Python
REM ============================================================================

echo [1/3] Instalando dependencias Python...
cd mt5-collector
call venv\Scripts\activate.bat
echo    Instalando MetaTrader5, cryptography, pywin32...
pip install -q -r requirements.txt
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Dependencias instaladas (incluindo pywin32 para modo background)
) else (
    echo    [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)
cd ..
echo.

REM ============================================================================
REM 2. Gerar ENCRYPTION_KEY
REM ============================================================================

echo [2/3] Gerando ENCRYPTION_KEY...
python generate-encryption-key.py
if %ERRORLEVEL% EQU 0 (
    echo    [OK] ENCRYPTION_KEY configurada
) else (
    echo    [ERRO] Falha ao gerar ENCRYPTION_KEY
    pause
    exit /b 1
)
echo.

REM ============================================================================
REM 3. Testar conexao MT5
REM ============================================================================

echo [3/3] Testando conexao MT5...
cd mt5-collector
call venv\Scripts\activate.bat
python test_mt5_connection.py
cd ..
echo.

echo ================================================================================
echo  SETUP CONCLUIDO!
echo ================================================================================
echo.
echo Proximos passos:
echo  1. Criar conta demo MT5 (se ainda nao tiver)
echo  2. Executar: START-MT5-SYSTEM.bat
echo  3. Acessar: http://localhost:3000/mt5/connect
echo.
echo ================================================================================
echo.

pause
