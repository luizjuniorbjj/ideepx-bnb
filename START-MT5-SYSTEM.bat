@echo off
REM ============================================================================
REM INICIAR SISTEMA MT5 COMPLETO
REM ============================================================================
REM Inicia Backend + Frontend + Collector em terminais separados
REM ============================================================================

echo.
echo ================================================================================
echo  INICIANDO SISTEMA MT5 MULTI-CONTA - iDeepX
echo ================================================================================
echo.

cd /d "%~dp0"

echo [1/3] Iniciando Backend (porta 5001)...
start "iDeepX Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Frontend (porta 3000)...
start "iDeepX Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando MT5 Collector (Python)...
start "MT5 Collector" cmd /k "cd mt5-collector && venv\Scripts\activate && python collector_pool.py"
timeout /t 2 /nobreak >nul

echo.
echo ================================================================================
echo  SISTEMA INICIADO!
echo ================================================================================
echo.
echo  3 terminais foram abertos:
echo  1. Backend      - http://localhost:5001
echo  2. Frontend     - http://localhost:3000
echo  3. MT5 Collector - Rodando em background
echo.
echo  Acesse o dashboard em: http://localhost:3000/mt5/dashboard
echo.
echo  Para PARAR tudo: Feche os 3 terminais que abriram
echo.
echo ================================================================================
echo.

REM Aguardar 5 segundos para tudo iniciar
timeout /t 5 /nobreak >nul

REM Abrir navegador no dashboard
echo Abrindo navegador...
start http://localhost:3000/mt5/dashboard

echo.
echo Pressione qualquer tecla para fechar este terminal...
pause >nul
