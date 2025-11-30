"""
🎠 iDeepX MT5 Carrossel Collector
==================================
Coleta dados de MÚLTIPLAS contas MT5 em rotação.

Como funciona:
1. Busca todas as contas MT5 cadastradas no backend
2. Para cada conta:
   - Faz login no MT5
   - Coleta dados (balance, equity, trades, P/L)
   - Envia para o backend
   - Desconecta
3. Aguarda intervalo e repete o ciclo

Limitação MT5: Apenas UMA sessão por vez
Solução: Rotação sequencial (carrossel)
"""

import MetaTrader5 as mt5
import requests
import time
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# ==========================================
# CONFIGURAÇÕES
# ==========================================

BACKEND_URL = "http://localhost:5001"
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"

# Intervalo entre coletas completas (todas as contas)
CYCLE_INTERVAL = 60  # segundos entre ciclos completos

# Intervalo entre cada conta (para não sobrecarregar)
ACCOUNT_DELAY = 60  # segundos entre contas

# Retry settings
MAX_RETRIES = 3
RETRY_DELAY = 3

# ==========================================
# FUNÇÕES DE COLETA
# ==========================================

def init_mt5() -> bool:
    """Inicializa o MT5 Terminal"""
    print("🔧 Inicializando MT5...")

    # Garante que não existe sessão anterior travada
    try:
        mt5.shutdown()
    except:
        pass

    # Pequeno delay para garantir limpeza
    time.sleep(1)

    if not mt5.initialize(path=MT5_PATH):
        error = mt5.last_error()
        print(f"❌ Erro ao inicializar MT5: {error}")
        print(f"   💡 Dica: Verifique se MT5 Terminal está aberto em {MT5_PATH}")
        return False

    print("✅ MT5 inicializado!")
    return True

def shutdown_mt5():
    """Desliga conexão MT5"""
    mt5.shutdown()

def login_account(login: int, password: str, server: str) -> bool:
    """Faz login em uma conta específica"""
    print(f"🔐 Fazendo login: {login}@{server}...")

    # Tenta fazer login
    authorized = mt5.login(
        login=login,
        password=password,
        server=server
    )

    if not authorized:
        error = mt5.last_error()
        print(f"❌ Erro no login {login}: {error}")
        return False

    # Verifica se realmente logou na conta certa
    account_info = mt5.account_info()
    if account_info is None:
        print(f"❌ Não foi possível obter info da conta {login}")
        return False

    if account_info.login != login:
        print(f"⚠️ Login incorreto! Esperado: {login}, Obtido: {account_info.login}")
        return False

    print(f"✅ Logado com sucesso: {account_info.name}")
    return True

def collect_account_data(account_id: str, login: int) -> Optional[Dict]:
    """Coleta dados de uma conta já logada"""
    try:
        # Informações da conta
        account_info = mt5.account_info()
        if account_info is None:
            print(f"❌ [{login}] Erro ao obter informações da conta")
            return None

        # Posições abertas
        positions = mt5.positions_get()
        open_trades = len(positions) if positions else 0

        # Calcula P/L das posições abertas
        open_pl = 0.0
        if positions:
            open_pl = sum([pos.profit for pos in positions])

        # Dados da conta
        balance = account_info.balance
        equity = account_info.equity
        margin = account_info.margin
        free_margin = account_info.margin_free
        margin_level = account_info.margin_level if account_info.margin > 0 else 0

        # Calcula P/L por período (usando nova função com calendário UTC)
        day_pl, week_pl, month_pl = calculate_pl_by_period(login)
        total_pl = equity - balance

        return {
            'accountId': account_id,
            'balance': float(balance),
            'equity': float(equity),
            'margin': float(margin),
            'freeMargin': float(free_margin),
            'marginLevel': float(margin_level),
            'openTrades': open_trades,
            'openPL': float(open_pl),
            'dayPL': float(day_pl),
            'weekPL': float(week_pl),
            'monthPL': float(month_pl),
            'totalPL': float(total_pl)
        }

    except Exception as e:
        print(f"❌ [{login}] Erro ao coletar dados: {e}")
        return None

def calculate_pl_by_period(login: int) -> tuple:
    """
    Calcula P/L por período (dia, semana, mês) baseado em períodos de calendário UTC.

    Retorna: (day_pl, week_pl, month_pl)
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

        # Busca deals do mês inteiro
        deals = mt5.history_deals_get(start_of_month, now)

        if deals is None or len(deals) == 0:
            return 0.0, 0.0, 0.0

        day_pl = 0.0
        week_pl = 0.0
        month_pl = 0.0

        for deal in deals:
            # Apenas BUY/SELL com saída (ignora depósitos/transferências)
            if deal.type in [0, 1]:  # DEAL_TYPE_BUY ou DEAL_TYPE_SELL
                if deal.entry in [1, 2]:  # OUT ou INOUT
                    profit = deal.profit
                    commission = deal.commission if hasattr(deal, 'commission') else 0
                    swap = deal.swap if hasattr(deal, 'swap') else 0
                    total = profit + commission + swap

                    # Converte timestamp do deal para datetime UTC
                    deal_time = datetime.fromtimestamp(deal.time, tz=timezone.utc)

                    # Acumula por período
                    month_pl += total

                    if deal_time >= start_of_week:
                        week_pl += total

                    if deal_time >= start_of_day:
                        day_pl += total

        return day_pl, week_pl, month_pl

    except Exception as e:
        print(f"⚠️ [{login}] Erro ao calcular P/L: {e}")
        return 0.0, 0.0, 0.0

def send_to_backend(data: Dict) -> bool:
    """Envia dados para o backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/sync"

        print(f"📤 Enviando dados para backend...")
        print(f"   Balance: ${data['balance']:.2f}")
        print(f"   Equity: ${data['equity']:.2f}")
        print(f"   Open Trades: {data['openTrades']}")

        response = requests.post(url, json=data, timeout=10)

        if response.status_code == 200:
            print(f"✅ Dados enviados com sucesso!")
            return True
        else:
            print(f"❌ Erro ao enviar: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Exceção ao enviar: {e}")
        return False

# ==========================================
# FUNÇÕES DO BACKEND
# ==========================================

def fetch_all_accounts() -> List[Dict]:
    """Busca todas as contas MT5 do backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/accounts/all"

        print("📋 Buscando contas MT5 do backend...")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            accounts = response.json()
            print(f"✅ {len(accounts)} conta(s) encontrada(s)")
            return accounts
        else:
            print(f"❌ Erro ao buscar contas: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ Exceção ao buscar contas: {e}")
        return []

# ==========================================
# CARROSSEL PRINCIPAL
# ==========================================

def process_single_account(account: Dict) -> bool:
    """Processa uma única conta (login, coleta, envio)"""
    account_id = account['id']
    login = int(account['login'])
    password = account['password']
    server = account['server']

    print(f"\n{'='*50}")
    print(f"🎯 Processando conta: {login}@{server}")
    print(f"{'='*50}")

    # 1. Faz login
    if not login_account(login, password, server):
        return False

    # 2. Coleta dados
    data = collect_account_data(account_id, login)
    if data is None:
        return False

    # 3. Envia para backend
    success = send_to_backend(data)

    return success

def run_carrossel_cycle() -> int:
    """Executa um ciclo completo do carrossel"""
    print("\n" + "="*60)
    print("🎠 INICIANDO CICLO DO CARROSSEL")
    print("="*60)

    # Busca todas as contas
    accounts = fetch_all_accounts()

    if not accounts:
        print("⚠️ Nenhuma conta MT5 cadastrada!")
        return 0

    # Inicializa MT5
    if not init_mt5():
        print("❌ Falha ao inicializar MT5!")
        return 0

    success_count = 0
    total_count = len(accounts)

    # Processa cada conta em sequência
    for i, account in enumerate(accounts, 1):
        print(f"\n📍 Conta {i}/{total_count}")

        try:
            if process_single_account(account):
                success_count += 1
            else:
                print(f"⚠️ Falha ao processar conta {account.get('login', 'unknown')}")
        except Exception as e:
            print(f"❌ Erro ao processar conta: {e}")

        # Delay entre contas (exceto na última)
        if i < total_count:
            print(f"⏳ Aguardando {ACCOUNT_DELAY}s antes da próxima conta...")
            time.sleep(ACCOUNT_DELAY)

    # Desliga MT5
    shutdown_mt5()

    print("\n" + "="*60)
    print(f"🎠 CICLO COMPLETO: {success_count}/{total_count} contas processadas")
    print("="*60)

    return success_count

def run_carrossel_loop():
    """Loop principal do carrossel"""
    print("\n" + "="*60)
    print("🎠 iDeepX MT5 CARROSSEL COLLECTOR")
    print("="*60)
    print(f"⚙️ Intervalo entre ciclos: {CYCLE_INTERVAL}s")
    print(f"⚙️ Delay entre contas: {ACCOUNT_DELAY}s")
    print(f"⚙️ Backend: {BACKEND_URL}")
    print(f"⚙️ MT5 Path: {MT5_PATH}")
    print("="*60)

    cycle_count = 0

    while True:
        try:
            cycle_count += 1
            print(f"\n🔄 Ciclo #{cycle_count} - {datetime.now().strftime('%H:%M:%S')}")

            # Executa ciclo
            processed = run_carrossel_cycle()

            # Aguarda próximo ciclo
            print(f"\n⏰ Próximo ciclo em {CYCLE_INTERVAL}s...")
            time.sleep(CYCLE_INTERVAL)

        except KeyboardInterrupt:
            print("\n⏹️ Carrossel interrompido pelo usuário")
            shutdown_mt5()
            break
        except Exception as e:
            print(f"❌ Erro no loop: {e}")
            time.sleep(RETRY_DELAY)

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    # Modo de execução
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Executa apenas um ciclo
        print("🎯 Modo: Ciclo único")
        run_carrossel_cycle()
    else:
        # Loop contínuo
        print("🎯 Modo: Loop contínuo")
        run_carrossel_loop()
