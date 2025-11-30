# -*- coding: utf-8 -*-
"""
🔍 DEBUG COMPLETO DO COLETOR MT5
================================
Este script testa CADA ETAPA do coletor para identificar onde está falhando.
"""

import MetaTrader5 as mt5
import requests
import json
import sys
from datetime import datetime

# ==========================================
# CONFIGURAÇÕES
# ==========================================

BACKEND_URL = "http://localhost:5001"
ACCOUNT_ID = "83afde98-e5d6-49cb-ad58-6d231c71aff4"

print("\n" + "="*70)
print("🔍 DEBUG COMPLETO - MT5 COLLECTOR")
print("="*70)
print(f"Backend URL: {BACKEND_URL}")
print(f"Account ID: {ACCOUNT_ID}")
print(f"Timestamp: {datetime.now()}\n")

# ==========================================
# TESTE 1: Buscar credenciais do backend
# ==========================================
print("📋 TESTE 1: Buscar credenciais do backend")
print("-" * 70)

try:
    url = f"{BACKEND_URL}/api/mt5/credentials/{ACCOUNT_ID}"
    print(f"🌐 GET {url}")

    response = requests.get(url, timeout=10)
    print(f"📥 Status: {response.status_code}")

    if response.status_code == 200:
        credentials = response.json()
        print(f"✅ Credenciais obtidas:")
        print(f"   ID: {credentials.get('id')}")
        print(f"   Login: {credentials.get('login')}")
        print(f"   Server: {credentials.get('server')}")
        print(f"   Platform: {credentials.get('platform')}")
        print(f"   Password: {'*' * len(credentials.get('password', ''))}")
    else:
        print(f"❌ Erro ao buscar credenciais: {response.text}")
        sys.exit(1)

except Exception as e:
    print(f"❌ Exceção ao buscar credenciais: {e}")
    sys.exit(1)

print()

# ==========================================
# TESTE 2: Inicializar MT5
# ==========================================
print("📋 TESTE 2: Inicializar MT5")
print("-" * 70)

mt5_path = r"C:\mt5_terminal1\terminal64.exe"
print(f"🔌 Caminho: {mt5_path}")

if not mt5.initialize(path=mt5_path):
    error = mt5.last_error()
    print(f"❌ Falha ao inicializar MT5: {error}")
    sys.exit(1)

print(f"✅ MT5 inicializado com sucesso")
print()

# ==========================================
# TESTE 3: Verificar sessão existente
# ==========================================
print("📋 TESTE 3: Verificar sessão MT5 existente")
print("-" * 70)

existing_account = mt5.account_info()

if existing_account is not None:
    print(f"✅ Sessão MT5 detectada:")
    print(f"   Login: {existing_account.login}")
    print(f"   Server: {existing_account.server}")
    print(f"   Balance: ${existing_account.balance:.2f}")
    print(f"   Equity: ${existing_account.equity:.2f}")
    print(f"   Margin: ${existing_account.margin:.2f}")
    print(f"   Free Margin: ${existing_account.margin_free:.2f}")

    if existing_account.login == int(credentials['login']):
        print(f"✅ Sessão corresponde à conta desejada ({credentials['login']})")
        use_existing = True
    else:
        print(f"⚠️  Sessão é de outra conta (esperado: {credentials['login']}, atual: {existing_account.login})")
        use_existing = False
else:
    print(f"⚠️  Nenhuma sessão MT5 ativa detectada")
    use_existing = False

print()

# ==========================================
# TESTE 4: Tentar login (se necessário)
# ==========================================
if not use_existing:
    print("📋 TESTE 4: Tentar login no MT5")
    print("-" * 70)

    login = int(credentials['login'])
    password = credentials['password']
    server = credentials['server']

    print(f"🔐 Login: {login}")
    print(f"🔐 Server: {server}")
    print(f"🔐 Password: {'*' * len(password)}")

    authorized = mt5.login(
        login=login,
        password=password,
        server=server
    )

    if not authorized:
        error = mt5.last_error()
        print(f"❌ Falha no login: {error}")

        # Verifica se sessão existe mesmo após falha
        check_account = mt5.account_info()
        if check_account and check_account.login == login:
            print(f"✅ Login falhou MAS sessão já está ativa - continuando...")
        else:
            mt5.shutdown()
            sys.exit(1)
    else:
        print(f"✅ Login bem-sucedido!")

    print()

# ==========================================
# TESTE 5: Coletar dados da conta
# ==========================================
print("📋 TESTE 5: Coletar dados da conta MT5")
print("-" * 70)

account_info = mt5.account_info()

if account_info is None:
    print(f"❌ Erro ao obter informações da conta")
    mt5.shutdown()
    sys.exit(1)

print(f"✅ Dados coletados:")
print(f"   Balance: ${account_info.balance:.2f}")
print(f"   Equity: ${account_info.equity:.2f}")
print(f"   Margin: ${account_info.margin:.2f}")
print(f"   Free Margin: ${account_info.margin_free:.2f}")
print(f"   Margin Level: {account_info.margin_level:.2f}%")

# Posições abertas
positions = mt5.positions_get()
open_trades = len(positions) if positions else 0
open_pl = sum([pos.profit for pos in positions]) if positions else 0.0

print(f"   Open Trades: {open_trades}")
print(f"   Open P/L: ${open_pl:.2f}")

print()

# ==========================================
# TESTE 6: Preparar dados para sincronização
# ==========================================
print("📋 TESTE 6: Preparar dados para sincronização")
print("-" * 70)

sync_data = {
    'accountId': ACCOUNT_ID,
    'balance': float(account_info.balance),
    'equity': float(account_info.equity),
    'margin': float(account_info.margin),
    'freeMargin': float(account_info.margin_free),
    'marginLevel': float(account_info.margin_level if account_info.margin > 0 else 0),
    'openTrades': open_trades,
    'openPL': float(open_pl),
    'dayPL': 0.0,    # Simplificado para teste
    'weekPL': 0.0,   # Simplificado para teste
    'monthPL': 0.0,  # Simplificado para teste
    'totalPL': float(account_info.equity - account_info.balance)
}

print(f"✅ Dados preparados:")
print(json.dumps(sync_data, indent=2))
print()

# ==========================================
# TESTE 7: Enviar dados para backend
# ==========================================
print("📋 TESTE 7: Enviar dados para backend")
print("-" * 70)

try:
    url = f"{BACKEND_URL}/api/mt5/sync"
    print(f"🌐 POST {url}")
    print(f"📤 Payload:")
    print(json.dumps(sync_data, indent=2))

    response = requests.post(url, json=sync_data, timeout=10)
    print(f"\n📥 Status: {response.status_code}")
    print(f"📥 Response: {response.text}")

    if response.status_code == 200:
        print(f"\n✅ SUCESSO! Dados sincronizados com sucesso!")
    else:
        print(f"\n❌ ERRO! Falha na sincronização")

except Exception as e:
    print(f"❌ Exceção ao enviar dados: {e}")
    mt5.shutdown()
    sys.exit(1)

print()

# ==========================================
# FINALIZAÇÃO
# ==========================================
mt5.shutdown()

print("="*70)
print("✅ TESTE COMPLETO FINALIZADO")
print("="*70)
print()
