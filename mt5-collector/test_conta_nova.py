"""
🧪 TESTE DE CONEXÃO MT5 - CONTA NOVA
=====================================
Conta: 9942058
Servidor: DooTechnology-Live
"""

import MetaTrader5 as mt5
import os

# Configurações
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"
LOGIN = 9942058
SERVER = "DooTechnology-Live"
PASSWORD = "5cc41!eE"

print("=" * 80)
print("🧪 TESTE DE CONEXÃO MT5 - CONTA NOVA")
print("=" * 80)
print(f"📍 MT5 Path: {MT5_PATH}")
print(f"🏢 Servidor: {SERVER}")
print(f"👤 Login: {LOGIN}")
print("=" * 80)
print()

# 1. Inicializar MT5
print("🔧 Inicializando MT5...")
if not mt5.initialize(path=MT5_PATH):
    error = mt5.last_error()
    print(f"❌ ERRO ao inicializar MT5: {error}")
    exit(1)

print("✅ MT5 inicializado!")

# 2. Fazer login
print(f"\n🔐 Fazendo login em {LOGIN}@{SERVER}...")
if not mt5.login(login=LOGIN, password=PASSWORD, server=SERVER):
    error = mt5.last_error()
    print(f"❌ ERRO ao fazer login!")
    print(f"   Código: {error[0] if error else 'Desconhecido'}")
    print(f"   Mensagem: {error[1] if error and len(error) > 1 else 'Sem detalhes'}")
    print()
    print("⚠️  Possíveis causas:")
    print("   1. Credenciais incorretas")
    print("   2. Nome do servidor incorreto")
    print("   3. Conta não ativada ainda")
    mt5.shutdown()
    exit(1)

print("✅ Login realizado com sucesso!")

# 3. Obter informações da conta
print("\n📊 Coletando informações da conta...")
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
print(f"🎯 Alavancagem: 1:{account_info.leverage}")
print(f"💱 Moeda: {account_info.currency}")
print("=" * 80)

# 4. Verificar posições abertas
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

    print("\nDetalhes:")
    for i, pos in enumerate(positions, 1):
        tipo = "COMPRA" if pos.type == 0 else "VENDA"
        print(f"  {i}. {pos.symbol} - {tipo} - Vol: {pos.volume} - P/L: US$ {pos.profit:.2f}")

print("\n" + "=" * 80)
print("🎉 TESTE CONCLUÍDO COM SUCESSO!")
print("=" * 80)

# 5. Desconectar
mt5.shutdown()
print("\n🔌 Desconectado do MT5")
