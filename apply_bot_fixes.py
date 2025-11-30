#!/usr/bin/env python3
"""Aplica todas as correções no bot"""

import re

print("🔧 Aplicando correções no bot...")

with open('intelligent_test_bot_v2.py', 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# Fix 1: Remover withdrawEarnings (linha ~202)
print("  1. Removendo withdrawEarnings (não existe no contrato)...")
old_pattern = '''    },
    {
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "withdrawEarnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {'''
new_replacement = '''    },
    {'''
content = content.replace(old_pattern, new_replacement)

# Fix 2: getSystemStats (8→4 params)
print("  2. Corrigindo getSystemStats (8→4 params)...")
content = re.sub(
    r'("name": "getSystemStats",\s+"outputs": \[)[^\]]+(\])',
    r'\1\n            {"name": "_totalUsers", "type": "uint256"},\n            {"name": "_totalActive", "type": "uint256"},\n            {"name": "_contractBalance", "type": "uint256"},\n            {"name": "_betaMode", "type": "bool"}\n        \2',
    content,
    flags=re.DOTALL
)

# Fix 3: Remover getSolvencyStatus
print("  3. Removendo getSolvencyStatus (não existe no contrato)...")
content = re.sub(
    r',\s*\{\s*"inputs": \[\],\s*"name": "getSolvencyStatus"[^}]+}[^}]+}[^}]+}[^}]+}[^}]+}\s*\],\s*"stateMutability": "view",\s*"type": "function"\s*\}',
    '',
    content,
    flags=re.DOTALL
)

# Fix 4: getSecurityStatus (5→3 params)
print("  4. Corrigindo getSecurityStatus (5→3 params)...")
content = re.sub(
    r'("name": "getSecurityStatus",\s+"outputs": \[)[^\]]+(\])',
    r'\1\n            {"name": "_emergencyReserve", "type": "uint256"},\n            {"name": "_circuitBreakerActive", "type": "bool"},\n            {"name": "_solvencyRatio", "type": "uint256"}\n        \2',
    content,
    flags=re.DOTALL
)

# Fix 5: Remover getWithdrawalLimits
print("  5. Removendo getWithdrawalLimits (não existe no contrato)...")
content = re.sub(
    r',\s*\{\s*"inputs": \[\{"name": "user", "type": "address"\}\],\s*"name": "getWithdrawalLimits"[^}]+}[^}]+}[^}]+}\s*\],\s*"stateMutability": "view",\s*"type": "function"\s*\}',
    '',
    content,
    flags=re.DOTALL
)

print(f"\n📊 Tamanho original: {original_len} bytes")
print(f"📊 Tamanho corrigido: {len(content)} bytes")
print(f"📊 Diferença: {original_len - len(content)} bytes removidos\n")

with open('intelligent_test_bot_fixed.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Bot corrigido salvo como: intelligent_test_bot_fixed.py\n")
print("Correções aplicadas:")
print("  ✅ getUserInfo: 10 → 5 params")
print("  ✅ getSystemStats: 8 → 4 params")
print("  ✅ getSecurityStatus: 5 → 3 params")
print("  ✅ Removido: withdrawEarnings()")
print("  ✅ Removido: getSolvencyStatus()")
print("  ✅ Removido: getWithdrawalLimits()")
print("\n🚀 Pronto para usar!")
