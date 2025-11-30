"""
Deletar conta duplicada (Doo Prime com servidor errado)
"""
import sqlite3

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"
ACCOUNT_ID_TO_DELETE = "f8d61236-f9ad-4c98-92db-827d658ac9dd"

conn = sqlite3.connect(DATABASE_PATH)
cursor = conn.cursor()

print("=" * 80)
print("🗑️  DELETANDO CONTA DUPLICADA")
print("=" * 80)
print()

# 1. Verificar conta antes de deletar
cursor.execute("""
    SELECT id, accountAlias, brokerName, server, status, balance
    FROM TradingAccount
    WHERE id = ?
""", (ACCOUNT_ID_TO_DELETE,))

account = cursor.fetchone()

if not account:
    print(f"❌ Conta não encontrada: {ACCOUNT_ID_TO_DELETE}")
    conn.close()
    exit(1)

id, alias, broker, server, status, balance = account

print("⚠️  CONTA A SER DELETADA:")
print(f"   ID: {id}")
print(f"   Alias: {alias}")
print(f"   Broker: {broker}")
print(f"   Server: {server}")
print(f"   Status: {status}")
print(f"   Balance: {balance}")
print()

# 2. Deletar credenciais primeiro (foreign key)
print("🔧 Deletando credenciais associadas...")
cursor.execute("""
    DELETE FROM TradingAccountCredential
    WHERE tradingAccountId = ?
""", (ACCOUNT_ID_TO_DELETE,))

deleted_creds = cursor.rowcount
print(f"   ✅ {deleted_creds} credencial(is) deletada(s)")
print()

# 3. Deletar a conta
print("🗑️  Deletando conta...")
cursor.execute("""
    DELETE FROM TradingAccount
    WHERE id = ?
""", (ACCOUNT_ID_TO_DELETE,))

deleted_account = cursor.rowcount
print(f"   ✅ {deleted_account} conta deletada")
print()

# 4. Commit
conn.commit()

print("=" * 80)
print("✅ CONTA DUPLICADA DELETADA COM SUCESSO!")
print("=" * 80)
print()

# 5. Verificar contas restantes
cursor.execute("""
    SELECT id, accountAlias, brokerName, server, status, balance, equity
    FROM TradingAccount
    WHERE userId = (
        SELECT userId FROM TradingAccount WHERE id = 'b332e19b-1345-4193-893c-017fa8fcc6e8'
    )
""")

remaining = cursor.fetchall()

print(f"📊 CONTAS RESTANTES: {len(remaining)}")
print()

for acc in remaining:
    id, alias, broker, server, status, balance, equity = acc
    print(f"✅ {broker}")
    print(f"   ID: {id}")
    print(f"   Server: {server}")
    print(f"   Status: {status}")
    print(f"   Balance: {balance}")
    print(f"   Equity: {equity}")
    print()

conn.close()

print("=" * 80)
print("🎉 PRÓXIMOS PASSOS:")
print("=" * 80)
print()
print("1. Atualizar o dashboard (F5)")
print("   http://localhost:3000/mt5")
print()
print("2. Verificar que agora mostra:")
print("   ✅ Saldo: US$ 0,91")
print("   ✅ Equity: US$ 0,91")
print("   ✅ Status: Conectado")
print()
