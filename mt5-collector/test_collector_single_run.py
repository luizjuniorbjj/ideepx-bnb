"""
Teste do coletor - Executa UMA VEZ apenas para debug
"""
import os
import sys
import sqlite3
from dotenv import load_dotenv
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import MetaTrader5 as mt5
from datetime import datetime

# Load env
load_dotenv()

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"

print("=" * 80)
print("🧪 TESTE DO COLETOR - EXECUÇÃO ÚNICA")
print("=" * 80)
print()

# Validar ENCRYPTION_KEY
if not ENCRYPTION_KEY:
    print("❌ ENCRYPTION_KEY não encontrada no .env!")
    sys.exit(1)

def decrypt_password(encrypted_password: str) -> str:
    """
    Descriptografa senha usando AES-256-CBC
    Compatível com o backend Node.js
    """
    try:
        # Decode base64
        encrypted_data = base64.b64decode(encrypted_password)

        # Extrair IV (primeiros 16 bytes) e dados criptografados
        iv = encrypted_data[:16]
        encrypted = encrypted_data[16:]

        # Preparar chave (primeiros 32 bytes da ENCRYPTION_KEY decodificada)
        key = base64.b64decode(ENCRYPTION_KEY)[:32]

        # Criar decipher AES-256-CBC
        cipher = AES.new(key, AES.MODE_CBC, iv)

        # Descriptografar e remover padding
        decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)

        return decrypted.decode('utf-8')

    except Exception as e:
        print(f"❌ Erro ao descriptografar: {e}")
        print(f"   Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return None

# 1. BUSCAR CONTAS DO BANCO
print("📊 1. Buscando contas do banco de dados...")
print("-" * 80)

try:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            ta.id,
            ta.login,
            ta.server,
            ta.brokerName,
            ta.accountAlias,
            tac.encryptedPassword
        FROM TradingAccount ta
        INNER JOIN TradingAccountCredential tac ON ta.id = tac.tradingAccountId
        WHERE ta.status != 'SUSPENDED'
        ORDER BY ta.createdAt ASC
    """)

    accounts = [dict(row) for row in cursor.fetchall()]
    conn.close()

    if not accounts:
        print("❌ Nenhuma conta encontrada!")
        sys.exit(1)

    print(f"✅ {len(accounts)} conta(s) encontrada(s):")
    for acc in accounts:
        print(f"   - {acc['brokerName']} | Login: {acc['login']} | Server: {acc['server']}")
    print()

except Exception as e:
    print(f"❌ Erro ao buscar contas: {e}")
    sys.exit(1)

# 2. INICIALIZAR MT5
print("🔌 2. Inicializando MT5...")
print("-" * 80)

if not mt5.initialize(path=MT5_PATH):
    print(f"❌ Falha ao inicializar MT5: {mt5.last_error()}")
    sys.exit(1)

print(f"✅ MT5 inicializado!")
print(f"   Versão: {mt5.version()}")
print()

# 3. PROCESSAR CADA CONTA
print("📡 3. Coletando dados das contas...")
print("=" * 80)

for account in accounts:
    account_id = account['id']
    login = int(account['login'])
    server = account['server']
    broker_name = account['brokerName']
    encrypted_password = account['encryptedPassword']

    print()
    print(f"🔑 Processando: {broker_name} - {login}@{server}")
    print("-" * 80)

    # Descriptografar senha
    password = decrypt_password(encrypted_password)
    if not password:
        print("❌ Falha ao descriptografar senha!")
        continue

    print(f"✅ Senha descriptografada: {password[:3]}...")

    # Fazer login
    print(f"🔐 Fazendo login no MT5...")
    if not mt5.login(login=login, password=password, server=server):
        error = mt5.last_error()
        print(f"❌ Falha no login!")
        print(f"   Código: {error[0]}")
        print(f"   Mensagem: {error[1]}")
        continue

    print(f"✅ Login realizado!")

    # Coletar dados da conta
    account_info = mt5.account_info()
    if not account_info:
        print("❌ Não conseguiu obter informações da conta!")
        continue

    print(f"📊 Dados coletados:")
    print(f"   💰 Saldo: US$ {account_info.balance:.2f}")
    print(f"   📈 Equity: US$ {account_info.equity:.2f}")
    print(f"   📊 Margem: US$ {account_info.margin:.2f}")
    print(f"   💵 Margem Livre: US$ {account_info.margin_free:.2f}")

    # Atualizar banco de dados
    print(f"💾 Atualizando banco de dados...")

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        now = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE TradingAccount
            SET
                balance = ?,
                equity = ?,
                margin = ?,
                freeMargin = ?,
                status = ?,
                connected = ?,
                lastHeartbeat = ?,
                updatedAt = ?
            WHERE id = ?
        """, (
            str(account_info.balance),
            str(account_info.equity),
            str(account_info.margin),
            str(account_info.margin_free),
            'CONNECTED',
            1,
            now,
            now,
            account_id
        ))

        conn.commit()
        conn.close()

        print(f"✅ Banco de dados atualizado com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao atualizar banco: {e}")

# 4. FINALIZAR
mt5.shutdown()
print()
print("=" * 80)
print("✅ TESTE CONCLUÍDO!")
print("=" * 80)
print()
print("Próximos passos:")
print("1. Verificar dashboard: http://localhost:3000/mt5")
print("2. Atualizar página (F5)")
print("3. Verificar se os valores aparecem!")
