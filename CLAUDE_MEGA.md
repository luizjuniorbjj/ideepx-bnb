# 🤖 DOCUMENTAÇÃO COMPLETA - PROJETO iDeepX

## 📋 ÍNDICE

1. [Configuração Geral](#configuração-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Smart Contract (Blockchain)](#smart-contract-blockchain)
4. [Backend API](#backend-api)
5. [Frontend (Next.js)](#frontend-nextjs)
6. [Database](#database)
7. [Integrações](#integrações)
8. [Fluxos de Usuário](#fluxos-de-usuário)
9. [Design System](#design-system)
10. [Sistema de 3 Níveis](#sistema-de-3-níveis)
11. [Segurança](#segurança)
12. [Deploy e DevOps](#deploy-e-devops)

---

# 1. CONFIGURAÇÃO GERAL

## 🎯 INFORMAÇÕES DO PROJETO

**Nome:** iDeepX - Copy Trading + MLM Blockchain
**Objetivo:** Sistema de copy trading automatizado com rede MLM 100% on-chain
**Público-alvo:** Traders brasileiros que usam Binance
**Blockchain:** BNB Smart Chain (BSC)
**Token:** USDT BEP-20
**Idioma:** Português Brasil (PT-BR)

## 🌍 IDIOMA E COMUNICAÇÃO

### ✅ SEMPRE RESPONDER EM PORTUGUÊS BRASILEIRO

**Regras de comunicação:**
- ✅ TODAS as respostas em português brasileiro
- ✅ Perguntas ao usuário em português claro
- ✅ Explicações técnicas acessíveis em PT-BR
- ✅ Nomes técnicos podem ficar em inglês (deploy, gas, wallet)
- ✅ Comentários de código em português
- ✅ Mensagens de commit em português
- ✅ Documentação em português

## 🧠 CAPACIDADE E INTELIGÊNCIA

**Você deve:**
- ✅ Usar todo seu conhecimento técnico avançado
- ✅ Antecipar problemas e sugerir soluções
- ✅ Otimizar código automaticamente
- ✅ Seguir best practices
- ✅ Detectar e corrigir erros proativamente
- ✅ Sugerir melhorias quando pertinente

**Nível de expertise esperado:**
- 🎯 Smart Contracts: Expert
- 🎯 Next.js/React: Expert
- 🎯 FastAPI/Python: Expert
- 🎯 BNB Chain: Expert
- 🎯 MT5 Integration: Expert
- 🎯 Web3/Blockchain: Expert

---

# 2. ARQUITETURA DO SISTEMA

## 🏗️ VISÃO GERAL

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIOS                             │
│  Cliente (Trader) | Afiliado (Network) | Admin         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Landing  │  │Dashboard │  │  Admin   │            │
│  │   Page   │  │ Cliente  │  │  Panel   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   WEB3.JS   │ │  BACKEND    │ │  BLOCKCHAIN │
│   ETHERS    │ │   API       │ │  BNB CHAIN  │
│  MetaMask   │ │  FastAPI    │ │   USDT      │
└─────────────┘ └──────┬──────┘ └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │  DATABASE   │
                │ PostgreSQL  │
                └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │     MT5     │
                │ Integration │
                └─────────────┘
```

## 📦 STACK TECNOLÓGICO

### Frontend
```javascript
- Framework: Next.js 14 (App Router)
- UI: React 18
- Styling: TailwindCSS + shadcn/ui
- Web3: wagmi + ethers.js
- State: Zustand
- Forms: React Hook Form + Zod
- Charts: Recharts
- Auth: NextAuth.js
```

### Backend
```python
- Framework: FastAPI 0.104+
- MT5: MetaTrader5 package
- Database ORM: SQLAlchemy
- Auth: JWT (python-jose)
- Blockchain: web3.py / tronpy
- Tasks: Celery + Redis
- Cache: Redis
```

### Smart Contract
```solidity
- Language: Solidity 0.8.20
- Framework: Hardhat
- Libraries: OpenZeppelin
- Network: BNB Smart Chain
- Token: USDT BEP-20
```

### Database
```sql
- Primary: PostgreSQL 15+
- Cache: Redis 7+
- ORM: SQLAlchemy
```

### DevOps
```yaml
- Frontend: Vercel
- Backend: Railway / Render
- Database: Supabase / Railway
- Monitoring: Sentry
- Analytics: Plausible
```

---

# 3. SMART CONTRACT (BLOCKCHAIN)

## 🔒 ESPECIFICAÇÕES CRÍTICAS - NÃO ALTERAR

### Estrutura MLM (10 NÍVEIS)

**FASE BETA (6 meses):**
```
L1: 6% do lucro ($60 de $1000)
L2: 3% do lucro ($30 de $1000)
L3: 2.5% do lucro ($25 de $1000)
L4: 2% do lucro ($20 de $1000)
L5: 1.5% do lucro ($15 de $1000)
L6-L10: 1% cada ($10 cada)
```

**FASE PERMANENTE (após beta):**
```
L1: 4% do lucro
L2: 2% do lucro
L3: 1.5% do lucro
L4-L10: 1% cada
```

### Distribuição dos 35% (Performance Fee)

```
MLM Pool: 60% ($210)
  ├─ Distribuído na rede: 73.8% ($155)
  └─ Reserva MLM: 26.2% ($55)

Pool Liquidez: 5% ($17.50)
Infraestrutura: 12% ($42)
Empresa: 23% ($80.50)

TOTAL: 100% ($350)
```

### Funções Principais

```solidity
// ✅ CLIENTE PAGA GAS (RECOMENDADO)
function selfRegister(address sponsorWallet)
function selfRegisterPermanent(address sponsorWallet)
function selfSubscribe()
function selfSubscribeCustom(uint256 amount)
function registerAndSubscribe(address sponsorWallet) // COMBO

// ⚠️ ADMIN PAGA GAS (Backup)
function adminRegisterUserBeta(address user, address sponsor)
function adminProcessSubscription(address user, uint256 amount)

// 📊 DISTRIBUIÇÃO
function processPerformanceFee(uint256 fee, address client)
function batchProcessPerformanceFees(uint256[] fees, address[] clients)

// 🔍 VIEW FUNCTIONS
function getUserInfo(address user) view returns (...)
function getUpline(address user) view returns (address[10])
function getGlobalStats() view returns (...)
```

### Arquivo: contracts/iDeepXDistributionV2.sol

**Padrões obrigatórios:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Sempre usar:
- ReentrancyGuard em funções de transferência
- Pausable em funções críticas
- Ownable para admin functions
- Events para transparência
- Custom errors (gas efficiency)
```

## ⚠️ NUNCA ALTERAR SEM PERMISSÃO

```
❌ Percentuais MLM
❌ Número de níveis (10)
❌ Estrutura de distribuição (60/5/12/23)
❌ Token (USDT BEP-20)
❌ Blockchain (BNB Chain)
❌ Nomes de funções principais
```

---

# 4. BACKEND API

## 🔧 ESTRUTURA DO BACKEND

```
backend/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configurações
│   ├── database.py             # DB connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── mt5_account.py
│   │   ├── distribution.py
│   │   └── transaction.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── user.py
│   │   ├── auth.py
│   │   └── mt5.py
│   ├── routers/                # API routes
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── mt5.py
│   │   ├── blockchain.py
│   │   └── admin.py
│   ├── services/               # Business logic
│   │   ├── mt5_connector.py
│   │   ├── blockchain_service.py
│   │   ├── performance_calculator.py
│   │   └── mlm_calculator.py
│   ├── utils/                  # Utilities
│   │   ├── security.py
│   │   ├── crypto.py
│   │   └── validators.py
│   └── tasks/                  # Celery tasks
│       ├── mt5_sync.py
│       └── distribution.py
├── tests/
├── requirements.txt
└── .env
```

## 📡 ENDPOINTS PRINCIPAIS

### Auth

```python
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Users

```python
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/me/stats
GET    /api/users/me/network
GET    /api/users/me/earnings
```

### MT5

```python
POST   /api/mt5/connect        # Conectar conta MT5
GET    /api/mt5/status          # Status da conexão
GET    /api/mt5/balance         # Saldo atual
GET    /api/mt5/trades          # Trades históricos
GET    /api/mt5/performance     # Performance stats
```

### Blockchain

```python
POST   /api/blockchain/register           # Registrar no contrato
POST   /api/blockchain/subscribe          # Pagar assinatura
GET    /api/blockchain/user-info          # Info do usuário
GET    /api/blockchain/earnings           # Ganhos MLM
GET    /api/blockchain/network            # Rede upline/downline
```

### Admin

```python
GET    /api/admin/users                   # Listar usuários
GET    /api/admin/stats                   # Estatísticas globais
POST   /api/admin/calculate-fees          # Calcular fees do mês
POST   /api/admin/distribute               # Distribuir batch
GET    /api/admin/distributions           # Histórico
```

## 🔌 MT5 INTEGRATION

### Arquivo: services/mt5_connector.py

```python
class MT5Connector:
    """Conector com MetaTrader 5"""
    
    def connect(self, account: int, password: str, server: str) -> bool:
        """Conecta à conta MT5 (senha investidor)"""
        
    def get_balance(self, account: int) -> float:
        """Retorna saldo atual"""
        
    def get_equity(self, account: int) -> float:
        """Retorna equity atual"""
        
    def get_profit(self, account: int, initial_balance: float) -> float:
        """Calcula lucro desde initial_balance"""
        
    def get_trades_history(self, account: int, from_date, to_date):
        """Retorna histórico de trades"""
        
    def calculate_performance_fee(self, profit: float) -> float:
        """Calcula 35% do lucro (menos gas estimado)"""
        return (profit * 0.35) - GAS_FEE_ESTIMATE
```

### Processo de Monitoramento

```python
# Task Celery (roda a cada 1 hora)
@celery.task
def sync_mt5_accounts():
    """
    1. Busca todas contas MT5 ativas
    2. Conecta em cada conta (senha investidor)
    3. Verifica saldo/equity atual
    4. Calcula profit desde último sync
    5. Se profit > 0: calcula performance fee (35%)
    6. Salva no banco para distribuição mensal
    """
```

## 🔐 AUTENTICAÇÃO

### JWT Token

```python
# Payload do token
{
  "sub": "user_id",
  "wallet": "0x...",
  "plan_type": 1,  # 1=BETA, 2=PERMANENTE
  "exp": 1234567890
}

# Headers
Authorization: Bearer <token>
```

### Permissões

```python
- Cliente: Acesso apenas aos próprios dados
- Afiliado: Acesso à própria rede
- Admin: Acesso total
```

## 💾 MODELS (SQLAlchemy)

### User

```python
class User(Base):
    __tablename__ = "users"
    
    id: int
    wallet: str (unique)
    email: str (optional)
    sponsor_wallet: str (nullable)
    plan_type: int  # 1=BETA, 2=PERMANENTE
    status: str  # active, inactive, suspended
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    mt5_account: MT5Account
    distributions: List[Distribution]
    transactions: List[Transaction]
```

### MT5Account

```python
class MT5Account(Base):
    __tablename__ = "mt5_accounts"
    
    id: int
    user_id: int (FK)
    account_number: int (unique)
    password_encrypted: str  # Senha investidor criptografada
    server: str
    initial_balance: Decimal
    current_balance: Decimal
    current_equity: Decimal
    total_profit: Decimal
    last_sync: datetime
    status: str  # connected, disconnected, error
```

### Distribution

```python
class Distribution(Base):
    __tablename__ = "distributions"
    
    id: int
    user_id: int (FK)
    period: str  # "2024-11"
    profit: Decimal
    performance_fee: Decimal  # 35% do profit
    tx_hash: str
    status: str  # pending, processed, failed
    processed_at: datetime (nullable)
```

---

# 5. FRONTEND (NEXT.JS)

## 🎨 ESTRUTURA DO FRONTEND

```
frontend/
├── app/
│   ├── (landing)/
│   │   ├── page.tsx              # Landing page
│   │   ├── sobre/page.tsx
│   │   └── contato/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   ├── perfil/page.tsx
│   │   ├── mt5/page.tsx
│   │   ├── rede/page.tsx
│   │   ├── ganhos/page.tsx
│   │   └── sacar/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── usuarios/page.tsx
│   │   ├── distribuicoes/page.tsx
│   │   └── stats/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                       # shadcn components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── EarningsChart.tsx
│   │   ├── NetworkTree.tsx
│   │   └── RecentTransactions.tsx
│   ├── web3/
│   │   ├── ConnectWallet.tsx
│   │   ├── NetworkSwitch.tsx
│   │   └── TransactionStatus.tsx
│   └── forms/
│       ├── RegisterForm.tsx
│       ├── MT5ConnectForm.tsx
│       └── WithdrawForm.tsx
├── lib/
│   ├── web3/
│   │   ├── config.ts             # wagmi config
│   │   ├── contracts.ts          # Contract ABIs
│   │   └── hooks.ts              # Custom Web3 hooks
│   ├── api/
│   │   ├── client.ts             # API client
│   │   └── endpoints.ts          # API endpoints
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── stores/
│       ├── useUserStore.ts       # Zustand store
│       └── useWeb3Store.ts
├── styles/
│   └── globals.css
├── public/
├── package.json
└── next.config.js
```

## 📱 PÁGINAS PRINCIPAIS

### 1. LANDING PAGE

**Arquivo:** `app/(landing)/page.tsx`

```tsx
export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Hero 
        title="Copy Trading + MLM 100% Blockchain"
        subtitle="Ganhe até 6% de comissão em 10 níveis"
        cta="Cadastre-se Agora"
      />
      
      {/* Como Funciona */}
      <HowItWorks />
      
      {/* Robôs Disponíveis */}
      <RobotsList />
      
      {/* Estrutura MLM */}
      <MLMStructure />
      
      {/* Founding Member CTA */}
      <FoundingMemberBanner />
      
      {/* Depoimentos */}
      <Testimonials />
      
      {/* FAQ */}
      <FAQ />
      
      {/* Footer */}
      <Footer />
    </>
  )
}
```

### 2. DASHBOARD CLIENTE

**Arquivo:** `app/(dashboard)/page.tsx`

```tsx
export default function DashboardPage() {
  const { user } = useUser()
  const { balance, profit } = useMT5Account()
  const { totalEarned } = useMLMEarnings()
  
  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Saldo MT5"
          value={formatCurrency(balance)}
          change="+12%"
          icon={<ChartIcon />}
        />
        <StatsCard
          title="Lucro Total"
          value={formatCurrency(profit)}
          change="+$120"
          icon={<TrendingUpIcon />}
        />
        <StatsCard
          title="Ganhos MLM"
          value={formatCurrency(totalEarned)}
          change="+$240"
          icon={<UsersIcon />}
        />
        <StatsCard
          title="Rede"
          value="23 pessoas"
          change="+3 este mês"
          icon={<NetworkIcon />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <EarningsChart />
        <NetworkGrowthChart />
      </div>
      
      {/* Transações Recentes */}
      <RecentTransactions />
      
      {/* Quick Actions */}
      <QuickActions />
    </DashboardLayout>
  )
}
```

### 3. PÁGINA DE CADASTRO

**Arquivo:** `app/(auth)/cadastro/page.tsx`

```tsx
export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [sponsor, setSponsor] = useState('')
  
  return (
    <div className="max-w-md mx-auto">
      <h1>Cadastro Beta iDeepX</h1>
      
      {/* Progress Bar */}
      <ProgressBar currentStep={step} totalSteps={3} />
      
      {step === 1 && (
        <Step1ConnectWallet onNext={() => setStep(2)} />
      )}
      
      {step === 2 && (
        <Step2Sponsor 
          sponsor={sponsor}
          setSponsor={setSponsor}
          onNext={() => setStep(3)}
        />
      )}
      
      {step === 3 && (
        <Step3Payment 
          sponsor={sponsor}
          onComplete={() => router.push('/dashboard')}
        />
      )}
    </div>
  )
}
```

### 4. PÁGINA DE REDE MLM

**Arquivo:** `app/(dashboard)/rede/page.tsx`

```tsx
export default function RedePage() {
  const { network } = useNetwork()
  
  return (
    <DashboardLayout>
      <h1>Minha Rede MLM</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Diretos (L1)" value={network.level1} />
        <StatCard title="Total Rede" value={network.total} />
        <StatCard title="Ganhos Totais" value={formatCurrency(network.earnings)} />
      </div>
      
      {/* Link de Indicação */}
      <ReferralLinkCard />
      
      {/* Árvore da Rede */}
      <NetworkTree data={network.tree} />
      
      {/* Tabela de Níveis */}
      <NetworkLevelsTable />
    </DashboardLayout>
  )
}
```

### 5. CONEXÃO MT5

**Arquivo:** `app/(dashboard)/mt5/page.tsx`

```tsx
export default function MT5Page() {
  const { connectMT5, status } = useMT5()
  
  if (status === 'connected') {
    return <MT5Connected />
  }
  
  return (
    <DashboardLayout>
      <h1>Conectar Conta MT5</h1>
      
      <Card>
        <MT5ConnectForm 
          onSubmit={connectMT5}
        />
        
        <Alert>
          ⚠️ Use apenas a senha INVESTIDOR (read-only)
        </Alert>
        
        <HelpSection>
          Como obter senha investidor?
        </HelpSection>
      </Card>
    </DashboardLayout>
  )
}
```

## 🎨 COMPONENTES PRINCIPAIS

### ConnectWallet

```tsx
'use client'
import { useAccount, useConnect } from 'wagmi'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span>{formatAddress(address)}</span>
        <NetworkBadge />
      </div>
    )
  }
  
  return (
    <Button onClick={() => connect({ connector: connectors[0] })}>
      Conectar MetaMask
    </Button>
  )
}
```

### StatsCard

```tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down'
}

export function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs",
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### NetworkTree

```tsx
'use client'
import { Tree } from 'react-d3-tree'

export function NetworkTree({ data }) {
  return (
    <div className="h-[600px] border rounded-lg">
      <Tree
        data={data}
        orientation="vertical"
        pathFunc="step"
        translate={{ x: 400, y: 50 }}
        renderCustomNodeElement={renderNode}
      />
    </div>
  )
}

function renderNode({ nodeDatum }) {
  return (
    <g>
      <circle r={20} fill="#3B82F6" />
      <text fill="white" x="30">
        {nodeDatum.name}
      </text>
      <text fill="gray" x="30" y="15" fontSize="12">
        {nodeDatum.earnings}
      </text>
    </g>
  )
}
```

## 🔌 WEB3 INTEGRATION

### Config (wagmi)

**Arquivo:** `lib/web3/config.ts`

```typescript
import { configureChains, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const { chains, publicClient } = configureChains(
  [bsc, bscTestnet],
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      },
    }),
  ],
  publicClient,
})
```

### Custom Hooks

**Arquivo:** `lib/web3/hooks.ts`

```typescript
import { useContractRead, useContractWrite } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contracts'

export function useUserInfo(address: string) {
  const { data, isLoading, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserInfo',
    args: [address],
    watch: true,
  })
  
  return {
    sponsor: data?.[0],
    totalEarnedMLM: data?.[1],
    planType: data?.[3],
    isRegistered: data?.[5],
    hasSubscribed: data?.[6],
    isLoading,
    refetch,
  }
}

export function useSelfRegister() {
  const { write, data, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'registerAndSubscribe',
  })
  
  return {
    register: write,
    txHash: data?.hash,
    isLoading,
  }
}

export function useMLMEarnings(address: string) {
  const { totalEarnedMLM } = useUserInfo(address)
  
  return {
    totalEarned: totalEarnedMLM,
    formatted: formatEther(totalEarnedMLM || 0n),
  }
}
```

## 🎨 DESIGN TOKENS

### Cores

```typescript
// tailwind.config.js
export const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  accent: {
    500: '#f59e0b',
    600: '#d97706',
  },
  success: {
    500: '#10b981',
  },
  danger: {
    500: '#ef4444',
  },
}
```

### Typography

```css
/* globals.css */
h1 { @apply text-3xl font-bold; }
h2 { @apply text-2xl font-semibold; }
h3 { @apply text-xl font-medium; }
body { @apply text-base text-gray-900; }
```

---

# 6. DATABASE

## 📊 SCHEMA COMPLETO

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    sponsor_wallet VARCHAR(42),
    plan_type INT NOT NULL, -- 1=BETA, 2=PERMANENTE
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet);
CREATE INDEX idx_users_sponsor ON users(sponsor_wallet);

-- MT5 Accounts
CREATE TABLE mt5_accounts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    account_number BIGINT UNIQUE NOT NULL,
    password_encrypted TEXT NOT NULL,
    server VARCHAR(100) NOT NULL,
    initial_balance DECIMAL(15,2) NOT NULL,
    current_balance DECIMAL(15,2),
    current_equity DECIMAL(15,2),
    total_profit DECIMAL(15,2) DEFAULT 0,
    last_sync TIMESTAMP,
    status VARCHAR(20) DEFAULT 'connected',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mt5_user ON mt5_accounts(user_id);
CREATE INDEX idx_mt5_status ON mt5_accounts(status);

-- Distributions
CREATE TABLE distributions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    period VARCHAR(7) NOT NULL, -- "2024-11"
    profit DECIMAL(15,2) NOT NULL,
    performance_fee DECIMAL(15,2) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dist_user ON distributions(user_id);
CREATE INDEX idx_dist_period ON distributions(period);
CREATE INDEX idx_dist_status ON distributions(status);

-- Transactions (blockchain)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- register, subscribe, mlm_payment
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    amount DECIMAL(15,2),
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    status VARCHAR(20) DEFAULT 'pending',
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_tx_type ON transactions(type);

-- Network Cache (para performance)
CREATE TABLE network_cache (
    user_wallet VARCHAR(42) PRIMARY KEY,
    level_1_count INT DEFAULT 0,
    total_network_count INT DEFAULT 0,
    total_earnings DECIMAL(15,2) DEFAULT 0,
    upline JSONB, -- [addr1, addr2, ...]
    downline JSONB, -- tree structure
    last_updated TIMESTAMP DEFAULT NOW()
);
```

---

# 7. INTEGRAÇÕES

## 🔗 METÁMASK / TRUST WALLET

### Adicionar BNB Chain

```typescript
export async function addBSCNetwork() {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x38', // 56
      chainName: 'BNB Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      rpcUrls: ['https://bsc-dataseed1.binance.org'],
      blockExplorerUrls: ['https://bscscan.com']
    }]
  })
}
```

### Aprovar USDT

```typescript
export async function approveUSDT(amount: string) {
  const contract = new ethers.Contract(
    USDT_ADDRESS,
    USDT_ABI,
    signer
  )
  
  const tx = await contract.approve(
    CONTRACT_ADDRESS,
    ethers.parseEther(amount)
  )
  
  await tx.wait()
  return tx.hash
}
```

## 📊 MT5 INTEGRATION

### Conectar Conta

```python
import MetaTrader5 as mt5

def connect_mt5(account: int, password: str, server: str) -> bool:
    """
    Conecta usando senha INVESTIDOR (read-only)
    """
    if not mt5.initialize():
        return False
    
    authorized = mt5.login(
        login=account,
        password=password,
        server=server
    )
    
    return authorized
```

### Monitorar Saldo

```python
def get_account_info(account: int):
    """Retorna informações da conta"""
    account_info = mt5.account_info()
    
    return {
        'balance': account_info.balance,
        'equity': account_info.equity,
        'profit': account_info.profit,
        'margin': account_info.margin,
        'margin_free': account_info.margin_free,
    }
```

### Calcular Lucro

```python
def calculate_profit(
    account: int,
    initial_balance: float,
    from_date: datetime
) -> float:
    """
    Calcula lucro real desde initial_balance
    """
    current = get_account_info(account)
    profit = current['equity'] - initial_balance
    
    return max(0, profit)  # Só lucro, não prejuízo
```

## 🔔 WEBHOOKS / NOTIFICATIONS

### Notificar Distribuição

```python
@app.post("/webhooks/distribution-complete")
async def distribution_webhook(data: DistributionWebhook):
    """
    Chamado pelo admin após processar batch
    Envia notificação para usuários
    """
    for user in data.users:
        # Email
        send_email(
            to=user.email,
            subject="💰 Você recebeu comissões MLM!",
            template="mlm_payment",
            data={
                'amount': user.amount,
                'tx_hash': user.tx_hash
            }
        )
        
        # Push notification (se tiver)
        send_push_notification(user.id, "Pagamento recebido!")
```

---

# 8. FLUXOS DE USUÁRIO

## 👤 FLUXO: CADASTRO DO CLIENTE

```
1. Cliente acessa landing page
   └─ Clica "Cadastrar Agora"

2. Conecta MetaMask
   ├─ Se não tem MetaMask → Tutorial de instalação
   ├─ Se não tem BNB → Link para comprar
   └─ Se não tem USDT → Link para comprar

3. Adiciona BNB Chain (se necessário)
   └─ Popup automático do MetaMask

4. Insere código de indicação (opcional)
   └─ Valida se existe no contrato

5. Aprova USDT ($29)
   └─ Transação no MetaMask
   └─ Aguarda confirmação

6. Registra + Paga em 1 transação
   └─ registerAndSubscribe()
   └─ Transação no MetaMask
   └─ Aguarda confirmação

7. Backend detecta registro
   └─ Cria usuário no banco
   └─ Envia email de boas-vindas

8. Redirect para dashboard
   └─ Tutorial de primeiro uso
   └─ Próximo passo: Conectar MT5
```

## 📊 FLUXO: CONEXÃO MT5

```
1. Cliente no dashboard clica "Conectar MT5"

2. Preenche formulário:
   ├─ Número da conta
   ├─ Senha INVESTIDOR
   ├─ Servidor
   └─ Saldo inicial

3. Backend valida:
   ├─ Tenta conectar no MT5
   ├─ Verifica se é senha investidor (read-only)
   └─ Se OK: salva criptografado no banco

4. Ativa monitoramento:
   └─ Task Celery começa a sincronizar a cada 1h

5. Cliente vê status "Conectado"
   └─ Dashboard mostra saldo/equity/profit em tempo real
```

## 💰 FLUXO: DISTRIBUIÇÃO MENSAL

```
1. Fim do mês (dia 30)
   └─ Task Celery: sync_all_accounts()
   
2. Para cada conta MT5:
   ├─ Conecta e verifica profit
   ├─ Se profit > 0: calcula 35% (performance fee)
   └─ Salva no banco com status "pending"

3. Admin acessa painel
   └─ Vê lista de distribuições pendentes
   └─ Revisa valores
   └─ Clica "Processar Batch"

4. Backend prepara transação:
   ├─ Monta arrays de (wallets, values)
   ├─ Calcula total de USDT necessário
   └─ Retorna dados para admin aprovar

5. Admin aprova USDT total
   └─ Transação no MetaMask

6. Admin chama batchProcessPerformanceFees()
   └─ Smart contract distribui automaticamente:
      ├─ MLM 10 níveis
      ├─ Pools
      └─ Empresa

7. Backend detecta distribuição:
   ├─ Atualiza status para "processed"
   ├─ Salva tx_hash
   └─ Envia notificações

8. Clientes recebem:
   ├─ Email: "Você recebeu $X em comissões!"
   ├─ Notificação no dashboard
   └─ USDT na carteira (direto do contrato)
```

## 🌳 FLUXO: VISUALIZAR REDE MLM

```
1. Cliente clica "Minha Rede"

2. Backend busca:
   ├─ network_cache (rápido)
   └─ Se cache velho: atualiza do contrato

3. Para atualizar cache:
   ├─ Chama getUpline(user) → retorna 10 níveis acima
   ├─ Busca no banco todos com sponsor = user (L1)
   ├─ Recursivo: busca L2, L3... até L10
   └─ Monta árvore JSON

4. Frontend renderiza:
   ├─ Stats (diretos, total, ganhos)
   ├─ Link de indicação
   ├─ Árvore visual (react-d3-tree)
   └─ Tabela de comissões por nível
```

---

# 9. DESIGN SYSTEM

## 🎨 PALETA DE CORES

```typescript
// Cores principais
const colors = {
  // Primary (Azul)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Principal
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Accent (Dourado/Amarelo)
  accent: {
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Success (Verde)
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669',
  },
  
  // Danger (Vermelho)
  danger: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827',
  }
}
```

## 📝 TIPOGRAFIA

```css
/* Font Families */
--font-sans: 'Inter', sans-serif;
--font-mono: 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 📦 COMPONENTES BASE

### Button

```tsx
// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Estados
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### Badge

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
```

## 🎭 ANIMAÇÕES

```css
/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;

/* Exemplo de uso */
.button {
  transition: all var(--transition-base);
}
```

---

# 10. SISTEMA DE 3 NÍVEIS

[CONTEÚDO ANTERIOR DO SISTEMA DE 3 NÍVEIS MANTIDO]

---

# 11. SEGURANÇA

## 🔐 CHECKLIST DE SEGURANÇA

### Smart Contract

```
✅ OpenZeppelin contracts (auditados)
✅ ReentrancyGuard em transferências
✅ Pausable em funções críticas
✅ Ownable para admin functions
✅ Custom errors (gas + segurança)
✅ Events para transparência
✅ Input validation
✅ Integer overflow protection (Solidity 0.8+)
```

### Backend

```
✅ Senhas MT5 criptografadas (AES-256)
✅ JWT com expiração curta (1h)
✅ Refresh tokens
✅ Rate limiting (100 req/min)
✅ CORS configurado
✅ Helmet.js (headers de segurança)
✅ SQL injection protection (SQLAlchemy)
✅ XSS protection
✅ CSRF tokens
✅ Environment variables (.env)
✅ Secrets nunca em código
```

### Frontend

```
✅ HTTPS obrigatório
✅ Content Security Policy
✅ No inline scripts
✅ Sanitização de inputs
✅ Validação client + server
✅ Private keys nunca tocam servidor
✅ Web3 transactions assinadas localmente
```

## 🚨 VARIÁVEIS SENSÍVEIS

### NUNCA commitar:

```bash
# .env
PRIVATE_KEY=...
DATABASE_URL=...
JWT_SECRET=...
MT5_ACCOUNTS=...
API_KEYS=...
```

### SEMPRE no .gitignore:

```gitignore
.env
.env.local
.env.production
*.key
*.pem
secrets/
```

---

# 12. DEPLOY E DEVOPS

## 🚀 AMBIENTES

### Testnet (BSC Testnet)

```bash
# Deploy contrato
npx hardhat run scripts/deploy.js --network bscTestnet

# Frontend
vercel --prod

# Backend
railway up
```

### Mainnet (BSC Mainnet)

```bash
# Deploy contrato
npx hardhat run scripts/deploy.js --network bsc

# Verify
npx hardhat verify --network bsc ADDRESS ...

# Frontend
vercel --prod

# Backend
railway deploy --production
```

## 📊 MONITORAMENTO

### Sentry (Errors)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Plausible (Analytics)

```html
<script defer data-domain="ideepx.com" 
  src="https://plausible.io/js/script.js">
</script>
```

---

# ✅ CHECKLIST FINAL

## Antes de considerar tarefa completa:

```
✅ Código funciona
✅ Código está otimizado
✅ Código está seguro
✅ Código está documentado (PT-BR)
✅ Testes passando
✅ Responsivo (mobile/desktop)
✅ Acessibilidade (a11y)
✅ Performance otimizada
✅ SEO configurado
✅ Usuário entendeu as mudanças
✅ Próximos passos foram sugeridos
```

---

# 🎯 MISSÃO

**Entregar o melhor sistema de Copy Trading + MLM on-chain possível, com:**
- Código limpo e seguro
- UX excelente
- Performance otimizada
- Custos operacionais mínimos
- Documentação clara em PT-BR
- Pronto para escalar para 10k+ usuários

**FOCO TOTAL em ajudar o usuário a ter sucesso! 🚀**

---

**FIM DA DOCUMENTAÇÃO COMPLETA**

_Este arquivo deve estar sempre no root do projeto: C:\ideepx-bnb\CLAUDE.md_
_Versão: 2.0 - MEGA COMPLETO_
_Última atualização: 2024-11-01_
