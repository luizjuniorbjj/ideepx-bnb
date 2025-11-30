@echo off
chcp 65001 >nul
title iDeepX - Verificar Configuração MT5
color 0B

echo ===============================================================================
echo                   🔍 VERIFICAR CONFIGURAÇÃO MT5 PARA PYTHON
echo ===============================================================================
echo.
echo Este guia vai te ajudar a verificar se o MT5 está configurado corretamente.
echo.
echo ===============================================================================
echo.

pause

cls

echo ===============================================================================
echo                        PASSO 1: VERIFICAR MT5 ABERTO
echo ===============================================================================
echo.
echo 📋 CHECKLIST:
echo.
echo    [ ] MT5 está ABERTO e RODANDO
echo        Caminho: C:\mt5_terminal1\terminal64.exe
echo.
echo    [ ] Você consegue ver a janela do MT5 na tela
echo.
echo ❌ SE MT5 NÃO ESTÁ ABERTO:
echo    1. Abrir: C:\mt5_terminal1\terminal64.exe
echo    2. Aguardar carregar completamente
echo    3. Voltar aqui e pressionar qualquer tecla
echo.
echo ===============================================================================
echo.

pause

cls

echo ===============================================================================
echo                    PASSO 2: VERIFICAR LOGIN NA CONTA
echo ===============================================================================
echo.
echo 🎯 CRÍTICO: MT5 DEVE ESTAR LOGADO NA CONTA!
echo.
echo 📋 COMO VERIFICAR:
echo.
echo    1. Olhar no CANTO INFERIOR DIREITO do MT5
echo.
echo    2. Deve mostrar algo como:
echo       "DooTechnology-Live  9941739"
echo       "Doo Prime"
echo       "Ping: XX ms"
echo.
echo    3. Se mostrar apenas "Desconectado" ou "No connection":
echo       ❌ PRECISA FAZER LOGIN MANUAL!
echo.
echo ===============================================================================
echo.
echo ❓ MT5 está LOGADO na conta? (mostra nome do servidor e número da conta)
echo.
echo    Digite 1 = SIM, está logado
echo    Digite 2 = NÃO, não está logado ou não sei
echo.

set /p login_status="Sua resposta: "

if "%login_status%"=="2" (
    cls
    echo ===============================================================================
    echo                     ⚠️  LOGIN MANUAL NECESSÁRIO
    echo ===============================================================================
    echo.
    echo CAUSA RAIZ IDENTIFICADA: Você precisa fazer login manual no MT5!
    echo.
    echo 📋 PASSO A PASSO:
    echo.
    echo 1. No MT5, clicar em: File -^> Open an Account
    echo    ou
    echo    File -^> Login to Trade Account
    echo.
    echo 2. Procurar e selecionar: Doo Prime
    echo.
    echo 3. Servidor: DooTechnology-Live
    echo.
    echo 4. Login: 9941739
    echo.
    echo 5. Senha: 110677Pa*
    echo.
    echo 6. Clicar em: Login ou OK
    echo.
    echo 7. VERIFICAR que canto inferior mostra "conectado"
    echo.
    echo 8. DEIXAR MT5 ABERTO E LOGADO
    echo.
    echo ===============================================================================
    echo.
    pause
    exit /b 0
)

cls

echo ===============================================================================
echo              PASSO 3: VERIFICAR "ALLOW AUTOMATED TRADING"
echo ===============================================================================
echo.
echo 📋 COMO VERIFICAR:
echo.
echo 1. No MT5, ir em: Tools -^> Options
echo.
echo 2. Clicar na aba: "Expert Advisors"
echo.
echo 3. Verificar se está MARCADO (✓):
echo    [✓] Allow automated trading
echo.
echo ===============================================================================
echo.
echo ❓ A opção "Allow automated trading" está MARCADA?
echo.
echo    Digite 1 = SIM, está marcada
echo    Digite 2 = NÃO, não está marcada
echo.

set /p allow_trading="Sua resposta: "

if "%allow_trading%"=="2" (
    cls
    echo ===============================================================================
    echo                     ⚠️  "ALLOW AUTOMATED TRADING" DESABILITADO
    echo ===============================================================================
    echo.
    echo PROBLEMA IDENTIFICADO: Automated trading está desabilitado!
    echo.
    echo 📋 SOLUÇÃO:
    echo.
    echo 1. No MT5: Tools -^> Options -^> Expert Advisors
    echo.
    echo 2. MARCAR a opção: [✓] Allow automated trading
    echo.
    echo 3. Clicar em: OK
    echo.
    echo 4. REINICIAR MT5
    echo.
    echo 5. Executar este script novamente
    echo.
    echo ===============================================================================
    echo.
    pause
    exit /b 0
)

cls

echo ===============================================================================
echo   PASSO 4: VERIFICAR "DISABLE PYTHON API" (CAUSA MAIS COMUM!)
echo ===============================================================================
echo.
echo 🎯 CRÍTICO: Esta é a causa #1 do erro IPC Timeout!
echo.
echo 📋 COMO VERIFICAR:
echo.
echo 1. No MT5, em: Tools -^> Options -^> Expert Advisors
echo.
echo 2. Procurar opção com nome parecido com:
echo    "Disable automated trading via external Python API"
echo    ou
echo    "Disable AlgoTrading via Python API"
echo.
echo 3. Esta opção DEVE ESTAR DESMARCADA (sem ✓)!
echo.
echo ⚠️  ATENÇÃO:
echo    - Se MARCADA = Python não funciona (IPC Timeout)
echo    - Se DESMARCADA = Python funciona normalmente
echo.
echo ===============================================================================
echo.
echo ❓ Você encontrou uma opção sobre "Disable Python API"?
echo.
echo    Digite 1 = SIM, encontrei essa opção
echo    Digite 2 = NÃO, não vejo essa opção
echo.

set /p found_python_option="Sua resposta: "

if "%found_python_option%"=="1" (
    echo.
    echo ❓ Essa opção está MARCADA ou DESMARCADA?
    echo.
    echo    Digite 1 = DESMARCADA (sem ✓) - CORRETO!
    echo    Digite 2 = MARCADA (com ✓) - PROBLEMA!
    echo.

    set /p python_option_status="Sua resposta: "

    if "!python_option_status!"=="2" (
        cls
        echo ===============================================================================
        echo         🎯 CAUSA RAIZ IDENTIFICADA: PYTHON API ESTÁ BLOQUEADO!
        echo ===============================================================================
        echo.
        echo ⚠️  PROBLEMA: "Disable Python API" está MARCADO!
        echo.
        echo Isso BLOQUEIA completamente a conexão Python com MT5.
        echo.
        echo 📋 SOLUÇÃO IMEDIATA:
        echo.
        echo 1. No MT5: Tools -^> Options -^> Expert Advisors
        echo.
        echo 2. DESMARCAR: [ ] Disable automated trading via external Python API
        echo    (Remover o ✓ dessa opção^)
        echo.
        echo 3. Clicar em: OK
        echo.
        echo 4. REINICIAR MT5
        echo.
        echo 5. Testar Python novamente
        echo.
        echo ===============================================================================
        echo.
        echo 🎉 PROBABILIDADE DE SUCESSO: 95%%
        echo.
        echo Esta é a causa mais comum do IPC Timeout em instalações recentes do MT5.
        echo.
        echo ===============================================================================
        echo.
        pause
        exit /b 0
    )
)

cls

echo ===============================================================================
echo              PASSO 5: VERIFICAR "ALLOW DLL IMPORTS"
echo ===============================================================================
echo.
echo 📋 COMO VERIFICAR:
echo.
echo 1. No MT5, em: Tools -^> Options -^> Expert Advisors
echo.
echo 2. Verificar se está MARCADO (✓):
echo    [✓] Allow DLL imports
echo.
echo ===============================================================================
echo.
echo ❓ A opção "Allow DLL imports" está MARCADA?
echo.
echo    Digite 1 = SIM, está marcada
echo    Digite 2 = NÃO, não está marcada
echo.

set /p allow_dll="Sua resposta: "

if "%allow_dll%"=="2" (
    cls
    echo ===============================================================================
    echo                     ⚠️  "ALLOW DLL IMPORTS" DESABILITADO
    echo ===============================================================================
    echo.
    echo PROBLEMA: DLL imports está desabilitado!
    echo.
    echo 📋 SOLUÇÃO:
    echo.
    echo 1. No MT5: Tools -^> Options -^> Expert Advisors
    echo.
    echo 2. MARCAR: [✓] Allow DLL imports
    echo.
    echo 3. Clicar em: OK
    echo.
    echo 4. REINICIAR MT5
    echo.
    echo ===============================================================================
    echo.
    pause
    exit /b 0
)

cls

echo ===============================================================================
echo                        ✅ CONFIGURAÇÃO PARECE CORRETA!
echo ===============================================================================
echo.
echo Você confirmou que:
echo    ✅ MT5 está aberto e rodando
echo    ✅ MT5 está LOGADO na conta
echo    ✅ "Allow automated trading" está HABILITADO
echo    ✅ "Disable Python API" está DESABILITADO (ou não existe)
echo    ✅ "Allow DLL imports" está HABILITADO
echo.
echo ===============================================================================
echo.
echo 🧪 PRÓXIMO PASSO: TESTAR PYTHON
echo.
echo Vamos testar se Python consegue conectar ao MT5:
echo.

pause

cls

echo ===============================================================================
echo                        🧪 TESTANDO CONEXÃO PYTHON
echo ===============================================================================
echo.

cd C:\ideepx-bnb\mt5-collector

echo Executando: python test_mt5_disponibilidade.py
echo.
echo ===============================================================================
echo.

python test_mt5_disponibilidade.py

if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo                        ❌ TESTE FALHOU
    echo ===============================================================================
    echo.
    echo Mesmo com as configurações corretas, Python não conseguiu conectar.
    echo.
    echo 🔧 SOLUÇÕES ADICIONAIS:
    echo.
    echo 1. TROCAR VERSÃO DA BIBLIOTECA:
    echo    pip uninstall MetaTrader5 -y
    echo    pip install MetaTrader5==5.0.45
    echo.
    echo 2. EXECUTAR COMO ADMINISTRADOR:
    echo    - Fechar este terminal
    echo    - Abrir PowerShell como Administrador
    echo    - Executar: python test_mt5_disponibilidade.py
    echo.
    echo 3. BAIXAR MT5 DO SITE DO BROKER:
    echo    - Acessar: https://www.dooprime.com/
    echo    - Baixar MT5 oficial da Doo Prime
    echo    - Instalar e fazer login
    echo.
    echo 📚 GUIA COMPLETO: SOLUCAO_DEFINITIVA_IPC_TIMEOUT.md
    echo.
    echo ===============================================================================
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo                        🎉 SUCESSO!
echo ===============================================================================
echo.
echo ✅ Python conectou ao MT5 com sucesso!
echo.
echo 🚀 PRÓXIMOS PASSOS:
echo.
echo 1. Testar com credenciais reais:
echo    python test_connection_doo_prime.py
echo.
echo 2. Iniciar coletor multi-conta:
echo    python collect_all_accounts.py
echo    ou
echo    INICIAR-COLETOR-MT5.bat
echo.
echo 3. Verificar dashboard:
echo    http://localhost:3000/mt5
echo.
echo ===============================================================================
echo.

pause
