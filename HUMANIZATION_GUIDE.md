# 🎭 GUIA DE HUMANIZAÇÃO DO CÓDIGO - iDeepX

**Versão:** 1.0
**Data:** 2025-11-19
**Baseado em:** PROJECT_RULES_V3.md Seção 0 e 0.1

---

## 🎯 OBJETIVO

Este documento define **EXATAMENTE** quais arquivos do projeto iDeepX podem ter código "humanizado" (com personalidade, TODOs informais, pequenas inconsistências) e quais **NUNCA** devem ter.

**Regra de Ouro:**
```
SE LIDA COM DINHEIRO REAL → ZERO HUMANIZAÇÃO
```

---

## 📊 CLASSIFICAÇÃO DE ARQUIVOS

### 🔴 NÍVEL CRÍTICO - ZERO HUMANIZAÇÃO

**Aplicar:**
- ✅ Código mais limpo e legível possível
- ✅ Documentação extensiva
- ✅ Testes com 100% cobertura
- ✅ Padrões industry-standard rigorosos
- ✅ Zero TODOs permanentes
- ✅ Zero hacks ou workarounds
- ✅ Nomes descritivos completos (sem abreviações)

#### 📄 Smart Contracts

| Arquivo | Motivo | Penalidade |
|---------|--------|------------|
| `contracts/iDeepXProofFinal.sol` | 🔴 Produção, dinheiro real | Nível 5 |
| `contracts/iDeepXRulebook.sol` | 🔴 Produção, dinheiro real | Nível 5 |
| `contracts/*.sol` | 🔴 Blockchain, imutável | Nível 5 |

#### 💰 Sistemas Financeiros

| Arquivo | Motivo | Penalidade |
|---------|--------|------------|
| `mt5-collector/mt5_collector.py` | 🔴 Trading real, fundos | Nível 5 |
| `mt5-collector/collector_pool.py` | 🔴 Gerencia contas MT5 | Nível 5 |
| `mt5-collector/encryption.py` | 🔴 Criptografia credenciais | Nível 5 |

#### 🔐 APIs Críticas (Backend)

| Arquivo | Motivo | Penalidade |
|---------|--------|------------|
| `backend/src/routes/proofs.js` | 🔴 Sistema de proofs blockchain | Nível 5 |
| `backend/src/routes/auth.js` | 🔴 Autenticação SIWE | Nível 5 |
| `backend/src/routes/mt5.js` | 🔴 Gerenciamento contas MT5 | Nível 5 |
| `backend/src/routes/transactions.js` | 🔴 Transações financeiras | Nível 5 |
| `backend/src/services/proofService.js` | 🔴 Lógica de proofs | Nível 5 |
| `backend/src/services/mt5Service.js` | 🔴 Integração MT5 | Nível 5 |
| `backend/src/services/encryptionService.js` | 🔴 Criptografia | Nível 5 |

#### 🔒 Segurança e Criptografia

| Arquivo | Motivo | Penalidade |
|---------|--------|------------|
| `backend/src/middleware/auth.js` | 🔴 Validação JWT/SIWE | Nível 5 |
| `backend/src/utils/crypto.js` | 🔴 Funções criptográficas | Nível 5 |
| `frontend/lib/siwe.ts` | 🔴 Sign-In With Ethereum | Nível 5 |
| `frontend/lib/contracts.ts` | 🔴 Interação blockchain | Nível 5 |

#### 💸 Frontend - Transações e Fundos

| Arquivo | Motivo | Penalidade |
|---------|--------|------------|
| `frontend/app/withdraw/page.tsx` | 🔴 Retirada de fundos | Nível 5 |
| `frontend/app/dashboard/page.tsx` | 🟡 Exibe saldos reais | Nível 4 |
| `frontend/hooks/useContract.ts` | 🔴 Interação contratos | Nível 5 |
| `frontend/hooks/useProofs.ts` | 🔴 Sistema de proofs | Nível 5 |

---

### 🟡 NÍVEL IMPORTANTE - HUMANIZAÇÃO MÍNIMA

**Aplicar:**
- ⚠️ Humanização permitida, mas com cuidado
- ⚠️ TODOs informativos (não permanentes)
- ⚠️ Nomes ainda devem ser claros
- ⚠️ Evitar hacks que afetem lógica de negócio

#### 🎨 Frontend - UI com Dados Sensíveis

| Arquivo | Humanização Permitida | Cuidados |
|---------|----------------------|----------|
| `frontend/app/dashboard/page.tsx` | 🟡 Mínima | Não afetar cálculos de saldo |
| `frontend/app/mt5/dashboard/page.tsx` | 🟡 Mínima | Não afetar dados MT5 |
| `frontend/app/transparency/page.tsx` | 🟡 Mínima | Dados de proofs precisos |
| `frontend/components/MT5SummaryCard.tsx` | 🟡 Mínima | Formatação de valores correta |

#### 🔧 Backend - Rotas Não-Críticas

| Arquivo | Humanização Permitida | Cuidados |
|---------|----------------------|----------|
| `backend/src/routes/debug.js` | 🟢 Sim | Apenas para desenvolvimento |
| `backend/src/routes/health.js` | 🟡 Mínima | Monitoramento importante |
| `backend/src/utils/logger.js` | 🟡 Mínima | Logs devem ser claros |

---

### 🟢 NÍVEL NORMAL - HUMANIZAÇÃO PERMITIDA

**Aplicar:**
- ✅ Personalidade no código
- ✅ TODOs informais
- ✅ Comentários com humor (quando apropriado)
- ✅ Mix português/inglês
- ✅ Abreviações: `btn`, `cfg`, `usr`
- ✅ Pequenas inconsistências propositais (3+ por arquivo)
- ✅ Evidência de evolução (`_v2`, `_temp`, `_old`)

#### 🎨 Frontend - UI Pura (Sem Lógica Financeira)

| Arquivo | Tipo de Humanização | Exemplos Permitidos |
|---------|---------------------|---------------------|
| `frontend/app/page.tsx` | 🟢 Total | TODOs, nomes customizados, mix de estilos |
| `frontend/components/Logo.tsx` | 🟢 Total | Componentes com personalidade |
| `frontend/components/ConnectButton.tsx` | 🟢 Total | UI não afeta fundos |
| `frontend/app/layout.tsx` | 🟢 Total | Layout geral |
| `frontend/app/register/page.tsx` | 🟢 Moderada | Apenas UI, não lógica de registro |

#### 📝 Documentação e Marketing

| Arquivo | Tipo de Humanização | Exemplos Permitidos |
|---------|---------------------|---------------------|
| `README.md` | 🟢 Total | Tom conversacional |
| `DOCS/*.md` | 🟢 Total | Explicações informais |
| `frontend/public/landing.html` | 🟢 Total | Marketing criativo |

#### 🛠️ Scripts Auxiliares (Não-Produção)

| Arquivo | Tipo de Humanização | Exemplos Permitidos |
|---------|---------------------|---------------------|
| `scripts/examples/*.js` | 🟢 Total | Código educacional |
| `scripts/utils/helpers.js` | 🟢 Moderada | Helpers gerais |
| `backend/src/utils/formatters.js` | 🟢 Moderada | Formatação de dados |

#### 🧪 Testes (Exceto Testes Financeiros)

| Arquivo | Tipo de Humanização | Exemplos Permitidos |
|---------|---------------------|---------------------|
| `test/ui/*.test.js` | 🟢 Total | Testes de UI |
| `frontend/__tests__/*.test.tsx` | 🟢 Moderada | Testes de componentes |
| `mt5-collector/test_mt5_connection.py` | 🟡 Mínima | Teste de sistema crítico |

---

## 🚫 ARQUIVOS ABSOLUTAMENTE PROIBIDOS

### ❌ NUNCA HUMANIZAR (Lista Negra)

```
contracts/**/*.sol
mt5-collector/mt5_collector.py
mt5-collector/collector_pool.py
mt5-collector/encryption.py
backend/src/routes/proofs.js
backend/src/routes/auth.js
backend/src/routes/mt5.js
backend/src/routes/transactions.js
backend/src/services/proofService.js
backend/src/services/mt5Service.js
backend/src/services/encryptionService.js
backend/src/middleware/auth.js
backend/src/utils/crypto.js
frontend/lib/siwe.ts
frontend/lib/contracts.ts
frontend/hooks/useContract.ts
frontend/hooks/useProofs.ts
frontend/app/withdraw/page.tsx
scripts/deploy.js
scripts/verify.js
scripts/submit-proof.js
scripts/finalize-proof.js
hardhat.config.js
```

---

## ✅ ARQUIVOS PERMITIDOS (Lista Branca)

```
frontend/app/page.tsx
frontend/components/Logo.tsx
frontend/components/ConnectButton.tsx
frontend/app/layout.tsx
frontend/app/simulations/page.tsx
frontend/components/Footer.tsx
frontend/components/Header.tsx
README.md
DOCS/**/*.md
scripts/examples/**/*.js
scripts/utils/helpers.js (não-críticos)
test/ui/**/*.test.js
frontend/__tests__/components/*.test.tsx
```

---

## 📋 EXEMPLOS PRÁTICOS

### ❌ CÓDIGO CRÍTICO (Smart Contract)

```solidity
// ❌ NUNCA FAZER
contract iDeepXProof {
  // TODO: otimizar gas depois
  uint temp_balance; // variável temporária

  function procProof(uint amt) public {
    if (amt == 0) return; // usar ===
  }
}

// ✅ FAZER
contract iDeepXProof {
  /// @notice Balance tracking for proof system
  /// @dev Uses uint256 for maximum precision
  uint256 private proofBalance;

  /// @notice Process proof submission
  /// @param amount Amount in wei to process
  /// @return success Whether processing succeeded
  function processProof(uint256 amount)
    public
    returns (bool success)
  {
    require(amount > 0, "Amount must be positive");
    // ... implementação limpa
  }
}
```

### ✅ CÓDIGO NÃO-CRÍTICO (Frontend UI)

```typescript
// ✅ PERMITIDO
const ActionBtn = ({ action, kids, tipo = 'main' }) => {
  // TODO: adicionar loading state quando tiver tempo
  const btnClass = tipo == 'main'
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-slate-600 hover:bg-slate-700';

  return (
    <button
      className={`px-4 py-2 rounded-md transition ${btnClass}`}
      onClick={action}
    >
      {kids}
    </button>
  );
};

// Também OK: mix de estilos
const TopBar = () => {
  const usr = useUser(); // abreviação OK
  // const oldLayout = ... // código comentado OK

  return <div style={{ marginTop: '18px' }}>...</div>; // valor customizado OK
};
```

### 🟡 CÓDIGO IMPORTANTE (Dashboard)

```typescript
// 🟡 CUIDADO - Humanização mínima
const DashboardStats = ({ userData }) => {
  // ✅ OK: TODOs informativos
  // TODO: adicionar gráfico de equity quando API estiver pronta

  // ✅ OK: Nomes claros mesmo com personalidade
  const profitTotal = userData.totalProfit;

  // ❌ EVITAR: Cálculos financeiros com hacks
  // const profit = balance == 0 ? 100 : balance; // NUNCA

  // ✅ FAZER: Cálculos precisos
  const displayProfit = profitTotal !== null
    ? profitTotal.toFixed(2)
    : '0.00';

  return <div>{displayProfit}</div>;
};
```

---

## 🔍 CHECKLIST DE CODE REVIEW

### Para Revisor de Código:

#### 🔴 Código Crítico (Nível 5)

- [ ] **ZERO TODOs** no código de produção?
- [ ] **ZERO comentários** de código desabilitado?
- [ ] **ZERO hacks** ou workarounds?
- [ ] **Nomes completos** e descritivos (sem abreviações)?
- [ ] **Comparações estritas** (`===` ao invés de `==`)?
- [ ] **Documentação completa** (JSDoc/docstrings)?
- [ ] **Testes com 100% cobertura**?

#### 🟡 Código Importante (Nível 4)

- [ ] TODOs são **informativos** (não permanentes)?
- [ ] Cálculos financeiros estão **corretos**?
- [ ] Formatação de valores está **precisa**?
- [ ] Não há **hacks que afetem dados reais**?

#### 🟢 Código Não-Crítico (Nível 0-2)

- [ ] Humanização está **balanceada** (não exagerada)?
- [ ] Código ainda é **legível**?
- [ ] TODOs não indicam **bugs não resolvidos**?
- [ ] Inconsistências são **intencionais** (não bugs)?

---

## ⚠️ PENALIDADES

### Aplicar Humanização em Código Crítico = **VIOLAÇÃO NÍVEL 5**

**Consequências:**
1. ❌ Reversão imediata do código
2. 🔍 Review de segurança completo do módulo
3. 📋 Documentação do incidente
4. ⚠️ Possível suspensão de privilégios de commit
5. 🎓 Treinamento obrigatório em padrões

---

## 🛠️ FERRAMENTAS DE VALIDAÇÃO

### ESLint - Exceções por Arquivo

```javascript
// .eslintrc.js
module.exports = {
  // Rigoroso por padrão
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],

  // Exceções para arquivos humanizados
  overrides: [
    {
      // Frontend UI não-crítico
      files: [
        'frontend/app/page.tsx',
        'frontend/components/Logo.tsx',
        'frontend/components/Footer.tsx'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn', // permite código comentado
        'eqeqeq': 'off', // permite == ocasional
      }
    },
    {
      // Código crítico - ZERO tolerância
      files: [
        'contracts/**/*.sol',
        'backend/src/routes/proofs.js',
        'backend/src/routes/auth.js',
        'backend/src/routes/mt5.js',
        'mt5-collector/**/*.py'
      ],
      rules: {
        'eqeqeq': 'error', // força ===
        '@typescript-eslint/no-unused-vars': 'error',
        'no-console': 'error',
        'no-todo-comments': 'error' // bloqueia TODOs
      }
    }
  ]
};
```

### Script de Auditoria

```python
# audit_humanization.py
import os
import re

CRITICAL_FILES = [
    'contracts/',
    'backend/src/routes/proofs.js',
    'backend/src/routes/auth.js',
    'mt5-collector/mt5_collector.py',
]

FORBIDDEN_PATTERNS = {
    'TODO': r'//\s*TODO',
    'Commented Code': r'//\s*const\s+\w+',
    'Loose Equality': r'\s==\s',
    'Abbreviations': r'const\s+(btn|cfg|usr|msg)\s*=',
}

def audit_file(filepath):
    violations = []
    with open(filepath, 'r') as f:
        content = f.read()
        for name, pattern in FORBIDDEN_PATTERNS.items():
            if re.search(pattern, content):
                violations.append(f'{name} found in {filepath}')
    return violations

# Executar auditoria
for critical_path in CRITICAL_FILES:
    # ... verificar arquivos
```

---

## 📊 MÉTRICAS DE QUALIDADE

### Código Crítico (Nível 5)

| Métrica | Valor Mínimo | Atual | Status |
|---------|--------------|-------|--------|
| Cobertura de Testes | 100% | - | ⚠️ Verificar |
| Complexidade Ciclomática | < 8 | - | ⚠️ Verificar |
| Duplicação | < 1% | - | ⚠️ Verificar |
| TODOs Permanentes | 0 | - | ⚠️ Verificar |
| Documentação | 100% | - | ⚠️ Verificar |

### Código Não-Crítico (Nível 0-2)

| Métrica | Valor Aceitável | Observação |
|---------|----------------|------------|
| TODOs Informativos | < 10 por arquivo | Devem ser resolvidos em sprint |
| Inconsistências Intencionais | 3-5 por arquivo | Humanização balanceada |
| Abreviações | Moderadas | Devem ser claras no contexto |

---

## 🎯 RESUMO EXECUTIVO

### **REGRA SIMPLES:**

```
┌─────────────────────────────────────────┐
│ LIDA COM DINHEIRO REAL?                 │
│                                         │
│  SIM → ZERO HUMANIZAÇÃO ❌              │
│  NÃO → HUMANIZAÇÃO OK ✅                │
└─────────────────────────────────────────┘
```

### **3 Níveis de Classificação:**

| Nível | Humanização | Exemplos |
|-------|-------------|----------|
| 🔴 **CRÍTICO** | ❌ ZERO | Smart contracts, MT5, APIs financeiras |
| 🟡 **IMPORTANTE** | ⚠️ MÍNIMA | Dashboard, componentes com dados reais |
| 🟢 **NORMAL** | ✅ PERMITIDA | UI pura, marketing, scripts auxiliares |

---

## 📞 DÚVIDAS?

**Não sabe se pode humanizar um arquivo?**

### Pergunte-se:

1. ❓ Este código lida com dinheiro real?
   → **SIM** = ❌ Não humanizar

2. ❓ Este código interage com blockchain?
   → **SIM** = ❌ Não humanizar

3. ❓ Este código gerencia credenciais/chaves?
   → **SIM** = ❌ Não humanizar

4. ❓ Um bug aqui pode causar perda financeira?
   → **SIM** = ❌ Não humanizar

5. ❓ É apenas UI/visual sem lógica de negócio?
   → **SIM** = ✅ Pode humanizar

**Em caso de dúvida:** Consulte Tech Lead ou assuma **Nível Crítico** (mais seguro).

---

## 📚 REFERÊNCIAS

- **PROJECT_RULES.md** - Seção 0: Diretivas de Humanização
- **PROJECT_RULES.md** - Seção 0.1: Exceções Críticas
- **PROJECT_CONTEXT.md** - Estado atual do projeto
- **CLAUDE.md** - Instruções para desenvolvimento

---

**Última atualização:** 2025-11-19
**Versão:** 1.0
**Mantenedor:** Arquiteto do Projeto
**Status:** ✅ ATIVO
