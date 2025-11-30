"""
🌙 iDeepX MetaAPI Daily Collector
==================================
Coleta dados MT5 uma vez por dia para economizar custos MetaAPI.

Funcionalidades:
- Deploy sob demanda (não mantém contas ativas 24/7)
- Coleta automática na virada do dia forex (17:00 EST = 22:00 UTC)
- Pode ser acionado manualmente via API
- Suporta coleta de data específica (histórico)

Economia: ~99% redução de custos MetaAPI
- Antes: 24h/dia deployed = ~720h/mês por conta
- Agora: ~5min/dia deployed = ~2.5h/mês por conta
"""

import asyncio
import requests
import sys
import argparse
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

# ==========================================
# CONFIGURAÇÕES
# ==========================================

METAAPI_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxNzUxZWNiMWZhMTMyMmU1ZmYwNTBhMjEzNzg5OTNjNSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMTc1MWVjYjFmYTEzMjJlNWZmMDUwYTIxMzc4OTkzYzUiLCJpYXQiOjE3NjQyMzk3MjZ9.PoznNv5cV78-MScbIQtyeAxe8SuNWgxCO49AwPKIdmO2vcYpkG6_ZnwCw_LY1SIYgmNLKvyn2r6L3AHYLxINogCYnEKzI3Qh7lfbS4c-Dci9o_-pCgNurSHszuJJdFVUKIPSnSV_g-fk6ONMKtNhpxwzbYoAoaMeZN4VvDxqCHKdELem0ii6pxYO7uvOvUq0WWj0I91AEsiK37SUoL6nlk-jDEJkY1DkN0mV0sTEDXP9Nm9KRXEMareAyuJ0kKOOSOh9tTADR84bOF-wICLPjqYnHlOKoQ5c-zxYK9sPjRDpePLHpJOhxRWsntjH_B5Yk7tb2arZS6LxHP6_OIYnX_7EuHpKNHT-OvGMfyhIMud8XgA_BgDmMp_fcNCr3gziJG62sDStWTZXWLMUU3l_JN0Wal12cWMGNSwgkUr1XQL2wlgZudGd0L4Yfe7N3aLHKTdH4XeWuAFEDekNBQbSDosm1ImnjiTGjEYypUoJRlGcm-4eyQ3AplNTPZJYDikfPhVBpWOYyJa4wPdp-Qjy-dEOaC5rFc6PMlWhV2_nWUCznYuDcBXXuBqlfrR_QDVMjq4vIWOKCe1EFukI089EbYrLiBgNfyhPDxFKDIv75Ye8MzYlg_P4RGykrbTJ_JPCeSjxWSg4Sur-S0u42ozdh-TnNB3hcAw8EJuF-JrZ0Ag"

BACKEND_URL = "http://localhost:5001"

# Horário de coleta forex (17:00 EST = 22:00 UTC)
FOREX_DAY_END_HOUR_UTC = 22

# ==========================================
# CACHE DE CONTAS METAAPI
# ==========================================

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

def notify_backend_collection_status(status: str, details: Dict) -> bool:
    """Notifica o backend sobre o status da coleta"""
    try:
        url = f"{BACKEND_URL}/api/mt5/collection-status"
        data = {
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **details
        }
        response = requests.post(url, json=data, timeout=10)
        return response.status_code == 200
    except:
        return False

# ==========================================
# METAAPI FUNCTIONS
# ==========================================

async def get_metaapi_account_id(api, account_data: Dict) -> Optional[str]:
    """Obtém o ID da conta no MetaAPI"""
    login = str(account_data['login'])

    if login in metaapi_accounts_cache:
        return metaapi_accounts_cache[login]

    try:
        accounts = await api.metatrader_account_api.get_accounts_with_infinite_scroll_pagination()
        for acc in accounts:
            if str(acc.login) == login:
                metaapi_accounts_cache[login] = acc.id
                return acc.id
        return None
    except Exception as e:
        print(f"❌ Erro ao buscar conta MetaAPI: {e}")
        return None

async def deploy_account(api, metaapi_id: str) -> bool:
    """Faz deploy de uma conta (ativa conexão)"""
    try:
        account = await api.metatrader_account_api.get_account(metaapi_id)

        if account.state == 'DEPLOYED':
            print(f"   ✅ Conta já está deployed")
            return True

        print(f"   🚀 Fazendo deploy...")
        await account.deploy()
        await account.wait_deployed(timeout_in_seconds=120)
        print(f"   ✅ Deploy concluído!")
        return True
    except Exception as e:
        print(f"   ❌ Erro no deploy: {e}")
        return False

async def undeploy_account(api, metaapi_id: str) -> bool:
    """Faz undeploy de uma conta (desativa conexão para economizar)"""
    try:
        account = await api.metatrader_account_api.get_account(metaapi_id)

        if account.state == 'UNDEPLOYED':
            print(f"   ✅ Conta já está undeployed")
            return True

        print(f"   🔌 Fazendo undeploy...")
        await account.undeploy()
        await account.wait_undeployed(timeout_in_seconds=60)
        print(f"   ✅ Undeploy concluído!")
        return True
    except Exception as e:
        print(f"   ⚠️ Erro no undeploy: {e}")
        return False

async def collect_account_data(api, metaapi_id: str, backend_account_id: str, reference_date: datetime = None) -> Optional[Dict]:
    """
    Coleta dados de uma conta via MetaAPI.

    Args:
        api: Instância do MetaApi
        metaapi_id: ID da conta no MetaAPI
        backend_account_id: ID da conta no backend
        reference_date: Data de referência para cálculo de P/L (default: agora)
    """
    try:
        account = await api.metatrader_account_api.get_account(metaapi_id)

        # Conecta via RPC
        connection = account.get_rpc_connection()
        await connection.connect()
        await connection.wait_synchronized()

        # Dados básicos da conta
        account_info = await connection.get_account_information()
        positions = await connection.get_positions()

        balance = account_info.get('balance', 0)
        equity = account_info.get('equity', 0)
        margin = account_info.get('margin', 0)
        free_margin = account_info.get('freeMargin', 0)
        margin_level = account_info.get('marginLevel', 0)

        open_trades = len(positions) if positions else 0
        open_pl = sum([pos.get('profit', 0) for pos in positions]) if positions else 0

        # Calcula P/L baseado na data de referência
        now = reference_date if reference_date else datetime.now(timezone.utc)

        # Períodos de calendário
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

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

        # Busca deals separadamente para cada período
        day_response = await connection.get_deals_by_time_range(start_of_day, now)
        day_deals = day_response.get('deals', []) if isinstance(day_response, dict) else day_response
        day_pl = calc_pl_from_deals(day_deals)

        week_response = await connection.get_deals_by_time_range(start_of_week, now)
        week_deals = week_response.get('deals', []) if isinstance(week_response, dict) else week_response
        week_pl = calc_pl_from_deals(week_deals)

        month_response = await connection.get_deals_by_time_range(start_of_month, now)
        month_deals = month_response.get('deals', []) if isinstance(month_response, dict) else month_response
        month_pl = calc_pl_from_deals(month_deals)

        print(f"   📊 P/L: Dia=${day_pl:.2f}, Semana=${week_pl:.2f}, Mês=${month_pl:.2f}")

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
            'totalPL': float(equity - balance),
            'collectionDate': now.isoformat()
        }

    except Exception as e:
        print(f"   ❌ Erro ao coletar dados: {e}")
        return None

# ==========================================
# COLETA PRINCIPAL
# ==========================================

async def run_daily_collection(reference_date: datetime = None, skip_undeploy: bool = False) -> Dict:
    """
    Executa a coleta diária de todas as contas.

    Args:
        reference_date: Data de referência para P/L (default: agora)
        skip_undeploy: Se True, não faz undeploy após coleta (útil para debug)

    Returns:
        Dict com resultado da coleta
    """
    start_time = datetime.now(timezone.utc)

    print("\n" + "="*60)
    print("🌙 iDeepX DAILY COLLECTOR")
    print("="*60)
    print(f"⏰ Início: {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    if reference_date:
        print(f"📅 Data de referência: {reference_date.strftime('%Y-%m-%d')}")
    print("="*60)

    result = {
        'success': False,
        'startTime': start_time.isoformat(),
        'accounts_processed': 0,
        'accounts_success': 0,
        'accounts_failed': 0,
        'errors': []
    }

    try:
        from metaapi_cloud_sdk import MetaApi
    except ImportError:
        error = "SDK não instalado! Execute: pip install metaapi-cloud-sdk"
        print(f"❌ {error}")
        result['errors'].append(error)
        return result

    # Busca contas do backend
    accounts = fetch_accounts_from_backend()
    if not accounts:
        error = "Nenhuma conta MT5 encontrada"
        print(f"⚠️ {error}")
        result['errors'].append(error)
        return result

    result['accounts_processed'] = len(accounts)

    # Conecta ao MetaAPI
    print("\n📡 Conectando ao MetaAPI...")
    api = MetaApi(METAAPI_TOKEN)

    # Processa cada conta
    for account in accounts:
        login = account['login']
        backend_id = account['id']

        print(f"\n{'='*50}")
        print(f"🎯 Processando: {login}@{account['server']}")
        print(f"{'='*50}")

        try:
            # 1. Obtém ID MetaAPI
            metaapi_id = await get_metaapi_account_id(api, account)
            if not metaapi_id:
                error = f"Conta {login} não encontrada no MetaAPI"
                print(f"   ❌ {error}")
                result['accounts_failed'] += 1
                result['errors'].append(error)
                continue

            # 2. Deploy (ativa conexão)
            if not await deploy_account(api, metaapi_id):
                error = f"Falha no deploy da conta {login}"
                result['accounts_failed'] += 1
                result['errors'].append(error)
                continue

            # 3. Coleta dados
            data = await collect_account_data(api, metaapi_id, backend_id, reference_date)
            if not data:
                error = f"Falha ao coletar dados da conta {login}"
                result['accounts_failed'] += 1
                result['errors'].append(error)
                # Faz undeploy mesmo se falhou
                if not skip_undeploy:
                    await undeploy_account(api, metaapi_id)
                continue

            # 4. Envia para backend
            print(f"   📤 Enviando para backend...")
            print(f"      Balance: ${data['balance']:.2f}")
            print(f"      Equity: ${data['equity']:.2f}")

            if send_to_backend(data):
                result['accounts_success'] += 1
            else:
                error = f"Falha ao enviar dados da conta {login}"
                result['accounts_failed'] += 1
                result['errors'].append(error)

            # 5. Undeploy (desativa conexão para economizar)
            if not skip_undeploy:
                await undeploy_account(api, metaapi_id)

        except Exception as e:
            error = f"Erro processando conta {login}: {str(e)}"
            print(f"   ❌ {error}")
            result['accounts_failed'] += 1
            result['errors'].append(error)

    # Finaliza
    end_time = datetime.now(timezone.utc)
    duration = (end_time - start_time).total_seconds()

    result['success'] = result['accounts_failed'] == 0
    result['endTime'] = end_time.isoformat()
    result['durationSeconds'] = duration

    print("\n" + "="*60)
    print("📊 RESUMO DA COLETA")
    print("="*60)
    print(f"✅ Sucesso: {result['accounts_success']}/{result['accounts_processed']}")
    print(f"❌ Falhas: {result['accounts_failed']}")
    print(f"⏱️ Duração: {duration:.1f}s")
    print("="*60)

    # Notifica backend sobre o status
    notify_backend_collection_status(
        'completed' if result['success'] else 'partial',
        {
            'accounts_success': result['accounts_success'],
            'accounts_failed': result['accounts_failed'],
            'duration_seconds': duration
        }
    )

    return result

# ==========================================
# SCHEDULER (Loop para coleta automática)
# ==========================================

async def run_scheduler():
    """
    Loop que aguarda o horário de coleta e executa automaticamente.
    Horário: 22:00 UTC (17:00 EST - fim do dia forex)
    """
    print("\n" + "="*60)
    print("🕐 SCHEDULER DAILY COLLECTOR")
    print("="*60)
    print(f"📅 Horário de coleta: {FOREX_DAY_END_HOUR_UTC}:00 UTC (17:00 EST)")
    print("💡 Pressione Ctrl+C para parar")
    print("="*60)

    while True:
        now = datetime.now(timezone.utc)

        # Calcula próximo horário de coleta
        next_collection = now.replace(
            hour=FOREX_DAY_END_HOUR_UTC,
            minute=0,
            second=0,
            microsecond=0
        )

        # Se já passou do horário hoje, agenda para amanhã
        if now >= next_collection:
            next_collection += timedelta(days=1)

        wait_seconds = (next_collection - now).total_seconds()

        print(f"\n⏳ Próxima coleta: {next_collection.strftime('%Y-%m-%d %H:%M')} UTC")
        print(f"   Aguardando {wait_seconds/3600:.1f} horas...")

        try:
            await asyncio.sleep(wait_seconds)

            # Executa coleta
            print(f"\n🔔 Horário de coleta! Iniciando...")
            await run_daily_collection()

        except asyncio.CancelledError:
            print("\n⏹️ Scheduler interrompido")
            break

# ==========================================
# MAIN
# ==========================================

def main():
    parser = argparse.ArgumentParser(
        description='iDeepX MetaAPI Daily Collector',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python metaapi_daily_collector.py --now           # Coleta agora
  python metaapi_daily_collector.py --date 2025-11-26  # Coleta com data específica
  python metaapi_daily_collector.py --scheduler     # Inicia scheduler automático
  python metaapi_daily_collector.py --no-undeploy   # Coleta sem fazer undeploy
        """
    )

    parser.add_argument('--now', action='store_true',
                       help='Executa coleta imediatamente')
    parser.add_argument('--date', type=str,
                       help='Data de referência para P/L (formato: YYYY-MM-DD)')
    parser.add_argument('--scheduler', action='store_true',
                       help='Inicia scheduler para coleta automática diária')
    parser.add_argument('--no-undeploy', action='store_true',
                       help='Não faz undeploy após coleta (debug)')

    args = parser.parse_args()

    # Parse data de referência se fornecida
    reference_date = None
    if args.date:
        try:
            reference_date = datetime.strptime(args.date, '%Y-%m-%d')
            reference_date = reference_date.replace(
                hour=23, minute=59, second=59,
                tzinfo=timezone.utc
            )
            print(f"📅 Usando data de referência: {args.date}")
        except ValueError:
            print(f"❌ Formato de data inválido: {args.date}")
            print("   Use o formato: YYYY-MM-DD (ex: 2025-11-26)")
            sys.exit(1)

    if args.scheduler:
        # Modo scheduler (loop automático)
        print("🕐 Modo: Scheduler automático")
        asyncio.run(run_scheduler())
    elif args.now or args.date:
        # Modo coleta única
        print("🎯 Modo: Coleta única")
        result = asyncio.run(run_daily_collection(
            reference_date=reference_date,
            skip_undeploy=args.no_undeploy
        ))

        # Exit code baseado no resultado
        if result['success']:
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        # Sem argumentos - mostra ajuda
        parser.print_help()
        print("\n💡 Dica: Use --now para coleta imediata ou --scheduler para automático")

if __name__ == "__main__":
    main()
