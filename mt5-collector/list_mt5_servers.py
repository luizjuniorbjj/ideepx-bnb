"""
🔍 iDeepX MT5 Server Finder
==========================
Lista todos os servidores MT5 disponíveis do terminal instalado
"""

import MetaTrader5 as mt5
import sys

def list_servers():
    """Lista todos os servidores MT5 disponíveis"""

    print("\n" + "="*60)
    print("🔍 iDeepX MT5 Server Finder")
    print("="*60 + "\n")

    print("="*60)
    print("📋 SERVIDORES MT5 CONHECIDOS")
    print("="*60 + "\n")

    # Tenta obter lista de servidores
    # Nota: A API do MT5 não tem método direto para listar todos os servidores
    # Mas podemos tentar alguns servidores conhecidos e mostrar informações

    known_brokers = {
        "Doo Technology": [
            "DooTechnology-Live",
            "DooTechnology-Demo"
        ],
        "GMI Markets": [
            "GMI Trading Platform Demo",
            "GMIEdge-Live",
            "GMIEdge-Cent"
        ],
        "XM": [
            "XM.COM-Real",
            "XM.COM-Real 2",
            "XM.COM-Demo"
        ],
        "IC Markets": [
            "ICMarketsSC-Live",
            "ICMarketsSC-Demo"
        ]
    }

    for broker, servers in known_brokers.items():
        print(f"📊 {broker}")
        print("-" * 60)
        for server in servers:
            print(f"   • {server}")
        print()

    print("="*60)
    print("💡 COMO ENCONTRAR SEU SERVIDOR")
    print("="*60 + "\n")
    print("1. Abra o MetaTrader 5")
    print("2. Clique em 'Arquivo' → 'Conectar a uma Conta de Negociação'")
    print("3. Digite o nome da sua corretora")
    print("4. A lista de servidores aparecerá")
    print("5. Copie o nome EXATO do servidor\n")

    print("="*60)
    print("📝 DICA IMPORTANTE")
    print("="*60 + "\n")
    print("O nome do servidor deve ser EXATAMENTE como aparece no MT5!")
    print("Exemplo:")
    print("  ✅ Correto: DooTechnology-Live")
    print("  ❌ Errado: DooTechnology Live")
    print("  ❌ Errado: Doo Technology Live\n")

    return True

if __name__ == "__main__":
    list_servers()
