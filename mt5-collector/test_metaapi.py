"""
Teste de Conexao MetaAPI
========================
Testa conexao com conta MT5 via MetaAPI Cloud (sem MT5 Terminal local)

Documentacao: https://metaapi.cloud/docs/client/
SDK Python: https://pypi.org/project/metaapi-cloud-sdk/
"""

import asyncio
from datetime import datetime

# ==========================================
# CONFIGURACOES
# ==========================================

METAAPI_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxNzUxZWNiMWZhMTMyMmU1ZmYwNTBhMjEzNzg5OTNjNSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMTc1MWVjYjFmYTEzMjJlNWZmMDUwYTIxMzc4OTkzYzUiLCJpYXQiOjE3NjQyMzk3MjZ9.PoznNv5cV78-MScbIQtyeAxe8SuNWgxCO49AwPKIdmO2vcYpkG6_ZnwCw_LY1SIYgmNLKvyn2r6L3AHYLxINogCYnEKzI3Qh7lfbS4c-Dci9o_-pCgNurSHszuJJdFVUKIPSnSV_g-fk6ONMKtNhpxwzbYoAoaMeZN4VvDxqCHKdELem0ii6pxYO7uvOvUq0WWj0I91AEsiK37SUoL6nlk-jDEJkY1DkN0mV0sTEDXP9Nm9KRXEMareAyuJ0kKOOSOh9tTADR84bOF-wICLPjqYnHlOKoQ5c-zxYK9sPjRDpePLHpJOhxRWsntjH_B5Yk7tb2arZS6LxHP6_OIYnX_7EuHpKNHT-OvGMfyhIMud8XgA_BgDmMp_fcNCr3gziJG62sDStWTZXWLMUU3l_JN0Wal12cWMGNSwgkUr1XQL2wlgZudGd0L4Yfe7N3aLHKTdH4XeWuAFEDekNBQbSDosm1ImnjiTGjEYypUoJRlGcm-4eyQ3AplNTPZJYDikfPhVBpWOYyJa4wPdp-Qjy-dEOaC5rFc6PMlWhV2_nWUCznYuDcBXXuBqlfrR_QDVMjq4vIWOKCe1EFukI089EbYrLiBgNfyhPDxFKDIv75Ye8MzYlg_P4RGykrbTJ_JPCeSjxWSg4Sur-S0u42ozdh-TnNB3hcAw8EJuF-JrZ0Ag"

# Dados da conta MT5 para teste (usando conta Doo Prime)
TEST_ACCOUNT = {
    "login": "9942058",
    "password": "5cc41!eE",
    "server": "DooTechnology-Live",
    "platform": "mt5"
}

# ==========================================
# TESTE
# ==========================================

async def test_metaapi_connection():
    """Testa conexao com MetaAPI"""

    try:
        from metaapi_cloud_sdk import MetaApi
    except ImportError:
        print("SDK nao instalado! Execute: pip install metaapi-cloud-sdk")
        return False

    print("=" * 60)
    print("TESTE DE CONEXAO METAAPI")
    print("=" * 60)
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Token: {METAAPI_TOKEN[:20]}...")
    print("=" * 60)

    try:
        # 1. Conectar na API
        print("\n1. Conectando na MetaAPI...")
        api = MetaApi(METAAPI_TOKEN)
        print("   Conectado na API")

        # 2. Listar contas existentes
        print("\n2. Listando contas provisionadas...")
        accounts = await api.metatrader_account_api.get_accounts_with_infinite_scroll_pagination()

        print(f"   Contas encontradas: {len(accounts)}")

        existing_account = None
        for acc in accounts:
            print(f"   - {acc.name}: {acc.login}@{acc.server} (ID: {acc.id})")
            if str(acc.login) == TEST_ACCOUNT['login']:
                existing_account = acc

        # 3. Criar ou usar conta existente
        if existing_account:
            print(f"\n3. Usando conta existente: {existing_account.id}")
            account = existing_account
        else:
            print(f"\n3. Provisionando nova conta...")
            print(f"   Login: {TEST_ACCOUNT['login']}")
            print(f"   Server: {TEST_ACCOUNT['server']}")

            account = await api.metatrader_account_api.create_account({
                'name': f"iDeepX - {TEST_ACCOUNT['login']}",
                'type': 'cloud',
                'login': TEST_ACCOUNT['login'],
                'password': TEST_ACCOUNT['password'],
                'server': TEST_ACCOUNT['server'],
                'platform': TEST_ACCOUNT['platform'],
                'magic': 0
            })
            print(f"   Conta criada: {account.id}")

        # 4. Deploy da conta
        print("\n4. Fazendo deploy da conta...")
        await account.deploy()
        print("   Deploy iniciado")

        print("   Aguardando deploy...")
        await account.wait_deployed()
        print("   Conta deployed!")

        # 5. Conectar e sincronizar
        print("\n5. Conectando na conta MT5...")
        connection = account.get_rpc_connection()
        await connection.connect()

        print("   Aguardando sincronizacao...")
        await connection.wait_synchronized()
        print("   Conta sincronizada!")

        # 6. Buscar dados da conta
        print("\n6. Buscando dados da conta...")
        account_info = await connection.get_account_information()

        print("\n" + "=" * 60)
        print("DADOS DA CONTA MT5 (via MetaAPI Cloud)")
        print("=" * 60)
        print(f"   Nome: {account_info.get('name', 'N/A')}")
        print(f"   Login: {account_info.get('login', 'N/A')}")
        print(f"   Servidor: {account_info.get('server', 'N/A')}")
        print(f"   Corretora: {account_info.get('broker', 'N/A')}")
        print(f"   Moeda: {account_info.get('currency', 'N/A')}")
        print("-" * 60)
        print(f"   Balance: ${account_info.get('balance', 0):,.2f}")
        print(f"   Equity: ${account_info.get('equity', 0):,.2f}")
        print(f"   Margin: ${account_info.get('margin', 0):,.2f}")
        print(f"   Free Margin: ${account_info.get('freeMargin', 0):,.2f}")
        print(f"   Margin Level: {account_info.get('marginLevel', 0):.2f}%")
        print("=" * 60)

        # 7. Buscar posicoes abertas
        print("\n7. Buscando posicoes abertas...")
        positions = await connection.get_positions()

        if positions:
            print(f"   {len(positions)} posicao(es) aberta(s):")
            total_pl = 0
            for pos in positions:
                symbol = pos.get('symbol', 'N/A')
                pl = pos.get('profit', 0)
                total_pl += pl
                print(f"      - {symbol}: ${pl:,.2f}")
            print(f"   P/L Total Aberto: ${total_pl:,.2f}")
        else:
            print("   Nenhuma posicao aberta")

        # 8. Fechar conexao
        print("\n8. Fechando conexao...")
        await connection.close()
        print("   Conexao fechada")

        print("\n" + "=" * 60)
        print("TESTE CONCLUIDO COM SUCESSO!")
        print("=" * 60)
        print("\nMetaAPI esta funcionando!")
        print("Podemos integrar no sistema iDeepX para escala.")

        return True

    except Exception as e:
        print(f"\nERRO: {e}")
        import traceback
        traceback.print_exc()
        return False

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    print("\nIniciando teste MetaAPI...\n")
    result = asyncio.run(test_metaapi_connection())

    if result:
        print("\nPronto para integrar MetaAPI!")
    else:
        print("\nVerifique os erros acima")
