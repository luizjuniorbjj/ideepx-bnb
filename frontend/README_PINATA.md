# 📌 iDeepX Frontend - Deploy Rápido no Pinata

**Guia Ultra-Simplificado para Hospedar no IPFS**

---

## ⚡ PASSO A PASSO RÁPIDO

### 1️⃣ **Configurar Endereços** (2 minutos)

Edite o arquivo `.env.local`:

```env
# Endereço do Core Contract (após deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...SEU_CORE_ADDRESS...

# USDT BSC Mainnet
NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# WalletConnect Project ID (https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...SEU_PROJECT_ID...
```

**Como obter WalletConnect Project ID:**
1. Acesse: https://cloud.walletconnect.com
2. Crie conta → New Project
3. Copie o Project ID

---

### 2️⃣ **Build** (3 minutos)

```bash
cd C:\ideepx-bnb\frontend

# Instalar dependências (primeira vez)
npm install

# Build para produção
npm run build
```

**Sucesso se ver:**
```
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Build completed successfully!
```

**Output gerado em:** `out/`

---

### 3️⃣ **Upload no Pinata** (5 minutos)

#### Opção A: Interface Web (Recomendado)

1. **Acesse:** https://app.pinata.cloud
2. **Login/Cadastro** (grátis)
3. **Upload:**
   - Clique em **"Upload"** → **"Folder"**
   - Selecione a pasta `C:\ideepx-bnb\frontend\out`
   - Nome: `ideepx-frontend-v1.0`
   - **Upload**
4. **Copie o CID:**
   - Exemplo: `QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx`
5. **Acesse seu dApp:**
   ```
   https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
   ```

#### Opção B: Arrastar e Soltar

1. **Abra:** https://app.pinata.cloud/pinmanager
2. **Arraste** a pasta `out/` para a janela
3. **Aguarde upload**
4. **Copie o CID**

---

### 4️⃣ **Testar** (2 minutos)

1. **Abra o link do Pinata:**
   ```
   https://gateway.pinata.cloud/ipfs/SEU_CID_AQUI
   ```

2. **Teste:**
   - ✅ Site carrega?
   - ✅ WalletConnect conecta?
   - ✅ Transação de teste funciona?

---

## 🔄 ATUALIZAR VERSÃO

Quando fizer mudanças no código:

```bash
# 1. Build novamente
npm run build

# 2. Upload nova pasta out/ no Pinata
# (repita passo 3)

# 3. Novo CID será gerado
# Exemplo: QmYyYyYyYyYyYyYyYyYyYyYyYyYyYy
```

**Versionamento:**
```
v1.0 → QmABC123...
v1.1 → QmDEF456...
v1.2 → QmGHI789...
```

---

## 🌐 CUSTOM DOMAIN (Opcional)

### Opção 1: ENS (.eth domain)

**Custo:** ~$5/ano

1. **Compre:** https://app.ens.domains
   - Exemplo: `ideepx.eth`
2. **Configure:**
   - ENS Manager → Records
   - **Content:** `ipfs://SEU_CID_AQUI`
3. **Acesse:**
   ```
   https://ideepx.eth.limo
   https://ideepx.eth.link
   ```

### Opção 2: Cloudflare IPFS (Grátis)

1. **DNS no Cloudflare:**
   ```
   Type: CNAME
   Name: app
   Value: cloudflare-ipfs.com
   ```

2. **TXT Record:**
   ```
   Type: TXT
   Name: _dnslink.app
   Value: dnslink=/ipfs/SEU_CID_AQUI
   ```

3. **Acesse:**
   ```
   https://app.seudominio.com
   ```

---

## 🛠️ COMANDOS ÚTEIS

```bash
# Desenvolvimento local
npm run dev

# Build para produção (IPFS)
npm run build

# Limpar build anterior
rm -rf out/ .next/

# Verificar tamanho do build
du -sh out/
```

---

## ❗ PROBLEMAS COMUNS

### 1. "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. "404 Not Found" no IPFS
- ✅ Certifique-se que `trailingSlash: true` está em `next.config.js`

### 3. Imagens não carregam
- ✅ Verifique `images: { unoptimized: true }` em `next.config.js`

### 4. WalletConnect não conecta
- ✅ Verifique se o Project ID está correto em `.env.local`

---

## 📋 CHECKLIST ANTES DO BUILD

- [ ] `.env.local` configurado com endereços corretos
- [ ] WalletConnect Project ID configurado
- [ ] `next.config.js` tem `output: 'export'`
- [ ] Testado localmente com `npm run dev`

---

## 🎯 LINKS IMPORTANTES

- **Pinata:** https://pinata.cloud (upload IPFS)
- **WalletConnect:** https://cloud.walletconnect.com (Project ID)
- **ENS:** https://app.ens.domains (domínio .eth)
- **IPFS Public Gateways:** https://ipfs.github.io/public-gateway-checker

---

## 📞 PRÓXIMOS PASSOS

Após deploy:

1. ✅ **Compartilhe o link:**
   ```
   https://gateway.pinata.cloud/ipfs/SEU_CID
   ```

2. ✅ **Documente versões:**
   - Anote cada CID
   - Use tags de versão

3. ✅ **Configure analytics** (opcional):
   - https://plausible.io
   - https://umami.is

4. ✅ **Backup:** Pin em outros serviços
   - web3.storage
   - Infura IPFS

---

**🎉 Pronto! Seu dApp está descentralizado no IPFS!**

---

**Criado:** 2025-11-02
**Versão:** 1.0
**Guia Completo:** `../PINATA_DEPLOYMENT_GUIDE.md`
