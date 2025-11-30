"""
Verificar contas no banco de dados
"""
import sqlite3
import os

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"

print("=" * 80)
print("🔍 VERIFICANDO CONTAS NO BANCO DE DADOS")
print("=" * 80)
print()

if not os.path.exists(DATABASE_PATH):
    print(f"❌ Banco de dados não encontrado: {DATABASE_PATH}")
    exit(1)

try:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Buscar contas
    cursor.execute("""
        SELECT
            id,
            brokerName,
            login,
            server,
            status,
            balance,
            equity,
            connected,
            lastHeartbeat
        FROM TradingAccount
    """)

    accounts = cursor.fetchall()

    if not accounts:
        print("❌ NENHUMA CONTA ENCONTRADA NO BANCO!")
        print()
        print("Possível causa:")
        print("- Conta não foi conectada pelo frontend")
        print("- Banco de dados está em local diferente")
        print()
    else:
        print(f"✅ {len(accounts)} conta(s) encontrada(s):")
        print()

        for account in accounts:
            id, broker_name, login, server, status, balance, equity, connected, last_heartbeat = account

            print(f"📊 ID: {id}")
            print(f"   Broker: {broker_name}")
            print(f"   Login (Account Number): {login}")
            print(f"   Server: {server}")
            print(f"   Status: {status}")
            print(f"   Balance: {balance or 'NULL'}")
            print(f"   Equity: {equity or 'NULL'}")
            print(f"   Connected: {connected}")
            print(f"   Last Heartbeat: {last_heartbeat or 'NULL'}")
            print()

    # Buscar credenciais
    print("-" * 80)
    print("🔐 VERIFICANDO CREDENCIAIS:")
    print()

    cursor.execute("""
        SELECT
            tradingAccountId,
            encryptedPassword
        FROM TradingAccountCredential
    """)

    credentials = cursor.fetchall()

    if not credentials:
        print("❌ NENHUMA CREDENCIAL ENCONTRADA!")
        print()
        print("Isso significa que o coletor não tem como fazer login no MT5!")
        print()
    else:
        print(f"✅ {len(credentials)} credencial(is) encontrada(s):")
        print()

        for cred in credentials:
            account_id, encrypted_password = cred

            print(f"🔑 Trading Account ID: {account_id}")
            print(f"   Senha criptografada: {encrypted_password[:30]}...")
            print()

    conn.close()

except Exception as e:
    print(f"❌ Erro ao acessar banco: {e}")
    exit(1)

print("=" * 80)
