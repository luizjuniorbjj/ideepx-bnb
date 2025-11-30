#!/usr/bin/env python3
"""
DEMO RÁPIDA - Bot de Testes
Apenas 3 usuários para demonstração
"""

import os
import sys
import time
import json
from datetime import datetime
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# For web3.py v7+
try:
    from web3.middleware import ExtraDataToPOAMiddleware as poa_middleware
except ImportError:
    from web3.middleware import geth_poa_middleware as poa_middleware

load_dotenv()

print("""
╔════════════════════════════════════════════════════════════╗
║  🎬 DEMONSTRAÇÃO - iDeepX V9_SECURE Test Bot              ║
║                                                            ║
║  Teste rápido com 3 usuários                              ║
╚════════════════════════════════════════════════════════════╝
""")

# ========== CONFIG ==========
RPC_URL = os.getenv('TESTNET_RPC_URL')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
USDT_ADDRESS = os.getenv('USDT_TESTNET')
PRIVATE_KEY = os.getenv('TESTNET_PRIVATE_KEY')

print(f"📋 Configuração:")
print(f"   Contrato: {CONTRACT_ADDRESS}")
print(f"   USDT: {USDT_ADDRESS}")
print("")

# ========== CONNECT ==========
print("🔌 Conectando ao BSC Testnet...")
w3 = Web3(Web3.HTTPProvider(RPC_URL))
w3.middleware_onion.inject(poa_middleware, layer=0)

if not w3.is_connected():
    print("❌ Falha na conexão!")
    sys.exit(1)

print(f"   ✅ Conectado! Block: {w3.eth.block_number}\n")

# ========== SETUP ACCOUNTS ==========
master = Account.from_key(PRIVATE_KEY)
print(f"👤 Master Account: {master.address}")

# Create 3 test users
users = []
for i in range(3):
    user = Account.create()
    users.append(user)
    print(f"   User {i+1}: {user.address[:10]}...")

print("")

# ========== SETUP CONTRACTS ==========
contract_abi = [
    {"inputs":[{"name":"sponsorWallet","type":"address"}],"name":"registerWithSponsor","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"months","type":"uint8"}],"name":"activateSubscriptionWithUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"withdrawAllEarnings","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"user","type":"address"}],"name":"getUserInfo","outputs":[{"name":"isRegistered","type":"bool"},{"name":"subscriptionActive","type":"bool"},{"name":"availableBalance","type":"uint256"},{"name":"subscriptionExpiration","type":"uint256"},{"name":"currentRank","type":"uint8"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalUsers","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"SUBSCRIPTION_FEE","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

usdt_abi = [
    {"inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)
usdt = w3.eth.contract(address=Web3.to_checksum_address(USDT_ADDRESS), abi=usdt_abi)

# ========== CHECK INITIAL STATE ==========
print("📊 Estado Inicial do Contrato:")
total_users = contract.functions.totalUsers().call()
sub_fee = contract.functions.SUBSCRIPTION_FEE().call()
print(f"   Total Users: {total_users}")
print(f"   Subscription Fee: ${sub_fee / 10**6} USDT")
print("")

# ========== DEMO TEST 1: Enviar BNB para usuários ==========
print("="*70)
print("  🧪 TESTE 1: Enviando BNB para usuários (gas)")
print("="*70)

# Get initial nonce and track it
master_nonce = w3.eth.get_transaction_count(master.address)

for i, user in enumerate(users):
    print(f"\n   [{i+1}/3] Enviando 0.01 BNB para User {i+1}...")

    tx = {
        'from': master.address,
        'to': user.address,
        'value': w3.to_wei(0.01, 'ether'),
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'nonce': master_nonce,
    }

    signed_tx = master.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print(f"       ✅ TX: {tx_hash.hex()[:20]}...")

    # Increment nonce for next transaction
    master_nonce += 1

print("\n✅ Teste 1 Completo!\n")

# ========== DEMO TEST 2: Enviar USDT para usuários ==========
print("="*70)
print("  🧪 TESTE 2: Enviando USDT para usuários")
print("="*70)

usdt_amount = int(100 * 10**6)  # $100 USDT

for i, user in enumerate(users):
    print(f"\n   [{i+1}/3] Enviando $100 USDT para User {i+1}...")

    tx = usdt.functions.transfer(user.address, usdt_amount).build_transaction({
        'from': master.address,
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
        'nonce': master_nonce,
    })

    signed_tx = master.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    balance = usdt.functions.balanceOf(user.address).call()
    print(f"       ✅ Balance: ${balance / 10**6} USDT")

    # Increment nonce for next transaction
    master_nonce += 1

print("\n✅ Teste 2 Completo!\n")

# ========== DEMO TEST 3: Registrar usuários ==========
print("="*70)
print("  🧪 TESTE 3: Registrando usuários no contrato")
print("="*70)

# User 1 -> sponsored by master
# User 2 -> sponsored by User 1
# User 3 -> sponsored by User 1

sponsors = [master.address, users[0].address, users[0].address]

for i, user in enumerate(users):
    print(f"\n   [{i+1}/3] Registrando User {i+1}...")
    print(f"       Sponsor: {sponsors[i][:10]}...")

    # Get user's current nonce and track it
    user_nonce = w3.eth.get_transaction_count(user.address)

    # Approve USDT
    approve_tx = usdt.functions.approve(CONTRACT_ADDRESS, sub_fee).build_transaction({
        'from': user.address,
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
        'nonce': user_nonce,
    })

    signed_approve = user.sign_transaction(approve_tx)
    tx_hash = w3.eth.send_raw_transaction(signed_approve.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"       ✅ USDT Approved")

    # Increment nonce for next transaction
    user_nonce += 1

    # Register
    register_tx = contract.functions.registerWithSponsor(sponsors[i]).build_transaction({
        'from': user.address,
        'gas': 500000,
        'gasPrice': w3.eth.gas_price,
        'nonce': user_nonce,
    })

    signed_register = user.sign_transaction(register_tx)
    tx_hash = w3.eth.send_raw_transaction(signed_register.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print(f"       ✅ Registrado! Gas: {receipt['gasUsed']:,}")

    # Check user info
    user_info = contract.functions.getUserInfo(user.address).call()
    print(f"       📊 Registered: {user_info[0]}, Active: {user_info[1]}, Balance: ${user_info[2] / 10**6}")

print("\n✅ Teste 3 Completo!\n")

# ========== DEMO TEST 4: Verificar estado final ==========
print("="*70)
print("  📊 ESTADO FINAL DO CONTRATO")
print("="*70)
print("")

total_users_final = contract.functions.totalUsers().call()
print(f"   Total Users: {total_users} → {total_users_final} (+{total_users_final - total_users})")
print("")

print("   Informações dos Usuários:")
for i, user in enumerate(users):
    user_info = contract.functions.getUserInfo(user.address).call()
    print(f"   User {i+1}:")
    print(f"      Registered: {user_info[0]}")
    print(f"      Active: {user_info[1]}")
    print(f"      Balance: ${user_info[2] / 10**6} USDT")
    print(f"      Rank: {user_info[4]}")
    print("")

print("="*70)
print("  ✅ DEMONSTRAÇÃO COMPLETA!")
print("="*70)
print("")
print("📊 Resumo:")
print(f"   ✅ 3 usuários criados")
print(f"   ✅ BNB enviado para gas")
print(f"   ✅ USDT enviado ($100 cada)")
print(f"   ✅ Usuários registrados no contrato")
print(f"   ✅ Árvore MLM criada (Master → User1 → User2,3)")
print("")
print("🎉 O bot está funcionando perfeitamente!")
print("")
