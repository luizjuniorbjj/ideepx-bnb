# 🤖 iDeepX V9_SECURE - Intelligent Test Bot

Bot de teste inteligente que simula TODAS as condições possíveis do contrato V9_SECURE.

---

## 🎯 O QUE ELE FAZ

### ✅ TESTES FUNCIONAIS
- Registro de usuários (árvore MLM profunda e realista)
- Assinaturas (1/3/6/12 meses, USDT/Balance/Mixed)
- Comissões (diretas, MLM 10 níveis, comissões para inativos)
- Saques (limites, circuit breaker)
- Ranks (upgrades automáticos baseados em volume)
- Bônus (fast start, consistency, rank upgrades)

### 🔐 TESTES DE SEGURANÇA
- Limites de saque ($10k/tx, $50k/mês)
- Circuit breaker (110%/130% thresholds)
- Emergency reserve (4 destinos)
- Solvency checks contínuos
- Address redirects (migração de multisig)
- Operações multisig

### 💪 TESTES DE STRESS
- 100 usuários simultâneos (beta mode limit)
- $100k deposit cap
- Transações concorrentes
- Edge cases extremos
- Tentativas de reentrancy
- Otimização de gas

### 🎭 SIMULAÇÃO REALISTA
- 6 perfis de comportamento:
  * ACTIVE: Sempre ativo, renova mensalmente
  * LAZY: Renova com atraso
  * CHURNER: Cancela depois de alguns meses
  * WHALE: Assina 12 meses, grande volume
  * INACTIVE: Fica inativo propositalmente
  * STRATEGIC: Renova sempre on-time (consistency bonus)

---

## 📦 INSTALAÇÃO

### 1. Clonar Repositório
```bash
cd seu-projeto
```

### 2. Instalar Python 3.10+
```bash
python3 --version  # Deve ser 3.10+
```

### 3. Criar Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 4. Instalar Dependências
```bash
pip install -r requirements.txt
```

---

## ⚙️ CONFIGURAÇÃO

### 1. Arquivo .env

Adicione ao seu `.env`:

```bash
# ========================================
# BOT CONFIGURATION
# ========================================

# Contrato deployado
CONTRACT_ADDRESS=0xSEU_CONTRATO_AQUI

# USDT Testnet
USDT_TESTNET=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd

# Network
TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Master account (deployer com muito BNB e USDT)
TESTNET_PRIVATE_KEY=0xSUA_PRIVATE_KEY_AQUI
```

### 2. Preparar Master Account

O master account precisa ter:
- ✅ Pelo menos 2 BNB (para enviar gas para 100 usuários)
- ✅ Pelo menos 10,000 USDT (para distribuir aos usuários)

---

## 🚀 USO

### Modo Básico (20 usuários, 1 dia)

```bash
python intelligent_test_bot.py
```

### Modo Completo (100 usuários, 35 dias)

Edite no código:

```python
config = SimulationConfig(
    num_users=100,         # 100 usuários (beta limit)
    duration_days=35,      # 5 semanas completas
    test_circuit_breaker=True,
    test_withdrawal_limits=True,
    test_emergency_reserve=True,   # Requer multisig
    test_address_redirects=True,   # Requer multisig
    test_concurrent_transactions=True,
    test_edge_cases=True,
    simulate_real_behavior=True,
    generate_reports=True
)
```

Depois:

```bash
python intelligent_test_bot.py
```

---

## 📊 OUTPUTS

### Logs em Tempo Real

```
2025-11-01 10:30:15 [INFO] 🤖 Bot inicializado!
2025-11-01 10:30:15 [INFO] 📍 Contrato: 0xABC...
2025-11-01 10:30:15 [INFO] 💰 USDT: 0x337...
2025-11-01 10:30:15 [INFO] 👤 Master: 0xEB2...
2025-11-01 10:30:20 [INFO] 🌳 Criando árvore de 20 usuários...
2025-11-01 10:30:25 [INFO] ✅ Usuário 1: 0x1234... (active)
...
```

### Arquivo de Log

```
simulation_20251101_103015.log
```

### Relatório JSON

```json
{
  "simulation_config": {
    "num_users": 20,
    "duration_days": 1,
    ...
  },
  "users": [
    {
      "address": "0x1234...",
      "behavior": "active",
      "rank": 2,
      ...
    }
  ],
  "test_results": [
    {
      "test_name": "register_user",
      "success": true,
      "gas_used": 250000,
      ...
    }
  ],
  "statistics": {
    "total_tests": 150,
    "successful": 148,
    "failed": 2,
    "success_rate": 98.67,
    "total_gas": 45000000,
    "avg_gas": 300000
  }
}
```

---

## 🧪 CENÁRIOS DE TESTE

### 1. Normal Operations (70% usuários)
- Registro normal
- Assinaturas variadas (1/3/6/12 meses)
- Renovações
- Saques regulares

### 2. Edge Cases
- Renovação imediata
- Múltiplos saques pequenos
- Transferências internas
- Expiração de assinatura
- Comissões para inativos

### 3. Stress Test
- Registro simultâneo de 100 usuários
- Transações concorrentes
- Alta carga de MLM (10 níveis)

### 4. Circuit Breaker
- Simula baixa solvência (<110%)
- Verifica bloqueio de saques
- Testa recuperação (>130%)

### 5. Emergency Reserve
- Usa emergency reserve
- 4 destinos (LIQUIDITY, INFRA, COMPANY, EXTERNAL)
- Requer multisig (configurar separadamente)

### 6. Withdrawal Limits
- Testa limite $10k/tx
- Testa limite $50k/mês
- Verifica reset mensal

### 7. Ranks & Bonuses
- Fast start bonus (7 dias)
- Consistency bonus (3/6/12/24 renovações)
- Rank upgrades (BRONZE → GRANDMASTER)

---

## 📈 MÉTRICAS COLETADAS

```
✅ Taxa de sucesso por operação
✅ Gas usado médio/total
✅ Tempo de execução
✅ Solvency ratio ao longo do tempo
✅ Emergency reserve acumulado
✅ Circuit breaker triggers
✅ Comissões distribuídas
✅ Usuários ativos/inativos
✅ Volume processado
```

---

## 🛠️ CUSTOMIZAÇÃO

### Adicionar Novo Comportamento

```python
class UserBehavior(Enum):
    # ... existing behaviors
    AGGRESSIVE = "aggressive"  # Saca tudo imediatamente
```

### Adicionar Novo Cenário

```python
async def scenario_custom(self):
    """Cenário customizado"""
    logger.info("📋 CENÁRIO CUSTOM: Meu Teste")
    
    # Seu código aqui
    pass

# No run_full_simulation:
await self.scenario_custom()
```

### Modificar Distribuição de Comportamentos

```python
def create_user_tree(self, num_users: int):
    # Personalizar distribuição
    behaviors = [
        UserBehavior.ACTIVE,  # 40%
        UserBehavior.ACTIVE,
        UserBehavior.WHALE,   # 20%
        UserBehavior.LAZY,    # 20%
        UserBehavior.CHURNER, # 20%
    ]
    
    behavior = random.choice(behaviors)
    # ...
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Não conseguiu conectar no BSC Testnet"
```bash
# Verificar RPC URL no .env
TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Testar conexão
python -c "from web3 import Web3; print(Web3(Web3.HTTPProvider('https://data-seed-prebsc-1-s1.binance.org:8545/')).is_connected())"
```

### Erro: "Insufficient funds"
```bash
# Master account precisa de BNB e USDT
# Verificar saldo:
# BNB: https://testnet.bscscan.com/address/SEU_ENDEREÇO
```

### Erro: "Transaction failed"
```bash
# Ver detalhes no log
# Verificar se contrato está correto
# Verificar se USDT approve foi feito
```

### Bot muito lento
```bash
# Reduzir número de usuários
config = SimulationConfig(
    num_users=10,  # Menos usuários
    ...
)
```

---

## 📚 ESTRUTURA DO CÓDIGO

```
intelligent_test_bot.py
├── IntelligentSimulationBot (classe principal)
│   ├── __init__: Setup Web3, contratos
│   ├── create_wallet: Cria carteiras
│   ├── send_bnb/send_usdt: Envia fundos
│   ├── execute_transaction: Executa tx e registra
│   ├── create_user: Cria usuário com comportamento
│   ├── create_user_tree: Cria árvore MLM
│   ├── register_user: Registra no contrato
│   ├── activate_subscription: Ativa assinatura
│   ├── withdraw_earnings: Saca ganhos
│   ├── scenario_*: Cenários de teste
│   ├── run_full_simulation: Loop principal
│   └── generate_report: Gera relatório final
└── main: Entry point
```

---

## 🎯 ROADMAP

### Versão Atual (2.0)
- ✅ Criação inteligente de usuários
- ✅ 6 perfis de comportamento
- ✅ Árvore MLM orgânica
- ✅ Testes funcionais completos
- ✅ Testes de segurança
- ✅ Stress tests
- ✅ Relatórios JSON
- ✅ Logs detalhados

### Próximas Features (2.1)
- ⏳ Dashboard web em tempo real
- ⏳ Gráficos de métricas (Matplotlib)
- ⏳ Alertas automáticos
- ⏳ Integração com Telegram bot
- ⏳ Modo replay (repetir simulação)
- ⏳ Exportar para CSV
- ⏳ Comparar múltiplas simulações

### Futuro (3.0)
- ⏳ Machine Learning para prever comportamentos
- ⏳ Fuzzing automático de inputs
- ⏳ Integração com CI/CD
- ⏳ Testes de performance (TPS)
- ⏳ Simulação de mainnet fork

---

## 📄 LICENSE

MIT License - Uso livre para testes

---

## 👨‍💻 SUPORTE

Para dúvidas ou problemas:
1. Verificar logs: `simulation_*.log`
2. Verificar relatório: `simulation_report_*.json`
3. Verificar transações no BscScan
4. Contatar desenvolvedor

---

## 🎉 PRONTO PARA USAR!

```bash
# Instalar
pip install -r requirements.txt

# Configurar .env
nano .env

# Executar
python intelligent_test_bot.py

# Ver relatório
cat simulation_report_*.json
```

---

**Bons testes! 🚀**
