"""
🚀 iDeepX MetaAPI Collector
============================
Coleta dados de MÚLTIPLAS contas MT5 via MetaAPI Cloud.

Vantagens sobre o carrossel:
- Conexões PARALELAS (não sequenciais)
- Sem necessidade de MT5 Terminal local
- Escalável para 100+ contas
- Dados em tempo real

Requisitos:
- pip install metaapi-cloud-sdk requests

Como usar:
- python metaapi_collector.py         # Loop contínuo
- python metaapi_collector.py --once  # Ciclo único
"""

import asyncio
import requests
import sys
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

# ==========================================
# CONFIGURAÇÕES
# ==========================================

METAAPI_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxNzUxZWNiMWZhMTMyMmU1ZmYwNTBhMjEzNzg5OTNjNSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMTc1MWVjYjFmYTEzMjJlNWZmMDUwYTIxMzc4OTkzYzUiLCJpYXQiOjE3NjQyMzk3MjZ9.PoznNv5cV78-MScbIQtyeAxe8SuNWgxCO49AwPKIdmO2vcYpkG6_ZnwCw_LY1SIYgmNLKvyn2r6L3AHYLxINogCYnEKzI3Qh7lfbS4c-Dci9o_-pCgNurSHszuJJdFVUKIPSnSV_g-fk6ONMKtNhpxwzbYoAoaMeZN4VvDxqCHKdELem0ii6pxYO7uvOvUq0WWj0I91AEsiK37SUoL6nlk-jDEJkY1DkN0mV0sTEDXP9Nm9KRXEMareAyuJ0kKOOSOh9tTADR84bOF-wICLPjqYnHlOKoQ5c-zxYK9sPjRDpePLHpJOhxRWsntjH_B5Yk7tb2arZS6LxHP6_OIYnX_7EuHpKNHT-OvGMfyhIMud8XgA_BgDmMp_fcNCr3gziJG62sDStWTZXWLMUU3l_JN0Wal12cWMGNSwgkUr1XQL2wlgZudGd0L4Yfe7N3aLHKTdH4XeWuAFEDekNBQbSDosm1ImnjiTGjEYypUoJRlGcm-4eyQ3AplNTPZJYDikfPhVBpWOYyJa4wPdp-Qjy-dEOaC5rFc6PMlWhV2_nWUCznYuDcBXXuBqlfrR_QDVMjq4vIWOKCe1EFukI089EbYrLiBgNfyhPDxFKDIv75Ye8MzYlg_P4RGykrbTJ_JPCeSjxWSg4Sur-S0u42ozdh-TnNB3hcAw8EJuF-JrZ0Ag"

BACKEND_URL = "http://localhost:5001"

# Intervalo entre ciclos de coleta
CYCLE_INTERVAL = 60  # segundos

# ==========================================
# CACHE DE CONTAS METAAPI
# ==========================================

# Mapeia login MT5 -> MetaAPI account ID
metaapi_accounts_cache: Dict[str, str] = {}

# ==========================================
# FUNÇÕES AUXILIARES
# ==========================================

def fetch_accounts_from_backend() -> List[Dict]:
    """Busca todas as contas MT5 do backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/accounts/all"
        print("📋 Buscando contas do backend...")

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
# METAAPI FUNCTIONS
# ==========================================

async def get_or_create_metaapi_account(api, account_data: Dict) -> Optional[str]:
    """Obtém ou cria uma conta no MetaAPI"""
    login = str(account_data['login'])

    # Verifica cache primeiro
    if login in metaapi_accounts_cache:
        print(f"   📦 Usando conta em cache: {metaapi_accounts_cache[login]}")
        return metaapi_accounts_cache[login]

    try:
        # Busca contas existentes
        accounts = await api.metatrader_account_api.get_accounts_with_infinite_scroll_pagination()

        for acc in accounts:
            if str(acc.login) == login:
                print(f"   📦 Conta existente encontrada: {acc.id}")
                metaapi_accounts_cache[login] = acc.id
                return acc.id

        # Cria nova conta
        print(f"   🆕 Criando nova conta MetaAPI para {login}...")
        print(f"      Server: {account_data['server']}")

        # MetaAPI exige platform em minúsculo (mt5 ou mt4)
        platform = account_data.get('platform', 'mt5').lower()
        print(f"      Platform: {platform}")

        account = await api.metatrader_account_api.create_account({
            'name': f"iDeepX - {login}",
            'type': 'cloud',
            'login': login,
            'password': account_data['password'],
            'server': account_data['server'],
            'platform': platform,
            'magic': 0
        })

        print(f"   ✅ Conta criada: {account.id}")
        metaapi_accounts_cache[login] = account.id
        return account.id

    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ Erro ao obter/criar conta MetaAPI: {error_msg}")

        # Tenta extrair detalhes do erro
        if hasattr(e, 'details'):
            print(f"   📋 Detalhes: {e.details}")

        # Se for erro de servidor não encontrado, pode ser nome errado
        if 'server' in error_msg.lower() or 'validation' in error_msg.lower():
            print(f"   💡 Dica: Verifique se o servidor '{account_data['server']}' está correto no MetaAPI")
            print(f"   💡 Nome do servidor pode ser diferente (ex: 'GMI-Live' vs 'GMI3-Real')")

        return None

async def collect_account_data(api, metaapi_account_id: str, backend_account_id: str) -> Optional[Dict]:
    """Coleta dados de uma conta via MetaAPI"""
    try:
        # Obtém a conta
        account = await api.metatrader_account_api.get_account(metaapi_account_id)

        # Deploy se necessário
        if account.state != 'DEPLOYED':
            print(f"   🚀 Fazendo deploy...")
            await account.deploy()
            await account.wait_deployed()

        # Conecta
        connection = account.get_rpc_connection()
        await connection.connect()
        await connection.wait_synchronized()

        # Busca dados básicos
        account_info = await connection.get_account_information()
        positions = await connection.get_positions()

        # Calcula valores básicos
        balance = account_info.get('balance', 0)
        equity = account_info.get('equity', 0)
        margin = account_info.get('margin', 0)
        free_margin = account_info.get('freeMargin', 0)
        margin_level = account_info.get('marginLevel', 0)

        open_trades = len(positions) if positions else 0
        open_pl = sum([pos.get('profit', 0) for pos in positions]) if positions else 0

        # Calcula P/L por período usando histórico de deals
        # IMPORTANTE: MetaAPI limita a 1000 deals por consulta
        # Por isso fazemos consultas separadas para cada período
        day_pl = 0.0
        week_pl = 0.0
        month_pl = 0.0

        try:
            # Define períodos (timezone aware) - baseado em calendário UTC
            now = datetime.now(timezone.utc)
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            start_of_week = now - timedelta(days=now.weekday())
            start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # Função auxiliar para calcular P/L de uma lista de deals
            def calc_pl_from_deals(deals_list):
                total = 0.0
                for deal in deals_list:
                    deal_type = deal.get('type', '')
                    if 'BALANCE' in str(deal_type):
                        continue
                    profit = deal.get('profit', 0) or 0
                    swap = deal.get('swap', 0) or 0
                    commission = deal.get('commission', 0) or 0
                    total += profit + swap + commission
                return total

            # Busca deals SEPARADAMENTE para cada período para evitar limite de 1000
            # 1. Dia (hoje)
            day_response = await connection.get_deals_by_time_range(start_of_day, now)
            day_deals = day_response.get('deals', []) if isinstance(day_response, dict) else day_response
            day_pl = calc_pl_from_deals(day_deals)

            # 2. Semana (desde segunda)
            week_response = await connection.get_deals_by_time_range(start_of_week, now)
            week_deals = week_response.get('deals', []) if isinstance(week_response, dict) else week_response
            week_pl = calc_pl_from_deals(week_deals)

            # 3. Mês (desde dia 1)
            month_response = await connection.get_deals_by_time_range(start_of_month, now)
            month_deals = month_response.get('deals', []) if isinstance(month_response, dict) else month_response
            month_pl = calc_pl_from_deals(month_deals)

            print(f"   📊 P/L calculado: Dia=${day_pl:.2f} ({len(day_deals)} deals), Semana=${week_pl:.2f} ({len(week_deals)} deals), Mês=${month_pl:.2f} ({len(month_deals)} deals)")
        except Exception as e:
            print(f"   ⚠️ Não foi possível calcular P/L histórico: {e}")
            import traceback
            traceback.print_exc()

        # Fecha conexão
        await connection.close()

        return {
            'accountId': backend_account_id,
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
            'totalPL': float(equity - balance)
        }

    except Exception as e:
        print(f"   ❌ Erro ao coletar dados: {e}")
        return None

async def process_single_account(api, account: Dict) -> bool:
    """Processa uma única conta"""
    login = account['login']
    backend_id = account['id']

    print(f"\n{'='*50}")
    print(f"🎯 Processando: {login}@{account['server']}")
    print(f"{'='*50}")

    # 1. Obtém ou cria conta MetaAPI
    metaapi_id = await get_or_create_metaapi_account(api, account)
    if not metaapi_id:
        return False

    # 2. Coleta dados
    data = await collect_account_data(api, metaapi_id, backend_id)
    if not data:
        return False

    # 3. Envia para backend
    return send_to_backend(data)

async def process_all_accounts_parallel(api, accounts: List[Dict]) -> int:
    """Processa TODAS as contas em paralelo"""
    print(f"\n🚀 Processando {len(accounts)} contas em PARALELO...")

    # Cria tasks para todas as contas
    tasks = [process_single_account(api, acc) for acc in accounts]

    # Executa em paralelo
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Conta sucessos
    success_count = sum(1 for r in results if r is True)

    return success_count

# ==========================================
# CICLO PRINCIPAL
# ==========================================

async def run_collection_cycle() -> int:
    """Executa um ciclo de coleta"""
    print("\n" + "="*60)
    print("🚀 INICIANDO CICLO METAAPI")
    print("="*60)
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Importa MetaAPI
    try:
        from metaapi_cloud_sdk import MetaApi
    except ImportError:
        print("❌ SDK não instalado! Execute: pip install metaapi-cloud-sdk")
        return 0

    # Busca contas do backend
    accounts = fetch_accounts_from_backend()
    if not accounts:
        print("⚠️ Nenhuma conta encontrada!")
        return 0

    # Conecta ao MetaAPI
    print("\n📡 Conectando ao MetaAPI...")
    api = MetaApi(METAAPI_TOKEN)

    # Processa contas (sequencial por ora, paralelo pode sobrecarregar)
    success_count = 0
    for account in accounts:
        try:
            if await process_single_account(api, account):
                success_count += 1
        except Exception as e:
            print(f"❌ Erro ao processar {account['login']}: {e}")

    print("\n" + "="*60)
    print(f"✅ CICLO COMPLETO: {success_count}/{len(accounts)} contas")
    print("="*60)

    return success_count

async def run_collector_loop():
    """Loop contínuo de coleta"""
    print("\n" + "="*60)
    print("🚀 iDeepX METAAPI COLLECTOR")
    print("="*60)
    print(f"⚙️ Intervalo: {CYCLE_INTERVAL}s")
    print(f"⚙️ Backend: {BACKEND_URL}")
    print("="*60)

    cycle_count = 0

    while True:
        try:
            cycle_count += 1
            print(f"\n🔄 Ciclo #{cycle_count}")

            await run_collection_cycle()

            print(f"\n⏰ Próximo ciclo em {CYCLE_INTERVAL}s...")
            await asyncio.sleep(CYCLE_INTERVAL)

        except KeyboardInterrupt:
            print("\n⏹️ Collector interrompido pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no loop: {e}")
            await asyncio.sleep(5)

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        print("🎯 Modo: Ciclo único")
        asyncio.run(run_collection_cycle())
    else:
        print("🎯 Modo: Loop contínuo")
        asyncio.run(run_collector_loop())
