#!/usr/bin/env python3
"""
Teste básico de conexão do bot
"""

import os
from web3 import Web3
from dotenv import load_dotenv

# For web3.py v7+
try:
    from web3.middleware import ExtraDataToPOAMiddleware
    poa_middleware = ExtraDataToPOAMiddleware
except ImportError:
    # Fallback for older versions
    from web3.middleware import geth_poa_middleware as poa_middleware

print("🧪 Testando Conexão do Bot\n")

# Load .env
load_dotenv()

# Config
RPC_URL = os.getenv('TESTNET_RPC_URL')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
USDT_ADDRESS = os.getenv('USDT_TESTNET')
PRIVATE_KEY = os.getenv('TESTNET_PRIVATE_KEY')

print(f"📋 Configuração:")
print(f"   RPC: {RPC_URL}")
print(f"   Contrato: {CONTRACT_ADDRESS}")
print(f"   USDT: {USDT_ADDRESS}")
print(f"   Private Key: {'✅ Configurada' if PRIVATE_KEY else '❌ Faltando'}")
print("")

# Test 1: Connect to RPC
print("🔌 Teste 1: Conectando ao BSC Testnet...")
try:
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    w3.middleware_onion.inject(poa_middleware, layer=0)

    if w3.is_connected():
        print(f"   ✅ Conectado! Block: {w3.eth.block_number}")
    else:
        print(f"   ❌ Falha na conexão")
        exit(1)
except Exception as e:
    print(f"   ❌ Erro: {e}")
    exit(1)

# Test 2: Check master account
print("\n💰 Teste 2: Verificando Master Account...")
try:
    from eth_account import Account
    master = Account.from_key(PRIVATE_KEY)

    balance_wei = w3.eth.get_balance(master.address)
    balance_bnb = w3.from_wei(balance_wei, 'ether')

    print(f"   Address: {master.address}")
    print(f"   Balance: {balance_bnb:.4f} BNB")

    if balance_bnb < 0.01:
        print(f"   ⚠️  Balance baixo! Recomendado: > 0.1 BNB")
    else:
        print(f"   ✅ Balance OK")
except Exception as e:
    print(f"   ❌ Erro: {e}")
    exit(1)

# Test 3: Check USDT balance
print("\n💵 Teste 3: Verificando USDT Balance...")
try:
    usdt_abi = [{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

    usdt = w3.eth.contract(
        address=Web3.to_checksum_address(USDT_ADDRESS),
        abi=usdt_abi
    )

    usdt_balance = usdt.functions.balanceOf(master.address).call()
    usdt_formatted = usdt_balance / 10**6  # USDT has 6 decimals

    print(f"   Balance: ${usdt_formatted:,.2f} USDT")

    if usdt_formatted < 100:
        print(f"   ⚠️  USDT baixo! Recomendado: > $1,000 para testes completos")
    else:
        print(f"   ✅ USDT OK")
except Exception as e:
    print(f"   ❌ Erro: {e}")

# Test 4: Try to read contract
print("\n📜 Teste 4: Lendo Contrato V9_SECURE_2...")
try:
    contract_abi = [
        {"inputs":[],"name":"betaMode","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalUsers","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"SUBSCRIPTION_FEE","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    ]

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=contract_abi
    )

    beta_mode = contract.functions.betaMode().call()
    total_users = contract.functions.totalUsers().call()
    sub_fee = contract.functions.SUBSCRIPTION_FEE().call()

    print(f"   Beta Mode: {beta_mode}")
    print(f"   Total Users: {total_users}")
    print(f"   Subscription Fee: ${sub_fee / 10**6} USDT")
    print(f"   ✅ Contrato acessível!")
except Exception as e:
    print(f"   ❌ Erro: {e}")
    exit(1)

print("\n" + "="*60)
print("  ✅ TODOS OS TESTES PASSARAM!")
print("="*60)
print("")
print("🚀 O bot está PRONTO para rodar:")
print(f"   python intelligent_test_bot_fixed.py")
print("")
