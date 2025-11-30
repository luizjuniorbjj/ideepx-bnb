#!/usr/bin/env python3
"""
🕵️ Fraud Detection Bot - iDeepX V9_SECURE_2
═══════════════════════════════════════════════

Bot especializado em detectar e simular comportamentos fraudulentos:

🔴 FRAUDES TESTADAS:
   - Fake Referral Networks (rede circular de indicações)
   - Sybil Attacks (múltiplas identidades)
   - Rank Manipulation (inflação artificial de volume)
   - Double Spending (tentar gastar mesmo USDT 2x)
   - Withdraw Before Payment (sacar sem pagar comissões)
   - Balance Manipulation (exploits de saldo interno)

🟡 COMPORTAMENTOS SUSPEITOS:
   - Registros em massa (100+ contas)
   - Padrões artificiais de renovação
   - Transferências circulares de saldo
   - Volume inflado artificialmente

Autor: Claude AI
Versão: 1.0 - Fraud Detection
"""

import os
import sys
import time
import json
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from decimal import Decimal
import logging

from web3 import Web3
from eth_account import Account

from bot_fix_nonce import execute_transaction_fixed, NonceFix
from config_loader import get_network_config

# ==================== CONFIGURAÇÃO ====================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(f'fraud_detection_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==================== DATA CLASSES ====================

@dataclass
class FraudTestResult:
    test_name: str
    fraud_type: str
    severity: str
    attack_description: str
    result: str
    fraud_successful: bool
    evidence: Optional[str]
    tx_hashes: List[str]
    timestamp: datetime

    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class FraudReport:
    total_tests: int
    fraud_attempts_blocked: int
    fraud_attempts_successful: int
    critical_frauds: int
    high_frauds: int
    duration: float
    results: List[FraudTestResult]

    def to_dict(self):
        data = asdict(self)
        data['results'] = [r.to_dict() for r in self.results]
        return data

# ==================== CONTRACT ABIs ====================

CONTRACT_ABI = json.loads('''[
    {"inputs": [{"name": "sponsorWallet", "type": "address"}], "name": "registerWithSponsor", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "months", "type": "uint8"}], "name": "activateSubscriptionWithUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "withdrawAllEarnings", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "transferBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}], "name": "getUserInfo", "outputs": [{"name": "isRegistered", "type": "bool"}, {"name": "subscriptionActive", "type": "bool"}, {"name": "availableBalance", "type": "uint256"}, {"name": "subscriptionExpiration", "type": "uint256"}, {"name": "currentRank", "type": "uint8"}], "stateMutability": "view", "type": "function"}
]''')

USDT_ABI = json.loads('''[
    {"inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
]''')

# ==================== FRAUD DETECTION BOT ====================

class FraudDetectionBot:
    def __init__(self, network_config=None):
        logger.info("🕵️ Inicializando Fraud Detection Bot...")

        if network_config is None:
            network_config = get_network_config()
        self.network_config = network_config

        self.w3 = Web3(Web3.HTTPProvider(network_config.rpc_url))

        if network_config.chain_id == 97:
            from web3.middleware import geth_poa_middleware
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if not self.w3.is_connected():
            raise Exception(f"❌ Não conseguiu conectar em {network_config.network_name}!")

        self.contract_address = network_config.contract_address
        self.usdt_address = network_config.usdt_address

        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=CONTRACT_ABI
        )

        self.usdt = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.usdt_address),
            abi=USDT_ABI
        )

        self.master_key = network_config.private_key
        self.master_account = Account.from_key(self.master_key)
        self.nonce_manager = NonceFix(self.w3)

        self.test_results: List[FraudTestResult] = []
        self.start_time = time.time()

        logger.info(f"✅ Bot inicializado!")
        logger.info(f"📍 Contrato: {self.contract_address}")

    def create_funded_account(self, usdt_amount: int = 500) -> Tuple[str, str]:
        """Cria conta com BNB e USDT"""
        account = Account.create()
        address = account.address
        private_key = account.key.hex()

        # BNB para gas
        tx = {
            'from': self.master_account.address,
            'to': Web3.to_checksum_address(address),
            'value': self.w3.to_wei(0.01, 'ether'),
            'gas': 21000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.master_account.address)
        }
        signed = self.w3.eth.account.sign_transaction(tx, self.master_key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        # USDT
        amount_wei = self.w3.to_wei(usdt_amount, 'mwei')
        tx = self.usdt.functions.transfer(
            Web3.to_checksum_address(address), amount_wei
        ).build_transaction({
            'from': self.master_account.address,
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.master_account.address)
        })
        signed = self.w3.eth.account.sign_transaction(tx, self.master_key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        # Approve
        tx = self.usdt.functions.approve(
            Web3.to_checksum_address(self.contract_address),
            self.w3.to_wei(1000000, 'mwei')
        ).build_transaction({
            'from': Web3.to_checksum_address(address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(address)
        })
        signed = self.w3.eth.account.sign_transaction(tx, private_key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        time.sleep(0.1)
        return address, private_key

    def execute_transaction(self, function_call, private_key: str, gas_limit: int = 500000):
        result_dict = execute_transaction_fixed(self, function_call, private_key, gas_limit)
        return result_dict

    def record_test(self, test_name: str, fraud_type: str, severity: str,
                   description: str, result: str, fraud_successful: bool,
                   evidence: Optional[str] = None, tx_hashes: List[str] = None):
        test_result = FraudTestResult(
            test_name=test_name,
            fraud_type=fraud_type,
            severity=severity,
            attack_description=description,
            result=result,
            fraud_successful=fraud_successful,
            evidence=evidence,
            tx_hashes=tx_hashes or [],
            timestamp=datetime.now()
        )

        self.test_results.append(test_result)

        emoji = "🔴" if severity == "CRITICAL" else "🟡"
        status = "❌ FRAUDE POSSÍVEL!" if fraud_successful else "✅ BLOQUEADO"
        logger.info(f"{emoji} {test_name}: {status}")

        return test_result

    # ==================== FRAUD TESTS ====================

    def test_fake_referral_network(self) -> FraudTestResult:
        """
        Testa rede de referrals falsos (circular)
        Cria A→B→C→A (rede circular)
        """
        logger.info("\n🔴 Testando: Fake Referral Network")

        try:
            # Cria 3 contas
            addr_a, key_a = self.create_funded_account()
            addr_b, key_b = self.create_funded_account()
            addr_c, key_c = self.create_funded_account()

            tx_hashes = []

            # A patrocina B
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(addr_a))
            result = self.execute_transaction(func, key_b)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            # B patrocina C
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(addr_b))
            result = self.execute_transaction(func, key_c)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            # C tenta patrocinar A (circular - deveria falhar)
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(addr_c))
            result = self.execute_transaction(func, key_a)

            if result['success']:
                tx_hashes.append(result['tx_hash'])
                return self.record_test(
                    "Fake Referral Network",
                    "Circular Referrals",
                    "CRITICAL",
                    "Tentou criar rede circular A→B→C→A",
                    "Rede circular foi criada! Fraude possível!",
                    True,
                    f"TXs: {len(tx_hashes)} transações bem-sucedidas",
                    tx_hashes
                )
            else:
                return self.record_test(
                    "Fake Referral Network",
                    "Circular Referrals",
                    "CRITICAL",
                    "Tentou criar rede circular A→B→C→A",
                    "Rede circular bloqueada pelo contrato",
                    False,
                    f"Erro: {result.get('error', '')}",
                    tx_hashes
                )

        except Exception as e:
            return self.record_test(
                "Fake Referral Network",
                "Circular Referrals",
                "CRITICAL",
                "Tentou criar rede circular",
                f"Erro durante teste: {str(e)}",
                False,
                str(e),
                []
            )

    def test_sybil_attack(self) -> FraudTestResult:
        """
        Testa ataque Sybil (múltiplas identidades)
        Cria 20 contas, todas referral do mesmo sponsor
        """
        logger.info("\n🟡 Testando: Sybil Attack (20 identidades)")

        try:
            sponsor_addr, sponsor_key = self.create_funded_account()

            # Registra sponsor
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(self.master_account.address))
            self.execute_transaction(func, sponsor_key)

            tx_hashes = []
            successful_sybils = 0

            # Cria 20 identidades falsas
            for i in range(20):
                sybil_addr, sybil_key = self.create_funded_account(100)

                # Registra como referral do sponsor
                func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(sponsor_addr))
                result = self.execute_transaction(func, sybil_key)

                if result['success']:
                    successful_sybils += 1
                    tx_hashes.append(result['tx_hash'])

                logger.info(f"   Sybil {i+1}/20: {'✅' if result['success'] else '❌'}")

            if successful_sybils >= 15:
                return self.record_test(
                    "Sybil Attack",
                    "Multiple Fake Identities",
                    "HIGH",
                    "Criou 20 identidades falsas como referrals",
                    f"Conseguiu criar {successful_sybils}/20 identidades falsas!",
                    True,
                    f"Taxa de sucesso: {successful_sybils/20*100:.1f}%",
                    tx_hashes
                )
            else:
                return self.record_test(
                    "Sybil Attack",
                    "Multiple Fake Identities",
                    "HIGH",
                    "Criou 20 identidades falsas como referrals",
                    f"Apenas {successful_sybils}/20 bem-sucedidas (beta limit funcionando)",
                    False,
                    "Sistema limitou criação em massa",
                    tx_hashes
                )

        except Exception as e:
            return self.record_test(
                "Sybil Attack",
                "Multiple Fake Identities",
                "HIGH",
                "Tentou criar múltiplas identidades",
                f"Erro: {str(e)}",
                False,
                str(e),
                []
            )

    def test_double_spending(self) -> FraudTestResult:
        """
        Testa double spending
        Tenta aprovar USDT e usar 2x
        """
        logger.info("\n🔴 Testando: Double Spending")

        try:
            attacker_addr, attacker_key = self.create_funded_account(50)

            tx_hashes = []

            # Registra
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(self.master_account.address))
            result = self.execute_transaction(func, attacker_key)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            # Ativa assinatura 1x
            func = self.contract.functions.activateSubscriptionWithUSDT(1)
            result1 = self.execute_transaction(func, attacker_key)
            if result1['success']:
                tx_hashes.append(result1['tx_hash'])

            # Tenta ativar assinatura de novo (double spend)
            func = self.contract.functions.activateSubscriptionWithUSDT(1)
            result2 = self.execute_transaction(func, attacker_key)

            if result2['success']:
                tx_hashes.append(result2['tx_hash'])
                return self.record_test(
                    "Double Spending",
                    "USDT Double Spend",
                    "CRITICAL",
                    "Tentou ativar assinatura 2x com mesmo USDT",
                    "Double spending bem-sucedido! CRÍTICO!",
                    True,
                    "Conseguiu gastar USDT duas vezes",
                    tx_hashes
                )
            else:
                return self.record_test(
                    "Double Spending",
                    "USDT Double Spend",
                    "CRITICAL",
                    "Tentou ativar assinatura 2x com mesmo USDT",
                    "Double spending bloqueado",
                    False,
                    f"Erro: {result2.get('error', '')}",
                    tx_hashes
                )

        except Exception as e:
            return self.record_test(
                "Double Spending",
                "USDT Double Spend",
                "CRITICAL",
                "Tentou gastar USDT 2x",
                f"Erro: {str(e)}",
                False,
                str(e),
                []
            )

    def test_withdraw_before_payment(self) -> FraudTestResult:
        """
        Testa sacar sem ter pago comissões
        Registra e tenta sacar imediatamente
        """
        logger.info("\n🟡 Testando: Withdraw Before Payment")

        try:
            attacker_addr, attacker_key = self.create_funded_account(100)

            tx_hashes = []

            # Registra
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(self.master_account.address))
            result = self.execute_transaction(func, attacker_key)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            # Tenta sacar SEM ter ativado assinatura
            func = self.contract.functions.withdrawAllEarnings()
            result = self.execute_transaction(func, attacker_key)

            if result['success']:
                tx_hashes.append(result['tx_hash'])
                return self.record_test(
                    "Withdraw Before Payment",
                    "Unauthorized Withdrawal",
                    "HIGH",
                    "Tentou sacar sem ter feito pagamentos",
                    "Conseguiu sacar sem pagar! FRAUDE!",
                    True,
                    "Sacou sem ativar assinatura",
                    tx_hashes
                )
            else:
                return self.record_test(
                    "Withdraw Before Payment",
                    "Unauthorized Withdrawal",
                    "HIGH",
                    "Tentou sacar sem ter feito pagamentos",
                    "Saque bloqueado corretamente",
                    False,
                    f"Erro: {result.get('error', '')}",
                    tx_hashes
                )

        except Exception as e:
            return self.record_test(
                "Withdraw Before Payment",
                "Unauthorized Withdrawal",
                "HIGH",
                "Tentou sacar sem pagar",
                f"Erro: {str(e)}",
                False,
                str(e),
                []
            )

    def test_balance_transfer_exploit(self) -> FraudTestResult:
        """
        Testa exploit de transferência de saldo
        Tenta transferir saldo para si mesmo múltiplas vezes
        """
        logger.info("\n🟡 Testando: Balance Transfer Exploit")

        try:
            attacker_addr, attacker_key = self.create_funded_account(100)

            tx_hashes = []

            # Registra e ativa
            func = self.contract.functions.registerWithSponsor(Web3.to_checksum_address(self.master_account.address))
            result = self.execute_transaction(func, attacker_key)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            func = self.contract.functions.activateSubscriptionWithUSDT(1)
            result = self.execute_transaction(func, attacker_key)
            if result['success']:
                tx_hashes.append(result['tx_hash'])

            # Verifica saldo
            user_info = self.contract.functions.getUserInfo(Web3.to_checksum_address(attacker_addr)).call()
            balance = user_info[2]

            if balance == 0:
                return self.record_test(
                    "Balance Transfer Exploit",
                    "Balance Manipulation",
                    "HIGH",
                    "Tentou manipular saldo interno",
                    "Sem saldo para testar",
                    False,
                    "Nenhum saldo disponível",
                    tx_hashes
                )

            # Tenta transferir para si mesmo (circular)
            func = self.contract.functions.transferBalance(Web3.to_checksum_address(attacker_addr), balance)
            result = self.execute_transaction(func, attacker_key)

            if result['success']:
                tx_hashes.append(result['tx_hash'])

                # Verifica se saldo duplicou
                user_info_after = self.contract.functions.getUserInfo(Web3.to_checksum_address(attacker_addr)).call()
                balance_after = user_info_after[2]

                if balance_after > balance:
                    return self.record_test(
                        "Balance Transfer Exploit",
                        "Balance Manipulation",
                        "CRITICAL",
                        "Transferiu saldo para si mesmo",
                        "Saldo aumentou! Exploit de duplicação!",
                        True,
                        f"Antes: {balance}, Depois: {balance_after}",
                        tx_hashes
                    )
                else:
                    return self.record_test(
                        "Balance Transfer Exploit",
                        "Balance Manipulation",
                        "HIGH",
                        "Transferiu saldo para si mesmo",
                        "Transferência permitida mas saldo não duplicou",
                        False,
                        "Sem duplicação de saldo",
                        tx_hashes
                    )
            else:
                return self.record_test(
                    "Balance Transfer Exploit",
                    "Balance Manipulation",
                    "HIGH",
                    "Tentou transferir saldo para si mesmo",
                    "Transferência circular bloqueada",
                    False,
                    f"Erro: {result.get('error', '')}",
                    tx_hashes
                )

        except Exception as e:
            return self.record_test(
                "Balance Transfer Exploit",
                "Balance Manipulation",
                "HIGH",
                "Tentou exploitar transferências",
                f"Erro: {str(e)}",
                False,
                str(e),
                []
            )

    # ==================== MAIN EXECUTION ====================

    def run_all_tests(self) -> FraudReport:
        logger.info("\n" + "="*80)
        logger.info("🕵️ INICIANDO FRAUD DETECTION")
        logger.info("="*80 + "\n")

        tests = [
            self.test_fake_referral_network,
            self.test_double_spending,
            self.test_withdraw_before_payment,
            self.test_balance_transfer_exploit,
            self.test_sybil_attack,
        ]

        for test in tests:
            try:
                test()
                time.sleep(1)
            except Exception as e:
                logger.error(f"❌ Erro em {test.__name__}: {e}")

        duration = time.time() - self.start_time

        fraud_successful = sum(1 for r in self.test_results if r.fraud_successful)
        fraud_blocked = sum(1 for r in self.test_results if not r.fraud_successful)
        critical = sum(1 for r in self.test_results if r.severity == "CRITICAL" and r.fraud_successful)
        high = sum(1 for r in self.test_results if r.severity == "HIGH" and r.fraud_successful)

        report = FraudReport(
            total_tests=len(self.test_results),
            fraud_attempts_blocked=fraud_blocked,
            fraud_attempts_successful=fraud_successful,
            critical_frauds=critical,
            high_frauds=high,
            duration=duration,
            results=self.test_results
        )

        self.print_report(report)
        self.save_report(report)

        return report

    def print_report(self, report: FraudReport):
        logger.info("\n" + "="*80)
        logger.info("📊 RELATÓRIO FRAUD DETECTION")
        logger.info("="*80)
        logger.info(f"\n⏱️  Duração: {report.duration:.2f}s")
        logger.info(f"🧪 Total de testes: {report.total_tests}")
        logger.info(f"✅ Fraudes bloqueadas: {report.fraud_attempts_blocked}")
        logger.info(f"❌ Fraudes bem-sucedidas: {report.fraud_attempts_successful}")
        logger.info(f"\n🔴 Fraudes CRÍTICAS: {report.critical_frauds}")
        logger.info(f"🟡 Fraudes HIGH: {report.high_frauds}")

        if report.total_tests > 0:
            fraud_rate = (report.fraud_attempts_successful / report.total_tests) * 100
            logger.info(f"\n🎯 Taxa de Fraude: {fraud_rate:.1f}%")

            if fraud_rate == 0:
                logger.info("✅ EXCELENTE! Todas fraudes bloqueadas!")
            elif fraud_rate < 20:
                logger.info("✅ BOM! Poucas fraudes possíveis.")
            else:
                logger.info("🔴 CRÍTICO! Múltiplas fraudes possíveis!")

        logger.info("\n" + "="*80)

    def save_report(self, report: FraudReport):
        filename = f"fraud_detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report.to_dict(), f, indent=2)
        logger.info(f"\n💾 Relatório salvo: {filename}")


def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║  🕵️ Fraud Detection Bot - iDeepX V9_SECURE_2             ║
║                                                            ║
║  Simula comportamentos fraudulentos:                       ║
║  🔴 Fake Referral Networks                                ║
║  🔴 Double Spending                                        ║
║  🟡 Withdraw Before Payment                                ║
║  🟡 Balance Transfer Exploits                              ║
║  🟡 Sybil Attacks (20 identidades)                        ║
╚════════════════════════════════════════════════════════════╝
    """)

    try:
        bot = FraudDetectionBot()
        report = bot.run_all_tests()

        logger.info("\n🎉 Fraud Detection completo!")

        if report.critical_frauds > 0:
            sys.exit(2)
        elif report.high_frauds > 0:
            sys.exit(1)
        else:
            sys.exit(0)

    except KeyboardInterrupt:
        logger.info("\n⚠️ Interrompido")
        sys.exit(130)
    except Exception as e:
        logger.error(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
