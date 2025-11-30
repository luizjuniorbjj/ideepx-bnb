"""
🤖 iDeepX MT5 Collector
=====================
Coleta dados de contas MT5 e envia para o backend.

Funcionalidades:
- Conecta ao MT5 via MetaTrader5 library
- Coleta dados a cada 30 segundos
- Envia para backend via POST /api/mt5/sync
- Gerencia múltiplas contas simultaneamente
- Monitora posições abertas e histórico
"""

import MetaTrader5 as mt5
import requests
import json
import time
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# ==========================================
# CONFIGURAÇÕES
# ==========================================

BACKEND_URL = "http://localhost:5001"
SYNC_INTERVAL = 30  # segundos
MAX_RETRIES = 3
RETRY_DELAY = 5  # segundos

# ==========================================
# CLASSES
# ==========================================

class MT5Collector:
    """Coletor de dados MT5"""

    def __init__(self, account_id: str, login: int, password: str, server: str):
        self.account_id = account_id
        self.login = login
        self.password = password
        self.server = server
        self.connected = False
        self.last_sync = None
        self.error_count = 0

    def connect(self) -> bool:
        """Conecta ao MT5 (ou anexa a sessão existente)"""
        try:
            print(f"🔌 [{self.login}] Conectando ao MT5...")

            # Caminho do terminal MT5
            mt5_path = r"C:\mt5_terminal1\terminal64.exe"

            # Inicializa MT5
            if not mt5.initialize(path=mt5_path):
                error = mt5.last_error()
                print(f"❌ [{self.login}] Erro ao inicializar MT5: {error}")
                print(f"   Verificar se MT5 está em: {mt5_path}")
                return False

            # ========================================================================
            # MODO INTELIGENTE: Tenta login, mas aceita sessão já conectada
            # ========================================================================
            # Verifica se já existe uma conta conectada
            existing_account = mt5.account_info()

            if existing_account is not None:
                # Já existe sessão ativa - vamos usar ela!
                existing_login = existing_account.login

                if existing_login == self.login:
                    # É exatamente a conta que queremos!
                    print(f"✅ [{self.login}] Sessão MT5 já ativa detectada - usando sessão existente!")
                    print(f"   Balance: ${existing_account.balance:.2f}")
                    print(f"   Equity: ${existing_account.equity:.2f}")
                    self.connected = True
                    return True
                else:
                    # Existe outra conta conectada
                    print(f"⚠️  [{self.login}] MT5 está conectado em outra conta: {existing_login}")
                    print(f"   Tentando fazer login na conta {self.login}...")

            # Tenta fazer login (caso não tenha sessão ou seja outra conta)
            authorized = mt5.login(
                login=self.login,
                password=self.password,
                server=self.server
            )

            if not authorized:
                error = mt5.last_error()

                # Se falhou o login mas existe uma conta conectada, pode ser conflito de sessão
                if existing_account is not None and existing_account.login == self.login:
                    print(f"⚠️  [{self.login}] Login falhou mas sessão já está ativa - usando sessão existente!")
                    self.connected = True
                    return True

                print(f"❌ [{self.login}] Erro ao fazer login: {error}")
                mt5.shutdown()
                return False

            self.connected = True
            print(f"✅ [{self.login}] Conectado com sucesso!")
            return True

        except Exception as e:
            print(f"❌ [{self.login}] Exceção ao conectar: {e}")
            return False

    def disconnect(self):
        """Desconecta do MT5"""
        if self.connected:
            mt5.shutdown()
            self.connected = False
            print(f"🔌 [{self.login}] Desconectado do MT5")

    def get_account_data(self) -> Optional[Dict]:
        """Coleta dados da conta"""
        try:
            if not self.connected:
                if not self.connect():
                    return None

            # Informações da conta
            account_info = mt5.account_info()
            if account_info is None:
                print(f"❌ [{self.login}] Erro ao obter informações da conta")
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
            day_pl, week_pl, month_pl = self.calculate_pl_by_period()
            total_pl = equity - balance  # P/L total baseado na diferença

            return {
                'accountId': self.account_id,
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
            print(f"❌ [{self.login}] Erro ao coletar dados: {e}")
            return None

    def calculate_pl_by_period(self) -> tuple:
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
            print(f"⚠️ [{self.login}] Erro ao calcular P/L do período: {e}")
            return 0.0, 0.0, 0.0

    def send_to_backend(self, data: Dict) -> bool:
        """Envia dados para o backend"""
        try:
            url = f"{BACKEND_URL}/api/mt5/sync"

            print(f"📤 [{self.login}] Enviando dados para backend...")
            print(f"   Balance: ${data['balance']:.2f}")
            print(f"   Equity: ${data['equity']:.2f}")
            print(f"   Open Trades: {data['openTrades']}")

            response = requests.post(url, json=data, timeout=10)

            if response.status_code == 200:
                print(f"✅ [{self.login}] Dados enviados com sucesso!")
                self.error_count = 0
                return True
            else:
                print(f"❌ [{self.login}] Erro ao enviar dados: {response.status_code}")
                print(f"   Resposta: {response.text}")
                self.error_count += 1
                return False

        except Exception as e:
            print(f"❌ [{self.login}] Exceção ao enviar dados: {e}")
            self.error_count += 1
            return False

    def run_once(self) -> bool:
        """Executa uma coleta e sincronização"""
        data = self.get_account_data()

        if data is None:
            return False

        success = self.send_to_backend(data)

        if success:
            self.last_sync = datetime.now()

        return success

    def run_loop(self):
        """Loop principal de coleta"""
        print(f"🚀 [{self.login}] Iniciando loop de coleta (intervalo: {SYNC_INTERVAL}s)")

        while True:
            try:
                # Executa coleta
                success = self.run_once()

                # Se muitos erros consecutivos, tenta reconectar
                if self.error_count >= MAX_RETRIES:
                    print(f"⚠️ [{self.login}] Muitos erros ({self.error_count}), tentando reconectar...")
                    self.disconnect()
                    time.sleep(RETRY_DELAY)
                    if not self.connect():
                        print(f"❌ [{self.login}] Falha ao reconectar, aguardando...")
                        time.sleep(RETRY_DELAY * 2)
                        continue

                # Aguarda próximo ciclo
                time.sleep(SYNC_INTERVAL)

            except KeyboardInterrupt:
                print(f"\n⏹️ [{self.login}] Interrompido pelo usuário")
                self.disconnect()
                break
            except Exception as e:
                print(f"❌ [{self.login}] Erro no loop: {e}")
                time.sleep(RETRY_DELAY)

# ==========================================
# FUNÇÕES AUXILIARES
# ==========================================

def fetch_account_credentials(account_id: str) -> Optional[Dict]:
    """Busca credenciais da conta no backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/credentials/{account_id}"

        print(f"🔐 Buscando credenciais para conta {account_id}...")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Credenciais obtidas para login {data['login']}")
            return data
        else:
            print(f"❌ Erro ao buscar credenciais: {response.status_code}")
            return None

    except Exception as e:
        print(f"❌ Exceção ao buscar credenciais: {e}")
        return None

def start_collector(account_id: str):
    """Inicia coletor para uma conta específica"""
    print(f"\n{'='*60}")
    print(f"🤖 iDeepX MT5 Collector")
    print(f"{'='*60}\n")

    # Busca credenciais
    credentials = fetch_account_credentials(account_id)

    if credentials is None:
        print("❌ Não foi possível obter credenciais. Abortando...")
        sys.exit(1)

    # Cria coletor
    collector = MT5Collector(
        account_id=credentials['id'],
        login=int(credentials['login']),
        password=credentials['password'],
        server=credentials['server']
    )

    # Conecta ao MT5
    if not collector.connect():
        print("❌ Falha ao conectar ao MT5. Abortando...")
        sys.exit(1)

    # Executa primeira coleta imediatamente
    print("\n📊 Executando primeira coleta...")
    collector.run_once()

    # Inicia loop de coleta
    print(f"\n⏰ Próxima coleta em {SYNC_INTERVAL} segundos...")
    collector.run_loop()

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Uso: python mt5_collector.py <account_id>")
        print("   Exemplo: python mt5_collector.py 31b4d891-4f84-4743-b464-303a814f4661")
        sys.exit(1)

    account_id = sys.argv[1]
    start_collector(account_id)
