"""
Teste de historico de deals via MetaAPI
"""

import asyncio
from datetime import datetime, timedelta, timezone

METAAPI_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxNzUxZWNiMWZhMTMyMmU1ZmYwNTBhMjEzNzg5OTNjNSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMTc1MWVjYjFmYTEzMjJlNWZmMDUwYTIxMzc4OTkzYzUiLCJpYXQiOjE3NjQyMzk3MjZ9.PoznNv5cV78-MScbIQtyeAxe8SuNWgxCO49AwPKIdmO2vcYpkG6_ZnwCw_LY1SIYgmNLKvyn2r6L3AHYLxINogCYnEKzI3Qh7lfbS4c-Dci9o_-pCgNurSHszuJJdFVUKIPSnSV_g-fk6ONMKtNhpxwzbYoAoaMeZN4VvDxqCHKdELem0ii6pxYO7uvOvUq0WWj0I91AEsiK37SUoL6nlk-jDEJkY1DkN0mV0sTEDXP9Nm9KRXEMareAyuJ0kKOOSOh9tTADR84bOF-wICLPjqYnHlOKoQ5c-zxYK9sPjRDpePLHpJOhxRWsntjH_B5Yk7tb2arZS6LxHP6_OIYnX_7EuHpKNHT-OvGMfyhIMud8XgA_BgDmMp_fcNCr3gziJG62sDStWTZXWLMUU3l_JN0Wal12cWMGNSwgkUr1XQL2wlgZudGd0L4Yfe7N3aLHKTdH4XeWuAFEDekNBQbSDosm1ImnjiTGjEYypUoJRlGcm-4eyQ3AplNTPZJYDikfPhVBpWOYyJa4wPdp-Qjy-dEOaC5rFc6PMlWhV2_nWUCznYuDcBXXuBqlfrR_QDVMjq4vIWOKCe1EFukI089EbYrLiBgNfyhPDxFKDIv75Ye8MzYlg_P4RGykrbTJ_JPCeSjxWSg4Sur-S0u42ozdh-TnNB3hcAw8EJuF-JrZ0Ag"

# ID da conta GMI no MetaAPI
GMI_METAAPI_ID = "f644911c-0076-4791-8aaa-38d96d3e8fb9"

async def test_deals():
    from metaapi_cloud_sdk import MetaApi

    print("=" * 60)
    print("TESTE DE HISTORICO DE DEALS")
    print("=" * 60)

    api = MetaApi(METAAPI_TOKEN)

    # Obtém a conta
    print("\n1. Conectando na conta GMI...")
    account = await api.metatrader_account_api.get_account(GMI_METAAPI_ID)

    print(f"   Estado: {account.state}")

    # Conecta
    connection = account.get_rpc_connection()
    await connection.connect()
    await connection.wait_synchronized()
    print("   Conectado!")

    # Define períodos
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    print(f"\n2. Períodos:")
    print(f"   Hoje: {start_of_day}")
    print(f"   Semana: {start_of_week}")
    print(f"   Mês: {start_of_month}")

    # Testa diferentes métodos
    print("\n3. Testando métodos disponíveis...")

    # Método 1: get_deals_by_time_range
    try:
        print("\n   a) get_deals_by_time_range...")
        deals = await connection.get_deals_by_time_range(start_of_month, now)
        print(f"      Resultado: {len(deals) if deals else 0} deals")
        if deals and len(deals) > 0:
            print(f"      Exemplo: {deals[0]}")
    except Exception as e:
        print(f"      ERRO: {e}")

    # Método 2: get_history_orders_by_time_range
    try:
        print("\n   b) get_history_orders_by_time_range...")
        orders = await connection.get_history_orders_by_time_range(start_of_month, now)
        print(f"      Resultado: {len(orders) if orders else 0} orders")
        if orders and len(orders) > 0:
            print(f"      Exemplo: {orders[0]}")
    except Exception as e:
        print(f"      ERRO: {e}")

    # Método 3: Histórico desde sempre (30 dias)
    try:
        print("\n   c) Histórico 30 dias...")
        start_30d = now - timedelta(days=30)
        deals_30d = await connection.get_deals_by_time_range(start_30d, now)
        print(f"      Resultado: {len(deals_30d) if deals_30d else 0} deals")

        if deals_30d:
            # Mostra tipo e estrutura
            print(f"\n   Tipo: {type(deals_30d)}")
            print(f"   Conteudo completo: {deals_30d}")

            # Se for dict, mostra as chaves
            if isinstance(deals_30d, dict):
                print(f"   Chaves: {deals_30d.keys()}")

            # Tenta diferentes formas de acesso
            deal = deals_30d[0]
            if isinstance(deal, dict):
                print(f"   É dict - profit: {deal.get('profit')}")
            elif hasattr(deal, 'profit'):
                print(f"   É objeto - profit: {deal.profit}")
            elif isinstance(deal, str):
                print(f"   É string!")
                import json
                try:
                    parsed = json.loads(deal)
                    print(f"   Parsed: {parsed}")
                except:
                    pass

            day_pl = 0
            week_pl = 0
            month_pl = 0

            for deal in deals_30d:
                # Tenta acessar como objeto ou dict
                if isinstance(deal, dict):
                    profit = deal.get('profit', 0) or 0
                    swap = deal.get('swap', 0) or 0
                    commission = deal.get('commission', 0) or 0
                    deal_time = deal.get('time')
                elif hasattr(deal, 'profit'):
                    profit = getattr(deal, 'profit', 0) or 0
                    swap = getattr(deal, 'swap', 0) or 0
                    commission = getattr(deal, 'commission', 0) or 0
                    deal_time = getattr(deal, 'time', None)
                else:
                    continue

                total = profit + swap + commission

                if deal_time:
                    if isinstance(deal_time, str):
                        dt = datetime.fromisoformat(deal_time.replace('Z', '+00:00'))
                    else:
                        dt = deal_time
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)

                    if dt >= start_of_day:
                        day_pl += total
                    if dt >= start_of_week:
                        week_pl += total
                    month_pl += total

            print(f"\n   RESULTADO P/L:")
            print(f"      Dia: ${day_pl:.2f}")
            print(f"      Semana: ${week_pl:.2f}")
            print(f"      Mês: ${month_pl:.2f}")
    except Exception as e:
        print(f"      ERRO: {e}")
        import traceback
        traceback.print_exc()

    # Fecha
    await connection.close()
    print("\n" + "=" * 60)
    print("TESTE CONCLUÍDO")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_deals())
