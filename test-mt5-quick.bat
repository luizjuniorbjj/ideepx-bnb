@echo off
REM ============================================================================
REM TESTE RÁPIDO - Sistema MT5 Multi-Conta
REM ============================================================================
REM Script para verificar se tudo está configurado corretamente
REM ============================================================================

echo.
echo ================================================================================
echo  TESTE RAPIDO - SISTEMA MT5
echo ================================================================================
echo.

REM ============================================================================
REM TESTE 1: Verificar MT5 Terminal instalado
REM ============================================================================

echo [1/7] Verificando MT5 Terminal...
if exist "C:\mt5_terminal1\terminal64.exe" (
    echo    [OK] MT5 Terminal instalado em: C:\mt5_terminal1
) else if exist "C:\Program Files\MetaTrader 5\terminal64.exe" (
    echo    [OK] MT5 Terminal instalado em: C:\Program Files\MetaTrader 5
) else (
    echo    [ERRO] MT5 Terminal NAO encontrado!
    echo    Esperado em: C:\mt5_terminal1\terminal64.exe
    echo    Ou em: C:\Program Files\MetaTrader 5\terminal64.exe
    echo    Baixe em: https://www.metatrader5.com/en/download
    echo.
    pause
    exit /b 1
)
echo.

REM ============================================================================
REM TESTE 2: Verificar Python
REM ============================================================================

echo [2/7] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python --version
    echo    [OK] Python instalado
) else (
    echo    [ERRO] Python NAO encontrado!
    echo    Baixe em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo.

REM ============================================================================
REM TESTE 3: Verificar venv do collector
REM ============================================================================

echo [3/7] Verificando venv do collector...
if exist "mt5-collector\venv\Scripts\activate.bat" (
    echo    [OK] Virtual environment criado
) else (
    echo    [AVISO] Virtual environment NAO criado
    echo    Criando agora...
    cd mt5-collector
    python -m venv venv
    cd ..
    echo    [OK] Virtual environment criado
)
echo.

REM ============================================================================
REM TESTE 4: Verificar dependencias Python
REM ============================================================================

echo [4/7] Verificando dependencias Python...
call mt5-collector\venv\Scripts\activate.bat
python -c "import MetaTrader5; print('   [OK] MetaTrader5 library:', MetaTrader5.__version__)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [AVISO] Dependencias NAO instaladas
    echo    Instalando agora...
    cd mt5-collector
    pip install -q -r requirements.txt
    cd ..
    echo    [OK] Dependencias instaladas
) else (
    echo    [OK] Dependencias instaladas
)
echo.

REM ============================================================================
REM TESTE 5: Verificar backend rodando
REM ============================================================================

echo [5/7] Verificando backend...
curl -s http://localhost:5001/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend rodando em http://localhost:5001
) else (
    echo    [AVISO] Backend NAO esta rodando
    echo    Execute em outro terminal: cd backend ^&^& npm run dev
)
echo.

REM ============================================================================
REM TESTE 6: Verificar frontend rodando
REM ============================================================================

echo [6/7] Verificando frontend...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Frontend rodando em http://localhost:3000
) else (
    echo    [AVISO] Frontend NAO esta rodando
    echo    Execute em outro terminal: cd frontend ^&^& npm run dev
)
echo.

REM ============================================================================
REM TESTE 7: Verificar ENCRYPTION_KEY
REM ============================================================================

echo [7/7] Verificando ENCRYPTION_KEY...

REM Verificar backend/.env
findstr /C:"ENCRYPTION_KEY" backend\.env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] ENCRYPTION_KEY encontrada em backend/.env
) else (
    echo    [AVISO] ENCRYPTION_KEY NAO encontrada em backend/.env
    echo    Gere com: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    echo    Adicione em backend/.env: ENCRYPTION_KEY=...
)

REM Verificar mt5-collector/.env
findstr /C:"ENCRYPTION_KEY" mt5-collector\.env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] ENCRYPTION_KEY encontrada em mt5-collector/.env
) else (
    echo    [AVISO] ENCRYPTION_KEY NAO encontrada em mt5-collector/.env
    echo    Copie a mesma key de backend/.env para mt5-collector/.env
)
echo.

REM ============================================================================
REM RESUMO
REM ============================================================================

echo ================================================================================
echo  RESUMO DO TESTE
echo ================================================================================
echo.
echo  Proximo passo: Executar teste de conexao MT5
echo.
echo  cd mt5-collector
echo  venv\Scripts\activate
echo  python test_mt5_connection.py
echo.
echo ================================================================================
echo  LINKS UTEIS
echo ================================================================================
echo.
echo  Dashboard MT5:    http://localhost:3000/mt5/dashboard
echo  Conectar Conta:   http://localhost:3000/mt5/connect
echo  Backend Health:   http://localhost:5001/api/health
echo.
echo  Guia Completo:    MT5_TESTING_GUIDE.md
echo  Instalacao:       MT5_INSTALLATION_GUIDE.md
echo  Sistema:          MT5_SYSTEM_GUIDE.md
echo.
echo ================================================================================
echo.

pause
