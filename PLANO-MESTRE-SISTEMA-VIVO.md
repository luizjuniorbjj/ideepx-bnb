# 🚀 PLANO MESTRE: SISTEMA VIVO iDeepX

**Objetivo:** Criar sistema MLM completo funcionando com "vida própria" para demonstração impressionante aos sócios

**Prazo Total:** 7-10 dias

**Equipe:** 1 desenvolvedor (Claude) + 1 orientador (Você)

---

## 🎯 VISÃO GERAL DO SISTEMA VIVO

### **O que os sócios vão ver:**

1. **Dashboard Admin (Tela Principal)**
   - Números subindo em tempo real
   - Gráficos animados
   - Usuários entrando automaticamente
   - Performance fees sendo processadas
   - MLM sendo distribuído
   - Pools crescendo
   - Sistema "respirando" sozinho

2. **Dashboard dos Clientes**
   - Múltiplos clientes ativos simultaneamente
   - Comissões aparecendo
   - Saques acontecendo
   - Contas GMI Edge conectadas
   - Performance real aparecendo

3. **Banco de Dados Visível**
   - Dados reais salvos
   - Histórico completo
   - Auditável
   - Exportável

**RESULTADO:** Sistema que parece estar sendo usado por centenas de pessoas REAIS!

---

## 📋 ESTRUTURA DO PLANO

### **4 FASES PRINCIPAIS:**

1. **FASE 1: FUNDAÇÃO** (Dias 1-2)
   - Backend expandido
   - Banco de dados completo
   - Serviços core

2. **FASE 2: INTELIGÊNCIA** (Dias 3-5)
   - 5 Bots de simulação
   - Automação completa
   - Sistema "vivo"

3. **FASE 3: VISUALIZAÇÃO** (Dias 6-8)
   - Painel Admin completo
   - Dashboard cliente melhorado
   - Gráficos e analytics

4. **FASE 4: POLISH** (Dias 9-10)
   - Testes finais
   - Ajustes visuais
   - Demonstração perfeita

---

## 🏗️ FASE 1: FUNDAÇÃO (Dias 1-2)

**Objetivo:** Construir base sólida (backend + banco)

---

### **DIA 1: BANCO DE DADOS & SERVIÇOS**

#### **1.1 - Expandir Prisma Schema** ⏱️ 1h
**Arquivo:** `backend/prisma/schema.prisma`

**Adicionar tabelas:**
```prisma
// Histórico de Performance Fees processados
model PerformanceFee {
  id            String   @id @default(uuid())
  clientAddress String
  amount        String   // USDT amount (string for precision)
  mlmAmount     String   // 60% para MLM
  liquidityAmount String // 5%
  infraAmount   String   // 12%
  companyAmount String   // 23%
  processedBy   String   // Admin address
  txHash        String?
  createdAt     DateTime @default(now())

  @@index([clientAddress])
  @@index([createdAt])
}

// Histórico de Comissões MLM
model MLMCommission {
  id              String   @id @default(uuid())
  recipientAddress String
  fromClient      String   // Cliente que gerou
  level           Int      // 1-10
  amount          String   // USDT
  earningType     String   // MLM_COMMISSION, DIRECT_BONUS
  txHash          String?
  createdAt       DateTime @default(now())

  @@index([recipientAddress])
  @@index([fromClient])
  @@index([createdAt])
}

// Histórico de Saques
model Withdrawal {
  id            String   @id @default(uuid())
  userAddress   String
  amount        String   // USDT
  txHash        String?
  status        String   // pending, completed, failed
  createdAt     DateTime @default(now())
  completedAt   DateTime?

  @@index([userAddress])
  @@index([status])
  @@index([createdAt])
}

// Histórico de Assinaturas
model Subscription {
  id            String   @id @default(uuid())
  userAddress   String
  type          String   // new, renewal
  amount        String   // $19 USDT
  expiresAt     DateTime
  txHash        String?
  createdAt     DateTime @default(now())

  @@index([userAddress])
  @@index([expiresAt])
}

// Logs de Ações Admin
model AdminAction {
  id          String   @id @default(uuid())
  adminAddress String
  action      String   // process_fees, pause_user, toggle_beta, etc
  targetUser  String?
  amount      String?
  details     String?  // JSON
  createdAt   DateTime @default(now())

  @@index([adminAddress])
  @@index([createdAt])
}

// Métricas Diárias do Sistema
model SystemMetrics {
  id                  String   @id @default(uuid())
  date                DateTime @unique
  totalUsers          Int
  activeUsers         Int
  newUsers            Int
  totalMLMDistributed String
  totalFeesProcessed  String
  totalWithdrawn      String
  liquidityPoolBalance String
  infraPoolBalance    String
  companyPoolBalance  String

  @@index([date])
}

// Pools (Saldos em tempo real)
model Pool {
  id            String   @id @default(uuid())
  poolType      String   // liquidity, infrastructure, company
  address       String   @unique
  currentBalance String
  totalReceived String
  totalSpent    String?
  lastUpdate    DateTime @default(now())
}
```

**Comandos:**
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

#### **1.2 - Criar Serviços Core** ⏱️ 2h

**Arquivo:** `backend/src/services/performanceFeeProcessor.js`
```javascript
/**
 * Serviço para processar performance fees
 * - Calcula distribuições
 * - Processa em lotes
 * - Salva no banco
 * - Emite eventos
 */
```

**Arquivo:** `backend/src/services/subscriptionMonitor.js`
```javascript
/**
 * Monitora assinaturas
 * - Expira assinaturas vencidas
 * - Notifica renovações próximas
 * - Estatísticas
 */
```

**Arquivo:** `backend/src/services/mlmDistributionService.js`
```javascript
/**
 * Calcula distribuições MLM
 * - Simula distribuição antes de executar
 * - Valida upline
 * - Calcula comissões por nível
 */
```

**Arquivo:** `backend/src/services/poolManager.js`
```javascript
/**
 * Gerencia pools
 * - Atualiza saldos
 * - Histórico
 * - Estatísticas
 */
```

**Arquivo:** `backend/src/services/analyticsService.js`
```javascript
/**
 * Analytics e métricas
 * - KPIs principais
 * - Gráficos
 * - Relatórios
 */
```

---

#### **1.3 - Criar Rotas Admin API** ⏱️ 2h

**Arquivo:** `backend/src/routes/admin.js`

**Rotas necessárias:**
```javascript
// Dashboard
GET  /api/admin/dashboard       // KPIs principais
GET  /api/admin/statistics      // Estatísticas avançadas

// Usuários
GET  /api/admin/users           // Lista paginada
GET  /api/admin/users/:address  // Detalhes
POST /api/admin/users/:address/pause
POST /api/admin/users/:address/unpause

// Performance Fees
POST /api/admin/process-fees    // Processar lote
GET  /api/admin/fees/pending    // Fees pendentes
GET  /api/admin/fees/history    // Histórico

// Pools
GET  /api/admin/pools           // Saldos dos pools
GET  /api/admin/pools/:type/history

// Assinaturas
GET  /api/admin/subscriptions/expiring  // Próximas a expirar
POST /api/admin/subscriptions/expire-batch

// Sistema
POST /api/admin/toggle-beta
POST /api/admin/pause-contract
POST /api/admin/unpause-contract
GET  /api/admin/actions/history // Logs de ações
```

---

### **DIA 2: INTEGRAÇÃO & TESTES**

#### **2.1 - Integrar Serviços com Rotas** ⏱️ 2h
- Conectar cada rota ao serviço correspondente
- Validações
- Tratamento de erros

#### **2.2 - Criar Scripts Auxiliares** ⏱️ 2h

**Script:** `backend/scripts/sync-contract-to-db.js`
```javascript
/**
 * Sincroniza dados do contrato para o banco
 * - Lê todos os usuários
 * - Salva/atualiza no banco
 * - Sincroniza pools
 */
```

**Script:** `backend/scripts/calculate-metrics.js`
```javascript
/**
 * Calcula métricas diárias
 * - Agrega dados
 * - Salva SystemMetrics
 * - Gera relatórios
 */
```

#### **2.3 - Testes de Integração** ⏱️ 1h
- Testar cada rota
- Validar serviços
- Verificar banco de dados

---

## 🤖 FASE 2: INTELIGÊNCIA (Dias 3-5)

**Objetivo:** Criar 5 bots para dar "vida" ao sistema

---

### **DIA 3: BOTS 1 & 2**

#### **3.1 - Bot 1: Criador de Usuários** ⏱️ 3h

**Arquivo:** `backend/bots/user-creator-bot.js`

**Funcionalidades:**
- Cria usuários continuamente (1 a cada 30-120 segundos)
- 80% usa registerAndSubscribe (paga $24)
- 20% só registra (depois ativa manual)
- Escolhe sponsor inteligentemente (distribuição balanceada)
- Conecta conta GMI Edge simulada
- Salva no banco de dados

**Configuração:**
```javascript
const CONFIG = {
  INTERVAL_MIN: 30000,  // 30 segundos
  INTERVAL_MAX: 120000, // 2 minutos
  ACTIVATION_RATE: 0.8, // 80% ativam
  GMI_CONNECTION_RATE: 0.9, // 90% conectam GMI
  RUN_FOREVER: true
};
```

---

#### **3.2 - Bot 2: Gerador de Performance** ⏱️ 3h

**Arquivo:** `backend/bots/performance-generator-bot.js`

**Funcionalidades:**
- Simula trades na GMI Edge
- Gera performance fees aleatórias ($50-$500 por cliente)
- Frequência: 1x por dia por cliente ativo
- Varia performance (70% positivo, 30% zero)
- Admin processa em lotes (50 clientes)
- Salva histórico

**Lógica:**
```javascript
Para cada cliente ativo com GMI Edge:
  1. Simular volume de trades ($10k-$100k)
  2. Simular lucro (0-5% do volume)
  3. Calcular performance fee (30% do lucro)
  4. Adicionar à fila de processamento

A cada X horas:
  - Admin pega fila
  - Processa lote de 50
  - Distribui MLM
  - Atualiza banco
```

---

### **DIA 4: BOTS 3, 4 & 5**

#### **4.1 - Bot 3: Renovador** ⏱️ 2h

**Arquivo:** `backend/bots/subscription-renewer-bot.js`

**Funcionalidades:**
- Monitora assinaturas expirando (próximos 7 dias)
- 70% renovam automaticamente
- 20% renovam com atraso (1-3 dias após expirar)
- 10% deixam expirar (inatividade)
- Simula comportamento realista

---

#### **4.2 - Bot 4: Sacador** ⏱️ 2h

**Arquivo:** `backend/bots/withdrawal-bot.js`

**Funcionalidades:**
- Monitora saldos disponíveis
- Quando > $10, tem chance de sacar
- 30% sacam tudo
- 50% sacam parcial (50-80%)
- 20% deixam acumular
- Frequência: aleatória (1-7 dias)

---

#### **4.3 - Bot 5: Admin Automático** ⏱️ 2h

**Arquivo:** `backend/bots/admin-bot.js`

**Funcionalidades:**
- Processa performance fees a cada 6h
- Expira assinaturas vencidas (diário)
- Calcula métricas (diário)
- Monitora pools
- Logs de todas as ações

---

### **DIA 5: ORQUESTRADOR DE BOTS**

#### **5.1 - Criar Orquestrador** ⏱️ 3h

**Arquivo:** `backend/bots/orchestrator.js`

**Funcionalidades:**
- Inicia todos os 5 bots
- Monitora saúde de cada bot
- Restart automático se crashar
- Logs centralizados
- Dashboard de status

**Comandos:**
```bash
# Iniciar todos os bots
node backend/bots/orchestrator.js

# Iniciar bot específico
node backend/bots/user-creator-bot.js
```

---

#### **5.2 - Configuração de Execução** ⏱️ 1h

**Arquivo:** `backend/bots/bot-config.json`
```json
{
  "userCreator": {
    "enabled": true,
    "interval": 60000,
    "activationRate": 0.8
  },
  "performanceGenerator": {
    "enabled": true,
    "processInterval": 21600000,
    "feeRange": [50, 500]
  },
  "subscriptionRenewer": {
    "enabled": true,
    "checkInterval": 3600000,
    "renewalRate": 0.7
  },
  "withdrawal": {
    "enabled": true,
    "checkInterval": 3600000
  },
  "admin": {
    "enabled": true,
    "feeProcessInterval": 21600000,
    "expireInterval": 86400000
  }
}
```

---

#### **5.3 - Testes de Integração Bots** ⏱️ 2h
- Rodar cada bot individualmente
- Testar orquestrador
- Validar dados no banco
- Verificar contrato

---

## 🎨 FASE 3: VISUALIZAÇÃO (Dias 6-8)

**Objetivo:** Criar interfaces impressionantes

---

### **DIA 6: PAINEL ADMIN - PARTE 1**

#### **6.1 - Estrutura Base Admin** ⏱️ 2h

**Arquivo:** `frontend/app/admin/layout.tsx`
```typescript
// Layout do painel admin
- Sidebar com menu
- Header com usuário logado
- Área de conteúdo
```

**Páginas criar:**
- `/admin` - Dashboard principal
- `/admin/users` - Gestão de usuários
- `/admin/fees` - Performance fees
- `/admin/pools` - Pools
- `/admin/statistics` - Estatísticas
- `/admin/settings` - Configurações

---

#### **6.2 - Dashboard Admin Principal** ⏱️ 4h

**Arquivo:** `frontend/app/admin/page.tsx`

**Componentes:**
- KPIs principais (cards)
  - Total de usuários (com +X hoje)
  - Usuários ativos (%)
  - Total MLM distribuído
  - Fees processados (mês)
  - Pools (liquidez, infra, empresa)

- Gráficos em tempo real
  - Crescimento de usuários (linha)
  - MLM distribuído por nível (barras)
  - Performance fees (área)
  - Taxa de renovação (pizza)

- Atividade recente (lista)
  - Últimos 10 usuários registrados
  - Últimas 10 comissões pagas
  - Últimos 5 saques

- Alertas
  - Assinaturas expirando (próximos 7 dias)
  - Fees pendentes de processar
  - Pools com saldo baixo

---

### **DIA 7: PAINEL ADMIN - PARTE 2**

#### **7.1 - Gestão de Usuários** ⏱️ 3h

**Arquivo:** `frontend/app/admin/users/page.tsx`

**Funcionalidades:**
- Lista paginada (50 por página)
- Filtros:
  - Todos / Ativos / Inativos / Pausados
  - Busca por endereço
  - Ordenação (data, comissões, diretos)

- Tabela com:
  - Endereço (com cópia)
  - Status (ativo/inativo)
  - Assinatura (dias restantes)
  - Total ganho
  - Diretos
  - Ações (ver detalhes, pausar, despausar)

- Modal de detalhes
  - Todas as info do usuário
  - Histórico de ganhos
  - Upline
  - Diretos

---

#### **7.2 - Processamento de Fees** ⏱️ 3h

**Arquivo:** `frontend/app/admin/fees/page.tsx`

**Funcionalidades:**
- Upload de CSV
  ```csv
  clientAddress,amount
  0x123...,150.50
  0x456...,280.00
  ```

- Preview da distribuição
  - Total MLM (60%)
  - Por nível (L1-L10)
  - Pools (5%, 12%, 23%)

- Botão "Processar Batch"
  - Confirma
  - Executa batchProcessPerformanceFees
  - Mostra progresso
  - Sucesso/erro

- Histórico de processamentos
  - Data
  - Clientes
  - Total distribuído
  - TX hash

---

### **DIA 8: MELHORIAS DASHBOARD CLIENTE**

#### **8.1 - Melhorar Earnings History** ⏱️ 2h

**Arquivo:** `frontend/app/earnings/page.tsx`

**Adicionar:**
- Tabela com histórico completo
- Filtros (tipo, período)
- Paginação
- Exportar CSV
- Gráfico de ganhos mensal

---

#### **8.2 - Melhorar Withdraw** ⏱️ 2h

**Arquivo:** `frontend/app/withdraw/page.tsx`

**Adicionar:**
- Card com saldo disponível (destaque)
- Opções:
  - Sacar tudo
  - Sacar valor parcial
- Histórico de saques
- Estimativa de tempo
- Confirmação clara

---

#### **8.3 - Adicionar Notificações** ⏱️ 2h

**Arquivo:** `frontend/components/NotificationCenter.tsx`

**Tipos de notificações:**
- Nova comissão recebida
- Assinatura expirando (7 dias)
- Assinatura expirada
- Saque processado
- Novo referral direto

**Armazenar no banco:**
```prisma
model Notification {
  id          String   @id @default(uuid())
  userAddress String
  type        String
  title       String
  message     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 💎 FASE 4: POLISH (Dias 9-10)

**Objetivo:** Testes finais e perfeição visual

---

### **DIA 9: TESTES & AJUSTES**

#### **9.1 - Teste Completo do Sistema** ⏱️ 3h
1. Iniciar fork local
2. Deploy contratos
3. Iniciar backend
4. Iniciar frontend
5. Iniciar orquestrador de bots
6. Deixar rodar por 2 horas
7. Verificar:
   - Usuários sendo criados
   - Performance fees processadas
   - MLM distribuído
   - Saques funcionando
   - Dashboard atualizado
   - Banco de dados consistente

#### **9.2 - Correção de Bugs** ⏱️ 3h
- Identificar problemas
- Corrigir
- Re-testar

---

### **DIA 10: DEMONSTRAÇÃO PERFEITA**

#### **10.1 - Preparar Dados Demo** ⏱️ 2h
- Popular com 100 usuários
- Gerar histórico de 30 dias
- Performance fees processadas
- MLM distribuído
- Saques realizados
- Gráficos bonitos

#### **10.2 - Script de Demo Automatizado** ⏱️ 2h

**Arquivo:** `backend/scripts/demo-mode.js`

**Funcionalidades:**
- Reseta banco de dados
- Cria 100 usuários (estrutura balanceada)
- Simula 30 dias de atividade (acelerado)
- Gera performance fees
- Processa distribuições
- Alguns saques
- Algumas renovações
- Resultado: Sistema "maduro" em 10 minutos!

#### **10.3 - Polimento Visual** ⏱️ 2h
- Animações suaves
- Loading states
- Cores consistentes
- Responsivo
- Tooltips
- Feedback visual

---

## 📊 RESUMO DAS ENTREGAS

### **Backend:**
- ✅ 7 tabelas novas no banco
- ✅ 5 serviços novos
- ✅ 15 rotas admin novas
- ✅ 5 bots funcionais
- ✅ Orquestrador de bots
- ✅ Scripts auxiliares

### **Frontend:**
- ✅ Painel Admin completo (6 páginas)
- ✅ Dashboard cliente melhorado
- ✅ Sistema de notificações
- ✅ Gráficos e analytics
- ✅ Tabelas paginadas
- ✅ Modais e confirmações

### **Sistema Vivo:**
- ✅ Usuários sendo criados automaticamente
- ✅ Performance fees geradas e processadas
- ✅ MLM distribuído em tempo real
- ✅ Saques automáticos
- ✅ Renovações automáticas
- ✅ Admin processando automaticamente
- ✅ Tudo salvo no banco
- ✅ Tudo visível em dashboards

---

## 🎯 PRIORIDADES

### **CRÍTICO (fazer primeiro):**
1. Banco de dados expandido
2. Serviços core (processamento, pools)
3. Bot criador de usuários
4. Bot gerador de performance
5. Dashboard admin principal

### **IMPORTANTE (fazer depois):**
6. Bot admin automático
7. Gestão de usuários (admin)
8. Processamento de fees (admin)
9. Melhorias dashboard cliente

### **BÔNUS (se der tempo):**
10. Bot renovador
11. Bot sacador
12. Notificações
13. Gráficos avançados
14. Modo demo automatizado

---

## 📅 CRONOGRAMA VISUAL

```
Semana 1:
┌─────────────────────────────────────────────────┐
│ Dom │ Seg │ Ter │ Qua │ Qui │ Sex │ Sab │ Dom │
│  -  │ D1  │ D2  │ D3  │ D4  │ D5  │ D6  │ D7  │
│     │ 🏗️  │ 🏗️  │ 🤖  │ 🤖  │ 🤖  │ 🎨  │ 🎨  │
└─────────────────────────────────────────────────┘

Semana 2:
┌───────────────────┐
│ Seg │ Ter │ Qua │
│ D8  │ D9  │ D10 │
│ 🎨  │ 🧪  │ 💎  │
└───────────────────┘

Legenda:
🏗️ = Fundação
🤖 = Inteligência (Bots)
🎨 = Visualização
🧪 = Testes
💎 = Polish
```

---

## 🚀 COMO EXECUTAR O PLANO

### **Opção 1: Passo a Passo (Recomendado)**
Você me guia dia por dia:
```
Dia 1: "Vamos fazer o Dia 1 completo"
→ Eu crio tudo do Dia 1
→ Você testa
→ Feedback
→ Correções
→ Próximo dia
```

### **Opção 2: Por Fase**
```
"Vamos fazer toda a FASE 1"
→ Eu crio Dias 1-2 completos
→ Você testa tudo
→ Próxima fase
```

### **Opção 3: Por Componente**
```
"Primeiro vamos criar os 5 bots"
→ Eu crio todos os bots
→ Você testa
→ Depois frontend, etc
```

---

## 💬 PRÓXIMO PASSO

**Agora preciso saber de você:**

1. **Aprovação do plano?**
   - Está de acordo?
   - Quer mudar algo?
   - Prioridades diferentes?

2. **Como quer executar?**
   - Passo a passo (dia por dia)?
   - Por fase (1-4)?
   - Por componente (bots, frontend, etc)?

3. **Quando começamos?**
   - Agora mesmo?
   - Amanhã?
   - Você define!

4. **Informações que preciso:**
   - Vai usar fork local ou testnet?
   - Tem preferência de tecnologias?
   - Algum requisito específico?

---

**🎯 OBJETIVO FINAL:**

Sistema MLM completo, funcionando sozinho, com:
- 100+ usuários simulados
- Performance fees sendo processadas
- MLM distribuído automaticamente
- Dashboards impressionantes
- Tudo visível para os sócios
- Parece REAL!

**⏱️ EM 7-10 DIAS ESTÁ PRONTO!**

**Vamos começar?** 🚀
