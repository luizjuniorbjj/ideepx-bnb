"""
Sincronização REAL de dados MT5 da GMI Markets
Conecta na conta MT5 e atualiza banco de dados automaticamente
"""
import MetaTrader5 as mt5
from datetime import datetime, timedelta
import sqlite3
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

# Configuração
MT5_LOGIN = os.getenv('MT5_LOGIN', '32650015')
MT5_PASSWORD = os.getenv('MT5_PASSWORD', '')
MT5_SERVER = os.getenv('MT5_SERVER', 'GMI3-Real')
WALLET_ADDRESS = os.getenv('MT5_WALLET_ADDRESS', '0xdf3051d2982660ea265add9ef0323e9f2badc292')

# Caminho do banco de dados
DB_PATH = Path(__file__).parent / 'prisma' / 'dev.db'

def connect_mt5():
    """Conecta no MetaTrader5"""
    if not mt5.initialize():
        print("❌ Erro ao inicializar MT5:", mt5.last_error())
        return False

    # Login
    authorized = mt5.login(login=int(MT5_LOGIN), password=MT5_PASSWORD, server=MT5_SERVER)
    if not authorized:
        print(f"❌ Erro ao fazer login na conta {MT5_LOGIN}")
        print("Último erro:", mt5.last_error())
        mt5.shutdown()
        return False

    print(f"✅ Conectado na conta {MT5_LOGIN} @ {MT5_SERVER}")
    return True

def get_account_data():
    """Busca dados da conta"""
    account_info = mt5.account_info()
    if account_info is None:
        print("❌ Erro ao buscar informações da conta")
        return None

    return {
        'balance': f"{account_info.balance:.2f}",
        'equity': f"{account_info.equity:.2f}",
        'profit': f"{account_info.profit:.2f}",
        'margin': f"{account_info.margin:.2f}",
        'margin_free': f"{account_info.margin_free:.2f}",
        'margin_level': f"{account_info.margin_level:.2f}" if account_info.margin > 0 else "0.00",
    }

def get_monthly_stats():
    """Calcula estatísticas do mês"""
    hoje = datetime.now()
    inicio_mes = datetime(hoje.year, hoje.month, 1)

    # Buscar deals do mês
    deals = mt5.history_deals_get(inicio_mes, hoje)
    if deals is None:
        print("⚠️ Nenhum deal encontrado no mês")
        return {
            'volume': '0.00',
            'profit': '0.00',
            'loss': '0.00',
            'trades': 0
        }

    # Calcular estatísticas
    total_volume = 0
    total_profit = 0
    total_loss = 0
    total_trades = 0

    for deal in deals:
        # Apenas deals de fechamento (entry OUT)
        if deal.entry == mt5.DEAL_ENTRY_OUT:
            total_volume += deal.volume * deal.price
            total_trades += 1

            if deal.profit > 0:
                total_profit += deal.profit
            else:
                total_loss += abs(deal.profit)

    return {
        'volume': f"{total_volume:.2f}",
        'profit': f"{total_profit:.2f}",
        'loss': f"{total_loss:.2f}",
        'trades': total_trades
    }

def get_user_id_from_wallet(cursor, wallet):
    """Busca ID do usuário pela carteira"""
    cursor.execute(
        "SELECT id FROM User WHERE walletAddress = ? COLLATE NOCASE",
        (wallet.lower(),)
    )
    result = cursor.fetchone()
    return result[0] if result else None

def get_gmi_account_id(cursor, user_id):
    """Busca ID da conta GMI do usuário"""
    cursor.execute(
        "SELECT id FROM GmiAccount WHERE userId = ?",
        (user_id,)
    )
    result = cursor.fetchone()
    return result[0] if result else None

def update_database(account_data, monthly_stats):
    """Atualiza banco de dados SQLite"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Buscar usuário
        user_id = get_user_id_from_wallet(cursor, WALLET_ADDRESS)
        if not user_id:
            print(f"❌ Usuário não encontrado: {WALLET_ADDRESS}")
            return False

        print(f"✅ Usuário encontrado: {user_id}")

        # Buscar conta GMI
        gmi_account_id = get_gmi_account_id(cursor, user_id)
        if not gmi_account_id:
            print(f"❌ Conta GMI não encontrada para usuário {user_id}")
            return False

        print(f"✅ Conta GMI encontrada: {gmi_account_id}")

        # Atualizar GmiAccount
        now = datetime.now().isoformat()
        cursor.execute("""
            UPDATE GmiAccount
            SET balance = ?,
                equity = ?,
                monthlyVolume = ?,
                monthlyProfit = ?,
                monthlyLoss = ?,
                totalTrades = ?,
                connected = 1,
                lastSyncAt = ?
            WHERE id = ?
        """, (
            account_data['balance'],
            account_data['equity'],
            monthly_stats['volume'],
            monthly_stats['profit'],
            monthly_stats['loss'],
            monthly_stats['trades'],
            now,
            gmi_account_id
        ))

        # Atualizar User com volume mensal
        cursor.execute("""
            UPDATE User
            SET monthlyVolume = ?
            WHERE id = ?
        """, (monthly_stats['volume'], user_id))

        # Atualizar TradingStat
        year = datetime.now().year
        month = int(f"{year}{str(datetime.now().month).zfill(2)}")

        net_profit = float(monthly_stats['profit']) - float(monthly_stats['loss'])
        total_pnl = float(monthly_stats['profit']) + float(monthly_stats['loss'])
        win_rate = (float(monthly_stats['profit']) / total_pnl * 100) if total_pnl > 0 else 0

        # Verificar se já existe
        cursor.execute("""
            SELECT id FROM TradingStat
            WHERE gmiAccountId = ? AND month = ? AND year = ?
        """, (gmi_account_id, month, year))

        existing = cursor.fetchone()

        if existing:
            # Atualizar
            cursor.execute("""
                UPDATE TradingStat
                SET volume = ?,
                    profit = ?,
                    loss = ?,
                    netProfit = ?,
                    trades = ?,
                    winRate = ?
                WHERE id = ?
            """, (
                monthly_stats['volume'],
                monthly_stats['profit'],
                monthly_stats['loss'],
                f"{net_profit:.2f}",
                monthly_stats['trades'],
                f"{win_rate:.2f}",
                existing[0]
            ))
        else:
            # Inserir
            cursor.execute("""
                INSERT INTO TradingStat (gmiAccountId, month, year, volume, profit, loss, netProfit, trades, winRate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                gmi_account_id,
                month,
                year,
                monthly_stats['volume'],
                monthly_stats['profit'],
                monthly_stats['loss'],
                f"{net_profit:.2f}",
                monthly_stats['trades'],
                f"{win_rate:.2f}"
            ))

        conn.commit()
        print("✅ Banco de dados atualizado com sucesso!")
        return True

    except Exception as e:
        print(f"❌ Erro ao atualizar banco: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Função principal"""
    print("\n" + "="*50)
    print("🔄 SINCRONIZAÇÃO MT5 → BANCO DE DADOS")
    print("="*50 + "\n")

    # Verificar senha
    if not MT5_PASSWORD:
        print("❌ ERRO: MT5_PASSWORD não configurada!")
        print("Configure a variável de ambiente MT5_PASSWORD")
        return 1

    # Conectar MT5
    if not connect_mt5():
        return 1

    try:
        # Buscar dados da conta
        print("\n📊 Buscando dados da conta...")
        account_data = get_account_data()
        if not account_data:
            return 1

        print(f"   Saldo: ${account_data['balance']}")
        print(f"   Equity: ${account_data['equity']}")
        print(f"   Lucro: ${account_data['profit']}")

        # Buscar estatísticas mensais
        print("\n📈 Calculando estatísticas do mês...")
        monthly_stats = get_monthly_stats()
        print(f"   Volume: ${monthly_stats['volume']}")
        print(f"   Lucro: ${monthly_stats['profit']}")
        print(f"   Prejuízo: ${monthly_stats['loss']}")
        print(f"   Trades: {monthly_stats['trades']}")

        # Atualizar banco
        print("\n💾 Atualizando banco de dados...")
        if update_database(account_data, monthly_stats):
            print("\n✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
            return 0
        else:
            print("\n❌ ERRO NA SINCRONIZAÇÃO")
            return 1

    finally:
        mt5.shutdown()
        print("\n🔌 Desconectado do MT5")

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
