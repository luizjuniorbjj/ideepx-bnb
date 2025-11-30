# 📘 Documentação Técnica Completa - Sistema iDeepX

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Smart Contract](#smart-contract)
4. [Backend](#backend)
5. [Database](#database)
6. [Frontend](#frontend)
7. [Integrações](#integrações)
8. [Deploy e DevOps](#deploy-e-devops)
9. [Testes](#testes)
10. [Segurança](#segurança)

---

## 🎯 Visão Geral

### Descrição do Projeto
O **iDeepX** é um sistema de distribuição MLM transparente para copy trading que:
- Integra com a corretora GMI Edge
- Distribui 35% de performance fee automaticamente
- Utiliza blockchain (BSC) para transparência total
- Gerencia rede de até 10 níveis com smart contracts

### Stack Tecnológica
```yaml
Blockchain: Binance Smart Chain (BSC)
Smart Contract: Solidity 0.8.20
Backend: Node.js + TypeScript + Express
Database: PostgreSQL 15 + Redis
Frontend: Next.js 14 + TailwindCSS + Wagmi
Web3: Ethers.js v6
```

### Requisitos do Sistema
```yaml
Node.js: v18+
PostgreSQL: v15+
Redis: v7+
npm/yarn: latest
MetaMask: Para testes
BSC Testnet: Para desenvolvimento
```

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Componentes
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│  Smart Contract │
│   (Next.js)     │◀────│   (Node.js)     │◀────│     (BSC)       │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │    + Redis      │
                        └─────────────────┘
```

### Fluxo de Dados Principal
1. GMI Edge gera performance → Backend consulta via API
2. Backend calcula 35% fee → Envia para Smart Contract
3. Smart Contract distribui → MLM automático 10 níveis
4. Frontend atualiza → Usuários visualizam saldos
5. Usuários sacam → Smart Contract transfere USDT

---

## 💎 Smart Contract

### Estrutura do Contrato
```solidity
// Arquivo: contracts/iDeepXUnified.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
```

### Instalação das Dependências
```bash
npm init -y
npm install --save-dev hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
npm install @openzeppelin/contracts
```

### Configuração Hardhat
```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Deploy Script
```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
  
  const iDeepX = await hre.ethers.getContractFactory("iDeepXUnified");
  const contract = await iDeepX.deploy(USDT_ADDRESS);
  await contract.deployed();
  
  console.log("iDeepX deployed to:", contract.address);
  
  // Configurações iniciais
  await contract.setWithdrawalLimits(
    ethers.utils.parseUnits("50", 6),    // min $50
    ethers.utils.parseUnits("10000", 6), // max $10k per tx
    ethers.utils.parseUnits("30000", 6)  // max $30k per month
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Comandos de Deploy
```bash
# Compile
npx hardhat compile

# Deploy testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Deploy mainnet
npx hardhat run scripts/deploy.js --network bscMainnet

# Verify
npx hardhat verify --network bscMainnet CONTRACT_ADDRESS USDT_ADDRESS
```

---

## 🔧 Backend

### Estrutura de Pastas
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── web3.ts
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   ├── performance.controller.ts
│   │   └── mlm.controller.ts
│   ├── services/
│   │   ├── gmi.service.ts
│   │   ├── blockchain.service.ts
│   │   └── distribution.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── performance.model.ts
│   │   └── distribution.model.ts
│   ├── routes/
│   │   └── index.ts
│   ├── jobs/
│   │   └── weekly-distribution.job.ts
│   └── app.ts
├── .env
├── package.json
└── tsconfig.json
```

### Package.json
```json
{
  "name": "ideepx-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ethers": "^6.7.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "axios": "^1.4.0",
    "dotenv": "^16.3.0",
    "bull": "^4.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "winston": "^3.9.0",
    "joi": "^17.9.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.0",
    "typescript": "^5.1.0",
    "nodemon": "^2.0.22",
    "ts-node": "^10.9.0"
  }
}
```

### Configuração TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Configuração Web3
```typescript
// src/config/web3.ts
import { ethers } from 'ethers';
import contractABI from '../abi/iDeepXUnified.json';

const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  contractABI,
  wallet
);

export { provider, wallet, contract };
```

### Serviço GMI
```typescript
// src/services/gmi.service.ts
import axios from 'axios';

export class GMIService {
  private apiKey: string;
  private baseURL: string;
  
  constructor() {
    this.apiKey = process.env.GMI_API_KEY!;
    this.baseURL = process.env.GMI_BASE_URL!;
  }
  
  async getWeeklyPerformance(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/performance/weekly`, {
        headers: { 'X-API-Key': this.apiKey }
      });
      
      const totalPerformance = response.data.totalPerformance;
      const performanceFee = totalPerformance * 0.35; // 35%
      
      return performanceFee;
    } catch (error) {
      console.error('GMI API Error:', error);
      throw error;
    }
  }
  
  async getUserVolumes(userIds: string[]): Promise<Map<string, number>> {
    // Implementar busca de volumes por usuário
    const volumes = new Map<string, number>();
    // ... lógica
    return volumes;
  }
}
```

### Job de Distribuição Semanal
```typescript
// src/jobs/weekly-distribution.job.ts
import Bull from 'bull';
import { contract } from '../config/web3';
import { GMIService } from '../services/gmi.service';
import { ethers } from 'ethers';

const distributionQueue = new Bull('weekly-distribution', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!)
  }
});

distributionQueue.process(async (job) => {
  console.log('Processing weekly distribution...');
  
  const gmiService = new GMIService();
  const performanceFee = await gmiService.getWeeklyPerformance();
  
  // Converter para USDT (6 decimais)
  const amount = ethers.parseUnits(performanceFee.toString(), 6);
  
  // Upload proof to IPFS
  const proof = await uploadToIPFS({
    week: new Date().toISOString(),
    amount: performanceFee,
    timestamp: Date.now()
  });
  
  // Enviar para smart contract
  const tx = await contract.depositWeeklyPerformance(amount, proof);
  await tx.wait();
  
  console.log('Distribution completed:', tx.hash);
  return tx.hash;
});

// Agendar para toda segunda-feira às 00:00
distributionQueue.add({}, {
  repeat: {
    cron: '0 0 * * 1' // Toda segunda-feira
  }
});
```

### API Routes
```typescript
// src/routes/index.ts
import express from 'express';
import { UserController } from '../controllers/user.controller';
import { PerformanceController } from '../controllers/performance.controller';

const router = express.Router();

// User routes
router.post('/users/register', UserController.register);
router.get('/users/:wallet', UserController.getByWallet);
router.post('/users/:wallet/activate-lai', UserController.activateLAI);

// Performance routes
router.get('/performance/weekly', PerformanceController.getWeekly);
router.get('/performance/history', PerformanceController.getHistory);
router.post('/performance/distribute', PerformanceController.distribute);

// MLM routes
router.get('/mlm/network/:wallet', MLMController.getNetwork);
router.get('/mlm/commissions/:wallet', MLMController.getCommissions);

export default router;
```

---

## 🗄️ Database

### Schema PostgreSQL
```sql
-- Criar database
CREATE DATABASE ideepx;

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    sponsor_wallet VARCHAR(42),
    gmi_account_id VARCHAR(100),
    lai_active BOOLEAN DEFAULT FALSE,
    lai_expires_at TIMESTAMP,
    network_level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de performance
CREATE TABLE performance_history (
    id SERIAL PRIMARY KEY,
    week INTEGER NOT NULL,
    total_volume DECIMAL(20,6),
    performance_percentage DECIMAL(5,2),
    performance_fee DECIMAL(20,6),
    tx_hash VARCHAR(66) UNIQUE,
    ipfs_proof VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de distribuições MLM
CREATE TABLE mlm_distributions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    week INTEGER NOT NULL,
    level INTEGER NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    percentage DECIMAL(5,2),
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de saques
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(20,6) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de rede/genealogia
CREATE TABLE network_tree (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    sponsor_id INTEGER REFERENCES users(id),
    level INTEGER NOT NULL,
    position VARCHAR(20),
    directs_count INTEGER DEFAULT 0,
    network_volume DECIMAL(20,6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_sponsor ON users(sponsor_wallet);
CREATE INDEX idx_distributions_user_week ON mlm_distributions(user_id, week);
CREATE INDEX idx_network_sponsor ON network_tree(sponsor_id);
CREATE INDEX idx_performance_week ON performance_history(week);

-- Views úteis
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.wallet_address,
    u.lai_active,
    u.network_level,
    COALESCE(SUM(CASE WHEN md.status = 'completed' THEN md.amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN md.status = 'pending' THEN md.amount ELSE 0 END), 0) as pending_balance,
    COUNT(DISTINCT nt.user_id) as directs_count,
    COALESCE(SUM(nt.network_volume), 0) as total_network_volume
FROM users u
LEFT JOIN mlm_distributions md ON u.id = md.user_id
LEFT JOIN network_tree nt ON u.id = nt.sponsor_id
GROUP BY u.id, u.wallet_address, u.lai_active, u.network_level;
```

### Migrations com Prisma (Alternativa)
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int      @id @default(autoincrement())
  walletAddress String   @unique @map("wallet_address")
  email         String?
  sponsorWallet String?  @map("sponsor_wallet")
  gmiAccountId  String?  @map("gmi_account_id")
  laiActive     Boolean  @default(false) @map("lai_active")
  laiExpiresAt  DateTime? @map("lai_expires_at")
  networkLevel  Int      @default(0) @map("network_level")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  distributions Distribution[]
  withdrawals   Withdrawal[]
  sponsored     NetworkTree[] @relation("sponsor")
  network       NetworkTree[] @relation("user")
  
  @@map("users")
}

model Distribution {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  week      Int
  level     Int
  amount    Decimal  @db.Decimal(20, 6)
  txHash    String?  @map("tx_hash")
  status    String   @default("pending")
  claimedAt DateTime? @map("claimed_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("mlm_distributions")
}
```

---

## 🎨 Frontend

### Estrutura Next.js
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── network/
│   │   └── page.tsx
│   └── admin/
│       └── page.tsx
├── components/
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   └── WalletProvider.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── WithdrawModal.tsx
│   ├── network/
│   │   ├── TreeView.tsx
│   │   └── LevelStats.tsx
│   └── shared/
│       ├── Header.tsx
│       └── Footer.tsx
├── hooks/
│   ├── useContract.ts
│   ├── useBalance.ts
│   └── useNetwork.ts
├── lib/
│   ├── web3.ts
│   ├── api.ts
│   └── utils.ts
├── public/
├── package.json
└── next.config.js
```

### Package.json Frontend
```json
{
  "name": "ideepx-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@rainbow-me/rainbowkit": "^1.3.0",
    "wagmi": "^1.4.0",
    "viem": "^1.19.0",
    "ethers": "^6.7.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.5.0",
    "recharts": "^2.8.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "tailwindcss": "^3.3.0",
    "shadcn-ui": "latest",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0"
  }
}
```

### Configuração Web3 (Wagmi)
```typescript
// app/providers.tsx
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [bsc, bscTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'iDeepX',
  projectId: 'YOUR_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

### Hook do Contrato
```typescript
// hooks/useContract.ts
import { useContractRead, useContractWrite } from 'wagmi';
import contractABI from '../abi/iDeepXUnified.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function useUserDashboard(wallet: string) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getUserDashboard',
    args: [wallet],
    watch: true,
  });
}

export function useActivateLAI() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'activateLAI',
  });
}

export function useClaimCommission() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'claimCommission',
  });
}
```

### Componente Dashboard
```tsx
// components/dashboard/Dashboard.tsx
import { useAccount } from 'wagmi';
import { useUserDashboard } from '@/hooks/useContract';
import { formatUnits } from 'ethers';

export function Dashboard() {
  const { address } = useAccount();
  const { data, isLoading } = useUserDashboard(address);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Saldo Disponível"
        value={`$${formatUnits(data?.available || 0, 6)}`}
        icon={<DollarSign />}
      />
      <StatsCard
        title="Total Ganho"
        value={`$${formatUnits(data?.totalEarned || 0, 6)}`}
        icon={<TrendingUp />}
      />
      <StatsCard
        title="Nível da Rede"
        value={data?.level || 0}
        icon={<Users />}
      />
    </div>
  );
}
```

---

## 🔌 Integrações

### GMI Edge API
```typescript
// services/gmi-integration.ts
export class GMIIntegration {
  private apiKey: string;
  private baseURL: string;
  
  constructor() {
    this.apiKey = process.env.GMI_API_KEY!;
    this.baseURL = 'https://api.gmi-edge.com/v1';
  }
  
  async getAccountInfo(accountId: string) {
    const response = await axios.get(`${this.baseURL}/accounts/${accountId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }
  
  async getPerformance(accountId: string, period: string) {
    const response = await axios.get(`${this.baseURL}/performance`, {
      params: { accountId, period },
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }
}
```

### IPFS para Provas
```typescript
// services/ipfs.service.ts
import { create } from 'ipfs-http-client';

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_API_SECRET}`
    ).toString('base64')}`
  }
});

export async function uploadToIPFS(data: any): Promise<string> {
  const json = JSON.stringify(data);
  const result = await client.add(json);
  return result.path;
}
```

---

## 🚀 Deploy e DevOps

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ideepx
      POSTGRES_USER: ideepx
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://ideepx:${DB_PASSWORD}@postgres:5432/ideepx
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"
  
  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
      - NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name ideepx.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy iDeepX

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Smart Contract
        run: |
          npm run deploy:mainnet
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
      
      - name: Build and Deploy Backend
        run: |
          docker build -t ideepx-backend ./backend
          docker push ideepx-backend
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/ideepx
            git pull
            docker-compose up -d --build
```

---

## 🧪 Testes

### Testes do Smart Contract
```javascript
// test/iDeepX.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("iDeepX", function () {
  let contract;
  let owner, user1, user2;
  let usdt;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock USDT
    const USDT = await ethers.getContractFactory("MockUSDT");
    usdt = await USDT.deploy();
    
    // Deploy iDeepX
    const iDeepX = await ethers.getContractFactory("iDeepXUnified");
    contract = await iDeepX.deploy(usdt.address);
  });
  
  it("Should activate LAI", async function () {
    await usdt.mint(user1.address, ethers.parseUnits("100", 6));
    await usdt.connect(user1).approve(contract.address, ethers.parseUnits("19", 6));
    
    await contract.connect(user1).activateLAI();
    
    const dashboard = await contract.getUserDashboard(user1.address);
    expect(dashboard.laiActive).to.be.true;
  });
  
  it("Should distribute performance correctly", async function () {
    const amount = ethers.parseUnits("35000", 6);
    await usdt.mint(owner.address, amount);
    await usdt.approve(contract.address, amount);
    
    await contract.depositWeeklyPerformance(amount, "ipfs://test");
    
    const state = await contract.getSystemState();
    expect(state.poolReserve).to.equal(ethers.parseUnits("1750", 6));
  });
});
```

### Testes do Backend
```typescript
// backend/test/gmi.test.ts
import { GMIService } from '../src/services/gmi.service';

describe('GMI Service', () => {
  let service: GMIService;
  
  beforeEach(() => {
    service = new GMIService();
  });
  
  it('should fetch weekly performance', async () => {
    const performance = await service.getWeeklyPerformance();
    expect(performance).toBeGreaterThan(0);
  });
});
```

---

## 🔒 Segurança

### Checklist de Segurança
```markdown
## Smart Contract
- [ ] Auditoria por empresa especializada (Certik, Consensys)
- [ ] Testes de reentrância
- [ ] Overflow/underflow protection
- [ ] Access control adequado
- [ ] Pausable em emergências
- [ ] Rate limiting nos saques

## Backend
- [ ] Validação de inputs (Joi)
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js para headers
- [ ] CORS configurado
- [ ] Autenticação JWT
- [ ] Logs com Winston
- [ ] Monitoramento com Sentry

## Database
- [ ] Conexões SSL
- [ ] Backup automático
- [ ] Encriptação de dados sensíveis
- [ ] Índices otimizados
- [ ] Query injection prevention

## Frontend
- [ ] Content Security Policy
- [ ] XSS Protection
- [ ] HTTPS only
- [ ] Sanitização de inputs
- [ ] Secure cookies
```

### Variáveis de Ambiente (.env)
```bash
# Backend .env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ideepx
REDIS_URL=redis://localhost:6379

# Blockchain
BSC_RPC_URL=https://bsc-dataseed.binance.org/
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# GMI API
GMI_API_KEY=your-api-key
GMI_BASE_URL=https://api.gmi-edge.com

# IPFS
INFURA_PROJECT_ID=your-project-id
INFURA_API_SECRET=your-secret

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=56
```

---

## 📝 Comandos Úteis

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build produção
npm run build

# Rodar testes
npm test

# Deploy contract
npx hardhat run scripts/deploy.js --network bscMainnet

# Verificar contract
npx hardhat verify --network bscMainnet CONTRACT_ADDRESS

# Rodar migrations
npx prisma migrate dev

# Gerar client Prisma
npx prisma generate
```

### Docker
```bash
# Build e rodar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Limpar volumes
docker-compose down -v
```

### Monitoramento
```bash
# Ver logs do PM2
pm2 logs

# Status dos processos
pm2 status

# Restart aplicação
pm2 restart all

# Monitorar recursos
pm2 monit
```

---

## 📚 Recursos Adicionais

- [Documentação Solidity](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [BSC Documentation](https://docs.bnbchain.org/)
- [GMI Edge API Docs](https://docs.gmi-edge.com/)

---

## 🤝 Suporte

Para dúvidas sobre implementação:
- Smart Contract: Use Hardhat Discord
- Backend: Node.js community
- Frontend: Next.js Discord
- BSC: BNB Chain forum

---

## ✅ Checklist de Implementação

### Fase 1 - Setup (Semana 1)
- [ ] Configurar ambiente de desenvolvimento
- [ ] Instalar todas as dependências
- [ ] Configurar banco de dados local
- [ ] Setup do Hardhat

### Fase 2 - Smart Contract (Semana 2)
- [ ] Deploy em testnet
- [ ] Testes unitários
- [ ] Verificação do contrato
- [ ] Deploy em mainnet

### Fase 3 - Backend (Semana 3-4)
- [ ] APIs básicas
- [ ] Integração GMI
- [ ] Jobs de distribuição
- [ ] Testes de integração

### Fase 4 - Frontend (Semana 5-6)
- [ ] Layout base
- [ ] Integração Web3
- [ ] Dashboard
- [ ] Rede MLM visualização

### Fase 5 - Testes (Semana 7)
- [ ] Testes end-to-end
- [ ] Testes de carga
- [ ] Auditoria segurança
- [ ] Bug fixes

### Fase 6 - Deploy (Semana 8)
- [ ] Setup VPS
- [ ] Configurar CI/CD
- [ ] Deploy produção
- [ ] Monitoramento

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0.0
**Autor:** Sistema iDeepX Team
