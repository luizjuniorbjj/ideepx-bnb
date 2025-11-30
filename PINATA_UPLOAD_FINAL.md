# 🚀 UPLOAD FINAL NO PINATA IPFS - iDeepX Frontend

## ✅ STATUS

**Build Frontend:** ✅ CONCLUÍDO
**Pasta Out Gerada:** ✅ SIM (6.6 MB)
**Pronto para Upload:** ✅ SIM

---

## 📦 O QUE FAZER AGORA

### 1️⃣ Acessar Pinata

**URL:** https://app.pinata.cloud

**Login:** Use sua conta Pinata (se não tem, criar é grátis)

---

### 2️⃣ Upload da Pasta OUT

#### Opção A: Upload via Interface Web (Recomendado)

1. Clique em **"Upload"** (botão roxo no topo direito)
2. Selecione **"Folder"**
3. No Windows Explorer que abrir:
   - Navegue até: `C:\ideepx-bnb\frontend\out`
   - **Selecione a pasta `out` inteira**
   - Clique em **"Selecionar Pasta"** ou **"Upload"**

4. Configurações do Upload:
   - **Name:** `ideepx-frontend-v1`
   - **Description:** `iDeepX MLM Distribution Platform - Production Build`
   - Deixe o resto como padrão

5. Clique em **"Upload"**

6. Aguarde (2-5 minutos para 6.6 MB)

#### Opção B: Upload via CLI (Alternativo)

```bash
# Instalar Pinata CLI
npm install -g pinata-upload-cli

# Fazer login
pinata login

# Upload
pinata upload C:\ideepx-bnb\frontend\out --name="ideepx-frontend-v1"
```

---

### 3️⃣ Copiar o CID

Quando o upload terminar, você verá:

```
✅ Upload Successful!

CID: QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx

Gateway URL: https://gateway.pinata.cloud/ipfs/QmXxXxXx...
```

**COPIE O CID E A URL DO GATEWAY!**

---

### 4️⃣ Testar o dApp

Acesse o link do gateway fornecido. Você deve ver:

✅ **Landing Page do iDeepX**
- Logo iDeepX
- Botão "Conectar Carteira"
- Design dark com gradientes
- Menu de navegação

✅ **Funcionalidades que devem funcionar:**
1. Conectar MetaMask (BSC Mainnet)
2. Navegar para /dashboard
3. Navegar para /register
4. Navegar para /network
5. Navegar para /withdraw
6. Navegar para /admin (se for owner)

---

## 🌐 COMO ACESSAR

### URLs disponíveis após upload:

**Gateway Pinata (Mais rápido):**
```
https://gateway.pinata.cloud/ipfs/SEU_CID
```

**IPFS Público (Descentralizado):**
```
https://SEU_CID.ipfs.dweb.link
```

**IPFS.io:**
```
https://ipfs.io/ipfs/SEU_CID
```

**Cloudflare IPFS:**
```
https://cloudflare-ipfs.com/ipfs/SEU_CID
```

---

## 📋 ESTRUTURA DA PASTA OUT

```
frontend/out/
├── index.html              # Landing page
├── 404.html                # Página de erro 404
├── favicon.png             # Ícone do site
├── index.txt               # Metadata
│
├── _next/                  # Assets do Next.js
│   ├── static/
│   │   ├── chunks/         # JavaScript chunks
│   │   └── css/            # Estilos compilados
│   └── ...
│
├── admin/                  # Página admin
│   └── index.html
│
├── dashboard/              # Página dashboard
│   └── index.html
│
├── network/                # Página network
│   └── index.html
│
├── register/               # Página register
│   └── index.html
│
├── withdraw/               # Página withdraw
│   └── index.html
│
├── 404/                    # Página 404
│   └── index.html
│
└── images/                 # Imagens do site
```

**Total:** 6.6 MB

---

## ✅ CHECKLIST PÓS-UPLOAD

Depois do upload, faça este checklist:

### Funcionalidades Básicas:
- [ ] Site carrega sem erros
- [ ] Botão "Conectar Carteira" abre MetaMask
- [ ] MetaMask conecta na BSC Mainnet
- [ ] Navegação entre páginas funciona
- [ ] Todas as imagens carregam

### Funcionalidades Cliente:
- [ ] Pode registrar com sponsor
- [ ] Pode assinar ($29 USDT)
- [ ] Pode renovar assinatura
- [ ] Pode ver saldo e ganhos
- [ ] Pode sacar (total ou parcial)
- [ ] Pode ver histórico de ganhos
- [ ] Pode ver upline (10 níveis)
- [ ] Pode ver stats da rede
- [ ] Link de indicação funciona

### Funcionalidades Admin (se for owner):
- [ ] Acessa painel admin
- [ ] Pode fazer batch processing
- [ ] Pode pausar/despausar usuários
- [ ] Pode pausar/despausar sistema
- [ ] Pode alternar Beta ↔ Permanente
- [ ] Pode atualizar carteiras dos pools
- [ ] Vê estatísticas do sistema

---

## 🆘 TROUBLESHOOTING

### Problema: "404 Not Found"
**Causa:** Pasta errada ou estrutura incorreta
**Solução:**
- Certifique-se de fazer upload da pasta `out/` completa
- Verifique se `index.html` está na raiz

### Problema: "Página em branco"
**Causa:** JavaScript não carregou
**Solução:**
- Verifique se a pasta `_next/` foi enviada
- Abra o console do browser (F12) e veja os erros

### Problema: "Imagens quebradas"
**Causa:** Caminhos incorretos
**Solução:**
- Já configurado no `next.config.js` com `images: { unoptimized: true }`
- Se persistir, verifique se a pasta `images/` foi enviada

### Problema: "MetaMask não conecta"
**Causa:** Configuração de rede
**Solução:**
- Certifique-se de estar na **BSC Mainnet** (Chain ID 56)
- Adicione BSC Mainnet no MetaMask se necessário:
  - **Network Name:** BNB Smart Chain
  - **RPC URL:** https://bsc-dataseed1.binance.org
  - **Chain ID:** 56
  - **Symbol:** BNB
  - **Block Explorer:** https://bscscan.com

### Problema: "Erro ao chamar contrato"
**Causa:** Endereço do contrato errado ou ABI incorreto
**Solução:**
- Contrato: `0xA64bD448aEECed62d02F0deb8305ecd30f79fb54`
- Rede: BSC Mainnet (ChainID 56)
- Já configurado em `frontend/config/contracts.ts`

---

## 🎯 PRÓXIMOS PASSOS APÓS UPLOAD

1. **Guardar o CID:**
   - Salve o CID em lugar seguro
   - Você pode atualizar o site fazendo novo upload e usando o novo CID

2. **Compartilhar o Link:**
   - Envie o link do gateway para seus usuários
   - Você pode usar um domínio personalizado (ex: ideepx.com → CID)

3. **Configurar Domínio Personalizado (Opcional):**
   - Opção 1: DNS TXT record no Cloudflare
   - Opção 2: CNAME para Pinata gateway
   - Opção 3: ENS domain (Ethereum Name Service)

4. **Monitorar Pins:**
   - Verifique periodicamente se seus pins estão ativos no Pinata
   - Pinata gratuito tem limite de storage (1 GB)
   - Upgrade para plano pago se necessário

5. **Atualizações Futuras:**
   - Quando fizer mudanças no código:
     1. `npm run build` no frontend
     2. Upload da nova pasta `out/`
     3. Pega o novo CID
     4. Atualiza o link que você compartilha

---

## 💰 CUSTOS

### Pinata (IPFS Hosting):

**Plano Gratuito:**
- ✅ 1 GB de storage
- ✅ Unlimited bandwidth
- ✅ Suficiente para este projeto (6.6 MB)

**Planos Pagos:**
- Starter: $20/mês (100 GB)
- Pro: $50/mês (1 TB)
- Business: Custom

Para este projeto, **plano gratuito é suficiente!**

### Gas Fees (Interação com Contrato):

- Registro: ~$0.10 - $0.50 (BSC gas)
- Assinatura: ~$0.10 - $0.50
- Saque: ~$0.10 - $0.50

**Muito mais barato que Ethereum!**

---

## 📊 MÉTRICAS DO DEPLOY

**Tempo de Build:** ~30 segundos
**Tamanho do Build:** 6.6 MB
**Páginas Geradas:** 9 páginas estáticas
**Tempo de Upload Estimado:** 2-5 minutos
**Disponibilidade:** 99.9% (IPFS é descentralizado)

---

## 🎉 CONCLUSÃO

Você está pronto para fazer o deploy final do iDeepX no IPFS via Pinata!

**Passos Resumidos:**
1. ✅ Build concluído → `frontend/out` (6.6 MB)
2. ⏳ Upload no Pinata → Copiar CID
3. ✅ Testar no gateway
4. ✅ Compartilhar link com usuários

**Seu dApp estará:**
- 🌐 Descentralizado (IPFS)
- 🔒 Seguro (imutável)
- ⚡ Rápido (via gateways)
- 💰 Gratuito (plano free do Pinata)

---

**Boa sorte com o deploy! 🚀🎉**

Se tiver problemas, verifique:
- Logs do build
- Console do browser (F12)
- Documentação do Pinata: https://docs.pinata.cloud
