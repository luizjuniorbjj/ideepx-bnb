#!/usr/bin/env python3
"""
Script para corrigir o intelligent_test_bot.py para V9_SECURE_2
"""

import re

# Ler o arquivo original
with open('intelligent_test_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# ========== FIX 1: Remover withdrawEarnings (não existe) ==========
content = content.replace(
    '''    {
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "withdrawEarnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },''',
    ''
)

# ========== FIX 2: Atualizar getUserInfo (10 → 5 params) ==========
content = content.replace(
    '''    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUserInfo",
        "outputs": [
            {"name": "isRegistered", "type": "bool"},
            {"name": "subscriptionActive", "type": "bool"},
            {"name": "totalEarned", "type": "uint256"},
            {"name": "availableBalance", "type": "uint256"},
            {"name": "totalWithdrawn", "type": "uint256"},
            {"name": "subscriptionExpiration", "type": "uint256"},
            {"name": "totalPaidWithBalance", "type": "uint256"},
            {"name": "pendingBonus", "type": "uint256"},
            {"name": "pendingInactive", "type": "uint256"},
            {"name": "currentRank", "type": "uint8"}
        ],
        "stateMutability": "view",
        "type": "function"
    },''',
    '''    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUserInfo",
        "outputs": [
            {"name": "isRegistered", "type": "bool"},
            {"name": "subscriptionActive", "type": "bool"},
            {"name": "availableBalance", "type": "uint256"},
            {"name": "subscriptionExpiration", "type": "uint256"},
            {"name": "currentRank", "type": "uint8"}
        ],
        "stateMutability": "view",
        "type": "function"
    },'''
)

# ========== FIX 3: Atualizar getSystemStats (8 → 4 params) ==========
content = content.replace(
    '''    {
        "inputs": [],
        "name": "getSystemStats",
        "outputs": [
            {"name": "_totalUsers", "type": "uint256"},
            {"name": "_totalActive", "type": "uint256"},
            {"name": "_totalPaidWithBalance", "type": "uint256"},
            {"name": "_totalMLMDistributed", "type": "uint256"},
            {"name": "_totalInactiveHistorical", "type": "uint256"},
            {"name": "_totalInactivePending", "type": "uint256"},
            {"name": "_contractBalance", "type": "uint256"},
            {"name": "_betaMode", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },''',
    '''    {
        "inputs": [],
        "name": "getSystemStats",
        "outputs": [
            {"name": "_totalUsers", "type": "uint256"},
            {"name": "_totalActive", "type": "uint256"},
            {"name": "_contractBalance", "type": "uint256"},
            {"name": "_betaMode", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },'''
)

# ========== FIX 4: Remover getSolvencyStatus (não existe) ==========
content = content.replace(
    '''    {
        "inputs": [],
        "name": "getSolvencyStatus",
        "outputs": [
            {"name": "isSolvent", "type": "bool"},
            {"name": "requiredBalance", "type": "uint256"},
            {"name": "currentBalance", "type": "uint256"},
            {"name": "surplus", "type": "uint256"},
            {"name": "deficit", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },''',
    ''
)

# ========== FIX 5: Atualizar getSecurityStatus (5 → 3 params) ==========
content = content.replace(
    '''    {
        "inputs": [],
        "name": "getSecurityStatus",
        "outputs": [
            {"name": "_multisig", "type": "address"},
            {"name": "_emergencyReserve", "type": "uint256"},
            {"name": "_circuitBreakerActive", "type": "bool"},
            {"name": "_solvencyRatio", "type": "uint256"},
            {"name": "_totalEmergencyReserveUsed", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },''',
    '''    {
        "inputs": [],
        "name": "getSecurityStatus",
        "outputs": [
            {"name": "_emergencyReserve", "type": "uint256"},
            {"name": "_circuitBreakerActive", "type": "bool"},
            {"name": "_solvencyRatio", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },'''
)

# ========== FIX 6: Remover getWithdrawalLimits (não existe) ==========
content = content.replace(
    '''    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getWithdrawalLimits",
        "outputs": [
            {"name": "maxPerTx", "type": "uint256"},
            {"name": "maxPerMonth", "type": "uint256"},
            {"name": "remainingThisMonth", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },''',
    ''
)

# ========== FIX 7: Adicionar funções faltando no ABI ==========
# Adicionar antes do ]''') final
abi_additions = '''    {
        "inputs": [],
        "name": "totalUsers",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_BETA_USERS",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "SUBSCRIPTION_FEE",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DIRECT_BONUS",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "FAST_START_BONUS",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_WITHDRAWAL_PER_TX",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_WITHDRAWAL_PER_MONTH",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalUserBalances",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalPendingReserve",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "USDT",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]''')

# Substituir o final do ABI
content = re.sub(
    r'(\s+)"betaMode"[^}]+}\s+\]\'\'\'',
    r'\1"betaMode",\n        "outputs": [{"name": "", "type": "bool"}],\n        "stateMutability": "view",\n        "type": "function"\n    },\n' + abi_additions.replace(']', ''),
    content
)

# Salvar arquivo corrigido
with open('intelligent_test_bot_fixed.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Bot corrigido salvo como: intelligent_test_bot_fixed.py")
print("")
print("Mudanças aplicadas:")
print("  1. ✅ Removida withdrawEarnings (não existe)")
print("  2. ✅ getUserInfo: 10 → 5 params")
print("  3. ✅ getSystemStats: 8 → 4 params")
print("  4. ✅ Removida getSolvencyStatus (não existe)")
print("  5. ✅ getSecurityStatus: 5 → 3 params")
print("  6. ✅ Removida getWithdrawalLimits (não existe)")
print("  7. ✅ Adicionadas funções faltando (totalUsers, SUBSCRIPTION_FEE, etc)")
print("")
print("Próximos passos:")
print("  python intelligent_test_bot_fixed.py")
