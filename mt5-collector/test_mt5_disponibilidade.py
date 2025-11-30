"""
🔍 VERIFICADOR DE DISPONIBILIDADE MT5
=====================================
Verifica se o MT5 está rodando e respondendo antes de tentar conectar contas.

USO:
    python test_mt5_disponibilidade.py
"""

import MetaTrader5 as mt5
import os

MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"

print("=" * 80)
print("🔍 VERIFICADOR DE DISPONIBILIDADE MT5")
print("=" * 80)
print()

# 1. Verificar se executável existe
print("📁 Verificando se MT5 está instalado...")
if not os.path.exists(MT5_PATH):
    print(f"❌ ERRO: MT5 não encontrado em: {MT5_PATH}")
    print()
    print("⚠️  SOLUÇÃO:")
    print("   1. Verifique se MT5 está instalado nesse caminho")
    print("   2. Ou ajuste MT5_PATH no script")
    exit(1)

print(f"✅ MT5 encontrado: {MT5_PATH}")
print()

# 2. Tentar inicializar MT5
print("🔧 Tentando inicializar MT5...")
print()

if not mt5.initialize(path=MT5_PATH):
    error = mt5.last_error()
    print(f"❌ ERRO: MT5 não está respondendo!")
    print(f"   Código: {error[0] if error else 'Desconhecido'}")
    print(f"   Mensagem: {error[1] if error and len(error) > 1 else 'Sem detalhes'}")
    print()
    print("⚠️  CAUSAS COMUNS:")
    print()
    print("   1. ❌ MT5 NÃO ESTÁ ABERTO")
    print("      Solução: Abrir C:\\mt5_terminal1\\terminal64.exe")
    print()
    print("   2. ❌ 'Allow automated trading' NÃO ESTÁ HABILITADO")
    print("      Solução:")
    print("      a) Abrir MT5")
    print("      b) Ir em Tools → Options → Expert Advisors")
    print("      c) ✅ MARCAR 'Allow automated trading'")
    print("      d) ✅ MARCAR 'Allow DLL imports'")
    print("      e) Clicar em OK")
    print()
    print("   3. ❌ MT5 OCUPADO COM OUTRA CONEXÃO")
    print("      Solução: Fechar outras instâncias Python conectadas ao MT5")
    print()
    print("=" * 80)
    print("🔧 AÇÕES NECESSÁRIAS:")
    print("=" * 80)
    print("1. Abrir MT5")
    print("2. Habilitar 'Allow automated trading'")
    print("3. Deixar MT5 aberto")
    print("4. Executar este script novamente")
    print("=" * 80)
    exit(1)

print("✅ MT5 inicializado com sucesso!")
print()

# 3. Obter informações do MT5
try:
    version = mt5.version()
    print("=" * 80)
    print("✅ MT5 ESTÁ RODANDO E RESPONDENDO!")
    print("=" * 80)
    if version:
        print(f"📦 Versão MT5: {version[0]}")
        print(f"📅 Build: {version[1]}")
        print(f"📌 Build date: {version[2]}")
    print("=" * 80)
    print()
    print("🎉 TUDO PRONTO!")
    print()
    print("✅ Você pode agora:")
    print("   1. Testar conexão com conta: python test_connection_doo_prime.py")
    print("   2. Iniciar collector: python collect_all_accounts.py")
    print()
except Exception as e:
    print(f"⚠️  Aviso: Não foi possível obter versão: {e}")

finally:
    # 4. Desconectar
    mt5.shutdown()
    print("🔌 Desconectado do MT5")
