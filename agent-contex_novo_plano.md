# iDeepX — Agent Context (Mainnet, Web3 + Backend)

## 📌 Objetivo
Gerar, integrar e validar um dApp Web3 **alinhado ao plano de negócios atual**, sem alterar regras do modelo.  
Arquitetura híbrida:
- **On-chain (Solidity)**: estados públicos, métricas, limites, saques, solvência, licenças, crédito de performance.
- **Off-chain (Backend)**: credenciais GMI, validações, cálculo de comissões/ranks e orquestração.

---

## 🧱 Componentes e Repositório

C:\ideepx-bnb
├─ contracts
│ └─ iDeepXCoreV10.sol # contrato principal (este repositório)
├─ backend
│ ├─ src\ # API, jobs, serviços
│ ├─ prisma\ # schema DB (ou migrations SQL)
│ └─ .env.example
├─ frontend
│ ├─ app\ # Next.js (rotas, páginas)
│ ├─ lib\ # wagmi/viem/ethers helpers
│ └─ .env.example
├─ docs
│ ├─ contracts.md
│ ├─ backend.md
│ ├─ security.md
│ ├─ api.md
│ └─ openapi.yaml
├─ hardhat.config.ts
├─ package.json
└─ agent-context.md # ESTE ARQUIVO

markdown
Copiar código

> **Importante:** dados sensíveis **não** vão para o contrato. GMI fica no backend.

---

## 🔗 Contrato (on-chain)

**Arquivo:** `contracts/iDeepXCoreV10.sol`  
**Principais features:**
- RBAC (AccessControl): `DEFAULT_ADMIN_ROLE`, `UPDATER_ROLE`, `DISTRIBUTOR_ROLE`, `TREASURY_ROLE`
- Pausable + ReentrancyGuard
- EIP-712 (opcional) para aplicar múltiplas atualizações em 1 tx (`applyAttestation`)
- Licença: `$19` / `30d` (USDT 6 decimais)
- Crédito de performance em lote: `creditPerformance(address[], uint256[])`
- Transferência interna de saldo, saques com limites e **circuit breaker por solvência**
- Views: `userView(address)`, `getSolvencyRatio()`

**Variáveis padrão (podem ser ajustadas por governo):**
- `subscriptionFee = 19e6`, `subscriptionDuration = 30 days`
- `minWithdrawal = 50e6`, `maxWithdrawalPerTx = 10_000e6`, `maxWithdrawalPerMonth = 30_000e6`
- `minSolvencyBps = 11000` (110%)

**Eventos (auditoria):**
- `UserLinked`, `UserActivityUpdated`, `UserVolumeUpdated`, `UserLevelsUnlocked`, `UserKYCUpdated`
- `SubscriptionActivated`, `PerformanceCredited`, `InternalTransfer`, `WithdrawExecuted`
- `LimitsUpdated`, `SolvencyTargetUpdated`, `BreakerStateChanged`

---

## 🖥️ Backend (off-chain)

**Funções:**
- Autenticação **SIWE** (wallet → JWT)
- Link GMI com **accountHash** (sem expor senhas)
- Sync de métricas: `active`, `monthlyVolume`, `kycStatus`, `maxLevel`
- Aplicação via chamadas diretas **ou** atestado **EIP-712** (1 tx)
- Orquestração de **crédito de performance** (tesouraria → contrato → usuários)
- Webhook PnL mensal

**Endpoints principais (ver `/docs/api.md` + `openapi.yaml`):**
- `POST /auth/siwe/start`, `POST /auth/siwe/verify`
- `POST /link` (JWT)
- `POST /sync/metrics` (HMAC)
- `POST /eligibility/apply` (HMAC)
- `POST /webhook/gmi/pnl` (HMAC/mTLS)

**DB mínimo:**
- `wallets`, `gmi_accounts` (hash + payload criptografado), `user_metrics`, `sync_logs`

---

## 🌐 Frontend (Next.js + Wagmi/Viem/Ethers)

**Rotas sugeridas:**
- `/` landing + conectar carteira
- `/register` (link GMI: chama **backend** `/link`)
- `/dashboard` (chama `userView`, mostra `solvency`, limites, histórico)
- `/withdraw` (on-chain, obedecendo limites e breaker)
- `/admin` (somente carteiras whitelist: parâmetros e saúde do sistema)

**.env (frontend)**
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_CONTRACT=0xSEU_CONTRATO_MAINNET
NEXT_PUBLIC_WC_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_WALLETS=0xAdmin1,0xAdmin2

markdown
Copiar código

---

## 🔐 Segurança

- **On-chain**: controle por **roles** + **timelock/multisig**
- **Off-chain**:
  - Usuário: JWT (SIWE)
  - Serviço: HMAC + allowlist de IP; mTLS opcional
  - Credenciais GMI: **Vault/KMS**, nunca em logs
- **Assinaturas**: EIP-712 para atestados; anti-replay por `nonce`

---

## 🧪 Testes

**Contrato**
- `creditPerformance` credita e atualiza `totalUserBalances`
- `withdraw` respeita `min`, `maxPerTx`, `maxPerMonth`
- `breaker` bloqueia saque quando `solvency < minSolvencyBps`
- `applyAttestation` aplica múltiplos campos (nonce/expiração ok)
- `transferBalance` mantém passivo constante

**Backend**
- `/link` gera `accountHash` e chama `confirmLink`
- `/sync/metrics` atualiza campos e confirma `tx`
- `/webhook/gmi/pnl` processa lotes ≤ 500
- HMAC rejeita assinatura inválida; rate-limit ativo

**Frontend**
- Lê `userView`, `getSolvencyRatio`
- Mostra razão de solvência e breaker
- Saque (`withdraw`) com hash (link BscScan)
- `/admin` protegido por whitelist

---

## ⚙️ Setup e Build

**Contrato**
```bash
npm i
npx hardhat compile
Backend

bash
Copiar código
cd backend
cp .env.example .env
npm i
npm run dev
Frontend

bash
Copiar código
cd frontend
cp .env.example .env.local
npm i
npm run dev
🧭 Fluxo Operacional
Deploy contrato (USDT + admin multisig)

grantRole → UPDATER, DISTRIBUTOR, TREASURY

Usuário conecta wallet (SIWE → JWT)

/link gera accountHash → confirmLink

/sync/metrics e /eligibility/apply → níveis e status

Webhook PnL → creditPerformance em lote

Saque (withdraw) dentro dos limites e solvência ≥ 110%

✅ Regras de Produto
Licença: $19 / 30 dias

Performance split: 65% cliente / 35% sistema

Comissões: 25% unilevel [8,3,2,1,1,2,2,2,2,2]

Desbloqueio níveis 6–10: 5 diretos + $5.000 volume

Saques com breaker ≥ 110%

Dados GMI off-chain

🧩 Prompts (Agente VS Code)
1️⃣ Deploy

Gere scripts Hardhat para deploy (USDT + ADMIN).
Após o deploy, conceda roles e grave endereços em .env.

2️⃣ Backend

Crie API (Nest/Express) com endpoints descritos, HMAC, SIWE, integração ethers/viem.

3️⃣ Frontend

Crie app Next.js, rotas /, /dashboard, /withdraw, /admin, integrando WalletConnect.

4️⃣ Testes

Teste roles, limits, breaker, creditPerformance, attestation, integração API.

🧰 Variáveis de Ambiente
Backend .env

ini
Copiar código
RPC_URL=https://bsc-dataseed.binance.org
CONTRACT_ADDRESS=0xSEU_CONTRATO_MAINNET
UPDATER_PRIVATE_KEY=0x...
DISTRIBUTOR_PRIVATE_KEY=0x...
JWT_SECRET=...
HMAC_SECRET=...
DB_URL=postgres://...
Frontend .env.local

ini
Copiar código
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_CONTRACT=0xSEU_CONTRATO_MAINNET
NEXT_PUBLIC_WC_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_WALLETS=0xAdmin1,0xAdmin2
📦 Entregáveis
contracts/iDeepXCoreV10.sol

Scripts de deploy (Hardhat)

Backend API (OpenAPI importável)

Frontend Next.js integrado

Testes mínimos (contrato + API)

docs/ com contracts.md, backend.md, security.md, api.md, openapi.yaml

❗ Regras Rápidas
Do

Multisig + timelock

Limites e breaker no UI

Registrar TX hash de cada write

Don’t

Jamais expor dados GMI

Jamais logar credenciais

Jamais liberar saque < 110% solvência