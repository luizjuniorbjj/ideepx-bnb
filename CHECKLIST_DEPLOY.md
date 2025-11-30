# ✅ CHECKLIST DE DEPLOY - iDeepX

**Use este checklist para garantir que tudo está pronto para o deploy!**

---

## 📦 FASE 1: PREPARAÇÃO

### Contratos
- [ ] Contratos compilam sem erros (`npx hardhat compile`)
- [ ] Tamanhos verificados (<24kb cada)
  - Core: 18.2kb ✅
  - MLM: 7.0kb ✅
  - Governance: 8.5kb ✅
- [ ] Arquivo `.env` configurado
  - PRIVATE_KEY
  - BSCSCAN_API_KEY
  - MULTISIG_ADDRESS
  - LIQUIDITY_POOL
  - INFRASTRUCTURE_WALLET
  - COMPANY_WALLET

### Frontend
- [ ] Arquivo `frontend/.env.local` criado
- [ ] WalletConnect Project ID obtido
  - Acesse: https://cloud.walletconnect.com
  - Copie Project ID
- [ ] `next.config.js` configurado para IPFS
  - `output: 'export'` ✅
  - `images: { unoptimized: true }` ✅
  - `trailingSlash: true` ✅

### Infraestrutura
- [ ] Multisig criado (Gnosis Safe)
  - Recomendado: 3/5 threshold
- [ ] Carteiras para pools definidas
  - Liquidity Pool
  - Infrastructure
  - Company
- [ ] Conta Pinata criada
  - https://pinata.cloud (grátis até 1GB)

---

## 🧪 FASE 2: TESTNET

### Deploy Contratos na BSC Testnet
- [ ] Deploy executado com sucesso
  ```bash
  npx hardhat run scripts/deploy_modular.js --network bscTestnet
  ```
- [ ] Endereços anotados:
  - Core: 0x____________________
  - MLM: 0x____________________
  - Governance: 0x____________________
- [ ] Contratos verificados no BscScan
  ```bash
  npx hardhat verify --network bscTestnet <ADDRESS> <ARGS>
  ```
- [ ] Modules conectados (Core.setModules) ✅

### Testes Funcionais
- [ ] Registro de usuário funciona
- [ ] Ativação de assinatura funciona
  - Com USDT
  - Com balance interno
  - Modo mixed
- [ ] Distribuição MLM funciona (10 níveis)
- [ ] Saques funcionam
- [ ] Circuit breaker funciona
- [ ] Solvency ratio calculado corretamente

### Testes de Segurança
- [ ] Circular referrals bloqueados
- [ ] Double spending bloqueado
- [ ] Sybil attack mitigado (cooldowns)
- [ ] Withdrawal limits aplicados
- [ ] Circuit breaker ativa em baixa solvência
- [ ] Timelock funciona (24h)

### Período de Testes
- [ ] **7+ dias de testes na testnet**
- [ ] Zero bugs críticos encontrados
- [ ] Performance OK
- [ ] Gas costs aceitáveis

---

## 🏗️ FASE 3: FRONTEND TESTNET

### Build & Deploy
- [ ] `.env.local` atualizado com Core address da testnet
- [ ] Build executado com sucesso
  ```bash
  cd frontend
  npm run build:pinata
  ```
- [ ] Pasta `out/` gerada
- [ ] Upload no Pinata completo
- [ ] CID anotado: ipfs://Qm____________________
- [ ] Site acessível via gateway
  ```
  https://gateway.pinata.cloud/ipfs/Qm...
  ```

### Testes Frontend
- [ ] Site carrega corretamente
- [ ] WalletConnect conecta
- [ ] Consegue se registrar
- [ ] Consegue ativar assinatura
- [ ] Consegue sacar
- [ ] Funciona em desktop
- [ ] Funciona em mobile
- [ ] Sem erros no console

---

## 🚀 FASE 4: MAINNET

### Deploy Contratos na BSC Mainnet
- [ ] **ATENÇÃO:** Revisão final antes de deploy!
- [ ] BNB suficiente para gas (~0.05 BNB)
- [ ] Deploy executado
  ```bash
  npx hardhat run scripts/deploy_modular.js --network bscMainnet
  ```
- [ ] Endereços anotados:
  - Core: 0x____________________
  - MLM: 0x____________________
  - Governance: 0x____________________
- [ ] Contratos verificados no BscScan
- [ ] Modules conectados

### Frontend Produção
- [ ] `.env.local` atualizado com Core address da mainnet
- [ ] Build final
  ```bash
  npm run build:pinata
  ```
- [ ] Upload no Pinata
- [ ] CID PRODUÇÃO anotado: ipfs://Qm____________________
- [ ] Site testado completamente

---

## 🌐 FASE 5: DOMAIN & INFRA (Opcional)

### Custom Domain
- [ ] Opção escolhida:
  - [ ] ENS Domain (.eth) - $5/ano
  - [ ] Cloudflare + DNS - Grátis
  - [ ] Pinata Gateway - $20/mês
- [ ] Domain configurado
- [ ] Site acessível via domain
  - https://app.ideepx.com OU
  - https://ideepx.eth.limo

### Monitoramento
- [ ] Analytics configurado
  - [ ] Plausible / Umami
- [ ] Alertas configurados
  - [ ] Solvency ratio
  - [ ] Circuit breaker
- [ ] Backup de CIDs documentado

---

## 📢 FASE 6: LAUNCH

### Comunicação
- [ ] Announcement preparado
- [ ] Endereços documentados
- [ ] Tutorial de uso criado
- [ ] FAQ preparado
- [ ] Canais de suporte definidos
  - Discord / Telegram

### Marketing
- [ ] Website live
- [ ] Social media posts
- [ ] Community notified
- [ ] Docs publicados

### Suporte
- [ ] Equipe de suporte pronta
- [ ] Incident response plan
- [ ] Backup plan

---

## 🔍 VERIFICAÇÃO FINAL

Antes de lançar, confirme:

- [ ] ✅ Todos os contratos verificados no BscScan
- [ ] ✅ Frontend funcionando 100%
- [ ] ✅ WalletConnect conecta
- [ ] ✅ Transações funcionam
- [ ] ✅ Circuit breaker OK
- [ ] ✅ Solvency ratio > 100%
- [ ] ✅ Beta mode ativo (100 users, $100k cap)
- [ ] ✅ Multisig configurado
- [ ] ✅ Endereços documentados
- [ ] ✅ Backups criados
- [ ] ✅ Equipe pronta
- [ ] ✅ Plano de emergência definido

---

## 📋 ENDEREÇOS FINAIS (Anotar Aqui)

### BSC Testnet
```
Core:          0x_________________________________
MLM:           0x_________________________________
Governance:    0x_________________________________
Multisig:      0x_________________________________
```

### BSC Mainnet
```
Core:          0x_________________________________
MLM:           0x_________________________________
Governance:    0x_________________________________
Multisig:      0x_________________________________
```

### Frontend
```
Testnet CID:   ipfs://Qm_________________________
Mainnet CID:   ipfs://Qm_________________________
Domain:        https://_________________________
```

---

## 🎉 LAUNCH!

Quando todos os checkboxes estiverem marcados:

```bash
# 1. Deploy mainnet
npx hardhat run scripts/deploy_modular.js --network bscMainnet

# 2. Build frontend
cd frontend
npm run build:pinata

# 3. Upload Pinata

# 4. Anunciar!
```

**🚀 Boa sorte com o launch!**

---

**Data de criação:** 2025-11-02
**Versão:** 1.0
**Status:** Ready for deployment

✅ = Item concluído
⚠️ = Requer atenção
❌ = Bloqueador
