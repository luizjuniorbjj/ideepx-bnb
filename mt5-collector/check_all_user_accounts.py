"""
Verificar TODAS as contas MT5 do usuário
"""
import sqlite3

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"
WALLET_ADDRESS = "0x75d1A8ac59003088c60A20bde8953cBECfe41669"

conn = sqlite3.connect(DATABASE_PATH)
cursor = conn.cursor()

print("=" * 80)
print("🔍 INVESTIGAÇÃO: CONTAS MT5 DO USUÁRIO")
print("=" * 80)
print()

# 1. Buscar userId
cursor.execute("SELECT id, walletAddress FROM User WHERE walletAddress = ?", (WALLET_ADDRESS,))
user = cursor.fetchone()

if not user:
    print(f"❌ Usuário não encontrado: {WALLET_ADDRESS}")
    conn.close()
    exit(1)

user_id, wallet = user
print(f"✅ Usuário encontrado:")
print(f"   ID: {user_id}")
print(f"   Wallet: {wallet}")
print()

# 2. Buscar TODAS as contas deste usuário
cursor.execute("""
    SELECT
        id,
        accountAlias,
        brokerName,
        login,
        server,
        balance,
        equity,
        status,
        connected,
        lastHeartbeat,
        createdAt,
        updatedAt
    FROM TradingAccount
    WHERE userId = ?
    ORDER BY createdAt DESC
""", (user_id,))

accounts = cursor.fetchall()

print("=" * 80)
print(f"📊 TOTAL DE CONTAS: {len(accounts)}")
print("=" * 80)
print()

for i, account in enumerate(accounts, 1):
    (id, alias, broker, login, server, balance, equity,
     status, connected, heartbeat, created, updated) = account

    print(f"{'🟢' if connected else '🔴'} CONTA #{i}")
    print(f"   ID: {id}")
    print(f"   Alias: {alias}")
    print(f"   Broker: {broker}")
    print(f"   Login: {login}")
    print(f"   Server: {server}")
    print(f"   Balance: {balance or 'NULL'}")
    print(f"   Equity: {equity or 'NULL'}")
    print(f"   Status: {status}")
    print(f"   Connected: {connected}")
    print(f"   Last Heartbeat: {heartbeat or 'NULL'}")
    print(f"   Criada em: {created}")
    print(f"   Atualizada em: {updated}")
    print()

# 3. Identificar problemas
print("=" * 80)
print("🔍 ANÁLISE:")
print("=" * 80)
print()

# Contas duplicadas?
logins = {}
for account in accounts:
    login = account[3]
    if login in logins:
        logins[login].append(account)
    else:
        logins[login] = [account]

duplicates = {k: v for k, v in logins.items() if len(v) > 1}

if duplicates:
    print("⚠️  CONTAS DUPLICADAS ENCONTRADAS:")
    print()
    for login, accs in duplicates.items():
        print(f"   Login {login} aparece {len(accs)} vezes:")
        for acc in accs:
            print(f"      - ID: {acc[0]} | Broker: {acc[2]} | Status: {acc[7]}")
    print()
else:
    print("✅ Não há contas duplicadas (mesmo login)")
    print()

# Qual conta está atualizada?
updated_accounts = [acc for acc in accounts if acc[5] and float(acc[5]) > 0]
pending_accounts = [acc for acc in accounts if acc[7] == 'PENDING']

if updated_accounts:
    print("✅ CONTAS COM SALDO ATUALIZADO:")
    for acc in updated_accounts:
        print(f"   - ID: {acc[0]} | Broker: {acc[2]} | Balance: {acc[5]}")
    print()

if pending_accounts:
    print("⚠️  CONTAS PENDENTES (NÃO ATUALIZADAS):")
    for acc in pending_accounts:
        print(f"   - ID: {acc[0]} | Broker: {acc[2]} | Status: {acc[7]}")
    print()

# 4. Recomendação
print("=" * 80)
print("💡 RECOMENDAÇÃO:")
print("=" * 80)
print()

if len(accounts) > 1:
    print("🎯 PROBLEMA IDENTIFICADO:")
    print(f"   Você tem {len(accounts)} contas cadastradas para a mesma wallet!")
    print()
    print("📋 SOLUÇÃO:")
    print()

    if updated_accounts and pending_accounts:
        print("   1. A API do backend retorna contas ordenadas por 'createdAt DESC'")
        print("      (mais recentes primeiro)")
        print()
        print("   2. A conta ATUALIZADA pelo coletor:")
        for acc in updated_accounts:
            print(f"      - {acc[2]} (ID: {acc[0]}) - Balance: {acc[5]}")
        print()
        print("   3. A conta PENDENTE que aparece no dashboard:")
        for acc in pending_accounts:
            print(f"      - {acc[2]} (ID: {acc[0]}) - Status: {acc[7]}")
        print()
        print("   ⚠️  O FRONTEND ESTÁ MOSTRANDO A CONTA ERRADA!")
        print()
        print("   OPÇÕES:")
        print()
        print("   A) DELETAR a conta pendente/duplicada")
        print(f"      DELETE FROM TradingAccount WHERE id = '{pending_accounts[0][0]}';")
        print()
        print("   B) ATUALIZAR o coletor para processar AMBAS as contas")
        print()
        print("   C) VERIFICAR qual conta você realmente quer usar")
        print()

conn.close()
