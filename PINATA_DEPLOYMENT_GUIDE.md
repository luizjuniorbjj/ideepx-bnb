# 📌 iDeepX Frontend - Deploy no Pinata Cloud (IPFS)

**Guia Completo de Hospedagem Descentralizada**

---

## 🎯 O QUE É PINATA?

Pinata é uma plataforma que facilita hospedar arquivos no **IPFS** (InterPlanetary File System), uma rede descentralizada de armazenamento. Perfeito para dApps Web3!

**Vantagens:**
- ✅ Descentralizado (sem servidor único)
- ✅ Imutável (CID único por versão)
- ✅ Resistente a censura
- ✅ Sem downtime
- ✅ Grátis até 1GB (Pinata)

---

## 📋 PRÉ-REQUISITOS

### 1. Conta Pinata (Grátis)
1. Acesse: https://pinata.cloud
2. Crie conta gratuita
3. Faça login

### 2. Contratos Deployados
Você precisa ter os endereços dos contratos na BSC:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...CoreAddress...
NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

### 3. Node.js Instalado
```bash
node --version  # v16+ recomendado
npm --version
```

---

## 🔧 PASSO 1: PREPARAR FRONTEND PARA IPFS

### 1.1. Atualizar next.config.js

Edite `C:\ideepx-bnb\frontend\next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANTE: Export estático para IPFS
  output: 'export',

  // Desabilitar Image Optimization (não funciona no IPFS)
  images: {
    unoptimized: true,
  },

  // Base path (apenas se usar ENS ou custom domain)
  // basePath: '',

  // Asset prefix (para IPFS gateway)
  // assetPrefix: './',

  // Trailing slash (importante para IPFS)
  trailingSlash: true,
}

module.exports = nextConfig
```

### 1.2. Configurar .env.local (IMPORTANTE!)

Edite `C:\ideepx-bnb\frontend\.env.local`:

```env
# Endereço do contrato Core (após deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...SEU_CORE_ADDRESS_AQUI...

# USDT na BSC Mainnet
NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...SEU_PROJECT_ID...

# IPFS Gateway (opcional - para fallback)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud
```

**Como obter WalletConnect Project ID:**
1. Acesse: https://cloud.walletconnect.com
2. Crie conta gratuita
3. Create New Project
4. Copie o Project ID

### 1.3. Remover Recursos Incompatíveis com IPFS

Edite `C:\ideepx-bnb\frontend\app\layout.tsx` se estiver usando `next/font`:

**ANTES:**
```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

**DEPOIS (para IPFS):**
```typescript
// Usar fonte via CDN ou self-hosted
import './globals.css'  // Fonte importada via CSS
```

E em `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

---

## 🏗️ PASSO 2: BUILD DO FRONTEND

### 2.1. Instalar Dependências

```bash
cd C:\ideepx-bnb\frontend
npm install
```

### 2.2. Build para Produção

```bash
npm run build
```

**Output esperado:**
```
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    142 B          87.2 kB
├ ○ /_not-found                          871 B          85.9 kB
└ ○ /favicon.ico                         0 B                0 B

○  (Static)  prerendered as static content

Build completed in 30s.
```

### 2.3. Verificar Output

```bash
dir out\  # Windows
ls out/   # Linux/Mac
```

Você deve ver:
```
out/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── favicon.ico
└── ...
```

---

## 📤 PASSO 3: UPLOAD NO PINATA

### Método 1: Interface Web (Mais Fácil)

1. **Acesse Pinata Dashboard:**
   - https://app.pinata.cloud

2. **Upload da Pasta:**
   - Clique em **"Upload"** → **"Folder"**
   - Selecione a pasta `C:\ideepx-bnb\frontend\out`
   - Nome: `ideepx-frontend-v1.0`
   - Clique em **"Upload"**

3. **Aguarde Upload:**
   - Progresso será exibido
   - Pode levar 2-5 minutos

4. **Obtenha o CID:**
   - Após upload, você verá um **CID** (Content Identifier)
   - Exemplo: `QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx`

5. **Acesse seu dApp:**
   ```
   https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
   ```

### Método 2: Pinata CLI (Avançado)

```bash
# Instalar Pinata CLI
npm install -g @pinata/sdk

# Configurar API Key (Pinata → API Keys → New Key)
export PINATA_API_KEY=your_api_key
export PINATA_SECRET_KEY=your_secret_key

# Upload
pinata upload out/ --name "ideepx-frontend-v1.0"
```

---

## 🌐 PASSO 4: CONFIGURAR CUSTOM DOMAIN (Opcional)

### Opção 1: Pinata Dedicated Gateway (Pago - $20/mês)

1. **Pinata → Gateways → Create Gateway**
2. **Custom Domain:** `app.ideepx.com`
3. **Configure DNS:**
   ```
   Type: CNAME
   Name: app
   Value: gateway.pinata.cloud
   ```
4. **Pin seu CID ao Gateway**

### Opção 2: Cloudflare IPFS Gateway (Grátis)

1. **Configure DNS no Cloudflare:**
   ```
   Type: CNAME
   Name: app
   Value: cloudflare-ipfs.com
   ```

2. **Adicione TXT Record com CID:**
   ```
   Type: TXT
   Name: _dnslink.app
   Value: dnslink=/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
   ```

3. **Acesse:**
   ```
   https://app.ideepx.com
   ```

### Opção 3: ENS Domain (Ethereum Name Service)

1. **Compre ENS:** https://app.ens.domains
   - Exemplo: `ideepx.eth` (~$5/ano)

2. **Configure Content Hash:**
   - Vá em ENS Manager → Records
   - Content: `ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx`

3. **Acesse:**
   ```
   https://ideepx.eth.limo
   https://ideepx.eth.link
   ```

---

## 🔄 PASSO 5: ATUALIZAR VERSÕES

### Quando atualizar o frontend:

1. **Faça mudanças no código**

2. **Rebuild:**
   ```bash
   cd C:\ideepx-bnb\frontend
   npm run build
   ```

3. **Upload nova versão:**
   - Pinata → Upload → Folder
   - Nome: `ideepx-frontend-v1.1`
   - Novo CID será gerado

4. **Atualize DNS (se usando custom domain):**
   - Atualize TXT record `_dnslink` com novo CID
   - Ou re-pin no Pinata Gateway

5. **Versionamento:**
   ```
   v1.0: QmABC123...
   v1.1: QmDEF456...
   v1.2: QmGHI789...
   ```

---

## ⚡ OTIMIZAÇÕES PARA IPFS

### 1. Reduzir Tamanho do Bundle

Edit `package.json`:
```json
{
  "scripts": {
    "build": "next build && npm run analyze",
    "analyze": "cross-env ANALYZE=true next build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0"
  }
}
```

### 2. Code Splitting Agressivo

Edit `next.config.js`:
```javascript
module.exports = {
  output: 'export',
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      },
    }
    return config
  },
}
```

### 3. Lazy Loading de Componentes

```typescript
import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <p>Loading...</p>,
  ssr: false  // Importante para IPFS
})
```

### 4. Service Worker para Cache

Create `public/sw.js`:
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ideepx-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        // Adicione assets principais
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

---

## 🛡️ SEGURANÇA NO IPFS

### 1. Proteger Variáveis Sensíveis

**NÃO incluir no build:**
- ❌ Private keys
- ❌ API secrets
- ❌ Database credentials

**OK incluir (são públicos no frontend):**
- ✅ Contract addresses
- ✅ RPC URLs públicos
- ✅ WalletConnect Project ID

### 2. Content Security Policy

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.binance.org https://bsc-dataseed1.binance.org wss://*.walletconnect.com;"
          },
        ],
      },
    ]
  },
}
```

### 3. Subresource Integrity (SRI)

Para CDN resources:
```html
<link
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
/>
```

---

## 📊 MONITORAMENTO

### 1. IPFS Pin Status

Verificar se ainda está pinned:
```bash
# Via Pinata API
curl -X GET "https://api.pinata.cloud/data/pinList" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY"
```

### 2. Gateway Uptime

Test múltiplos gateways:
```
https://gateway.pinata.cloud/ipfs/QmXxX
https://ipfs.io/ipfs/QmXxX
https://cloudflare-ipfs.com/ipfs/QmXxX
https://dweb.link/ipfs/QmXxX
```

### 3. Analytics

Use Web3 analytics:
- https://dune.com (on-chain analytics)
- https://plausible.io (privacy-friendly analytics)
- https://umami.is (self-hosted)

---

## 🚨 TROUBLESHOOTING

### Problema 1: "404 Not Found" no IPFS

**Causa:** Next.js routing não funciona em IPFS
**Solução:** Use `trailingSlash: true` no `next.config.js`

### Problema 2: Imagens não carregam

**Causa:** Image Optimization não funciona no IPFS
**Solução:** Use `images: { unoptimized: true }`

### Problema 3: WalletConnect não conecta

**Causa:** WebSocket bloqueado
**Solução:** Configure CSP corretamente

### Problema 4: Slow loading

**Causa:** Gateway congestionado
**Solução:** Use múltiplos gateways ou Pinata Dedicated Gateway

---

## ✅ CHECKLIST FINAL

### Pré-Deploy:
- [ ] Contratos deployados na BSC
- [ ] Endereços atualizados em `.env.local`
- [ ] WalletConnect Project ID configurado
- [ ] `next.config.js` configurado para export estático
- [ ] Fontes via CDN (não `next/font`)

### Build:
- [ ] `npm install` sem erros
- [ ] `npm run build` completo
- [ ] Pasta `out/` gerada
- [ ] `index.html` existe em `out/`

### Upload:
- [ ] Conta Pinata criada
- [ ] Upload da pasta `out/` completo
- [ ] CID obtido e salvo
- [ ] Site acessível via gateway

### Pós-Deploy:
- [ ] Testado em desktop
- [ ] Testado em mobile
- [ ] WalletConnect funcionando
- [ ] Transações na testnet OK
- [ ] Custom domain configurado (opcional)

---

## 📝 EXEMPLO DE FLUXO COMPLETO

```bash
# 1. Preparar frontend
cd C:\ideepx-bnb\frontend
code .env.local  # Configurar endereços

# 2. Build
npm install
npm run build

# 3. Verificar
dir out\

# 4. Upload no Pinata (via web)
# https://app.pinata.cloud → Upload → Folder → Selecionar out/

# 5. Obter CID
# Exemplo: QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx

# 6. Acessar
# https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx

# 7. (Opcional) Configurar ENS
# ideepx.eth → Content: ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

---

## 🔗 LINKS ÚTEIS

- **Pinata:** https://pinata.cloud
- **IPFS Docs:** https://docs.ipfs.tech
- **WalletConnect:** https://cloud.walletconnect.com
- **ENS Domains:** https://app.ens.domains
- **Next.js Static Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports

---

## 💡 DICAS PROFISSIONAIS

1. **Versionamento:** Mantenha histórico de CIDs
   ```
   v1.0.0: QmABC123...
   v1.0.1: QmDEF456...
   ```

2. **Backup:** Pin em múltiplos serviços
   - Pinata (principal)
   - web3.storage (backup)
   - Infura IPFS (backup)

3. **Performance:** Use Pinata Dedicated Gateway para produção

4. **SEO:** IPFS não é SEO-friendly. Use ENS + Gateway para indexação.

5. **Updates:** Comunique updates via Discord/Twitter com novo CID

---

**🎉 Seu dApp estará descentralizado e imparável no IPFS!**

**Criado:** 2025-11-02
**Versão:** 1.0
