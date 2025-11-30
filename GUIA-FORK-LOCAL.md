# 🚀 GUIA COMPLETO - Fork Local iDeepX v3.1

**Teste em escala sem custos! Simule milhares de usuários e semanas de operação em minutos.**

---

## 📋 ÍNDICE

1. [O que é Fork Local?](#o-que-é-fork-local)
2. [Vantagens](#vantagens)
3. [Setup Rápido](#setup-rápido)
4. [Comandos Essenciais](#comandos-essenciais)
5. [Cenários de Teste](#cenários-de-teste)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 O QUE É FORK LOCAL?

**Fork local** cria uma **cópia completa da BSC mainnet** rodando na sua máquina:

```
BSC Mainnet (real)  →  Fork Local (sua máquina)
        ↓                         ↓
  Custos reais              GRÁTIS! 🎉
  Faucets limitados         BNB ilimitado
  Rate limits               Sem limites
  Lento                     Instantâneo
```

**O que você tem:**
- ✅ 100 contas pré-financiadas (10k BNB cada)
- ✅ USDT ilimitado (mock)
- ✅ Transações instantâneas
- ✅ Zero custos de gas
- ✅ Controle total do tempo (avançar blocos)

---

## 🎁 VANTAGENS

### ✅ Para Desenvolvimento

- **Testes rápidos:** Segundos em vez de minutos
- **Debugging fácil:** Console.log no Solidity funciona
- **Iteração rápida:** Deploy → Test → Fix em segundos
- **Sem limites:** Crie quantas contas quiser

### ✅ Para Testes

- **Escala:** Teste com 1000+ usuários facilmente
- **Semanas em minutos:** Simule 52 semanas em < 10 min
- **Edge cases:** Teste cenários impossíveis em testnet
- **Performance:** Medir gas, otimizar, repetir

### ✅ Para Apresentação/Demo

- **Ambiente controlado:** Não depende de rede externa
- **Reproduzível:** Mesmos dados sempre
- **Rápido:** Sem esperar confirmações
- **Realista:** Fork da mainnet real

---

## ⚡ SETUP RÁPIDO

### Passo 1: Verificar Configuração

O `hardhat.config.js` já está configurado! Verifique:

```javascript
hardhat: {
  forking: {
    url: "https://rpc.ankr.com/bsc",
    enabled: true  // ✅ ATIVADO!
  },
  accounts: {
    count: 100,  // 100 contas
    accountsBalance: "10000000000000000000000"  // 10k BNB cada
  }
}
```

✅ **Já está pronto!**

---

### Passo 2: Iniciar Hardhat Node

Abra um terminal e rode:

```bash
npx hardhat node
```

**Você verá:**

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
(mais 98 contas)
```

**🔥 IMPORTANTE: Deixe este terminal rodando!**

---

### Passo 3: Setup Inicial (Outro Terminal)

Em **outro terminal**, rode:

```bash
npx hardhat run scripts/local-fork-setup.js --network localhost
```

**Isso vai:**
1. ✅ Deploy Mock USDT
2. ✅ Deploy iDeepXUnified
3. ✅ Distribuir 100k USDT para todas as contas
4. ✅ Salvar configuração em `local-fork-config/setup.json`

**Tempo:** ~30 segundos

**Output:**
```
🚀 SETUP LOCAL FORK - iDeepX v3.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Mock USDT deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ iDeepXUnified deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ 100/100 contas financiadas

✅ SETUP COMPLETO!
```

---

### Passo 4: Populate com Usuários

Crie estrutura MLM realista:

```bash
npx hardhat run scripts/local-fork-populate.js --network localhost
```

**Isso vai:**
1. ✅ Registrar 50 usuários (padrão)
2. ✅ Criar rede MLM com sponsors
3. ✅ ~80% com LAI ativa
4. ✅ ~20% qualificados L6-10
5. ✅ Atualizar níveis

**Tempo:** ~2 minutos

**Output:**
```
🤖 POPULATE LOCAL FORK - iDeepX v3.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 50/50 usuários processados
✅ 50/50 níveis atualizados

📊 ESTATÍSTICAS:
   Total registrados: 50
   Com LAI ativa: 40 (80%)
   FREE (sem LAI): 10 (20%)
   Qualificados L6-10: 12 (24%)

✅ POPULATE CONCLUÍDO!
```

---

### Passo 5: Simular Distribuição Semanal

Simule uma semana completa:

```bash
npx hardhat run scripts/local-fork-simulate-week.js --network localhost
```

**Isso vai:**
1. ✅ Gerar performance aleatória ($10k-$100k)
2. ✅ Calcular 35% fee
3. ✅ Distribuir para carteiras (5/15/35%)
4. ✅ Distribuir MLM (30% + 15% locked)
5. ✅ Mostrar top earners

**Tempo:** ~30 segundos

**Output:**
```
📅 SIMULAR DISTRIBUIÇÃO SEMANAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Performance da semana:
   Performance total: $45,234.56
   Performance fee (35%): $15,832.10

💸 Distribuição:
   - Liquidity (5%): $791.61
   - Infrastructure (15%): $2,374.82
   - Company (35%): $5,541.24
   - MLM Distribuído (30%): $4,749.63
   - MLM Locked (15%): $2,374.82

✅ MLMDistributed:
   Total: $4,749.63
   Usuários recompensados: 38

🏆 Top 10 Earners:
   1. 0xf39Fd... (L10) - $456.23
   2. 0x70997... (L10) - $234.12
   ...
```

---

## 🎮 COMANDOS ESSENCIAIS

### Setup Inicial

```bash
# Terminal 1: Iniciar node
npx hardhat node

# Terminal 2: Setup
npx hardhat run scripts/local-fork-setup.js --network localhost
```

---

### Populate

```bash
# Populate padrão (50 usuários)
npx hardhat run scripts/local-fork-populate.js --network localhost

# Populate com 100 usuários
USER_COUNT=100 npx hardhat run scripts/local-fork-populate.js --network localhost

# Populate com todos os disponíveis (96)
USER_COUNT=96 npx hardhat run scripts/local-fork-populate.js --network localhost
```

---

### Simulação

```bash
# Simular 1 semana (performance aleatória)
npx hardhat run scripts/local-fork-simulate-week.js --network localhost

# Simular 1 semana com performance específica
PERFORMANCE=50000 npx hardhat run scripts/local-fork-simulate-week.js --network localhost

# Simular 10 semanas seguidas (bash loop)
for i in {1..10}; do
  npx hardhat run scripts/local-fork-simulate-week.js --network localhost
done
```

---

### Testes

```bash
# Rodar todos os testes
npx hardhat test --network localhost

# Teste específico
npx hardhat test --grep "Distribuição" --network localhost
```

---

## 🎯 CENÁRIOS DE TESTE

### Cenário 1: Rede Pequena (10-20 usuários)

**Objetivo:** Validar lógica básica

```bash
# Setup
npx hardhat node
npx hardhat run scripts/local-fork-setup.js --network localhost

# Populate pequeno
USER_COUNT=20 npx hardhat run scripts/local-fork-populate.js --network localhost

# Simular 1 semana
npx hardhat run scripts/local-fork-simulate-week.js --network localhost
```

**Validar:**
- ✅ Todos os níveis corretos (L0, L5, L10)
- ✅ Bônus de sponsor pagos
- ✅ Distribuição proporcional

---

### Cenário 2: Rede Média (50-100 usuários)

**Objetivo:** Testar escalabilidade

```bash
# Populate médio
USER_COUNT=75 npx hardhat run scripts/local-fork-populate.js --network localhost

# Simular 4 semanas
for i in {1..4}; do
  PERFORMANCE=$((20000 + $RANDOM % 80000)) \
  npx hardhat run scripts/local-fork-simulate-week.js --network localhost
done
```

**Validar:**
- ✅ Gas usado por distribuição
- ✅ MLM distribuído corretamente em 10 níveis
- ✅ Performance ao longo do tempo

---

### Cenário 3: Stress Test (Máximo de usuários)

**Objetivo:** Encontrar limites

```bash
# Populate máximo (96 usuários de teste)
USER_COUNT=96 npx hardhat run scripts/local-fork-populate.js --network localhost

# Simular múltiplas semanas com alta performance
for i in {1..10}; do
  PERFORMANCE=100000 \
  npx hardhat run scripts/local-fork-simulate-week.js --network localhost
done
```

**Validar:**
- ✅ Contrato não quebra com muitos usuários
- ✅ Gas limit não é excedido
- ✅ Distribuição permanece correta

---

### Cenário 4: Edge Cases

**Objetivo:** Testar casos extremos

```bash
# Setup normal
USER_COUNT=30 npx hardhat run scripts/local-fork-populate.js --network localhost

# Performance muito baixa
PERFORMANCE=1000 npx hardhat run scripts/local-fork-simulate-week.js --network localhost

# Performance muito alta
PERFORMANCE=500000 npx hardhat run scripts/local-fork-simulate-week.js --network localhost

# Performance zero (deve falhar ou ignorar)
PERFORMANCE=0 npx hardhat run scripts/local-fork-simulate-week.js --network localhost
```

**Validar:**
- ✅ Comportamento com valores extremos
- ✅ Validações de input funcionam
- ✅ Erros são tratados corretamente

---

### Cenário 5: Jornada do Usuário

**Objetivo:** Testar fluxo completo de um usuário

```javascript
// Criar script customizado: scripts/test-user-journey.js

const { ethers } = require("hardhat");

async function main() {
    // 1. Registrar usuário FREE
    // 2. Indicar 5 pessoas
    // 3. Pagar LAI
    // 4. Receber bônus
    // 5. Qualificar para L6-10
    // 6. Receber comissões MLM
    // 7. Sacar saldo
}
```

---

## 📊 ANÁLISE DE RESULTADOS

### Arquivos Gerados

Todos os resultados são salvos em `local-fork-config/`:

```
local-fork-config/
├── setup.json              # Configuração inicial
├── populate-results.json   # Resultado do populate
├── week-1-results.json     # Semana 1
├── week-2-results.json     # Semana 2
└── ...
```

---

### Estrutura do `setup.json`

```json
{
  "network": "localhost",
  "fork": "BSC Mainnet",
  "contractAddress": "0x...",
  "usdtAddress": "0x...",
  "accounts": {
    "total": 100,
    "testAccounts": 96
  },
  "funding": {
    "bnbPerAccount": "10000",
    "usdtPerAccount": "100000"
  }
}
```

---

### Estrutura do `populate-results.json`

```json
{
  "results": {
    "registered": 50,
    "withLAI": 40,
    "qualified": 12,
    "errors": 0
  },
  "levels": {
    "L0": 10,
    "L5": 28,
    "L10": 12
  },
  "financial": {
    "totalLAIPaid": "760.00",
    "totalBonusPaid": "190.00"
  }
}
```

---

### Estrutura do `week-X-results.json`

```json
{
  "week": "2",
  "performance": {
    "total": 45234.56,
    "fee": 15832.10
  },
  "results": {
    "usersRewarded": "38",
    "totalCommissionsPaid": "4749.63"
  },
  "topEarners": [
    {
      "address": "0x...",
      "level": 10,
      "available": "456.23",
      "locked": "228.12"
    }
  ]
}
```

---

## 🔧 TROUBLESHOOTING

### ❌ Erro: "ECONNREFUSED 127.0.0.1:8545"

**Problema:** Hardhat node não está rodando

**Solução:**
```bash
# Terminal 1
npx hardhat node
```

---

### ❌ Erro: "Setup não encontrado"

**Problema:** Não executou o setup inicial

**Solução:**
```bash
npx hardhat run scripts/local-fork-setup.js --network localhost
```

---

### ❌ Erro: "Insufficient balance"

**Problema:** Conta sem USDT

**Solução:** Re-executar setup:
```bash
# Parar hardhat node (Ctrl+C)
# Reiniciar
npx hardhat node

# Setup novamente
npx hardhat run scripts/local-fork-setup.js --network localhost
```

---

### ❌ Node lento ou travando

**Problema:** Fork muito antigo ou RPC lento

**Solução:** Atualizar `blockNumber` em `hardhat.config.js`:

```javascript
forking: {
  url: "https://rpc.ankr.com/bsc",
  blockNumber: 45000000  // Atualizar para bloco mais recente
}
```

Ou trocar RPC:

```javascript
forking: {
  url: "https://bsc-dataseed1.binance.org/"  // Usar RPC diferente
}
```

---

### ❌ Erro: "User already registered"

**Problema:** Tentando popular novamente sem resetar

**Solução:** Resetar ambiente:

```bash
# Parar node (Ctrl+C)
# Reiniciar
npx hardhat node

# Setup novamente (cria novos contratos)
npx hardhat run scripts/local-fork-setup.js --network localhost
npx hardhat run scripts/local-fork-populate.js --network localhost
```

---

## 🚀 FLUXO COMPLETO RECOMENDADO

### Para Desenvolvimento Diário

```bash
# 1. Iniciar node (deixar rodando)
npx hardhat node

# 2. Em outro terminal, sempre que começar:
npx hardhat run scripts/local-fork-setup.js --network localhost
USER_COUNT=20 npx hardhat run scripts/local-fork-populate.js --network localhost

# 3. Testar sua feature
npx hardhat test --grep "Sua feature" --network localhost

# 4. Quando terminar, parar node (Ctrl+C)
```

---

### Para Demonstração/Apresentação

```bash
# 1. Preparar ambiente
npx hardhat node  # Terminal 1

# Terminal 2:
npx hardhat run scripts/local-fork-setup.js --network localhost
USER_COUNT=50 npx hardhat run scripts/local-fork-populate.js --network localhost

# 2. Durante apresentação:
npx hardhat run scripts/local-fork-simulate-week.js --network localhost

# 3. Mostrar resultados
cat local-fork-config/week-1-results.json | jq .
```

---

### Para Teste de Stress/Escala

```bash
# 1. Setup máximo
npx hardhat node

# 2. Populate máximo
USER_COUNT=96 npx hardhat run scripts/local-fork-populate.js --network localhost

# 3. Simular múltiplas semanas
for i in {1..20}; do
  echo "=== SEMANA $i ==="
  PERFORMANCE=$((50000 + $RANDOM % 100000)) \
  npx hardhat run scripts/local-fork-simulate-week.js --network localhost
done

# 4. Analisar gas usado
# Ver logs do hardhat node (Terminal 1)
```

---

## 📝 CHECKLIST DE VALIDAÇÃO

Use este checklist para validar seu sistema:

### ✅ Funcionalidade Básica

- [ ] Setup completa sem erros
- [ ] 100 contas financiadas
- [ ] Contrato deployado
- [ ] Mock USDT funcionando

### ✅ Registro de Usuários

- [ ] Primeiro usuário sem sponsor
- [ ] Usuários com sponsor válido
- [ ] Não permite auto-patrocínio
- [ ] Não permite sponsor não registrado
- [ ] Não permite registro duplicado

### ✅ LAI e Bônus

- [ ] Pagamento de LAI funciona
- [ ] Bônus 25% pago ao sponsor
- [ ] FREE users podem receber bônus
- [ ] Renovação de LAI funciona

### ✅ Níveis

- [ ] L0 para FREE users
- [ ] L5 para users com LAI
- [ ] L10 para qualificados (5 diretos + $5k)
- [ ] Níveis atualizam corretamente

### ✅ Distribuição Semanal

- [ ] Performance depositada
- [ ] 5/15/35% para carteiras
- [ ] 30% MLM distribuído
- [ ] 15% MLM locked
- [ ] IPFS hash registrado
- [ ] Semana incrementa

### ✅ MLM

- [ ] Comissões distribuídas em 10 níveis
- [ ] Apenas usuários ativos recebem
- [ ] Valores proporcionais corretos
- [ ] Saldo disponível e locked separados

### ✅ Saque

- [ ] Saque de saldo disponível
- [ ] Não permite saque maior que saldo
- [ ] USDT transferido corretamente

### ✅ Admin

- [ ] Pause/unpause funciona
- [ ] Apenas owner pode pausar
- [ ] Operações bloqueadas quando pausado
- [ ] Atualizar carteiras funciona

---

## 💡 DICAS AVANÇADAS

### 1. Usar Snapshot/Restore

```javascript
// Em seus testes
const { takeSnapshot, restoreSnapshot } = require("@nomicfoundation/hardhat-network-helpers");

it("teste que modifica estado", async function() {
  const snapshot = await takeSnapshot();

  // ... fazer mudanças ...

  await snapshot.restore();  // Voltar ao estado anterior
});
```

---

### 2. Avançar Tempo

```javascript
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Avançar 7 dias
await time.increase(7 * 24 * 60 * 60);

// Avançar para timestamp específico
await time.increaseTo(1735689600);
```

---

### 3. Impersonate Accounts

```javascript
// Fingir ser qualquer conta
await network.provider.request({
  method: "hardhat_impersonateAccount",
  params: ["0x..."]
});

const impersonatedSigner = await ethers.getSigner("0x...");
```

---

### 4. Debug com Console.sol

```solidity
// No seu contrato
import "hardhat/console.sol";

function minhaFuncao() public {
    console.log("Debug:", someValue);
}
```

---

## 🎉 CONCLUSÃO

Com fork local você tem:

✅ **Desenvolvimento rápido** - Itere em segundos
✅ **Testes robustos** - Valide cenários complexos
✅ **Zero custos** - Sem gas, sem faucets
✅ **Controle total** - Crie qualquer cenário

**Agora você pode testar o sistema completo em escala, sem limites!**

---

**🚀 Próximos Passos:**

1. Rodar setup completo
2. Popular com 50 usuários
3. Simular 10 semanas
4. Analisar resultados
5. Ajustar e repetir

**Boa sorte nos testes! 🎯**
