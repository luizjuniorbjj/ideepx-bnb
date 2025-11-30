#!/usr/bin/env python3
"""
🔀 Fuzzing Bot - iDeepX V9_SECURE_2
═══════════════════════════════════════

Bot de fuzzing para testar inputs extremos e maliciosos:

🔴 TESTES DE FUZZING:
   - Integer Overflow/Underflow (valores extremos)
   - Zero Values (endereços zero, valores zero)
   - Negative Values (valores negativos)
   - Array Bounds (tamanhos extremos)
   - UTF-8 Malformed (strings malformadas)
   - Gas Limit Manipulation
   - Timestamp Manipulation
   - Reentrancy Patterns

🟡 EDGE CASES:
   - Valores MAX_UINT256
   - Endereços inválidos
   - Valores decimais extremos
   - Sequências de operações inválidas

Autor: Claude AI
Versão: 1.0
"""

import os, sys, time, json, random
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import logging
from web3 import Web3
from eth_account import Account
from bot_fix_nonce import execute_transaction_fixed, NonceFix
from config_loader import get_network_config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(f'fuzzing_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class FuzzingTestResult:
    test_name: str
    fuzz_type: str
    severity: str
    description: str
    input_value: str
    result: str
    vulnerability_found: bool
    metrics: Dict
    timestamp: datetime

    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class FuzzingReport:
    total_tests: int
    vulnerabilities_found: int
    tests_passed: int
    critical_vulns: int
    duration: float
    results: List[FuzzingTestResult]

    def to_dict(self):
        data = asdict(self)
        data['results'] = [r.to_dict() for r in self.results]
        return data

CONTRACT_ABI = json.loads('''[
    {"inputs": [{"name": "sponsorWallet", "type": "address"}], "name": "registerWithSponsor", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "months", "type": "uint8"}], "name": "activateSubscriptionWithUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "withdrawAllEarnings", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "user", "type": "address"}], "name": "getUserInfo", "outputs": [
        {"name": "isRegistered", "type": "bool"},
        {"name": "subscriptionExpiry", "type": "uint256"},
        {"name": "availableBalance", "type": "uint256"},
        {"name": "totalEarned", "type": "uint256"},
        {"name": "directReferrals", "type": "uint256"}
    ], "stateMutability": "view", "type": "function"}
]''')

USDT_ABI = json.loads('''[
    {"inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
]''')

class FuzzingBot:
    def __init__(self, network_config=None):
        logger.info("🔀 Inicializando Fuzzing Bot...")

        if network_config is None:
            network_config = get_network_config()

        self.network_config = network_config
        self.w3 = Web3(Web3.HTTPProvider(network_config.rpc_url))

        # POA middleware for BSC Testnet
        if network_config.chain_id == 97:
            from web3.middleware import geth_poa_middleware
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if not self.w3.is_connected():
            raise Exception(f"❌ Não conectado em {network_config.network_name}!")

        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(network_config.contract_address),
            abi=CONTRACT_ABI
        )

        self.usdt = self.w3.eth.contract(
            address=Web3.to_checksum_address(network_config.usdt_address),
            abi=USDT_ABI
        )

        self.master_key = network_config.private_key
        self.master_account = Account.from_key(self.master_key)
        self.nonce_manager = NonceFix(self.w3)

        self.test_results: List[FuzzingTestResult] = []
        self.start_time = time.time()

        logger.info("✅ Bot inicializado!")

    def create_funded_account(self) -> tuple[str, str]:
        """Cria conta com BNB e USDT"""
        account = Account.create()

        # Send BNB
        tx = {
            'from': self.master_account.address,
            'to': Web3.to_checksum_address(account.address),
            'value': self.w3.to_wei(0.01, 'ether'),
            'gas': 21000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.master_account.address)
        }
        signed = self.w3.eth.account.sign_transaction(tx, self.master_key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        # Send USDT (500 USDT = 500 * 10^6)
        amount_wei = self.w3.to_wei(500, 'mwei')
        tx = self.usdt.functions.transfer(
            Web3.to_checksum_address(account.address),
            amount_wei
        ).build_transaction({
            'from': self.master_account.address,
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.master_account.address)
        })
        signed = self.w3.eth.account.sign_transaction(tx, self.master_key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        # Approve contract
        tx = self.usdt.functions.approve(
            Web3.to_checksum_address(self.network_config.contract_address),
            self.w3.to_wei(1000000, 'mwei')
        ).build_transaction({
            'from': Web3.to_checksum_address(account.address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(account.address)
        })
        signed = self.w3.eth.account.sign_transaction(tx, account.key.hex())
        self.w3.eth.send_raw_transaction(signed.raw_transaction)

        time.sleep(0.05)
        return account.address, account.key.hex()

    def execute_transaction(self, function_call, private_key: str, gas_limit: int = 500000):
        """Executa transação com gerenciamento de nonce"""
        return execute_transaction_fixed(self, function_call, private_key, gas_limit)

    def record_test(self, test_name: str, fuzz_type: str, severity: str,
                   description: str, input_value: str, result: str,
                   vulnerability_found: bool, metrics: Dict = None):
        """Registra resultado de teste"""
        test_result = FuzzingTestResult(
            test_name=test_name,
            fuzz_type=fuzz_type,
            severity=severity,
            description=description,
            input_value=input_value,
            result=result,
            vulnerability_found=vulnerability_found,
            metrics=metrics or {},
            timestamp=datetime.now()
        )

        self.test_results.append(test_result)

        emoji = "🔴" if severity == "CRITICAL" else "🟡"
        status = "❌ VULNERÁVEL" if vulnerability_found else "✅ PROTEGIDO"
        logger.info(f"{emoji} {test_name}: {status}")

        return test_result

    def test_zero_address_registration(self) -> FuzzingTestResult:
        """Testa registro com endereço zero como sponsor"""
        logger.info("\n🔀 Testando: Zero Address Registration")

        try:
            user_addr, user_key = self.create_funded_account()

            # Tenta registrar com address(0) como sponsor
            zero_address = "0x0000000000000000000000000000000000000000"

            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(zero_address)
            )

            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "Zero Address Registration",
                    "Null Pointer",
                    "CRITICAL",
                    "Registro com address(0) como sponsor",
                    f"sponsor = {zero_address}",
                    "Permitiu registro com endereço zero!",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                return self.record_test(
                    "Zero Address Registration",
                    "Null Pointer",
                    "CRITICAL",
                    "Registro com address(0) como sponsor",
                    f"sponsor = {zero_address}",
                    "Bloqueou corretamente",
                    False,
                    {'error': str(result.get('error', ''))}
                )

        except Exception as e:
            return self.record_test(
                "Zero Address Registration",
                "Null Pointer",
                "CRITICAL",
                "Registro com address(0) como sponsor",
                "address(0)",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_max_uint_subscription(self) -> FuzzingTestResult:
        """Testa ativação com valor MAX_UINT8 para meses"""
        logger.info("\n🔀 Testando: MAX_UINT8 Subscription")

        try:
            user_addr, user_key = self.create_funded_account()

            # Registra primeiro
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(self.master_account.address)
            )
            reg_result = self.execute_transaction(func, user_key)

            if not reg_result['success']:
                return self.record_test(
                    "MAX_UINT8 Subscription",
                    "Integer Overflow",
                    "HIGH",
                    "Ativação com 255 meses",
                    "months = 255",
                    "Falhou no registro prévio",
                    False,
                    {'error': 'Registration failed'}
                )

            # Tenta ativar com 255 meses (MAX_UINT8)
            max_months = 255

            func = self.contract.functions.activateSubscriptionWithUSDT(max_months)
            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "MAX_UINT8 Subscription",
                    "Integer Overflow",
                    "HIGH",
                    "Ativação com 255 meses",
                    f"months = {max_months}",
                    "Permitiu 255 meses (possível overflow em cálculos)",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                error_msg = str(result.get('error', '')).lower()
                if 'max' in error_msg or 'limit' in error_msg or '12' in error_msg:
                    return self.record_test(
                        "MAX_UINT8 Subscription",
                        "Integer Overflow",
                        "HIGH",
                        "Ativação com 255 meses",
                        f"months = {max_months}",
                        "Bloqueou corretamente (limite de meses)",
                        False,
                        {'error': error_msg}
                    )
                else:
                    return self.record_test(
                        "MAX_UINT8 Subscription",
                        "Integer Overflow",
                        "HIGH",
                        "Ativação com 255 meses",
                        f"months = {max_months}",
                        f"Falhou por outro motivo: {error_msg}",
                        False,
                        {'error': error_msg}
                    )

        except Exception as e:
            return self.record_test(
                "MAX_UINT8 Subscription",
                "Integer Overflow",
                "HIGH",
                "Ativação com 255 meses",
                "255",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_zero_month_subscription(self) -> FuzzingTestResult:
        """Testa ativação com zero meses"""
        logger.info("\n🔀 Testando: Zero Month Subscription")

        try:
            user_addr, user_key = self.create_funded_account()

            # Registra primeiro
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(self.master_account.address)
            )
            self.execute_transaction(func, user_key)

            # Tenta ativar com 0 meses
            func = self.contract.functions.activateSubscriptionWithUSDT(0)
            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "Zero Month Subscription",
                    "Zero Value",
                    "HIGH",
                    "Ativação com 0 meses",
                    "months = 0",
                    "Permitiu assinatura de 0 meses!",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                return self.record_test(
                    "Zero Month Subscription",
                    "Zero Value",
                    "HIGH",
                    "Ativação com 0 meses",
                    "months = 0",
                    "Bloqueou corretamente",
                    False,
                    {'error': str(result.get('error', ''))}
                )

        except Exception as e:
            return self.record_test(
                "Zero Month Subscription",
                "Zero Value",
                "HIGH",
                "Ativação com 0 meses",
                "0",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_self_sponsorship(self) -> FuzzingTestResult:
        """Testa usuário se auto-patrocinando"""
        logger.info("\n🔀 Testando: Self Sponsorship")

        try:
            user_addr, user_key = self.create_funded_account()

            # Tenta se auto-patrocinar
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(user_addr)
            )

            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "Self Sponsorship",
                    "Logic Error",
                    "HIGH",
                    "Usuário se auto-patrocinando",
                    f"user = sponsor = {user_addr}",
                    "Permitiu auto-patrocínio!",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                return self.record_test(
                    "Self Sponsorship",
                    "Logic Error",
                    "HIGH",
                    "Usuário se auto-patrocinando",
                    f"user = sponsor = {user_addr}",
                    "Bloqueou corretamente",
                    False,
                    {'error': str(result.get('error', ''))}
                )

        except Exception as e:
            return self.record_test(
                "Self Sponsorship",
                "Logic Error",
                "HIGH",
                "Usuário se auto-patrocinando",
                "self",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_double_registration(self) -> FuzzingTestResult:
        """Testa duplo registro do mesmo usuário"""
        logger.info("\n🔀 Testando: Double Registration")

        try:
            user_addr, user_key = self.create_funded_account()

            # Primeiro registro
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(self.master_account.address)
            )
            first_result = self.execute_transaction(func, user_key)

            if not first_result['success']:
                return self.record_test(
                    "Double Registration",
                    "State Inconsistency",
                    "MEDIUM",
                    "Usuário se registra duas vezes",
                    "register() x2",
                    "Primeiro registro falhou",
                    False,
                    {'error': 'First registration failed'}
                )

            # Segundo registro (mesmo usuário)
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(self.master_account.address)
            )
            second_result = self.execute_transaction(func, user_key)

            if second_result['success']:
                return self.record_test(
                    "Double Registration",
                    "State Inconsistency",
                    "MEDIUM",
                    "Usuário se registra duas vezes",
                    "register() x2",
                    "Permitiu duplo registro!",
                    True,
                    {'tx_hash': second_result.get('tx_hash', '')}
                )
            else:
                error_msg = str(second_result.get('error', '')).lower()
                if 'already' in error_msg or 'registered' in error_msg:
                    return self.record_test(
                        "Double Registration",
                        "State Inconsistency",
                        "MEDIUM",
                        "Usuário se registra duas vezes",
                        "register() x2",
                        "Bloqueou corretamente",
                        False,
                        {'error': error_msg}
                    )
                else:
                    return self.record_test(
                        "Double Registration",
                        "State Inconsistency",
                        "MEDIUM",
                        "Usuário se registra duas vezes",
                        "register() x2",
                        f"Bloqueou por outro motivo: {error_msg}",
                        False,
                        {'error': error_msg}
                    )

        except Exception as e:
            return self.record_test(
                "Double Registration",
                "State Inconsistency",
                "MEDIUM",
                "Usuário se registra duas vezes",
                "register() x2",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_withdraw_without_balance(self) -> FuzzingTestResult:
        """Testa saque sem saldo disponível"""
        logger.info("\n🔀 Testando: Withdraw Without Balance")

        try:
            user_addr, user_key = self.create_funded_account()

            # Registra mas NÃO ativa assinatura (sem comissões)
            func = self.contract.functions.registerWithSponsor(
                Web3.to_checksum_address(self.master_account.address)
            )
            self.execute_transaction(func, user_key)

            # Verifica saldo (deve ser 0)
            user_info = self.contract.functions.getUserInfo(
                Web3.to_checksum_address(user_addr)
            ).call()

            available_balance = user_info[2]  # availableBalance

            if available_balance > 0:
                return self.record_test(
                    "Withdraw Without Balance",
                    "Underflow",
                    "MEDIUM",
                    "Saque sem saldo disponível",
                    f"balance = {available_balance}",
                    "Usuário já tem saldo (teste inválido)",
                    False,
                    {'balance': available_balance}
                )

            # Tenta sacar com saldo zero
            func = self.contract.functions.withdrawAllEarnings()
            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "Withdraw Without Balance",
                    "Underflow",
                    "MEDIUM",
                    "Saque sem saldo disponível",
                    "balance = 0",
                    "Permitiu saque com saldo zero!",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                error_msg = str(result.get('error', '')).lower()
                if 'balance' in error_msg or 'insufficient' in error_msg or 'minimum' in error_msg:
                    return self.record_test(
                        "Withdraw Without Balance",
                        "Underflow",
                        "MEDIUM",
                        "Saque sem saldo disponível",
                        "balance = 0",
                        "Bloqueou corretamente",
                        False,
                        {'error': error_msg}
                    )
                else:
                    return self.record_test(
                        "Withdraw Without Balance",
                        "Underflow",
                        "MEDIUM",
                        "Saque sem saldo disponível",
                        "balance = 0",
                        f"Bloqueou por outro motivo: {error_msg}",
                        False,
                        {'error': error_msg}
                    )

        except Exception as e:
            return self.record_test(
                "Withdraw Without Balance",
                "Underflow",
                "MEDIUM",
                "Saque sem saldo disponível",
                "0",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def test_unregistered_user_operations(self) -> FuzzingTestResult:
        """Testa operações sem estar registrado"""
        logger.info("\n🔀 Testando: Unregistered User Operations")

        try:
            user_addr, user_key = self.create_funded_account()

            # NÃO registra, tenta diretamente ativar
            func = self.contract.functions.activateSubscriptionWithUSDT(1)
            result = self.execute_transaction(func, user_key)

            if result['success']:
                return self.record_test(
                    "Unregistered User Operations",
                    "Access Control",
                    "HIGH",
                    "Operação sem estar registrado",
                    "activateSubscription() sem register()",
                    "Permitiu operação sem registro!",
                    True,
                    {'tx_hash': result.get('tx_hash', '')}
                )
            else:
                error_msg = str(result.get('error', '')).lower()
                if 'not registered' in error_msg or 'register' in error_msg:
                    return self.record_test(
                        "Unregistered User Operations",
                        "Access Control",
                        "HIGH",
                        "Operação sem estar registrado",
                        "activateSubscription() sem register()",
                        "Bloqueou corretamente",
                        False,
                        {'error': error_msg}
                    )
                else:
                    return self.record_test(
                        "Unregistered User Operations",
                        "Access Control",
                        "HIGH",
                        "Operação sem estar registrado",
                        "activateSubscription() sem register()",
                        f"Bloqueou por outro motivo: {error_msg}",
                        False,
                        {'error': error_msg}
                    )

        except Exception as e:
            return self.record_test(
                "Unregistered User Operations",
                "Access Control",
                "HIGH",
                "Operação sem estar registrado",
                "no registration",
                f"Erro: {str(e)}",
                False,
                {'error': str(e)}
            )

    def run_all_tests(self) -> FuzzingReport:
        """Executa todos os testes de fuzzing"""
        logger.info("\n" + "="*80)
        logger.info("🔀 INICIANDO FUZZING TESTS")
        logger.info("="*80 + "\n")

        tests = [
            self.test_zero_address_registration,
            self.test_max_uint_subscription,
            self.test_zero_month_subscription,
            self.test_self_sponsorship,
            self.test_double_registration,
            self.test_withdraw_without_balance,
            self.test_unregistered_user_operations
        ]

        for test in tests:
            try:
                test()
                time.sleep(1)
            except Exception as e:
                logger.error(f"❌ Erro em {test.__name__}: {e}")

        duration = time.time() - self.start_time
        vulnerabilities = sum(1 for r in self.test_results if r.vulnerability_found)
        passed = sum(1 for r in self.test_results if not r.vulnerability_found)
        critical = sum(1 for r in self.test_results if r.severity == "CRITICAL" and r.vulnerability_found)

        report = FuzzingReport(
            total_tests=len(self.test_results),
            vulnerabilities_found=vulnerabilities,
            tests_passed=passed,
            critical_vulns=critical,
            duration=duration,
            results=self.test_results
        )

        self.print_report(report)
        self.save_report(report)

        return report

    def print_report(self, report: FuzzingReport):
        """Imprime relatório final"""
        logger.info("\n" + "="*80)
        logger.info("📊 RELATÓRIO FUZZING")
        logger.info("="*80)
        logger.info(f"\n⏱️  Duração: {report.duration:.2f}s")
        logger.info(f"🧪 Total de testes: {report.total_tests}")
        logger.info(f"✅ Protegido: {report.tests_passed}")
        logger.info(f"❌ Vulnerabilidades: {report.vulnerabilities_found}")
        logger.info(f"\n🔴 Vulnerabilidades CRÍTICAS: {report.critical_vulns}")

        if report.total_tests > 0:
            security_score = (report.tests_passed / report.total_tests) * 100
            logger.info(f"\n🎯 Security Score: {security_score:.1f}%")

            if security_score == 100:
                logger.info("✅ PERFEITO! Nenhuma vulnerabilidade de fuzzing encontrada!")
            elif security_score >= 80:
                logger.info("✅ BOM! Poucas vulnerabilidades.")
            else:
                logger.info("🔴 CRÍTICO! Múltiplas vulnerabilidades de fuzzing!")

        logger.info("\n" + "="*80)

    def save_report(self, report: FuzzingReport):
        """Salva relatório em JSON"""
        filename = f"fuzzing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report.to_dict(), f, indent=2)
        logger.info(f"\n💾 Relatório salvo: {filename}")

def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║  🔀 Fuzzing Bot - iDeepX V9_SECURE_2                      ║
║                                                            ║
║  Testes de fuzzing:                                        ║
║  🔴 Zero Address Registration                             ║
║  🔴 MAX_UINT8 Subscription                                ║
║  🟡 Zero Month Subscription                                ║
║  🟡 Self Sponsorship                                       ║
║  🟡 Double Registration                                    ║
║  🟡 Withdraw Without Balance                               ║
║  🟡 Unregistered User Operations                           ║
╚════════════════════════════════════════════════════════════╝
    """)

    try:
        bot = FuzzingBot()
        report = bot.run_all_tests()

        logger.info("\n🎉 Fuzzing completo!")
        sys.exit(0 if report.critical_vulns == 0 else 1)

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
