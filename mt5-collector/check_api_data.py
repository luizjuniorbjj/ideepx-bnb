"""
Verificar que dados a API retornaria
"""
import sqlite3

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"

conn = sqlite3.connect(DATABASE_PATH)
cursor = conn.cursor()

# Buscar conta com userId
cursor.execute("""
    SELECT
        ta.id,
        ta.userId,
        ta.accountAlias,
        ta.brokerName,
        ta.login,
        ta.server,
        ta.balance,
        ta.equity,
        ta.status,
        ta.connected,
        ta.lastHeartbeat,
        u.walletAddress
    FROM TradingAccount ta
    JOIN User u ON ta.userId = u.id
    WHERE ta.status = 'CONNECTED'
""")

rows = cursor.fetchall()

print("=" * 80)
print("DADOS QUE A API DEVERIA RETORNAR:")
print("=" * 80)
print()

if rows:
    for row in rows:
        (id, userId, accountAlias, brokerName, login, server,
         balance, equity, status, connected, lastHeartbeat, walletAddress) = row

        print(f"📊 Conta ID: {id}")
        print(f"   User ID: {userId}")
        print(f"   Wallet: {walletAddress}")
        print(f"   Broker: {brokerName}")
        print(f"   Login: {login}")
        print(f"   Server: {server}")
        print(f"   Balance: {balance}")
        print(f"   Equity: {equity}")
        print(f"   Status: {status}")
        print(f"   Connected: {connected}")
        print(f"   Last Heartbeat: {lastHeartbeat}")
        print()
        print(f"🌐 Para testar a API, use:")
        print(f"   http://localhost:5001/api/mt5/accounts?walletAddress={walletAddress}")
        print()
else:
    print("❌ Nenhuma conta CONNECTED encontrada!")

conn.close()
