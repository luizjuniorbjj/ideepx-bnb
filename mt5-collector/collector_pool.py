#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================================
MT5 COLLECTOR - WORKER POOL ARCHITECTURE
============================================================================
Sistema de coleta de dados MT5 com pool de workers para múltiplas contas.

Arquitetura:
- Worker Pool com 5-10 workers (configurável)
- Cada worker processa contas sequencialmente (limitação MT5)
- Coleta a cada 30 segundos
- Calcula P/L corretamente (apenas trades: deal.type in [0, 1])
- Armazena snapshots históricos
- Credenciais criptografadas (AES-256/Fernet)

Autor: iDeepX Team
Data: 2025-11-17
============================================================================
"""

import os
import sys
import time
import logging
from datetime import datetime, timedelta
from multiprocessing import Pool, cpu_count
from typing import List, Dict, Optional
import pytz

# MT5
import MetaTrader5 as mt5

# Database (SQLite via direct connection)
import sqlite3
from contextlib import contextmanager

# Encryption
from cryptography.fernet import Fernet

# Environment
from dotenv import load_dotenv

# Windows GUI (minimizar janela MT5)
try:
    import win32gui
    import win32con
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

load_dotenv()

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('collector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Worker Pool
NUM_WORKERS = int(os.getenv('NUM_WORKERS', '5'))
COLLECT_INTERVAL = int(os.getenv('COLLECT_INTERVAL', '30'))  # segundos

# MT5 Terminal Path
MT5_PATH = os.getenv('MT5_PATH', r'C:\mt5_terminal1\terminal64.exe')

# Database
DATABASE_PATH = os.getenv('DATABASE_URL', 'file:../backend/prisma/dev.db').replace('file:', '')

# Encryption
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY não definida no .env")

cipher = Fernet(ENCRYPTION_KEY.encode())

# Timezone
TZ = pytz.timezone('America/Sao_Paulo')

# ============================================================================
# DATABASE CONNECTION
# ============================================================================

@contextmanager
def get_db():
    """Context manager para conexão SQLite"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ============================================================================
# ENCRYPTION HELPERS
# ============================================================================

def decrypt_password(encrypted: str) -> str:
    """Descriptografa senha usando Fernet"""
    try:
        return cipher.decrypt(encrypted.encode()).decode()
    except Exception as e:
        logger.error(f"Erro ao descriptografar senha: {e}")
        return ""

# ============================================================================
# MT5 HELPERS
# ============================================================================

def minimize_mt5_windows():
    """Minimiza todas as janelas do MT5 para background"""
    if not HAS_WIN32:
        logger.warning("pywin32 não instalado - janelas MT5 ficarão visíveis")
        return 0

    def callback(hwnd, windows):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            class_name = win32gui.GetClassName(hwnd)
            # Detectar janelas do MetaTrader
            if ('MetaTrader' in title or 'terminal64' in title.lower() or
                'MetaTrader' in class_name):
                # Minimizar para bandeja
                win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
                windows.append((hwnd, title))
        return True

    windows = []
    win32gui.EnumWindows(callback, windows)

    if windows:
        logger.info(f"✅ {len(windows)} janela(s) MT5 minimizada(s)")
    return len(windows)

def initialize_mt5() -> bool:
    """Inicializa terminal MT5"""
    if not mt5.initialize(path=MT5_PATH):
        logger.error(f"MT5 initialize() failed, error: {mt5.last_error()}")
        logger.error(f"MT5 Path: {MT5_PATH}")
        return False

    # Minimizar janelas do MT5 após inicializar
    time.sleep(1)  # Aguardar janela abrir
    minimize_mt5_windows()

    return True

def login_mt5(login: int, password: str, server: str) -> bool:
    """Faz login em conta MT5"""
    try:
        authorized = mt5.login(login=login, password=password, server=server)
        if not authorized:
            error = mt5.last_error()
            logger.error(f"Login failed for {login}@{server}: {error}")
            return False
        return True
    except Exception as e:
        logger.error(f"Exception during login {login}@{server}: {e}")
        return False

def get_account_info() -> Optional[Dict]:
    """Obtém informações da conta MT5 logada"""
    try:
        info = mt5.account_info()
        if info is None:
            return None

        return {
            'balance': str(info.balance),
            'equity': str(info.equity),
            'margin': str(info.margin),
            'free_margin': str(info.margin_free),
            'margin_level': str(info.margin_level) if info.margin_level else "0"
        }
    except Exception as e:
        logger.error(f"Error getting account info: {e}")
        return None

def get_positions_info() -> Dict:
    """Obtém informações de posições abertas"""
    try:
        positions = mt5.positions_get()
        if positions is None:
            return {'open_trades': 0, 'open_pl': "0"}

        open_pl = sum(pos.profit for pos in positions)

        return {
            'open_trades': len(positions),
            'open_pl': str(open_pl)
        }
    except Exception as e:
        logger.error(f"Error getting positions: {e}")
        return {'open_trades': 0, 'open_pl': "0"}

def calculate_pl(start_time: datetime, end_time: datetime) -> float:
    """
    Calcula P/L entre duas datas

    CRÍTICO: Apenas deal.type in [0, 1] (BUY/SELL trades)
    Exclui deposits, withdrawals, etc.
    """
    try:
        deals = mt5.history_deals_get(start_time, end_time)
        if deals is None:
            return 0.0

        # Filtro CRÍTICO: apenas trades (type 0=BUY, 1=SELL)
        profit = sum(
            deal.profit
            for deal in deals
            if deal.type in [0, 1]  # DEAL_TYPE_BUY, DEAL_TYPE_SELL
        )

        return profit
    except Exception as e:
        logger.error(f"Error calculating P/L: {e}")
        return 0.0

def get_pl_metrics() -> Dict:
    """
    Calcula P/L por período (Day, Week, Month, Total) baseado em calendário UTC.

    IMPORTANTE: Usa períodos de calendário (início do dia/semana/mês UTC)
    em vez de períodos relativos (últimas 24h/7d/30d).
    """
    try:
        from datetime import timezone

        now = datetime.now(timezone.utc)

        # Início do dia (00:00 UTC)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Início da semana (segunda-feira 00:00 UTC)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)

        # Início do mês (dia 1, 00:00 UTC)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Busca todos os deals do mês (otimização: uma única query)
        deals = mt5.history_deals_get(start_of_month, now)

        if deals is None:
            return {
                'day_pl': "0",
                'week_pl': "0",
                'month_pl': "0",
                'total_pl': "0"
            }

        day_pl = 0.0
        week_pl = 0.0
        month_pl = 0.0

        for deal in deals:
            # Apenas trades (type 0=BUY, 1=SELL), não depósitos/transferências
            if deal.type in [0, 1]:
                profit = deal.profit

                # Converte timestamp do deal para datetime UTC
                deal_time = datetime.fromtimestamp(deal.time, tz=timezone.utc)

                # Acumula por período
                month_pl += profit

                if deal_time >= start_of_week:
                    week_pl += profit

                if deal_time >= start_of_day:
                    day_pl += profit

        # Total P/L (últimos 365 dias como proxy)
        total_start = now - timedelta(days=365)
        total_pl = calculate_pl(total_start, now)

        return {
            'day_pl': str(day_pl),
            'week_pl': str(week_pl),
            'month_pl': str(month_pl),
            'total_pl': str(total_pl)
        }
    except Exception as e:
        logger.error(f"Error calculating P/L metrics: {e}")
        return {
            'day_pl': "0",
            'week_pl': "0",
            'month_pl': "0",
            'total_pl': "0"
        }

# ============================================================================
# WORKER FUNCTION
# ============================================================================

def process_account(account: Dict) -> Dict:
    """
    Processa uma conta MT5 (executado por worker)

    Args:
        account: Dict com dados da conta do banco

    Returns:
        Dict com status e dados coletados
    """
    account_id = account['id']
    login = int(account['login'])
    server = account['server']

    logger.info(f"[Worker] Processando conta {login}@{server}")

    result = {
        'account_id': account_id,
        'status': 'ERROR',
        'error': None,
        'data': None
    }

    try:
        # 1. Inicializa MT5
        if not initialize_mt5():
            result['error'] = "Failed to initialize MT5"
            return result

        # 2. Descriptografa senha
        password = decrypt_password(account['encrypted_password'])
        if not password:
            result['error'] = "Failed to decrypt password"
            mt5.shutdown()
            return result

        # 3. Login
        if not login_mt5(login, password, server):
            result['error'] = f"Login failed: {mt5.last_error()}"
            result['status'] = 'DISCONNECTED'
            mt5.shutdown()
            return result

        # 4. Coleta dados da conta
        account_info = get_account_info()
        if account_info is None:
            result['error'] = "Failed to get account info"
            mt5.shutdown()
            return result

        # 5. Coleta posições
        positions_info = get_positions_info()

        # 6. Calcula P/L
        pl_metrics = get_pl_metrics()

        # 7. Monta dados completos
        result['data'] = {
            **account_info,
            **positions_info,
            **pl_metrics,
            'last_heartbeat': datetime.now(TZ).isoformat()
        }
        result['status'] = 'CONNECTED'

        logger.info(f"[Worker] ✅ Conta {login}@{server} processada com sucesso")

    except Exception as e:
        logger.error(f"[Worker] ❌ Erro ao processar {login}@{server}: {e}")
        result['error'] = str(e)

    finally:
        # Sempre desconecta
        mt5.shutdown()

    return result

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def fetch_active_accounts() -> List[Dict]:
    """Busca contas ativas no banco de dados"""
    with get_db() as conn:
        cursor = conn.cursor()

        # Join TradingAccount com TradingAccountCredential
        cursor.execute("""
            SELECT
                ta.id,
                ta.userId,
                ta.login,
                ta.server,
                ta.platform,
                ta.accountAlias,
                ta.brokerName,
                tac.encryptedPassword as encrypted_password
            FROM TradingAccount ta
            INNER JOIN TradingAccountCredential tac ON ta.id = tac.tradingAccountId
            WHERE ta.status IN ('PENDING', 'CONNECTED', 'DISCONNECTED')
            ORDER BY ta.lastHeartbeat ASC NULLS FIRST
        """)

        rows = cursor.fetchall()
        accounts = [dict(row) for row in rows]

        logger.info(f"Encontradas {len(accounts)} contas ativas para processar")
        return accounts

def update_account(account_id: str, status: str, data: Optional[Dict], error: Optional[str]):
    """Atualiza dados da conta no banco"""
    with get_db() as conn:
        cursor = conn.cursor()

        if data:
            # Atualiza TradingAccount com dados coletados
            cursor.execute("""
                UPDATE TradingAccount SET
                    status = ?,
                    connected = ?,
                    balance = ?,
                    equity = ?,
                    margin = ?,
                    freeMargin = ?,
                    marginLevel = ?,
                    openTrades = ?,
                    openPL = ?,
                    dayPL = ?,
                    weekPL = ?,
                    monthPL = ?,
                    totalPL = ?,
                    lastHeartbeat = ?,
                    lastError = ?,
                    updatedAt = CURRENT_TIMESTAMP,
                    lastSnapshotAt = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                status,
                1 if status == 'CONNECTED' else 0,
                data['balance'],
                data['equity'],
                data['margin'],
                data['free_margin'],
                data['margin_level'],
                data['open_trades'],
                data['open_pl'],
                data['day_pl'],
                data['week_pl'],
                data['month_pl'],
                data['total_pl'],
                data['last_heartbeat'],
                error,
                account_id
            ))

            # Cria snapshot histórico
            cursor.execute("""
                INSERT INTO AccountSnapshot (
                    tradingAccountId, capturedAt,
                    balance, equity, margin, freeMargin, marginLevel,
                    openTrades, openPL,
                    dayPL, weekPL, monthPL, totalPL
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                account_id,
                data['last_heartbeat'],
                data['balance'],
                data['equity'],
                data['margin'],
                data['free_margin'],
                data['margin_level'],
                data['open_trades'],
                data['open_pl'],
                data['day_pl'],
                data['week_pl'],
                data['month_pl'],
                data['total_pl']
            ))

            logger.info(f"✅ Conta {account_id} atualizada: {status}")
        else:
            # Apenas atualiza status e erro
            cursor.execute("""
                UPDATE TradingAccount SET
                    status = ?,
                    connected = 0,
                    lastError = ?,
                    updatedAt = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, error, account_id))

            logger.warning(f"⚠️ Conta {account_id} com erro: {error}")

        conn.commit()

# ============================================================================
# MAIN COLLECTOR LOOP
# ============================================================================

def collector_cycle():
    """Executa um ciclo de coleta completo"""
    logger.info("=" * 80)
    logger.info("🚀 Iniciando ciclo de coleta MT5")
    logger.info("=" * 80)

    # 1. Busca contas ativas
    accounts = fetch_active_accounts()

    if not accounts:
        logger.info("Nenhuma conta ativa para processar")
        return

    # 2. Processa contas em paralelo com worker pool
    logger.info(f"Processando {len(accounts)} contas com {NUM_WORKERS} workers...")

    start_time = time.time()

    with Pool(processes=NUM_WORKERS) as pool:
        results = pool.map(process_account, accounts)

    # 3. Atualiza banco de dados com resultados
    for result in results:
        update_account(
            account_id=result['account_id'],
            status=result['status'],
            data=result['data'],
            error=result['error']
        )

    elapsed = time.time() - start_time

    # 4. Resumo
    success = sum(1 for r in results if r['status'] == 'CONNECTED')
    failed = len(results) - success

    logger.info("=" * 80)
    logger.info(f"✅ Ciclo concluído em {elapsed:.2f}s")
    logger.info(f"   - Sucesso: {success}/{len(results)}")
    logger.info(f"   - Falhas: {failed}/{len(results)}")
    logger.info("=" * 80)

def main():
    """Loop principal do collector"""
    logger.info("=" * 80)
    logger.info("MT5 COLLECTOR - WORKER POOL")
    logger.info("=" * 80)
    logger.info(f"Workers: {NUM_WORKERS}")
    logger.info(f"Intervalo: {COLLECT_INTERVAL}s")
    logger.info(f"Database: {DATABASE_PATH}")
    logger.info("=" * 80)

    try:
        while True:
            try:
                collector_cycle()
            except Exception as e:
                logger.error(f"❌ Erro no ciclo de coleta: {e}", exc_info=True)

            # Aguarda próximo ciclo
            logger.info(f"⏳ Aguardando {COLLECT_INTERVAL}s até próximo ciclo...\n")
            time.sleep(COLLECT_INTERVAL)

    except KeyboardInterrupt:
        logger.info("\n🛑 Collector interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro fatal: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
