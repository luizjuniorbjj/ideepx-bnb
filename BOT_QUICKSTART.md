# 🚀 Guia Rápido - Bot de Testes Corrigido

**Data:** 2025-11-01
**Versão do Bot:** 2.0 Fixed (para V9_SECURE_2)
**Status:** ✅ PRONTO PARA USAR

---

## ✅ **O QUE FOI CORRIGIDO**

O bot original foi adaptado para o contrato V9_SECURE_2 deployado:

1. ✅ **getUserInfo**: 10 → 5 parâmetros
2. ✅ **getSystemStats**: 8 → 4 parâmetros
3. ✅ **getSecurityStatus**: 5 → 3 parâmetros
4. ✅ **Removido**: `withdrawEarnings()` (não existe)
5. ✅ **Removido**: `getSolvencyStatus()` (não existe)
6. ✅ **Removido**: `getWithdrawalLimits()` (não existe)
7. ✅ **Middleware**: Atualizado para web3.py v7+

---

## 📦 **INSTALAÇÃO RÁPIDA**

### 1. Verifique as Dependências

```bash
# Instalar requirements (se ainda não instalou)
pip install -r requirements.txt
```

### 2. Verifique o .env

O arquivo `.env` já está configurado com:

```bash
# Contrato
CONTRACT_ADDRESS=0xe678A271c096EF9CFE296243e022deaFBE05f4Ea

# USDT Mock (deployado)
USDT_TESTNET=0xf484a22555113Cebac616bC84451Bf04085097b8

# RPC
TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Master Account
TESTNET_PRIVATE_KEY=8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03
```

✅ **Tudo pronto!**

---

## 🧪 **TESTE RÁPIDO DE CONEXÃO**

Antes de executar o bot completo, teste a conexão:

```bash
python test_bot_connection.py
```

**Saída esperada:**
```
🧪 Testando Conexão do Bot

📋 Configuração:
   RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
   Contrato: 0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
   USDT: 0xf484a22555113Cebac616bC84451Bf04085097b8
   Private Key: ✅ Configurada

🔌 Teste 1: Conectando ao BSC Testnet...
   ✅ Conectado! Block: XXXXXXX

💰 Teste 2: Verificando Master Account...
   Address: 0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2
   Balance: 0.21 BNB
   ✅ Balance OK

💵 Teste 3: Verificando USDT Balance...
   Balance: $1,000,000.00 USDT
   ✅ USDT OK

📜 Teste 4: Lendo Contrato V9_SECURE_2...
   Beta Mode: True
   Total Users: 1
   Subscription Fee: $19.0 USDT
   ✅ Contrato acessível!

============================================================
  ✅ TODOS OS TESTES PASSARAM!
============================================================
```

---

## 🚀 **EXECUTAR O BOT**

### Modo Teste (5 usuários, rápido)

Edite `intelligent_test_bot_fixed.py` linha ~928:

```python
config = SimulationConfig(
    num_users=5,           # TESTE: Apenas 5 usuários
    duration_days=1,       # TESTE: 1 dia
    test_circuit_breaker=True,
    test_withdrawal_limits=True,
    test_emergency_reserve=False,  # Requer multisig
    test_address_redirects=False,  # Requer multisig
    test_concurrent_transactions=False,  # Desabilitar para teste rápido
    test_edge_cases=False,          # Desabilitar para teste rápido
    simulate_real_behavior=True,
    generate_reports=True
)
```

Depois execute:

```bash
python intelligent_test_bot_fixed.py
```

### Modo Completo (20 usuários)

```python
config = SimulationConfig(
    num_users=20,          # 20 usuários
    duration_days=1,       # 1 dia
    test_circuit_breaker=True,
    test_withdrawal_limits=True,
    test_emergency_reserve=False,
    test_address_redirects=False,
    test_concurrent_transactions=True,
    test_edge_cases=True,
    simulate_real_behavior=True,
    generate_reports=True
)
```

### Modo Stress (100 usuários - DEMORADO)

```python
config = SimulationConfig(
    num_users=100,         # Beta limit
    duration_days=7,       # 1 semana
    test_circuit_breaker=True,
    test_withdrawal_limits=True,
    test_emergency_reserve=False,  # Configure multisig primeiro
    test_address_redirects=False,  # Configure multisig primeiro
    test_concurrent_transactions=True,
    test_edge_cases=True,
    simulate_real_behavior=True,
    generate_reports=True
)
```

---

## 📊 **SAÍDA DO BOT**

### Logs em Tempo Real

```
╔════════════════════════════════════════════════════════════╗
║  🤖 iDeepX V9_SECURE - Intelligent Stress Test Bot       ║
║                                                            ║
║  Testa TODAS as condições possíveis do contrato:          ║
║  ✅ Funcionalidades                                        ║
║  ✅ Segurança                                              ║
║  ✅ Stress                                                 ║
║  ✅ Edge cases                                             ║
╚════════════════════════════════════════════════════════════╝

🤖 Bot inicializado!
📍 Contrato: 0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
💰 USDT: 0xf484a22555113Cebac616bC84451Bf04085097b8
👤 Master: 0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2

🌳 Criando árvore de 5 usuários...
✅ Usuário 1: 0x1234... (active)
✅ Usuário 2: 0x5678... (whale)
...
```

### Arquivos Gerados

1. **`simulation_YYYYMMDD_HHMMSS.log`** - Log completo
2. **`simulation_report_YYYYMMDD_HHMMSS.json`** - Relatório em JSON

#### Exemplo de Relatório JSON:

```json
{
  "simulation_config": {
    "num_users": 5,
    "duration_days": 1,
    "test_circuit_breaker": true,
    ...
  },
  "users": [
    {
      "address": "0x1234...",
      "behavior": "active",
      "rank": 2,
      "total_earned": "150.50",
      ...
    }
  ],
  "test_results": [
    {
      "test_name": "register_user",
      "success": true,
      "gas_used": 250000,
      "duration": 3.5,
      ...
    }
  ],
  "statistics": {
    "total_tests": 50,
    "successful": 48,
    "failed": 2,
    "success_rate": 96.0,
    "total_gas": 12500000,
    "avg_gas": 250000
  }
}
```

---

## ⚙️ **CUSTOMIZAÇÃO**

### Modificar Comportamentos

Edite a distribuição de perfis de usuários:

```python
# No método create_user_tree()
behaviors = [
    UserBehavior.ACTIVE,    # 40%
    UserBehavior.ACTIVE,
    UserBehavior.WHALE,     # 20%
    UserBehavior.LAZY,      # 20%
    UserBehavior.CHURNER,   # 20%
]
```

### Adicionar Novo Cenário

```python
async def scenario_custom(self):
    """Seu cenário customizado"""
    logger.info("📋 CENÁRIO CUSTOM: Meu Teste")

    # Seu código aqui
    # Exemplo:
    for user in self.users[:5]:
        await self.activate_subscription(user, months=1)

    logger.info("✅ Cenário custom completo")

# Adicionar no run_full_simulation():
await self.scenario_custom()
```

---

## 🐛 **TROUBLESHOOTING**

### Erro: "Cannot import web3"
```bash
pip install web3==6.11.3
```

### Erro: "Insufficient funds"
O master account precisa de:
- **BNB**: > 0.1 BNB (para gas de 20+ usuários)
- **USDT**: > $1,000 USDT (para distribuir aos usuários)

Verificar saldos:
```bash
python test_bot_connection.py
```

### Erro: "Transaction failed"
- Verificar que `CONTRACT_ADDRESS` está correto no `.env`
- Verificar que `USDT_TESTNET` está correto
- Ver logs detalhados em `simulation_*.log`

### Bot muito lento
Reduza o número de usuários:
```python
config = SimulationConfig(
    num_users=5,  # Menos usuários = mais rápido
    ...
)
```

---

## 📈 **MÉTRICAS COLETADAS**

O bot coleta e reporta:

- ✅ Taxa de sucesso por operação
- ✅ Gas usado (médio/total)
- ✅ Tempo de execução
- ✅ Solvency ratio ao longo do tempo
- ✅ Circuit breaker triggers
- ✅ Comissões distribuídas (MLM, Direct, Fast Start)
- ✅ Usuários ativos vs inativos
- ✅ Volume processado
- ✅ Rank upgrades
- ✅ Withdrawal limits testados

---

## 📚 **ARQUIVOS DO BOT**

| Arquivo | Descrição |
|---------|-----------|
| `intelligent_test_bot_fixed.py` | ✅ Bot corrigido (USAR ESTE) |
| `intelligent_test_bot_original_backup.py` | 📁 Backup do original |
| `test_bot_connection.py` | 🧪 Teste de conexão |
| `BOT_QUICKSTART.md` | 📖 Este guia |
| `BOT_README.md` | 📖 Documentação completa original |
| `BOT_ANALYSIS.md` | 📊 Análise das correções |
| `requirements.txt` | 📦 Dependências Python |

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Executar teste rápido** (5 usuários):
   ```bash
   python intelligent_test_bot_fixed.py
   ```

2. **Ver relatório**:
   ```bash
   cat simulation_report_*.json
   ```

3. **Executar teste completo** (20 usuários):
   - Editar config para `num_users=20`
   - Executar novamente

4. **Stress test** (100 usuários):
   - Editar config para `num_users=100`
   - Executar e aguardar (~30-60 min)

---

## 🔗 **LINKS ÚTEIS**

- **Contrato**: https://testnet.bscscan.com/address/0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
- **Mock USDT**: https://testnet.bscscan.com/address/0xf484a22555113Cebac616bC84451Bf04085097b8
- **Master Account**: https://testnet.bscscan.com/address/0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2
- **BNB Faucet**: https://testnet.bnbchain.org/faucet-smart

---

## ✅ **CHECKLIST ANTES DE EXECUTAR**

- [x] ✅ Dependências instaladas (`pip install -r requirements.txt`)
- [x] ✅ `.env` configurado com `CONTRACT_ADDRESS`
- [x] ✅ `.env` configurado com `USDT_TESTNET`
- [x] ✅ `.env` configurado com `TESTNET_PRIVATE_KEY`
- [x] ✅ Master account com > 0.1 BNB
- [x] ✅ Master account com > $1,000 USDT
- [x] ✅ Teste de conexão passou (`python test_bot_connection.py`)

---

**🎉 BOT PRONTO PARA USAR!**

```bash
python intelligent_test_bot_fixed.py
```

---

**Versão:** 2.0 Fixed
**Data:** 2025-11-01
**Compatível com:** V9_SECURE_2
