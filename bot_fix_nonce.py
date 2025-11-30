#!/usr/bin/env python3
"""
🔧 Correção do Bot - Problema de Nonce
========================================

Este arquivo corrige o problema de gerenciamento de nonce no intelligent_test_bot_fixed.py

PROBLEMA ORIGINAL:
- Linha 469: 'nonce': self.w3.eth.get_transaction_count(account.address)
- Isso busca nonce confirmado, ignorando transações pending
- Resultado: múltiplas transações tentam usar o mesmo nonce

SOLUÇÃO:
- Usar 'pending' para incluir transações não confirmadas
- Adicionar tracking de nonce por usuário
- Implementar retry logic com nonce incrementado
"""

import time
from typing import Optional, Dict
from datetime import datetime
from web3 import Web3
from eth_account import Account

class NonceFix:
    """
    Correções para gerenciamento de nonce
    """

    def __init__(self, w3: Web3):
        self.w3 = w3
        self.nonce_cache: Dict[str, int] = {}  # address -> last used nonce

    def get_nonce(self, address: str, use_cache: bool = True) -> int:
        """
        Obtém o nonce correto considerando transações pending

        Args:
            address: Endereço da conta
            use_cache: Se True, usa cache local incrementado

        Returns:
            Nonce correto para próxima transação
        """
        address_lower = address.lower()

        if use_cache and address_lower in self.nonce_cache:
            # Usa cache e incrementa
            cached_nonce = self.nonce_cache[address_lower]

            # Verifica nonce na rede (pending)
            network_nonce = self.w3.eth.get_transaction_count(address, 'pending')

            # Usa o maior entre cache e network
            nonce = max(cached_nonce + 1, network_nonce)
        else:
            # Primeira transação ou sem cache - usa pending da rede
            nonce = self.w3.eth.get_transaction_count(address, 'pending')

        # Atualiza cache
        self.nonce_cache[address_lower] = nonce

        return nonce

    def reset_nonce(self, address: str):
        """Remove do cache (útil após erro)"""
        address_lower = address.lower()
        if address_lower in self.nonce_cache:
            del self.nonce_cache[address_lower]


# ==================== FUNÇÃO CORRIGIDA ====================

def execute_transaction_fixed(
    bot_instance,  # IntelligentSimulationBot
    function_call,
    private_key: str,
    gas_limit: int = 500000,
    max_retries: int = 3
) -> Optional[dict]:
    """
    Versão CORRIGIDA da execute_transaction com gerenciamento correto de nonce

    Mudanças:
    1. Usa 'pending' no get_transaction_count
    2. Implementa retry logic
    3. Detecta e corrige erros de nonce
    4. Melhor tratamento de erros
    """

    # Inicializa nonce_manager se não existir
    if not hasattr(bot_instance, 'nonce_manager'):
        bot_instance.nonce_manager = NonceFix(bot_instance.w3)

    account = Account.from_key(private_key)

    for attempt in range(max_retries):
        start_time = time.time()

        try:
            # ✅ CORREÇÃO 1: Usa nonce_manager ao invés de get_transaction_count direto
            nonce = bot_instance.nonce_manager.get_nonce(account.address)

            print(f"🔄 Tentativa {attempt + 1}/{max_retries} | Nonce: {nonce} | Conta: {account.address[:8]}...")

            tx = function_call.build_transaction({
                'from': account.address,
                'gas': gas_limit,
                'gasPrice': bot_instance.w3.eth.gas_price,
                'nonce': nonce  # ✅ Usa nonce gerenciado
            })

            signed = bot_instance.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = bot_instance.w3.eth.send_raw_transaction(signed.raw_transaction)

            print(f"⏳ Aguardando confirmação: {tx_hash.hex()[:16]}...")
            receipt = bot_instance.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            duration = time.time() - start_time

            if receipt['status'] == 1:
                print(f"✅ Sucesso! Gas usado: {receipt['gasUsed']} | Tempo: {duration:.2f}s")

                return {
                    'test_name': 'transaction',
                    'success': True,
                    'duration': duration,
                    'tx_hash': receipt['transactionHash'].hex(),
                    'gas_used': receipt['gasUsed'],
                    'error': None,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"❌ Transação revertida no contrato")
                # Não faz retry em caso de revert (problema no contrato, não no nonce)
                return {
                    'test_name': 'transaction',
                    'success': False,
                    'duration': duration,
                    'tx_hash': receipt['transactionHash'].hex(),
                    'gas_used': receipt['gasUsed'],
                    'error': 'Transaction reverted',
                    'timestamp': datetime.now().isoformat()
                }

        except Exception as e:
            error_msg = str(e)
            duration = time.time() - start_time

            print(f"❌ Erro na tentativa {attempt + 1}: {error_msg[:100]}")

            # ✅ CORREÇÃO 2: Detecta erro de nonce e corrige
            if 'nonce too low' in error_msg.lower():
                print(f"🔧 Detectado 'nonce too low' - resetando cache e tentando novamente...")
                bot_instance.nonce_manager.reset_nonce(account.address)

                if attempt < max_retries - 1:
                    time.sleep(1)  # Aguarda um pouco antes de retry
                    continue

            # Se não for erro de nonce ou última tentativa, retorna erro
            if attempt >= max_retries - 1:
                return {
                    'test_name': 'transaction',
                    'success': False,
                    'duration': duration,
                    'tx_hash': None,
                    'gas_used': None,
                    'error': error_msg,
                    'timestamp': datetime.now().isoformat()
                }

            time.sleep(1)  # Aguarda antes de próxima tentativa

    # Nunca deveria chegar aqui, mas por segurança
    return {
        'test_name': 'transaction',
        'success': False,
        'duration': 0,
        'tx_hash': None,
        'gas_used': None,
        'error': 'Max retries exceeded',
        'timestamp': datetime.now().isoformat()
    }


# ==================== INSTRUÇÕES DE USO ====================

"""
COMO APLICAR A CORREÇÃO:

1. OPÇÃO A - Patch Manual:
   - Abrir intelligent_test_bot_fixed.py
   - Substituir a função execute_transaction (linhas 458-502)
   - Adicionar import do NonceFix no topo do arquivo
   - Inicializar nonce_manager no __init__

2. OPÇÃO B - Usar este módulo:

   No intelligent_test_bot_fixed.py, adicionar no topo:

   ```python
   from bot_fix_nonce import execute_transaction_fixed, NonceFix
   ```

   No __init__ do IntelligentSimulationBot:

   ```python
   self.nonce_manager = NonceFix(self.w3)
   ```

   Substituir chamadas de:

   ```python
   result = self.execute_transaction(...)
   ```

   Por:

   ```python
   result = execute_transaction_fixed(self, ...)
   ```

3. OPÇÃO C - Script Automático:

   Execute: python apply_nonce_fix.py
   (Vou criar este script a seguir)
"""

if __name__ == "__main__":
    print("🔧 Bot Nonce Fix - Módulo de Correção")
    print("=" * 50)
    print("\nEste módulo corrige o problema de nonce no bot de testes.")
    print("\nVeja as instruções de uso no final do arquivo.")
    print("\n✅ Correções implementadas:")
    print("   1. Gerenciamento de nonce com 'pending'")
    print("   2. Cache de nonce por usuário")
    print("   3. Retry logic automático")
    print("   4. Detecção e correção de 'nonce too low'")
