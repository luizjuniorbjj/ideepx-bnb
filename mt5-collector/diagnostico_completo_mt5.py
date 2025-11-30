"""
🔍 DIAGNÓSTICO COMPLETO MT5 - IPC TIMEOUT
==========================================
Este script tenta várias abordagens para identificar o problema do IPC Timeout.

Executa:
1. Verificação de versão da biblioteca MetaTrader5
2. Teste com terminal64.exe (64-bit)
3. Teste com terminal.exe (32-bit)
4. Verificação de processos MT5 rodando
5. Teste de permissões
6. Análise de logs detalhados
"""

import MetaTrader5 as mt5
import os
import sys
import subprocess
import psutil

print("=" * 80)
print("🔍 DIAGNÓSTICO COMPLETO - PROBLEMA IPC TIMEOUT MT5")
print("=" * 80)
print()

# ============================================================================
# 1. VERIFICAR VERSÃO DA BIBLIOTECA METATRADER5
# ============================================================================
print("📦 1. VERIFICANDO VERSÃO DA BIBLIOTECA METATRADER5")
print("-" * 80)

try:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "show", "MetaTrader5"],
        capture_output=True,
        text=True
    )

    for line in result.stdout.split('\n'):
        if 'Version' in line or 'Location' in line:
            print(f"   {line}")
    print()
except Exception as e:
    print(f"⚠️  Erro ao verificar versão: {e}")
    print()

# ============================================================================
# 2. VERIFICAR SE MT5 ESTÁ RODANDO
# ============================================================================
print("🔍 2. VERIFICANDO SE MT5 ESTÁ RODANDO")
print("-" * 80)

mt5_processes = []
for proc in psutil.process_iter(['pid', 'name', 'exe']):
    try:
        if proc.info['name'] and 'terminal' in proc.info['name'].lower():
            mt5_processes.append({
                'pid': proc.info['pid'],
                'name': proc.info['name'],
                'exe': proc.info['exe']
            })
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        pass

if mt5_processes:
    print(f"✅ Encontrados {len(mt5_processes)} processo(s) MT5 rodando:")
    for i, proc in enumerate(mt5_processes, 1):
        print(f"   {i}. PID: {proc['pid']}")
        print(f"      Nome: {proc['name']}")
        print(f"      Caminho: {proc['exe']}")
        print()
else:
    print("❌ NENHUM PROCESSO MT5 ENCONTRADO!")
    print("   SOLUÇÃO: Abrir C:\\mt5_terminal1\\terminal64.exe")
    print()

# ============================================================================
# 3. TESTAR COM TERMINAL64.EXE (64-BIT)
# ============================================================================
print("🧪 3. TESTANDO CONEXÃO COM TERMINAL64.EXE (64-BIT)")
print("-" * 80)

MT5_PATH_64 = r"C:\mt5_terminal1\terminal64.exe"

if os.path.exists(MT5_PATH_64):
    print(f"✅ Encontrado: {MT5_PATH_64}")
    print(f"   Tamanho: {os.path.getsize(MT5_PATH_64):,} bytes")
    print()

    print("   Tentando inicializar...")
    if mt5.initialize(path=MT5_PATH_64):
        print("   ✅ SUCESSO! MT5 inicializado com terminal64.exe")

        try:
            version = mt5.version()
            if version:
                print(f"   📦 Versão MT5: {version[0]}")
                print(f"   📅 Build: {version[1]}")
                print(f"   📌 Build date: {version[2]}")
        except Exception as e:
            print(f"   ⚠️  Erro ao obter versão: {e}")

        mt5.shutdown()
        print("   🔌 Desconectado")
        print()
        print("=" * 80)
        print("✅ PROBLEMA RESOLVIDO! MT5 ESTÁ FUNCIONANDO COM TERMINAL64.EXE")
        print("=" * 80)
        sys.exit(0)
    else:
        error = mt5.last_error()
        print(f"   ❌ FALHOU!")
        print(f"   Código: {error[0] if error else 'Desconhecido'}")
        print(f"   Mensagem: {error[1] if error and len(error) > 1 else 'Sem detalhes'}")
        print()
else:
    print(f"❌ NÃO ENCONTRADO: {MT5_PATH_64}")
    print()

# ============================================================================
# 4. TESTAR COM TERMINAL.EXE (32-BIT)
# ============================================================================
print("🧪 4. TESTANDO CONEXÃO COM TERMINAL.EXE (32-BIT)")
print("-" * 80)

MT5_PATH_32 = r"C:\mt5_terminal1\terminal.exe"

if os.path.exists(MT5_PATH_32):
    print(f"✅ Encontrado: {MT5_PATH_32}")
    print(f"   Tamanho: {os.path.getsize(MT5_PATH_32):,} bytes")
    print()

    print("   Tentando inicializar...")
    if mt5.initialize(path=MT5_PATH_32):
        print("   ✅ SUCESSO! MT5 inicializado com terminal.exe (32-bit)")

        try:
            version = mt5.version()
            if version:
                print(f"   📦 Versão MT5: {version[0]}")
                print(f"   📅 Build: {version[1]}")
                print(f"   📌 Build date: {version[2]}")
        except Exception as e:
            print(f"   ⚠️  Erro ao obter versão: {e}")

        mt5.shutdown()
        print("   🔌 Desconectado")
        print()
        print("=" * 80)
        print("✅ PROBLEMA RESOLVIDO! MT5 FUNCIONA COM TERMINAL.EXE (32-BIT)")
        print("=" * 80)
        print()
        print("⚠️  AÇÃO NECESSÁRIA:")
        print("   Atualizar todos os scripts para usar:")
        print(f"   MT5_PATH = r\"{MT5_PATH_32}\"")
        sys.exit(0)
    else:
        error = mt5.last_error()
        print(f"   ❌ FALHOU!")
        print(f"   Código: {error[0] if error else 'Desconhecido'}")
        print(f"   Mensagem: {error[1] if error and len(error) > 1 else 'Sem detalhes'}")
        print()
else:
    print(f"❌ NÃO ENCONTRADO: {MT5_PATH_32}")
    print()

# ============================================================================
# 5. TESTAR SEM ESPECIFICAR CAMINHO
# ============================================================================
print("🧪 5. TESTANDO CONEXÃO SEM ESPECIFICAR CAMINHO (AUTO-DETECT)")
print("-" * 80)

print("   Tentando mt5.initialize() sem parâmetros...")
if mt5.initialize():
    print("   ✅ SUCESSO! MT5 conectou automaticamente")

    try:
        version = mt5.version()
        if version:
            print(f"   📦 Versão MT5: {version[0]}")
            print(f"   📅 Build: {version[1]}")
            print(f"   📌 Build date: {version[2]}")
    except Exception as e:
        print(f"   ⚠️  Erro ao obter versão: {e}")

    mt5.shutdown()
    print("   🔌 Desconectado")
    print()
    print("=" * 80)
    print("✅ PROBLEMA RESOLVIDO! MT5 FUNCIONA COM AUTO-DETECT")
    print("=" * 80)
    print()
    print("⚠️  AÇÃO NECESSÁRIA:")
    print("   Atualizar todos os scripts para usar:")
    print("   mt5.initialize()  # Sem especificar path")
    sys.exit(0)
else:
    error = mt5.last_error()
    print(f"   ❌ FALHOU!")
    print(f"   Código: {error[0] if error else 'Desconhecido'}")
    print(f"   Mensagem: {error[1] if error and len(error) > 1 else 'Sem detalhes'}")
    print()

# ============================================================================
# 6. VERIFICAR PERMISSÕES
# ============================================================================
print("🔐 6. VERIFICANDO PERMISSÕES")
print("-" * 80)

import ctypes

try:
    is_admin = ctypes.windll.shell32.IsUserAnAdmin()
    if is_admin:
        print("✅ Script está rodando como ADMINISTRADOR")
    else:
        print("⚠️  Script NÃO está rodando como Administrador")
        print("   TENTE: Abrir PowerShell como Administrador e rodar novamente")
    print()
except Exception as e:
    print(f"⚠️  Erro ao verificar permissões: {e}")
    print()

# ============================================================================
# CONCLUSÃO
# ============================================================================
print("=" * 80)
print("❌ PROBLEMA NÃO RESOLVIDO")
print("=" * 80)
print()
print("SITUAÇÃO:")
print("- MT5 parece estar rodando (processos encontrados)")
print("- Biblioteca MetaTrader5 instalada")
print("- NENHUMA abordagem de conexão funcionou")
print()
print("POSSÍVEIS CAUSAS:")
print()
print("1. 🔒 ANTIVÍRUS/FIREWALL bloqueando IPC")
print("   Solução: Desabilitar temporariamente e testar")
print()
print("2. 🔧 VERSÃO INCOMPATÍVEL da biblioteca MetaTrader5")
print("   Solução:")
print("   pip uninstall MetaTrader5 -y")
print("   pip install MetaTrader5==5.0.45")
print()
print("3. 🖥️  MT5 rodando como Administrador (e Python não)")
print("   Solução:")
print("   - Fechar MT5")
print("   - Desmarcar 'Executar como administrador' nas propriedades")
print("   - Abrir MT5 normalmente")
print()
print("4. 🐛 PROBLEMA CONHECIDO com esta versão do MT5")
print("   Solução: Atualizar MT5 para versão mais recente")
print()
print("5. 🔌 MT5 não tem 'Allow algorithmic trading' habilitado")
print("   Solução:")
print("   - Tools → Options → Expert Advisors")
print("   - ✅ Allow automated trading")
print("   - ✅ Allow DLL imports")
print()
print("PRÓXIMOS PASSOS:")
print("1. Executar este script COMO ADMINISTRADOR")
print("2. Se não resolver, tentar versão específica: MetaTrader5==5.0.45")
print("3. Se não resolver, verificar antivírus")
print("=" * 80)
