# -*- coding: utf-8 -*-
"""
Teste rápido de conexão MT5
"""
import MetaTrader5 as mt5
import sys

# Credenciais GMI Edge
LOGIN = 32650016
PASSWORD = "R8h@YXjPq"
SERVER = "GMI3-Real"

print("\n🧪 TESTE DE CONEXÃO MT5")
print("=" * 50)
print(f"Login: {LOGIN}")
print(f"Server: {SERVER}")
print()

# Inicializar MT5
print("🔌 Inicializando MT5...")
if not mt5.initialize(path=r"C:\mt5_terminal1\terminal64.exe"):
    error = mt5.last_error()
    print(f"❌ Erro ao inicializar: {error}")
    sys.exit(1)

print("✅ MT5 inicializado")

# Tentar login
print(f"\n🔐 Tentando login no {SERVER}...")
authorized = mt5.login(
    login=LOGIN,
    password=PASSWORD,
    server=SERVER
)

if not authorized:
    error = mt5.last_error()
    print(f"❌ Falha no login: {error}")
    print()
    print("Possíveis causas:")
    print("- Conta demo expirada")
    print("- Servidor indisponível")
    print("- Credenciais incorretas")
    print("- Firewall bloqueando conexão")
    mt5.shutdown()
    sys.exit(1)

print("✅ Login bem-sucedido!")

# Info da conta
account_info = mt5.account_info()
if account_info:
    print("\n📊 Informações da conta:")
    print(f"   Balance: ${account_info.balance:.2f}")
    print(f"   Equity: ${account_info.equity:.2f}")
    print(f"   Margin: ${account_info.margin:.2f}")
    print(f"   Free Margin: ${account_info.margin_free:.2f}")
    print(f"   Margin Level: {account_info.margin_level:.2f}%")
else:
    print("⚠️  Não foi possível obter informações da conta")

# Posições abertas
positions = mt5.positions_get()
print(f"\n💹 Posições abertas: {len(positions) if positions else 0}")

mt5.shutdown()
print("\n✅ TESTE CONCLUÍDO!\n")
