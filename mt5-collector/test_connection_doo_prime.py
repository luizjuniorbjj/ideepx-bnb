"""
🧪 TESTE RÁPIDO DE CONEXÃO MT5
================================
Testa conexão com a conta Doo Prime fornecida.

Credenciais de teste:
- Corretora: Doo Prime
- Conta: 9941739
- Servidor: DooTechnology-Live
- Senha: 110677Pa*
"""

import MetaTrader5 as mt5
import os

# Configurações
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"
LOGIN = 9941739
SERVER = "DooTechnology-Live"
PASSWORD = "110677Pa*"

print("=" * 80)
print("🧪 TESTE DE CONEXÃO MT5 - DOO PRIME")
print("=" * 80)
print(f"📍 MT5 Path: {MT5_PATH}")
print(f"🏢 Servidor: {SERVER}")
print(f"👤 Login: {LOGIN}")
print("=" * 80)
print()

# 1. Verificar se MT5 existe
if not os.path.exists(MT5_PATH):
    print(f"❌ ERRO: MetaTrader 5 não encontrado em: {MT5_PATH}")
    print("   Verifique o caminho da instalação.")
    exit(1)
else:
    print(f"✅ MT5 encontrado: {MT5_PATH}")

# 2. Inicializar MT5
print("\n🔧 Inicializando MT5...")
if not mt5.initialize(path=MT5_PATH):
    error = mt5.last_error()
    print(f"❌ ERRO ao inicializar MT5: {error}")
    print("   Código:", error[0] if error else "Desconhecido")
    print("   Mensagem:", error[1] if error and len(error) > 1 else "Sem detalhes")
    exit(1)

print("✅ MT5 inicializado com sucesso!")

# 3. Fazer login
print(f"\n🔐 Fazendo login em {LOGIN}@{SERVER}...")
if not mt5.login(login=LOGIN, password=PASSWORD, server=SERVER):
    error = mt5.last_error()
    print(f"❌ ERRO ao fazer login: {error}")
    print("   Código:", error[0] if error else "Desconhecido")
    print("   Mensagem:", error[1] if error and len(error) > 1 else "Sem detalhes")
    print("\n⚠️  Possíveis causas:")
    print("   1. Credenciais incorretas (login/senha)")
    print("   2. Nome do servidor incorreto")
    print("   3. Servidor offline ou inacessível")
    print("   4. Conta bloqueada/desativada")
    mt5.shutdown()
    exit(1)

print("✅ Login realizado com sucesso!")

# 4. Obter informações da conta
print("\n📊 Coletando informações da conta...")
try:
    account_info = mt5.account_info()

    if not account_info:
        print("❌ ERRO: Não foi possível obter informações da conta")
        mt5.shutdown()
        exit(1)

    print("\n" + "=" * 80)
    print("✅ DADOS DA CONTA COLETADOS COM SUCESSO!")
    print("=" * 80)
    print(f"👤 Nome: {account_info.name}")
    print(f"🏢 Servidor: {account_info.server}")
    print(f"🆔 Login: {account_info.login}")
    print(f"💰 Saldo: US$ {account_info.balance:.2f}")
    print(f"📈 Equity: US$ {account_info.equity:.2f}")
    print(f"📊 Margem: US$ {account_info.margin:.2f}")
    print(f"💵 Margem Livre: US$ {account_info.margin_free:.2f}")
    print(f"📉 Nível de Margem: {account_info.margin_level:.2f}%" if account_info.margin_level else "N/A")
    print(f"🎯 Alavancagem: 1:{account_info.leverage}")
    print(f"💱 Moeda: {account_info.currency}")
    print("=" * 80)

    # 5. Obter posições abertas
    print("\n📍 Verificando posições abertas...")
    positions = mt5.positions_get()

    if positions is None:
        print("⚠️  Erro ao obter posições")
    elif len(positions) == 0:
        print("✅ Nenhuma posição aberta")
    else:
        print(f"✅ {len(positions)} posição(ões) aberta(s)")
        total_profit = sum([pos.profit for pos in positions])
        print(f"💹 Lucro/Prejuízo Total: US$ {total_profit:.2f}")

        print("\nDetalhes das posições:")
        for i, pos in enumerate(positions, 1):
            print(f"  {i}. {pos.symbol} - {pos.type_str} - Volume: {pos.volume} - P/L: US$ {pos.profit:.2f}")

    print("\n" + "=" * 80)
    print("🎉 TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 80)
    print("\n✅ A conta pode ser conectada e os dados podem ser coletados!")
    print("✅ O collector deve funcionar corretamente com esta conta.")

except Exception as e:
    print(f"❌ EXCEÇÃO ao coletar dados: {e}")
    import traceback
    traceback.print_exc()

finally:
    # 6. Desconectar
    print("\n🔌 Desconectando do MT5...")
    mt5.shutdown()
    print("✅ Desconectado!")
