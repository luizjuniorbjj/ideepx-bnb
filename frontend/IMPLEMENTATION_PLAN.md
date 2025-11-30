# 🎯 PLANO DE IMPLEMENTAÇÃO COMPLETO - iDeepX Mobile-First

**Data:** 2025-11-15
**Status:** 🚀 EM EXECUÇÃO

---

## 📋 PÁGINAS A IMPLEMENTAR

### ✅ 1. Dashboard (COMPLETO)
- Layout mobile-first
- Cards responsivos
- Seções expandidas
- Funcionalidades completas

### 🔄 2. Network/MLM Page
**Prioridade:** ALTA
**Complexidade:** ALTA

**Funcionalidades:**
- [ ] Árvore MLM visual interativa (10 níveis)
- [ ] Lista de referrals com filtros
- [ ] Stats da rede (total, ativos, inativos)
- [ ] Upline visualization
- [ ] Link de indicação com QR Code
- [ ] Export CSV
- [ ] Busca por endereço

**Layout Mobile:**
```
┌─────────────────────────────┐
│ Stats Cards (3x)            │
│ ┌────┬────┬────┐           │
│ │Tot │Ativ│Vol │           │
│ └────┴────┴────┘           │
├─────────────────────────────┤
│ Link de Indicação           │
│ [Copiar] [QR Code]          │
├─────────────────────────────┤
│ Meu Sponsor (se tiver)      │
├─────────────────────────────┤
│ Árvore MLM Visual           │
│ [Nível 1] [Nível 2]...      │
├─────────────────────────────┤
│ Lista de Referrals          │
│ ┌─────────────────────────┐│
│ │ 0x1234... Nível 3       ││
│ │ Ativo • $5,000          ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

### 🔄 3. Withdraw Page
**Prioridade:** ALTA
**Complexidade:** MÉDIA

**Funcionalidades:**
- [ ] Formulário de saque
- [ ] Validação de saldo disponível
- [ ] Limite mensal ($10k)
- [ ] Histórico de saques
- [ ] Confirmação em 2 etapas
- [ ] Status de transação

**Layout Mobile:**
```
┌─────────────────────────────┐
│ Saldo Disponível            │
│ $5,481.50                   │
├─────────────────────────────┤
│ Limites                     │
│ Mensal: $2,000 / $10,000    │
├─────────────────────────────┤
│ Sacar                       │
│ [Input valor]               │
│ [Input carteira destino]    │
│ [Sacar] btn                 │
├─────────────────────────────┤
│ Histórico                   │
│ ┌─────────────────────────┐│
│ │ $500 • 10/11 • Pending  ││
│ │ $300 • 01/11 • Confirmed││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

### 🔄 4. GMI Edge Page
**Prioridade:** MÉDIA
**Complexidade:** MÉDIA

**Funcionalidades:**
- [ ] Status de conexão GMI
- [ ] Métricas de performance
- [ ] Gráficos (lucro semanal/mensal)
- [ ] Histórico de trades
- [ ] Link/Unlink account
- [ ] Sync manual

**Layout Mobile:**
```
┌─────────────────────────────┐
│ Status Conexão              │
│ ✅ Conectado • MT5 #12345   │
│ [Desconectar]               │
├─────────────────────────────┤
│ Performance Cards (3x)      │
│ ┌────┬────┬────┐           │
│ │P&L │Win%│Trad││           │
│ └────┴────┴────┘           │
├─────────────────────────────┤
│ Gráfico Semanal             │
│ [Chart]                     │
├─────────────────────────────┤
│ Últimos Trades              │
│ ┌─────────────────────────┐│
│ │ EURUSD • +$50 • 12:30   ││
│ │ GBPUSD • -$20 • 11:15   ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

### 🔄 5. Transparency Page
**Prioridade:** MÉDIA
**Complexidade:** BAIXA

**Funcionalidades:**
- [ ] Informações do contrato
- [ ] Últimas provas on-chain
- [ ] Links BSCScan
- [ ] Snapshots IPFS
- [ ] Validador de integridade
- [ ] Histórico de distribuições

**Layout Mobile:**
```
┌─────────────────────────────┐
│ Contrato Rulebook           │
│ 0x9F8b...3653               │
│ [Ver BSCScan]               │
├─────────────────────────────┤
│ Contrato Proof              │
│ 0xABCD...1234               │
│ [Ver BSCScan]               │
├─────────────────────────────┤
│ Últimas Provas On-Chain     │
│ ┌─────────────────────────┐│
│ │ Semana #145 • 10/11     ││
│ │ Hash: 0x5678...         ││
│ │ IPFS: Qm...             ││
│ │ [Verificar]             ││
│ └─────────────────────────┘│
├─────────────────────────────┤
│ Sistema de Provas           │
│ ✅ 100% auditável           │
│ ✅ Snapshots semanais       │
│ ✅ IPFS permanente          │
└─────────────────────────────┘
```

---

### 🔄 6. Admin Panel
**Prioridade:** BAIXA
**Complexidade:** ALTA

**Funcionalidades:**
- [ ] Dashboard administrativo
- [ ] Gestão de usuários
- [ ] Processar performance fees
- [ ] Controle circuit breaker
- [ ] Logs de sistema
- [ ] Estatísticas globais

**Layout Mobile:**
```
┌─────────────────────────────┐
│ Stats Globais (4x)          │
│ ┌────┬────┬────┬────┐      │
│ │User│Vol │Fees│Solv│      │
│ └────┴────┴────┴────┘      │
├─────────────────────────────┤
│ Ações Administrativas       │
│ [Processar Fees]            │
│ [Circuit Breaker]           │
│ [Sync Eligibility]          │
├─────────────────────────────┤
│ Usuários Recentes           │
│ ┌─────────────────────────┐│
│ │ 0x1234... • Ativo       ││
│ │ $5k volume              ││
│ └─────────────────────────┘│
├─────────────────────────────┤
│ Logs do Sistema             │
│ ┌─────────────────────────┐│
│ │ 12:30 • Fee processed   ││
│ │ 11:15 • User activated  ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

## 🎨 PADRÕES DE DESIGN

### Cores (Consistente em todas as páginas)
```css
background: from-gray-900 via-blue-900 to-purple-900
cards: bg-white/5 backdrop-blur-sm border-white/10
hover: hover:bg-white/10
success: text-green-400, bg-green-500/10
warning: text-yellow-400, bg-yellow-500/10
error: text-red-400, bg-red-500/10
info: text-blue-400, bg-blue-500/10
```

### Tipografia
```css
h1: text-2xl font-bold (mobile) → text-4xl (desktop)
h2: text-lg font-bold (mobile) → text-2xl (desktop)
h3: text-base font-semibold
body: text-sm (mobile) → text-base (desktop)
small: text-xs text-gray-400
```

### Espaçamentos
```css
container: px-4 py-6 (mobile) → px-6 py-8 (desktop)
sections: space-y-6
cards: p-4 (mobile) → p-6 (desktop)
grids: gap-3 (mobile) → gap-4 (desktop)
```

### Breakpoints
```css
mobile: < 640px (padrão)
tablet: sm: 640px
desktop: lg: 1024px
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
frontend/app/
├── dashboard/
│   ├── page.tsx (✅ COMPLETO)
│   └── page-backup-desktop.tsx
├── network/
│   ├── page.tsx (🔄 A IMPLEMENTAR)
│   └── components/
│       ├── MlmTree.tsx
│       └── ReferralsList.tsx
├── withdraw/
│   ├── page.tsx (🔄 A IMPLEMENTAR)
│   └── components/
│       └── WithdrawForm.tsx
├── gmi-hedge/
│   ├── page.tsx (🔄 A IMPLEMENTAR)
│   └── components/
│       ├── PerformanceChart.tsx
│       └── TradesList.tsx
├── transparency/
│   ├── page.tsx (🔄 A IMPLEMENTAR)
│   └── components/
│       └── ProofsList.tsx
└── admin/
    ├── page.tsx (🔄 A IMPLEMENTAR)
    └── components/
        ├── AdminStats.tsx
        └── UserManagement.tsx
```

---

## 🔌 APIS NECESSÁRIAS

### Network/MLM
```typescript
GET /api/dev/user/:address/referrals
GET /api/dev/user/:address/mlm/stats
GET /api/mlm-tree/:address
```

### Withdraw
```typescript
POST /api/withdraw
GET /api/withdrawals/:address
GET /api/withdrawal-limits/:address
```

### GMI Edge
```typescript
GET /api/gmi/stats/:address
GET /api/gmi/trades/:address
GET /api/gmi/weekly-profit/:address
POST /api/link-gmi
POST /api/disconnect-gmi
```

### Transparency
```typescript
GET /api/blockchain/rulebook
GET /api/blockchain/proof
GET /api/blockchain/proofs?limit=10
GET /api/blockchain/ipfs/:hash
```

### Admin
```typescript
GET /api/admin/stats
POST /api/admin/process-fees
POST /api/admin/circuit-breaker
GET /api/admin/users
GET /api/admin/logs
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Network/MLM Page
- [ ] Criar componente MlmTree.tsx
- [ ] Criar componente ReferralsList.tsx
- [ ] Implementar filtros (ativo/inativo)
- [ ] Implementar busca
- [ ] QR Code generator
- [ ] Export CSV

### Withdraw Page
- [ ] Formulário de saque
- [ ] Validações
- [ ] Histórico
- [ ] Status tracking

### GMI Edge Page
- [ ] Link/Unlink account
- [ ] Performance charts
- [ ] Trades list
- [ ] Sync button

### Transparency Page
- [ ] Contract info cards
- [ ] Proofs list
- [ ] IPFS viewer
- [ ] Validator

### Admin Panel
- [ ] Admin dashboard
- [ ] User management
- [ ] Process fees button
- [ ] Circuit breaker toggle
- [ ] System logs

---

## 🎯 PRIORIZAÇÃO

**FASE 1 (CRÍTICA):**
1. Network/MLM Page
2. Withdraw Page

**FASE 2 (IMPORTANTE):**
3. GMI Edge Page
4. Transparency Page

**FASE 3 (ADMIN):**
5. Admin Panel

---

## 🚀 COMEÇANDO AGORA

Implementando na ordem:
1. ✅ Dashboard (COMPLETO)
2. 🔄 Network/MLM (AGORA)
3. ⏳ Withdraw
4. ⏳ GMI Edge
5. ⏳ Transparency
6. ⏳ Admin Panel

---

**Última atualização:** 2025-11-15
