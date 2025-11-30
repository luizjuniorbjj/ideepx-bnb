"""
Script para verificar e fazer undeploy de todas as contas MetaAPI.
"""

import asyncio
import sys

METAAPI_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxNzUxZWNiMWZhMTMyMmU1ZmYwNTBhMjEzNzg5OTNjNSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMTc1MWVjYjFmYTEzMjJlNWZmMDUwYTIxMzc4OTkzYzUiLCJpYXQiOjE3NjQyMzk3MjZ9.PoznNv5cV78-MScbIQtyeAxe8SuNWgxCO49AwPKIdmO2vcYpkG6_ZnwCw_LY1SIYgmNLKvyn2r6L3AHYLxINogCYnEKzI3Qh7lfbS4c-Dci9o_-pCgNurSHszuJJdFVUKIPSnSV_g-fk6ONMKtNhpxwzbYoAoaMeZN4VvDxqCHKdELem0ii6pxYO7uvOvUq0WWj0I91AEsiK37SUoL6nlk-jDEJkY1DkN0mV0sTEDXP9Nm9KRXEMareAyuJ0kKOOSOh9tTADR84bOF-wICLPjqYnHlOKoQ5c-zxYK9sPjRDpePLHpJOhxRWsntjH_B5Yk7tb2arZS6LxHP6_OIYnX_7EuHpKNHT-OvGMfyhIMud8XgA_BgDmMp_fcNCr3gziJG62sDStWTZXWLMUU3l_JN0Wal12cWMGNSwgkUr1XQL2wlgZudGd0L4Yfe7N3aLHKTdH4XeWuAFEDekNBQbSDosm1ImnjiTGjEYypUoJRlGcm-4eyQ3AplNTPZJYDikfPhVBpWOYyJa4wPdp-Qjy-dEOaC5rFc6PMlWhV2_nWUCznYuDcBXXuBqlfrR_QDVMjq4vIWOKCe1EFukI089EbYrLiBgNfyhPDxFKDIv75Ye8MzYlg_P4RGykrbTJ_JPCeSjxWSg4Sur-S0u42ozdh-TnNB3hcAw8EJuF-JrZ0Ag"

async def check_and_undeploy(do_undeploy: bool = False):
    """Verifica status das contas e opcionalmente faz undeploy"""
    try:
        from metaapi_cloud_sdk import MetaApi
    except ImportError:
        print("❌ SDK não instalado! Execute: pip install metaapi-cloud-sdk")
        return

    print("\n" + "="*60)
    print("📊 VERIFICANDO STATUS DAS CONTAS METAAPI")
    print("="*60)

    api = MetaApi(METAAPI_TOKEN)

    print("\n📋 Buscando contas...")
    accounts = await api.metatrader_account_api.get_accounts_with_infinite_scroll_pagination()

    deployed_count = 0
    undeployed_count = 0

    print(f"\n{'Login':<15} {'Server':<25} {'State':<15} {'Action'}")
    print("-" * 70)

    for acc in accounts:
        state = acc.state
        login = acc.login
        server = acc.server if hasattr(acc, 'server') else 'N/A'

        if state == 'DEPLOYED':
            deployed_count += 1
            status_icon = "🟢"

            if do_undeploy:
                print(f"{login:<15} {server:<25} {state:<15} ⏳ Fazendo undeploy...")
                try:
                    await acc.undeploy()
                    await acc.wait_undeployed(timeout_in_seconds=60)
                    print(f"{login:<15} {server:<25} {'UNDEPLOYED':<15} ✅ Desconectado!")
                except Exception as e:
                    print(f"{login:<15} {server:<25} {state:<15} ❌ Erro: {e}")
            else:
                print(f"{login:<15} {server:<25} {state:<15} {status_icon} CONECTADO")
        else:
            undeployed_count += 1
            status_icon = "⚪"
            print(f"{login:<15} {server:<25} {state:<15} {status_icon} DESCONECTADO")

    print("\n" + "="*60)
    print("📊 RESUMO")
    print("="*60)
    print(f"   Total de contas: {len(accounts)}")
    print(f"   🟢 Deployed (conectadas): {deployed_count}")
    print(f"   ⚪ Undeployed (desconectadas): {undeployed_count}")

    if do_undeploy and deployed_count > 0:
        print(f"\n✅ Todas as contas foram desconectadas!")
    elif deployed_count > 0 and not do_undeploy:
        print(f"\n⚠️  {deployed_count} conta(s) estão conectadas!")
        print("   Execute com --undeploy para desconectar todas")

    print("="*60)

def main():
    do_undeploy = '--undeploy' in sys.argv

    if do_undeploy:
        print("🔌 Modo: Verificar E fazer undeploy de todas as contas")
    else:
        print("👀 Modo: Apenas verificar status (use --undeploy para desconectar)")

    asyncio.run(check_and_undeploy(do_undeploy))

if __name__ == "__main__":
    main()
