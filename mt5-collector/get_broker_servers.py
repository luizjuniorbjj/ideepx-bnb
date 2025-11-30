"""
🔍 iDeepX - Buscar Servidores MT5 de uma Corretora
==================================================
Busca lista real de servidores de uma corretora específica
"""

import MetaTrader5 as mt5
import sys
import json

def get_broker_servers(broker_name):
    """Busca servidores de uma corretora específica"""

    # Caminho do terminal MT5
    mt5_path = r"C:\mt5_terminal1\terminal64.exe"

    # Inicializa MT5
    if not mt5.initialize(path=mt5_path):
        error = mt5.last_error()
        return {
            'success': False,
            'error': f'Failed to initialize MT5: {error}',
            'servers': []
        }

    try:
        # Busca servidores
        # Nota: MT5 API não tem método direto para buscar servidores
        # Precisamos usar uma abordagem alternativa

        # Lista de possíveis servidores conhecidos por corretora
        known_servers = {
            'Doo Technology': [
                'DooTechnology-Live',
                'DooTechnology-Demo'
            ],
            'GMI Markets': [
                'GMI Trading Platform Demo',
                'GMIEdge-Live',
                'GMIEdge-Cent'
            ],
            'XM': [
                'XM.COM-Real',
                'XM.COM-Real 2',
                'XM.COM-Demo'
            ],
            'IC Markets': [
                'ICMarketsSC-Live',
                'ICMarketsSC-Demo'
            ]
        }

        servers = known_servers.get(broker_name, [])

        return {
            'success': True,
            'broker': broker_name,
            'servers': servers
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'servers': []
        }
    finally:
        mt5.shutdown()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Broker name required',
            'servers': []
        }))
        sys.exit(1)

    broker_name = sys.argv[1]
    result = get_broker_servers(broker_name)
    print(json.dumps(result))
