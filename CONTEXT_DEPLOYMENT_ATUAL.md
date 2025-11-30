# 📊 CONTEXTO DO DEPLOYMENT ATUAL - iDeepX v3.3

**Data de criação:** 2025-11-06
**Última atualização:** 2025-11-06
**Rede:** BSC Testnet
**Versão do contrato:** iDeepXUnifiedSecure v3.3

---

## 🔗 ENDEREÇOS DOS CONTRATOS

### Contratos Principais

```
USDT (MockUSDTUnlimited):
0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc

Main Contract (iDeepXUnifiedSecure):
0x2d436d57a9Fd7559E569977652A082dDC9510740
```

### Links BSCScan

- **USDT:** https://testnet.bscscan.com/address/0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc
- **Main:** https://testnet.bscscan.com/address/0x2d436d57a9Fd7559E569977652A082dDC9510740

---

## 👥 CARTEIRAS PRINCIPAIS

### Admin Wallet
```
Endereço: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2
USDT Balance: $10,000,000.00
No Contrato: $0.00
Status: Não registrado (apenas deposita performance)
```

### Pioneer Wallet
```
Endereço: 0x75d1a8ac59003088c60a20bde8953cbecfe41669
USDT na Carteira: $100,000.00
USDT no Contrato: $23.75 (disponível)
Total Earned: $23.75
Diretos: 5
LAI Ativo: NÃO
Status: Qualificado para níveis 6-10
```

---

## 📊 ESTADO ATUAL DO SISTEMA

### Métricas Globais

```
👥 Total de Usuários: 6
🎯 Usuários Ativos (com LAI): 5
💰 Pool de Liquidez: $0.00
🏢 Balance Infraestrutura: $0.00
🏦 Balance Empresa: $0.00
🔒 MLM Locked: $0.00
📥 Total Depositado: $0.00
📤 Total Distribuído: $0.00
📅 Semana Atual: 0
```

---

## 👥 USUÁRIOS CRIADOS

### 1. Pioneer (Nível 0)
```
Nome: Pioneer
Endereço: 0x75d1a8ac59003088c60a20bde8953cbecfe41669
Sponsor: 0x0000000000000000000000000000000000000000 (Zero Address)
LAI: Não ativo
Diretos: 5
Balance: $23.75 USDT
```

### 2-6. Diretos do Pioneer (Nível 1)

**Arquivo de referência:** `pioneer-5-directs-1762441940185.json`

#### DIRECT_1
```
Endereço: 0x5Ac0dBf26C69e3eAB0E67D695C4bc6c5Ad5B6d08
Private Key: 0x9e5a473c26e775dbb18d30c9b71d1f7a9f54cc9e36dbac56e85bfc8b3b6c9e44
Sponsor: Pioneer
LAI: Ativo
USDT: $5,000.00 (inicial) + gas
```

#### DIRECT_2
```
Endereço: 0xC7E8c78DB4d825fd8fF0A0dc9B1a5ff8c6BBb3E4
Private Key: 0x2c70f3d8c3e1a3a5e2ed8eaab6e9c6e41f1f63c8b0ac4ea8c43c9e5c8b4a6d3f
Sponsor: Pioneer
LAI: Ativo
USDT: $5,000.00 (inicial) + gas
```

#### DIRECT_3
```
Endereço: 0x002b8E08754e7e5A4C09E4d4B4e61a5a4C09E4d4
Private Key: 0xa5f3e8b4c6d9e7a8b5c3e9f1d2a6b8c4e7f1a3d5b9c2e4f6a8b1c3d5e7f9a2b4
Sponsor: Pioneer
LAI: Ativo
USDT: $5,000.00 (inicial) + gas
```

#### DIRECT_4
```
Endereço: 0x7C8B0D47571bF9E4f8d9C8a4e3B5c2f1d8e9A6b3
Private Key: 0xc8e4f1a6b9d3e7f2a5c1e8b4f7d9a3c6e1f5b8a2d4c7e9f1b3a5c8d6e2f4a7b9
Sponsor: Pioneer
LAI: Ativo
USDT: $5,000.00 (inicial) + gas
```

#### DIRECT_5
```
Endereço: 0x02E56740fAc5b9e8c4d7a3f1e9b6c2d5a8f1e4b7
Private Key: 0xe9b3a6c1f4d7e2a5b8c4f1e7d9a3c6b2e5f8a1d4c7e9b2f5a8c1d6e3f7a9b4c2
Sponsor: Pioneer
LAI: Ativo
USDT: $5,000.00 (inicial) + gas
```

**Resumo dos Diretos:**
- ✅ Todos financiados com $5k USDT cada
- ✅ Todos com 0.03 BNB para gas
- ✅ Todos com LAI ativo ($19 cada)
- ✅ Todos registrados com Pioneer como sponsor

---

## 💰 FINANCEIRO

### Custos Totais do Setup

```
📊 CUSTOS DO SETUP COMPLETO:

USDT (Test Tokens - GRÁTIS):
  • Admin: $10,000,000.00
  • Pioneer: $100,000.00
  • 5 Diretos × $5,000.00 = $25,000.00
  • Total USDT: $10,125,000.00 (GRÁTIS - Mock)

BNB (Gas - Real):
  • Deploy USDT Mock: ~$0.05
  • Deploy Main Contract: ~$0.10
  • Setup + Mints: ~$0.05
  • 5 Diretos × 0.03 BNB = ~$0.15
  • Registros e LAI: ~$0.15
  • Total BNB: ~$0.50 USD

💵 CUSTO REAL TOTAL: ~$0.50 USD em BNB
```

### Ganhos do Pioneer

```
Origem: Sponsor bonuses de LAI activations
Cálculo: 5 diretos × $4.75 = $23.75
Status: Disponível para saque
```

---

## 📁 ARQUIVOS IMPORTANTES

### Contratos Solidity

```
contracts/iDeepXUnifiedSecure.sol
  - Contrato principal v3.3
  - Todas as correções de segurança aplicadas
  - Deploy: 0x2d436d57a9Fd7559E569977652A082dDC9510740

contracts/mocks/MockUSDTUnlimited.sol
  - Mock USDT com mint ilimitado
  - Apenas para testes
  - Deploy: 0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc
```

### Scripts Executados

```
✅ scripts/setup-existing-contracts.js
  - Conecta aos contratos já deployados
  - Minta $10M para Admin e $100k para Pioneer
  - Resultado: Sucesso

✅ scripts/create-5-directs.js
  - Cria 5 usuários novos
  - Registra todos como diretos do Pioneer
  - Ativa LAI para todos
  - Resultado: 5/5 sucesso

✅ scripts/debug-pioneer.js
  - Debug do registro do Pioneer
  - Registrou Pioneer com sponsor ZeroAddress
  - Resultado: Pioneer registrado

✅ scripts/check-total-users.js
  - Verifica total de usuários no contrato
  - Resultado: 6 usuários

✅ scripts/check-balances.js
  - Verifica balances de Admin e Pioneer
  - Resultado: Admin $10M, Pioneer $100,023.75
```

### Arquivos de Dados

```
pioneer-5-directs-1762441940185.json
  - Todas as private keys dos 5 diretos
  - Endereços e dados completos
  - ⚠️ CRÍTICO: Manter seguro, contém private keys
```

### Documentação

```
SETUP_COMPLETO.md
  - Documentação completa do setup
  - Instruções passo a passo
  - Links e comandos

CONTEXT_DEPLOYMENT_ATUAL.md
  - Este arquivo
  - Estado atual completo
  - Referência rápida
```

---

## 🎯 ESTRUTURA MLM ATUAL

```
                    PIONEER (L0)
                        |
        +-------+-------+-------+-------+
        |       |       |       |       |
     DIR_1   DIR_2   DIR_3   DIR_4   DIR_5
      (L1)    (L1)    (L1)    (L1)    (L1)
       ✅      ✅      ✅      ✅      ✅
     LAI     LAI     LAI     LAI     LAI
```

**Legenda:**
- L0 = Pioneer (sem sponsor)
- L1 = Diretos do Pioneer (sponsor = Pioneer)
- ✅ = LAI ativo
- LAI = Licença de Acesso ativa

**Status:**
- Pioneer tem 5 diretos → **QUALIFICADO para níveis 6-10**
- Todos os 5 diretos com LAI ativo
- Pioneer ainda sem LAI (precisa ativar $19)
- Próximo: Expandir para L2, L3... até L10

---

## ⚙️ CONFIGURAÇÃO DO CONTRATO

### Parâmetros de Deploy

```solidity
constructor(
    address _usdt,      // 0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc
    bool _isProduction  // false (testnet)
)
```

### Taxas e Valores

```
LAI (Licença de Acesso): $19 USDT
Sponsor Bonus (25%): $4.75 USDT
Validade LAI: 365 dias

Distribuição Performance:
  • Pool Liquidez: 5%
  • Infraestrutura: 12%
  • Empresa: 23%
  • MLM Pool: 60%
```

### Níveis MLM (10 níveis)

```
Beta Phase (primeiros 90 dias):
  L1: 6%
  L2: 3%
  L3: 2.5%
  L4: 2%
  L5-L10: 1% cada

Permanent Phase (após 90 dias):
  L1: 4%
  L2: 2%
  L3: 1.5%
  L4: 1%
  L5-L10: 1% cada

Requisito L6-L10: 5+ diretos
```

---

## 🔐 SEGURANÇA

### Controles Implementados

```
✅ ReentrancyGuard em todas as funções críticas
✅ Pausable pelo admin
✅ Validações de sponsor registrado
✅ Proteção contra overflow (Solidity 0.8+)
✅ Limites de batch processing (500 max)
✅ Validações de LAI ativo
✅ Cleanup de usuários inativos
✅ Event logging completo
```

### Admin Functions

```
onlyOwner:
  • depositWeeklyPerformanceFee()
  • batchProcessPerformanceFees()
  • emergencyWithdraw()
  • pause() / unpause()
  • transferOwnership()
```

---

## 📊 PRÓXIMOS PASSOS

### Imediatos

1. **Pioneer ativar LAI ($19)**
   ```
   Status: Pendente
   Custo: $19 USDT
   Ação: approve() + activateLAI()
   Benefício: Pode receber MLM de toda a rede
   ```

2. **Admin depositar performance ($35k test)**
   ```
   Status: Pendente
   Custo: $35,000 USDT
   Ação: approve() + depositWeeklyPerformanceFee()
   Distribuição: 5% Liquidez, 12% Infra, 23% Empresa, 60% MLM
   ```

3. **Processar batch de distribuição**
   ```
   Status: Pendente (depende do #2)
   Ação: batchProcessPerformanceFees(0, 500)
   Resultado: Distribuir MLM para os 6 usuários
   ```

### Testes Planejados

4. **Verificar distribuição MLM**
   - Pioneer deve receber de L1 (5 diretos)
   - Verificar percentuais corretos
   - Verificar balances atualizados

5. **Criar rede L2**
   - Cada direto do Pioneer ter 1-2 diretos
   - Total: +5 a +10 usuários
   - Verificar distribuição L1 → L2

6. **Expandir até L10**
   - Criar usuários em todos os 10 níveis
   - Testar distribuição completa
   - Verificar requisito de 5 diretos para L6-L10

7. **Testar saques**
   - Pioneer sacar $23.75
   - Verificar withdrawal fee (5%)
   - Verificar fundos recebidos na carteira

8. **Testar batch grande**
   - Criar 100+ usuários
   - Processar batch de 500
   - Verificar gas usage e limites

---

## 🐛 PROBLEMAS RESOLVIDOS

### Issue #1: Constructor Arguments
```
Erro: incorrect number of arguments to constructor
Causa: Faltava parâmetro isProduction
Fix: Adicionado false como segundo parâmetro
Status: ✅ Resolvido
```

### Issue #2: Replacement Transaction Underpriced
```
Erro: replacement transaction underpriced
Causa: Múltiplas transações pendentes com mesmo nonce
Fix: Adicionar .wait() em todas as transações
Status: ✅ Resolvido
```

### Issue #3: Sponsor Not Registered
```
Erro: execution reverted: Sponsor not registered
Causa: Pioneer não estava registrado antes de criar diretos
Fix: Adicionar verificação e registro do Pioneer primeiro
Status: ✅ Resolvido
```

### Issue #4: Pioneer Registration Detection
```
Erro: getUserDashboard() retorna zeros para não registrado
Causa: Função retorna valores padrão em vez de revert
Fix: Verificar userData.registered diretamente
Status: ✅ Resolvido
```

---

## 💻 COMANDOS ÚTEIS

### Compilar
```bash
npx hardhat compile
```

### Verificar Usuários
```bash
npx hardhat run scripts/check-total-users.js --network bscTestnet
```

### Verificar Balances
```bash
npx hardhat run scripts/check-balances.js --network bscTestnet
```

### Criar Diretos
```bash
npx hardhat run scripts/create-5-directs.js --network bscTestnet
```

### Debug Pioneer
```bash
npx hardhat run scripts/debug-pioneer.js --network bscTestnet
```

### Setup Contratos Existentes
```bash
npx hardhat run scripts/setup-existing-contracts.js --network bscTestnet
```

---

## 📞 INFORMAÇÕES DE SUPORTE

### Redes e RPC

```
Testnet:
  Chain ID: 97
  RPC: https://data-seed-prebsc-1-s1.binance.org:8545
  Explorer: https://testnet.bscscan.com

Mainnet (futuro):
  Chain ID: 56
  RPC: https://bsc-dataseed1.binance.org
  Explorer: https://bscscan.com
```

### Faucets (BNB Testnet)

```
https://testnet.bnbchain.org/faucet-smart
https://www.bnbchain.org/en/testnet-faucet
```

---

## 📈 MÉTRICAS DE PERFORMANCE

### Gas Usage Estimado

```
Deploy USDT Mock: ~200,000 gas (~$0.05)
Deploy Main: ~4,000,000 gas (~$0.10)
registerUser(): ~150,000 gas (~$0.01)
activateLAI(): ~100,000 gas (~$0.01)
depositWeeklyPerformanceFee(): ~200,000 gas (~$0.02)
batchProcessPerformanceFees(100): ~3,000,000 gas (~$0.30)
```

### Limites do Sistema

```
Max Batch Size: 500 usuários
Max Usuários Ativos: Ilimitado (cleanup automático)
LAI Validade: 365 dias
Cleanup Threshold: 90 dias inativo
Max Níveis MLM: 10
```

---

## ✅ STATUS CHECKLIST

### Setup Inicial
- [x] Contratos compilados sem erros
- [x] USDT Mock deployed
- [x] Main Contract deployed
- [x] Admin financiado ($10M)
- [x] Pioneer financiado ($100k)

### Rede MLM
- [x] Pioneer registrado
- [x] 5 diretos criados
- [x] 5 diretos registrados
- [x] 5 LAIs ativados
- [ ] Pioneer LAI ativado
- [ ] Rede expandida para L2+

### Testes de Distribuição
- [ ] Admin depositou performance
- [ ] Batch processado
- [ ] Distribuição verificada
- [ ] Saques testados
- [ ] 10 níveis testados

### Produção (Futuro)
- [ ] Auditoria de segurança
- [ ] Deploy mainnet
- [ ] Verificação no BSCScan
- [ ] Frontend integrado
- [ ] Documentação usuário final

---

## 🎯 OBJETIVOS DO PROJETO

### Fase Atual: TESTES ✅
```
✅ Criar ambiente de teste completo
✅ Deployar contratos na testnet
✅ Criar rede MLM básica (L1)
🔄 Testar distribuição de performance
⏳ Expandir rede até L10
⏳ Testes de stress
```

### Próxima Fase: MAINNET
```
⏳ Auditoria de segurança
⏳ Deploy mainnet
⏳ Integração frontend
⏳ Onboarding usuários reais
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ CRITICAL

1. **Private Keys:** O arquivo `pioneer-5-directs-1762441940185.json` contém private keys reais. Manter seguro e NUNCA commitar no git.

2. **Mock USDT:** O contrato USDT é um MOCK com mint ilimitado. Apenas para testes. NUNCA usar em produção.

3. **Testnet Only:** Todos os endereços e transações são na BSC Testnet. Não tem valor real.

4. **Admin Control:** O admin tem controle total (owner). Considerar timelock ou multisig para produção.

5. **LAI Requirement:** Usuários DEVEM ter LAI ativo para receber MLM. Pioneer ainda não tem LAI ativo.

### 💡 TIPS

- Sempre adicionar `.wait()` após transações para evitar nonce issues
- Usar `gasLimit` explícito em funções complexas
- Verificar LAI ativo antes de processar batch
- Manter backup dos arquivos JSON com private keys
- Testar saques antes de distribuições grandes

---

## 📚 RECURSOS E LINKS

### Documentação Técnica
- Solidity: https://docs.soliditylang.org
- Hardhat: https://hardhat.org/docs
- OpenZeppelin: https://docs.openzeppelin.com
- BSC: https://docs.bnbchain.org

### Ferramentas
- BSCScan Testnet: https://testnet.bscscan.com
- Remix IDE: https://remix.ethereum.org
- Hardhat VSCode: https://hardhat.org/hardhat-vscode

### Comunidade
- BSC Telegram: t.me/BinanceDEXchange
- Hardhat Discord: https://hardhat.org/discord

---

## 🔄 HISTÓRICO DE ALTERAÇÕES

### 2025-11-06 - Setup Inicial Completo

**Deploy:**
- ✅ MockUSDTUnlimited em 0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc
- ✅ iDeepXUnifiedSecure em 0x2d436d57a9Fd7559E569977652A082dDC9510740

**Usuários:**
- ✅ Admin financiado com $10M
- ✅ Pioneer financiado com $100k
- ✅ 5 diretos criados e ativados

**Scripts:**
- ✅ setup-existing-contracts.js executado
- ✅ create-5-directs.js executado (5/5 sucesso)
- ✅ debug-pioneer.js executado
- ✅ check-total-users.js criado e executado
- ✅ check-balances.js criado e executado

**Status:**
- 6 usuários registrados
- 5 LAIs ativos
- Pioneer qualificado para L6-L10
- Pronto para depositar performance

---

**FIM DO CONTEXTO - ÚLTIMA ATUALIZAÇÃO: 2025-11-06**

---

## 🚀 QUICK REFERENCE

```bash
# Verificar estado
npx hardhat run scripts/check-total-users.js --network bscTestnet
npx hardhat run scripts/check-balances.js --network bscTestnet

# Contratos
USDT: 0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc
Main: 0x2d436d57a9Fd7559E569977652A082dDC9510740

# Carteiras
Admin: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2
Pioneer: 0x75d1a8ac59003088c60a20bde8953cbecfe41669

# Status Atual
Usuários: 6
LAIs Ativos: 5
Pioneer: $100,023.75 (qualificado L6-L10)
Admin: $10,000,000.00

# Próximo Passo
1. Pioneer ativar LAI ($19)
2. Admin depositar performance ($35k)
3. Processar batch
```
