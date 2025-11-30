"""
🤖 MT5 Multi-Account Collector
===============================
Coleta dados de TODAS as contas MT5 do banco de dados e atualiza automaticamente.

USO:
    python collect_all_accounts.py

REQUER:
    - MetaTrader 5 instalado
    - ENCRYPTION_KEY no arquivo .env (mesma chave do backend)
    - Banco de dados em ../backend/prisma/dev.db
"""

import os
import sys
import sqlite3
import time
from datetime import datetime
from cryptography.fernet import Fernet
import MetaTrader5 as mt5
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# ==========================================
# CONFIGURAÇÕES
# ==========================================

DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
COLLECT_INTERVAL = 30  # segundos entre cada ciclo de coleta
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"  # Seu MT5 instalado

# ==========================================
# VALIDAÇÕES
# ==========================================

if not ENCRYPTION_KEY:
    print("❌ ERRO: ENCRYPTION_KEY não encontrada no .env")
    print("   Adicione: ENCRYPTION_KEY=<sua-chave-fernet>")
    sys.exit(1)

if not os.path.exists(DATABASE_PATH):
    print(f"❌ ERRO: Banco de dados não encontrado: {DATABASE_PATH}")
    sys.exit(1)

# ==========================================
# FUNÇÕES DE CRIPTOGRAFIA
# ==========================================

cipher = Fernet(ENCRYPTION_KEY.encode())

def decrypt_password(encrypted_password: str) -> str:
    """Descriptografa senha usando Fernet"""
    try:
        return cipher.decrypt(encrypted_password.encode()).decode()
    except Exception as e:
        print(f"❌ Erro ao descriptografar senha: {e}")
        return None

# ==========================================
# FUNÇÕES DO BANCO DE DADOS
# ==========================================

def get_all_accounts():
    """Busca todas as contas ativas do banco"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Buscar todas as contas com credenciais
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

        return accounts

    except Exception as e:
        print(f"❌ Erro ao buscar contas: {e}")
        return []

def update_account_data(account_id: str, data: dict):
    """Atualiza dados da conta no banco"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE TradingAccount
            SET
                balance = ?,
                equity = ?,
                margin = ?,
                freeMargin = ?,
                marginLevel = ?,
                openTrades = ?,
                openPL = ?,
                status = ?,
                lastHeartbeat = ?,
                connected = ?,
                updatedAt = ?
            WHERE id = ?
        """, (
            str(data.get('balance', '0')),
            str(data.get('equity', '0')),
            str(data.get('margin', '0')),
            str(data.get('freeMargin', '0')),
            str(data.get('marginLevel', '0')),
            data.get('openTrades', 0),
            str(data.get('openPL', '0')),
            data.get('status', 'PENDING'),
            data.get('lastHeartbeat'),
            1 if data.get('connected') else 0,
            datetime.utcnow().isoformat(),
            account_id
        ))

        conn.commit()
        conn.close()

        return True

    except Exception as e:
        print(f"❌ Erro ao atualizar conta {account_id}: {e}")
        return False

# ==========================================
# FUNÇÕES MT5
# ==========================================

def collect_account_data(account):
    """Coleta dados de uma conta MT5"""
    account_id = account['id']
    login = int(account['login'])
    server = account['server']
    broker = account['brokerName']
    alias = account['accountAlias'] or f"Conta {login}"

    print(f"\n📊 [{broker}] {alias} ({login}@{server})")

    # Descriptografar senha
    password = decrypt_password(account['encryptedPassword'])
    if not password:
        print(f"   ❌ Erro ao descriptografar senha")
        update_account_data(account_id, {
            'status': 'ERROR',
            'connected': False,
            'lastHeartbeat': datetime.utcnow().isoformat()
        })
        return False

    # Inicializar MT5
    if not mt5.initialize(path=MT5_PATH):
        error = mt5.last_error()
        print(f"   ❌ Erro ao inicializar MT5: {error}")
        print(f"   📌 Verificar caminho: {MT5_PATH}")
        update_account_data(account_id, {
            'status': 'ERROR',
            'connected': False,
            'lastHeartbeat': datetime.utcnow().isoformat()
        })
        return False

    # Login
    if not mt5.login(login=login, password=password, server=server):
        error = mt5.last_error()
        print(f"   ❌ Erro ao conectar: {error}")
        mt5.shutdown()
        update_account_data(account_id, {
            'status': 'DISCONNECTED',
            'connected': False,
            'lastHeartbeat': datetime.utcnow().isoformat()
        })
        return False

    # Obter dados da conta
    try:
        account_info = mt5.account_info()
        if not account_info:
            print(f"   ❌ Erro ao obter informações da conta")
            mt5.shutdown()
            return False

        # Obter posições abertas
        positions = mt5.positions_get()
        open_pl = sum([pos.profit for pos in positions]) if positions else 0.0

        # Preparar dados
        data = {
            'balance': float(account_info.balance),
            'equity': float(account_info.equity),
            'margin': float(account_info.margin),
            'freeMargin': float(account_info.margin_free),
            'marginLevel': float(account_info.margin_level) if account_info.margin_level else 0,
            'openTrades': len(positions) if positions else 0,
            'openPL': float(open_pl),
            'status': 'CONNECTED',
            'connected': True,
            'lastHeartbeat': datetime.utcnow().isoformat()
        }

        # Atualizar banco
        if update_account_data(account_id, data):
            print(f"   ✅ Saldo: US$ {data['balance']:.2f} | Equity: US$ {data['equity']:.2f} | Trades: {data['openTrades']}")
            return True
        else:
            print(f"   ⚠️  Dados coletados mas erro ao salvar")
            return False

    except Exception as e:
        print(f"   ❌ Exceção ao coletar dados: {e}")
        return False
    finally:
        mt5.shutdown()

# ==========================================
# MAIN LOOP
# ==========================================

def main():
    """Loop principal de coleta"""
    print("=" * 80)
    print("🤖 MT5 MULTI-ACCOUNT COLLECTOR")
    print("=" * 80)
    print(f"📁 Database: {DATABASE_PATH}")
    print(f"🔑 Encryption: {'Configurada' if ENCRYPTION_KEY else 'NÃO CONFIGURADA'}")
    print(f"⏱️  Intervalo: {COLLECT_INTERVAL}s")
    print(f"📍 MT5 Path: {MT5_PATH}")
    print("=" * 80)

    cycle = 1

    while True:
        print(f"\n\n🔄 CICLO #{cycle} - {datetime.now().strftime('%H:%M:%S')}")
        print("-" * 80)

        # Buscar contas
        accounts = get_all_accounts()

        if not accounts:
            print("⚠️  Nenhuma conta encontrada no banco de dados")
            print("   Conecte uma conta através do frontend em /mt5")
        else:
            print(f"📋 {len(accounts)} conta(s) encontrada(s)")

            # Coletar dados de cada conta
            success = 0
            errors = 0

            for account in accounts:
                if collect_account_data(account):
                    success += 1
                else:
                    errors += 1

                # Pequeno delay entre contas para não sobrecarregar
                time.sleep(2)

            print(f"\n📊 Resultados: ✅ {success} sucesso | ❌ {errors} erros")

        # Aguardar próximo ciclo
        print(f"\n⏳ Aguardando {COLLECT_INTERVAL}s até próximo ciclo...")
        print("-" * 80)

        time.sleep(COLLECT_INTERVAL)
        cycle += 1

# ==========================================
# ENTRY POINT
# ==========================================

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Collector interrompido pelo usuário")
        print("Até logo! 👋")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ ERRO FATAL: {e}")
        sys.exit(1)
