#!/usr/bin/env python3
"""
🔧 Configuration Loader - Auto-detect Local vs Testnet

Detecta automaticamente qual ambiente usar:
- --local: Usa Hardhat Local (BNB infinito)
- --testnet: Usa BSC Testnet (faucets)
- Padrão: Testnet (compatibilidade retroativa)
"""

import os
import sys
from dotenv import load_dotenv

class NetworkConfig:
    """Configuração de rede"""

    def __init__(self, use_local=False):
        self.use_local = use_local

        if use_local:
            self._load_local_config()
        else:
            self._load_testnet_config()

    def _load_local_config(self):
        """Carrega configuração LOCAL (Hardhat)"""
        # Carrega .env.local
        if os.path.exists('.env.local'):
            load_dotenv('.env.local', override=True)
        else:
            raise FileNotFoundError(
                "❌ .env.local not found!\n"
                "Run: npx hardhat node\n"
                "Then: npx hardhat run scripts/deploy_local.js --network hardhat"
            )

        self.network_name = "Hardhat Local"
        self.rpc_url = os.getenv('LOCAL_RPC_URL', 'http://127.0.0.1:8545')
        self.chain_id = int(os.getenv('LOCAL_CHAIN_ID', '31337'))
        self.private_key = os.getenv('LOCAL_PRIVATE_KEY')
        self.contract_address = os.getenv('LOCAL_CONTRACT_ADDRESS')
        self.usdt_address = os.getenv('LOCAL_USDT_ADDRESS')

        # Validar
        if not self.contract_address:
            raise ValueError(
                "❌ LOCAL_CONTRACT_ADDRESS not set in .env.local!\n"
                "Run: npx hardhat run scripts/deploy_local.js --network hardhat"
            )

        if not self.usdt_address:
            raise ValueError(
                "❌ LOCAL_USDT_ADDRESS not set in .env.local!\n"
                "Run: npx hardhat run scripts/deploy_local.js --network hardhat"
            )

    def _load_testnet_config(self):
        """Carrega configuração TESTNET (BSC)"""
        # Carrega .env normal
        load_dotenv()

        self.network_name = "BSC Testnet"
        self.rpc_url = os.getenv(
            'TESTNET_RPC_URL',
            'https://data-seed-prebsc-1-s1.binance.org:8545/'
        )
        self.chain_id = 97
        self.private_key = os.getenv('TESTNET_PRIVATE_KEY') or os.getenv('PRIVATE_KEY')
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        self.usdt_address = os.getenv('USDT_TESTNET') or os.getenv('USDT_ADDRESS')

        # Validar
        if not self.contract_address:
            raise ValueError("❌ CONTRACT_ADDRESS not set in .env!")

        if not self.usdt_address:
            raise ValueError("❌ USDT_TESTNET not set in .env!")

    def __str__(self):
        return f"""
🌐 Network Configuration
{'='*50}
Network: {self.network_name}
RPC URL: {self.rpc_url}
Chain ID: {self.chain_id}
Contract: {self.contract_address}
USDT: {self.usdt_address}
{'='*50}
"""


def get_network_config():
    """
    Detecta qual configuração usar baseado em argumentos

    Returns:
        NetworkConfig: Configuração da rede
    """
    # Detectar argumentos
    use_local = False

    if '--local' in sys.argv:
        use_local = True
        sys.argv.remove('--local')  # Remove para não interferir com outros parsers
        print("🚀 Using HARDHAT LOCAL (BNB infinito!)")
    elif '--testnet' in sys.argv:
        use_local = False
        sys.argv.remove('--testnet')
        print("🌐 Using BSC TESTNET (faucets)")
    else:
        # Padrão: testnet (compatibilidade retroativa)
        use_local = False
        print("🌐 Using BSC TESTNET (default)")
        print("   Tip: Use --local for infinite BNB!")

    try:
        config = NetworkConfig(use_local=use_local)
        print(config)
        return config
    except Exception as e:
        print(f"\n❌ Configuration Error:\n{e}\n")
        sys.exit(1)


if __name__ == "__main__":
    """Test configuration loader"""
    print("🔧 Testing Configuration Loader\n")

    # Test local
    print("Testing --local:")
    sys.argv.append('--local')
    config = get_network_config()
    print(f"✅ Local config loaded: {config.network_name}\n")

    # Test testnet
    print("Testing --testnet:")
    sys.argv = [sys.argv[0], '--testnet']
    config = get_network_config()
    print(f"✅ Testnet config loaded: {config.network_name}\n")
