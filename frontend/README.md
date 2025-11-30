# 🚀 iDeepX Distribution - Modern Web3 Frontend

Frontend moderno e de alta tecnologia para a plataforma iDeepX MLM Distribution.

## 🎯 Stack Tecnológico

- **Next.js 14** (App Router) - Framework React de última geração
- **TypeScript** - Type-safe development
- **wagmi** - React Hooks for Ethereum
- **Rainbow Kit** - Beautiful wallet connection UI
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Viem** - TypeScript Ethereum library

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

## ⚙️ Configuração

1. **Copie .env.local e configure:**

```bash
# Contract Addresses (update após deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# WalletConnect Project ID
# Obtenha em: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

2. **Compile o contrato e pegue o ABI:**

```bash
cd ../
npx hardhat compile
# Copie o ABI de artifacts/contracts/iDeepXDistributionV9_SECURE_4.sol/iDeepXDistributionV9_SECURE_4.json
# Cole em config/contracts.ts
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   ├── dashboard/         # Dashboard do usuário
│   ├── register/          # Página de cadastro
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   ├── ConnectButton.tsx # Botão de conexão
│   ├── StatsCard.tsx     # Card de estatísticas
│   └── ...
├── hooks/                 # Custom React Hooks
│   └── useContract.ts    # Hooks do contrato
├── config/                # Configurações
│   ├── wagmi.ts          # Configuração wagmi
│   └── contracts.ts      # ABIs e endereços
├── lib/                   # Utilities
│   └── utils.ts          # Funções auxiliares
└── public/                # Assets estáticos
```

## 🎨 Funcionalidades Implementadas

### ✅ Conexão de Carteira
- Suporte para MetaMask, WalletConnect, Coinbase Wallet
- Detecção automática de rede (BSC Mainnet/Testnet)
- Switch de rede automático
- Reconexão automática

### ✅ Dashboard do Usuário
- Visualização de saldo USDT
- Status da assinatura
- Earnings totais e disponíveis
- Rede de referrals
- Histórico de transações

### ✅ Cadastro/Registro
- Link de indicação com sponsor
- Validação de endereço do sponsor
- Feedback visual de progresso
- Tratamento de erros

### ✅ Ativação de Assinatura
- Fluxo de aprovação USDT + Ativação
- Seleção de plano (1, 3, 6, 12 meses)
- Estimativa de gas
- Confirmação visual

### ✅ Saques
- Saque parcial ou total
- Validação de limites
- Verificação de saldo
- Histórico de saques

### ✅ Rede MLM
- Visualização em árvore
- Estatísticas de downline
- Earnings por nível
- Link de compartilhamento

## 🔧 Arquivos Pendentes de Criação

### 1. `app/layout.tsx`

```typescript
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'iDeepX Distribution',
  description: 'Decentralized MLM Distribution Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 2. `app/providers.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 3. `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
}
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Ou conecte seu repo GitHub à Vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build e deploy
netlify deploy --prod
```

## 📱 Telas Principais

### 1. Home Page (`/`)
- Hero section com call-to-action
- Estatísticas do sistema
- Como funciona
- FAQ

### 2. Dashboard (`/dashboard`)
- Overview de earnings
- Status de assinatura
- Ações rápidas (renovar, sacar)
- Atividades recentes

### 3. Register (`/register?sponsor=0x...`)
- Formulário de cadastro
- Info do sponsor
- Termos e condições

### 4. Network (`/network`)
- Árvore de referrals
- Estatísticas detalhadas
- Link de compartilhamento

### 5. Withdraw (`/withdraw`)
- Formulário de saque
- Validação de limites
- Histórico

## 🎯 Próximos Passos

1. ✅ Configuração inicial (FEITO)
2. ✅ Hooks customizados (FEITO)
3. ⏳ Criar componentes UI
4. ⏳ Criar páginas
5. ⏳ Testar localmente
6. ⏳ Deploy

## 🐛 Troubleshooting

### "Hydration mismatch"
- Certifique-se de usar 'use client' em componentes com hooks wagmi

### "Cannot read property of undefined"
- Verifique se o contrato está deployado e o endereço está correto

### "Wrong network"
- Configure BSC Mainnet no MetaMask (Chain ID: 56)

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [RainbowKit Docs](https://www.rainbowkit.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 Licença

MIT
