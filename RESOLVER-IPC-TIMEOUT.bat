@echo off
chcp 65001 >nul
title iDeepX - Resolver IPC Timeout MT5
color 0E

echo ===============================================================================
echo                   🔧 RESOLVER PROBLEMA IPC TIMEOUT MT5
echo ===============================================================================
echo.
echo Este script vai tentar resolver o problema de IPC Timeout automaticamente.
echo.
echo 📋 O QUE SERÁ FEITO:
echo    1. Desinstalar biblioteca MetaTrader5 atual
echo    2. Limpar cache do pip
echo    3. Instalar versão específica MetaTrader5==5.0.45 (mais estável)
echo    4. Testar conexão
echo.
echo ===============================================================================
echo.

pause

echo.
echo 🔧 ETAPA 1/4: Desinstalando MetaTrader5 atual...
echo ===============================================================================
cd C:\ideepx-bnb\mt5-collector
python -m pip uninstall MetaTrader5 -y

if errorlevel 1 (
    echo ⚠️  Aviso: Erro ao desinstalar, mas continuando...
) else (
    echo ✅ Desinstalado com sucesso
)

echo.
echo 🔧 ETAPA 2/4: Limpando cache do pip...
echo ===============================================================================
python -m pip cache purge

if errorlevel 1 (
    echo ⚠️  Aviso: Erro ao limpar cache, mas continuando...
) else (
    echo ✅ Cache limpo
)

echo.
echo 🔧 ETAPA 3/4: Instalando MetaTrader5==5.0.45...
echo ===============================================================================
python -m pip install MetaTrader5==5.0.45

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao instalar MetaTrader5!
    echo.
    echo TENTE MANUALMENTE:
    echo    1. Abrir PowerShell COMO ADMINISTRADOR
    echo    2. cd C:\ideepx-bnb\mt5-collector
    echo    3. python -m pip install MetaTrader5==5.0.45
    echo.
    pause
    exit /b 1
)

echo ✅ MetaTrader5==5.0.45 instalado com sucesso

echo.
echo 🔧 ETAPA 4/4: Testando conexão com MT5...
echo ===============================================================================
echo.
echo ⚠️  IMPORTANTE: Verifique que o MT5 está ABERTO antes de prosseguir!
echo    - Abrir: C:\mt5_terminal1\terminal64.exe
echo    - Deixar rodando em segundo plano
echo.

pause

echo.
echo 🧪 Executando teste de disponibilidade...
echo.

python test_mt5_disponibilidade.py

if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo ❌ AINDA NÃO FUNCIONOU
    echo ===============================================================================
    echo.
    echo PRÓXIMAS TENTATIVAS:
    echo.
    echo 1️⃣ EXECUTAR COMO ADMINISTRADOR:
    echo    - Fechar este terminal
    echo    - Clicar com botão direito neste .bat
    echo    - "Executar como administrador"
    echo.
    echo 2️⃣ VERIFICAR ANTIVÍRUS:
    echo    - Desabilitar temporariamente
    echo    - Executar novamente
    echo.
    echo 3️⃣ MT5 NÃO COMO ADMIN:
    echo    - Fechar MT5
    echo    - Propriedades do terminal64.exe
    echo    - Desmarcar "Executar como administrador"
    echo    - Abrir MT5 normalmente
    echo.
    echo 4️⃣ TESTAR VERSÃO 32-BIT:
    echo    - Editar scripts Python
    echo    - Trocar terminal64.exe por terminal.exe
    echo.
    echo ===============================================================================
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo ✅ PROBLEMA RESOLVIDO!
echo ===============================================================================
echo.
echo 🎉 MT5 está respondendo corretamente!
echo.
echo PRÓXIMOS PASSOS:
echo    1. Testar conexão com conta: python test_connection_doo_prime.py
echo    2. Iniciar coletor: python collect_all_accounts.py
echo    3. Ou usar: INICIAR-COLETOR-MT5.bat
echo.
echo ===============================================================================
pause
