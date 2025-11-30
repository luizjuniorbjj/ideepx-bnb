"""
Procurar o ID da conta retornado pela API em todos os bancos de dados
"""
import sqlite3
import os

ACCOUNT_ID = "3713f410-94e0-4f5a-99de-0a053aac1890"

databases = [
    r"C:\ideepx-bnb\backend\prisma\dev.db",
    r"C:\ideepx-bnb\backend\prisma\prisma\dev.db",
    r"C:\ideepx-bnb\SIMULADOR\backend\prisma\dev.db",
    r"C:\ideepx-bnb\SIMULADOR\backend\prisma\prisma\dev.db",
]

print("=" * 80)
print(f"🔍 PROCURANDO CONTA ID: {ACCOUNT_ID}")
print("=" * 80)
print()

for db_path in databases:
    if not os.path.exists(db_path):
        print(f"⚠️  {db_path}")
        print(f"   Arquivo não existe")
        print()
        continue

    print(f"📁 {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, brokerName, login, server, balance, equity, status
            FROM TradingAccount
            WHERE id = ?
        """, (ACCOUNT_ID,))

        account = cursor.fetchone()

        if account:
            id, broker, login, server, balance, equity, status = account
            print(f"   ✅ CONTA ENCONTRADA!")
            print(f"   Broker: {broker}")
            print(f"   Login: {login}")
            print(f"   Server: {server}")
            print(f"   Balance: {balance}")
            print(f"   Equity: {equity}")
            print(f"   Status: {status}")
        else:
            print(f"   ❌ Conta não encontrada")

        conn.close()

    except Exception as e:
        print(f"   ❌ Erro: {e}")

    print()

print("=" * 80)
print("🎯 CONCLUSÃO:")
print("=" * 80)
print()
print("O banco que CONTÉM a conta retornada pela API é o banco que")
print("o backend está REALMENTE usando.")
print()
print("O banco que NÃO contém é o que o coletor atualizou.")
print()
