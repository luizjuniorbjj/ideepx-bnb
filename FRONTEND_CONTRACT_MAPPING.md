# 🔗 MAPEAMENTO COMPLETO: CONTRATO ↔ FRONTEND

**Data:** 2025-11-03
**Contrato:** iDeepXDistributionV2.sol (0xA64bD448aEECed62d02F0deb8305ecd30f79fb54)
**Objetivo:** Espelhar 100% das funções do contrato no frontend

---

## 📋 FUNÇÕES DO CONTRATO

### ✅ FUNÇÕES WRITE (15 funções)

#### **Funções do Cliente (7)**

| # | Função no Contrato | Parâmetros | Descrição | Hook Frontend | Status |
|---|-------------------|-----------|-----------|---------------|--------|
| 1 | `selfRegister(address sponsor)` | sponsor | Cliente se registra | `useSelfRegister()` | ⚠️ Criar |
| 2 | `selfSubscribe()` | - | Pagar $29 USDT | `useSelfSubscribe()` | ⚠️ Criar |
| 3 | `registerAndSubscribe(address sponsor)` | sponsor | Registro + assinatura | `useRegisterAndSubscribe()` | ❌ Falta |
| 4 | `renewSubscription()` | - | Renovar assinatura | `useRenewSubscription()` | ❌ Falta |
| 5 | `withdrawEarnings()` | - | Sacar tudo | `useWithdrawEarnings()` | ⚠️ Corrigir |
| 6 | `withdrawPartial(uint256 amount)` | amount | Sacar parcial | `useWithdrawPartial()` | ❌ Falta |
| 7 | `expireSubscriptions(address[])` | addresses | Expirar assinaturas | `useExpireSubscriptions()` | ❌ Falta |

#### **Funções Admin (8)**

| # | Função no Contrato | Parâmetros | Descrição | Hook Frontend | Status |
|---|-------------------|-----------|-----------|---------------|--------|
| 8 | `batchProcessPerformanceFees(address[], uint256[])` | clients, amounts | Distribuir comissões | `useBatchProcessFees()` | ❌ Falta |
| 9 | `toggleBetaMode()` | - | Beta ↔ Permanente | `useToggleBetaMode()` | ❌ Falta |
| 10 | `updateWallets(address, address, address)` | liquidity, infra, company | Atualizar carteiras | `useUpdateWallets()` | ❌ Falta |
| 11 | `pause()` | - | Pausar sistema | `usePause()` | ❌ Falta |
| 12 | `unpause()` | - | Despausar sistema | `useUnpause()` | ❌ Falta |
| 13 | `deactivateSubscription(address user)` | user | Desativar usuário | `useDeactivateSubscription()` | ❌ Falta |
| 14 | `pauseUser(address user)` | user | Pausar usuário | `usePauseUser()` | ❌ Falta |
| 15 | `unpauseUser(address user)` | user | Despausar usuário | `useUnpauseUser()` | ❌ Falta |

#### **Funções de Aprovação (USDT)**

| # | Função | Parâmetros | Descrição | Hook Frontend | Status |
|---|--------|-----------|-----------|---------------|--------|
| 16 | `approve(address, uint256)` | spender, amount | Aprovar USDT | `useApproveUSDT()` | ✅ Existe |

---

### 👁️ FUNÇÕES READ (22 funções)

#### **Dados do Usuário (10)**

| # | Função no Contrato | Retorno | Descrição | Hook Frontend | Status |
|---|-------------------|---------|-----------|---------------|--------|
| 1 | `users(address)` | User struct | Dados básicos | `useUserData()` | ✅ Existe |
| 2 | `getUserInfo(address)` | User completo | Info completa | `useGetUserInfo()` | ❌ Falta |
| 3 | `getQuickStats(address)` | Quick stats | Stats rápidas | `useGetQuickStats()` | ❌ Falta |
| 4 | `getNetworkStats(address)` | Network stats | Stats de rede | `useGetNetworkStats()` | ❌ Falta |
| 5 | `getEarningHistory(address, uint256)` | Earning[] | Histórico ganhos | `useGetEarningHistory()` | ❌ Falta |
| 6 | `getUpline(address)` | address[10] | Upline 10 níveis | `useGetUpline()` | ❌ Falta |
| 7 | `isSubscriptionActive(address)` | bool | Assinatura ativa? | `useIsSubscriptionActive()` | ❌ Falta |
| 8 | `userPaused(address)` | bool | Usuário pausado? | `useIsUserPaused()` | ❌ Falta |
| 9 | `clientPerformances(address)` | ClientPerformance | Performance cliente | `useClientPerformance()` | ❌ Falta |
| 10 | `earningHistory(address, uint256)` | Earning | Ganho específico | - | ❌ Interno |

#### **Sistema Geral (6)**

| # | Função no Contrato | Retorno | Descrição | Hook Frontend | Status |
|---|-------------------|---------|-----------|---------------|--------|
| 11 | `getSystemStats()` | System stats | Estatísticas globais | `useSystemStats()` | ✅ Existe |
| 12 | `totalUsers()` | uint256 | Total usuários | - | ⚠️ Via getSystemStats |
| 13 | `totalActiveSubscriptions()` | uint256 | Assinaturas ativas | - | ⚠️ Via getSystemStats |
| 14 | `totalMLMDistributed()` | uint256 | MLM distribuído | - | ⚠️ Via getSystemStats |
| 15 | `totalWithdrawn()` | uint256 | Total sacado | `useTotalWithdrawn()` | ❌ Falta |
| 16 | `paused()` | bool | Sistema pausado? | `useIsPaused()` | ❌ Falta |

#### **MLM e Cálculos (6)**

| # | Função no Contrato | Retorno | Descrição | Hook Frontend | Status |
|---|-------------------|---------|-----------|---------------|--------|
| 17 | `calculateMLMDistribution(uint256)` | Cálculos | Simular distribuição | `useCalculateMLM()` | ❌ Falta |
| 18 | `getActiveMLMPercentages()` | uint256[10] | Percentuais ativos | `useActiveMLMPercentages()` | ❌ Falta |
| 19 | `betaMode()` | bool | Modo beta ativo? | `useIsBetaMode()` | ❌ Falta |
| 20 | `mlmPercentagesBeta(uint256)` | uint256 | % Beta nível X | - | ⚠️ Via getActiveMLM |
| 21 | `mlmPercentagesPermanent(uint256)` | uint256 | % Permanente nível X | - | ⚠️ Via getActiveMLM |
| 22 | `MLM_LEVELS()` | uint256 | Número de níveis | - | ⚠️ Constante (10) |

#### **Configurações e Constantes (Extras)**

| # | Item | Valor/Tipo | Descrição | Frontend | Status |
|---|------|-----------|-----------|----------|--------|
| 23 | `USDT()` | address | Token USDT | ✅ Hardcoded | ✅ OK |
| 24 | `SUBSCRIPTION_FEE()` | uint256 | $29 USDT | ✅ Hardcoded | ✅ OK |
| 25 | `SUBSCRIPTION_DURATION()` | uint256 | 30 dias | ✅ Hardcoded | ✅ OK |
| 26 | `MIN_WITHDRAWAL()` | uint256 | $10 USDT | ❌ Falta | ❌ Falta |
| 27 | `DIRECT_BONUS()` | uint256 | $5 USDT | ❌ Falta | ❌ Falta |
| 28 | `MAX_BATCH_SIZE()` | uint256 | 50 | ❌ Falta | ❌ Falta |
| 29 | `owner()` | address | Owner/Admin | `useOwner()` | ❌ Falta |
| 30 | `liquidityPool()` | address | Pool liquidez | `useLiquidityPool()` | ❌ Falta |
| 31 | `infrastructureWallet()` | address | Wallet infra | `useInfrastructureWallet()` | ❌ Falta |
| 32 | `companyWallet()` | address | Wallet empresa | `useCompanyWallet()` | ❌ Falta |

---

## 📊 RESUMO DO GAP

### ✅ O QUE JÁ EXISTE NO FRONTEND:
- `useUserData()` ✅
- `useSystemStats()` ✅
- `useApproveUSDT()` ✅
- `useUSDTBalance()` ✅
- `useUSDTAllowance()` ✅

### ❌ O QUE PRECISA SER CRIADO/CORRIGIDO:

**Hooks Write (12 novos):**
1. `useSelfRegister()` - Corrigir nome
2. `useSelfSubscribe()` - Corrigir nome
3. `useRegisterAndSubscribe()` - Criar
4. `useRenewSubscription()` - Criar
5. `useWithdrawPartial()` - Criar
6. `useBatchProcessFees()` - Criar
7. `useToggleBetaMode()` - Criar
8. `useUpdateWallets()` - Criar
9. `usePause()` - Criar
10. `useUnpause()` - Criar
11. `useDeactivateSubscription()` - Criar
12. `usePauseUser()` - Criar
13. `useUnpauseUser()` - Criar
14. `useExpireSubscriptions()` - Criar

**Hooks Read (17 novos):**
1. `useGetUserInfo()` - Criar
2. `useGetQuickStats()` - Criar
3. `useGetNetworkStats()` - Criar
4. `useGetEarningHistory()` - Criar
5. `useGetUpline()` - Criar
6. `useIsSubscriptionActive()` - Criar
7. `useIsUserPaused()` - Criar
8. `useClientPerformance()` - Criar
9. `useTotalWithdrawn()` - Criar
10. `useIsPaused()` - Criar
11. `useCalculateMLM()` - Criar
12. `useActiveMLMPercentages()` - Criar
13. `useIsBetaMode()` - Criar
14. `useOwner()` - Criar
15. `useLiquidityPool()` - Criar
16. `useInfrastructureWallet()` - Criar
17. `useCompanyWallet()` - Criar

**Total: 31 hooks novos/corrigidos**

---

## ❌ HOOKS QUE DEVEM SER REMOVIDOS (Funções inexistentes):

1. ~~`useRegisterWithSponsor()`~~ → Usar `useSelfRegister()`
2. ~~`useActivateSubscription()`~~ → Usar `useSelfSubscribe()`
3. ~~`useActivateWithBalance()`~~ → NÃO EXISTE NO CONTRATO
4. ~~`useActivateMixed()`~~ → NÃO EXISTE NO CONTRATO
5. ~~`useTransferBalance()`~~ → NÃO EXISTE NO CONTRATO
6. ~~`useGetReferrals()`~~ → NÃO EXISTE NO CONTRATO
7. ~~`useSecurityStatus()`~~ → NÃO EXISTE NO CONTRATO
8. ~~`useSolvencyRatio()`~~ → NÃO EXISTE NO CONTRATO
9. ~~Todos os hooks de governance~~ → NÃO EXISTEM NO CONTRATO

---

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### **FASE 1: Hooks Essenciais (Cliente)**
1. ✅ Corrigir `useSelfRegister()`
2. ✅ Corrigir `useSelfSubscribe()`
3. ✅ Criar `useRegisterAndSubscribe()`
4. ✅ Criar `useRenewSubscription()`
5. ✅ Corrigir `useWithdrawEarnings()`
6. ✅ Criar `useWithdrawPartial()`

### **FASE 2: Hooks de Visualização (Cliente)**
7. ✅ Criar `useGetUserInfo()`
8. ✅ Criar `useGetQuickStats()`
9. ✅ Criar `useGetEarningHistory()`
10. ✅ Criar `useGetUpline()`
11. ✅ Criar `useIsSubscriptionActive()`

### **FASE 3: Hooks Admin**
12. ✅ Criar `useBatchProcessFees()`
13. ✅ Criar `useToggleBetaMode()`
14. ✅ Criar `usePause()` / `useUnpause()`
15. ✅ Criar `usePauseUser()` / `useUnpauseUser()`
16. ✅ Criar `useDeactivateSubscription()`
17. ✅ Criar `useUpdateWallets()`

### **FASE 4: Hooks de Sistema**
18. ✅ Criar `useIsPaused()`
19. ✅ Criar `useIsBetaMode()`
20. ✅ Criar `useOwner()`
21. ✅ Criar `useCalculateMLM()`
22. ✅ Criar `useActiveMLMPercentages()`

---

## 🗂️ ARQUIVOS A MODIFICAR

### **Hooks:**
- ✅ `frontend/hooks/useContract.ts` - Reescrever completamente
- ❌ `frontend/hooks/useGovernance.ts` - DELETAR (funções inexistentes)
- ❌ `frontend/hooks/useAdminCore.ts` - DELETAR e recriar com funções corretas

### **Páginas:**
- ✅ `frontend/app/dashboard/page.tsx` - Atualizar com todas as funções
- ✅ `frontend/app/admin/page.tsx` - RECRIAR do zero
- ✅ `frontend/app/register/page.tsx` - Corrigir função
- ✅ `frontend/app/withdraw/page.tsx` - Adicionar parcial

### **Componentes a Criar:**
- ✅ `frontend/components/EarningHistory.tsx` - Histórico de ganhos
- ✅ `frontend/components/UplineTree.tsx` - Árvore de upline (10 níveis)
- ✅ `frontend/components/MLMCalculator.tsx` - Calculadora MLM
- ✅ `frontend/components/admin/BatchProcessor.tsx` - Processar performance fees
- ✅ `frontend/components/admin/UserManagement.tsx` - Gerenciar usuários

### **Configurações:**
- ✅ `frontend/config/contracts.ts` - Adicionar constantes faltantes
- ✅ Atualizar ABI completo

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Sistema de Permissões:
- O contrato usa apenas `onlyOwner` (Ownable do OpenZeppelin)
- NÃO há sistema de delegates/múltiplos admins no contrato
- Frontend deve verificar: `address === owner()`
- Para adicionar admins, seria necessário modificar o contrato

### ⚠️ Funções que o Frontend Atual Usa mas NÃO Existem:
- Todo o sistema de governance (emergency reserves, timelock, proposals)
- Circuit breakers automáticos
- Solvency ratio
- Multi-sig com delegates
- Transferências de saldo interno
- Ativação com saldo interno ou misto
- Sistema de referrals customizado

**Conclusão:** Frontend foi desenvolvido para um contrato diferente/mais complexo.

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Preparação
- [x] Mapear todas as funções
- [ ] Atualizar ABI completo
- [ ] Adicionar constantes ao config
- [ ] Criar arquivo de tipos TypeScript

### Fase 2: Hooks
- [ ] Reescrever useContract.ts (hooks cliente)
- [ ] Criar useAdmin.ts (hooks admin)
- [ ] Criar useSystem.ts (hooks sistema)
- [ ] Deletar hooks obsoletos

### Fase 3: Componentes
- [ ] Criar componentes de visualização
- [ ] Criar componentes admin
- [ ] Atualizar componentes existentes

### Fase 4: Páginas
- [ ] Atualizar Dashboard
- [ ] Recriar Admin
- [ ] Corrigir Register
- [ ] Melhorar Withdraw
- [ ] Atualizar Network

### Fase 5: Testes
- [ ] Testar todas as funções write
- [ ] Testar todas as funções read
- [ ] Validar permissões admin
- [ ] Testar fluxo completo usuário

### Fase 6: IPFS
- [ ] Configurar Pinata
- [ ] Build otimizado
- [ ] Deploy IPFS
- [ ] Testar acesso

---

**FIM DO MAPEAMENTO**

_Este documento serve como guia completo para reconstrução do frontend._
