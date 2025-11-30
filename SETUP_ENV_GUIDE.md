# 🔧 Guia de Configuração do .env - V9_SECURE_2

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Passo a Passo](#configuração-passo-a-passo)
3. [Testnet vs Mainnet](#testnet-vs-mainnet)
4. [Checklist de Segurança](#checklist-de-segurança)

---

## 🎯 Visão Geral

O arquivo `.env` contém informações sensíveis necessárias para deploy e operação do contrato V9_SECURE_2. **NUNCA compartilhe este arquivo ou faça commit dele no Git!**

### Variáveis Obrigatórias:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `PRIVATE_KEY` | ✅ | Chave privada da carteira de deploy |
| `MULTISIG_ADDRESS` | ✅ | Endereço do Gnosis Safe |
| `LIQUIDITY_POOL` | ✅ | Carteira para liquidez (4% + 1%) |
| `INFRASTRUCTURE_WALLET` | ✅ | Carteira para infraestrutura (12%) |
| `COMPANY_WALLET` | ✅ | Carteira da empresa (23%) |
| `BSCSCAN_API_KEY` | ⚠️ | API key para verificar contratos |
| `CONTRACT_ADDRESS` | ℹ️ | Endereço após deploy (para monitor) |

---

## 🔐 Configuração Passo a Passo

### 1. PRIVATE_KEY (Chave Privada de Deploy)

**⚠️ ATENÇÃO: Use uma carteira dedicada apenas para deploy!**

#### Como obter (MetaMask):
1. Abra MetaMask
2. Clique nos 3 pontos → "Account details"
3. Clique em "Show private key"
4. Digite sua senha
5. Copie a chave (remova o prefixo `0x` se houver)

#### Exemplo:
```env
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### ⚠️ Segurança:
- ❌ NUNCA use sua carteira principal
- ✅ Crie uma carteira nova só para deploy
- ✅ Transfira apenas o BNB necessário para gas
- ✅ Após deploy, remova fundos restantes

---

### 2. MULTISIG_ADDRESS (Gnosis Safe)

**✅ OBRIGATÓRIO para V9_SECURE_2**

O Multisig controla:
- ✅ Emergency reserve (1%)
- ✅ Circuit breaker manual
- ✅ Atualização do próprio multisig
- ✅ Distribuição de performance fees
- ✅ Pause/unpause do contrato

#### Como criar (Passo a Passo):

**2.1. Acesse Gnosis Safe**
```
https://app.safe.global
```

**2.2. Conecte sua carteira**
- Clique em "Connect Wallet"
- Escolha MetaMask (ou sua wallet)
- Aprove a conexão

**2.3. Selecione a rede**
- Para **TESTNET**: Escolha "BNB Smart Chain Testnet"
- Para **MAINNET**: Escolha "BNB Smart Chain"

**2.4. Crie o Safe**
- Clique em "+ Create new Safe"
- Dê um nome (ex: "iDeepX Multisig")

**2.5. Adicione Signatários**

Recomendações:
- **Mínimo:** 3 signatários (threshold 2/3)
- **Recomendado:** 5 signatários (threshold 3/5)
- **Enterprise:** 7 signatários (threshold 4/7)

Exemplo:
```
Signatário 1: CEO/Founder
Signatário 2: CTO/Tech Lead
Signatário 3: CFO/Finance
Signatário 4: COO/Operations
Signatário 5: Legal/Compliance
```

**2.6. Configure Threshold**
- Para 5 signatários: escolha "3 out of 5"
- Isso significa que 3 pessoas precisam aprovar cada transação

**2.7. Revise e Deploy**
- Revise todos os endereços
- Clique em "Create"
- Pague o gas fee (≈ 0.01 BNB)
- Aguarde confirmação

**2.8. Copie o endereço**
- Após criado, copie o endereço do Safe
- Exemplo: `0x1234567890123456789012345678901234567890`

#### Adicione no .env:
```env
MULTISIG_ADDRESS=0x1234567890123456789012345678901234567890
```

---

### 3. LIQUIDITY_POOL

**Recebe: 5% de cada transação**
- 4% → Saldo operacional (pode ser sacado com limites)
- 1% → Emergency reserve (protegido com timelock 24h)

#### Recomendações:
- ✅ **MELHOR:** Outro Gnosis Safe dedicado
- ✅ **BOM:** Hardware wallet (Ledger/Trezor)
- ⚠️ **ACEITÁVEL:** Carteira fria bem protegida
- ❌ **EVITAR:** Hot wallet ou carteira de uso diário

#### Como criar Safe dedicado:
1. Repita processo do item 2 (Multisig)
2. Nomeie "iDeepX Liquidity Pool"
3. Pode usar threshold menor (2/3)
4. Copie o endereço

#### Adicione no .env:
```env
LIQUIDITY_POOL=0x2345678901234567890123456789012345678901
```

---

### 4. INFRASTRUCTURE_WALLET

**Recebe: 12% de cada transação**

Destino dos fundos:
- ☁️ Servidores e hosting
- 🔧 APIs e ferramentas
- 👨‍💻 Desenvolvimento
- 📢 Marketing e crescimento
- 🛡️ Segurança e auditorias

#### Recomendações:
- ✅ Carteira empresarial
- ✅ Com controles de gastos
- ✅ Auditável e rastreável

#### Adicione no .env:
```env
INFRASTRUCTURE_WALLET=0x3456789012345678901234567890123456789012
```

---

### 5. COMPANY_WALLET

**Recebe: 23% de cada transação**

Destino dos fundos:
- 💼 Receita operacional
- 💰 Investimentos
- 🏦 Reservas
- 🚀 Expansão

#### Recomendações:
- ✅ Carteira corporativa principal
- ✅ Com proteção multisig (recomendado)
- ✅ Integrada com contabilidade

#### Adicione no .env:
```env
COMPANY_WALLET=0x4567890123456789012345678901234567890123
```

---

### 6. BSCSCAN_API_KEY

**Necessário para verificar contratos no BscScan**

Verificação permite:
- ✅ Usuários lerem o código-fonte
- ✅ Interagir via BscScan interface
- ✅ Transparência total
- ✅ Confiança dos usuários

#### Como obter:

**6.1. Crie conta no BscScan**
```
https://bscscan.com/register
```

**6.2. Faça login**
```
https://bscscan.com/login
```

**6.3. Acesse API Keys**
- Menu superior direito → "API-KEYs"
- Ou acesse: https://bscscan.com/myapikey

**6.4. Crie nova API key**
- Clique em "+ Add"
- Nomeie: "iDeepX V9_SECURE_2"
- Copie a chave gerada

#### Adicione no .env:
```env
BSCSCAN_API_KEY=ABC123XYZ456DEF789GHI012JKL345MNO
```

---

### 7. CONTRACT_ADDRESS (Após Deploy)

**Adicione APÓS fazer o deploy do contrato**

#### Como obter:
1. Execute o deploy:
   ```bash
   npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscTestnet
   ```

2. No output, localize:
   ```
   ✅ Deploy concluído!
   📍 Contrato: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   ```

3. Copie o endereço

#### Adicione no .env:
```env
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

#### Uso:
- Necessário para o monitor: `node monitoring/monitor.js`
- Necessário para scripts de interação

---

## 🧪 Testnet vs Mainnet

### Testnet (Recomendado Primeiro)

**Vantagens:**
- ✅ BNB grátis (faucet)
- ✅ Sem risco financeiro
- ✅ Pode testar à vontade
- ✅ Encontrar bugs antes de mainnet

**Como conseguir BNB testnet:**
```
https://testnet.bnbchain.org/faucet-smart
```

**Configuração testnet:**
1. Use carteiras separadas (não suas reais)
2. Pode usar endereços simples (sem multisig)
3. Teste por **7+ dias** antes de mainnet
4. Simule todos os cenários possíveis

**Deploy testnet:**
```bash
npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscTestnet
```

---

### Mainnet (Somente Após Testes)

**⚠️ ANTES DE MAINNET:**
- [ ] Testado 7+ dias em testnet
- [ ] Todos os cenários testados
- [ ] Auditoria externa concluída
- [ ] Gnosis Safe criado e testado
- [ ] Todas as carteiras configuradas
- [ ] Monitoramento 24/7 pronto
- [ ] Plano de resposta a incidentes
- [ ] Time de emergência definido

**Deploy mainnet:**
```bash
npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscMainnet
```

---

## 🔒 Checklist de Segurança

### Antes do Deploy:

- [ ] **.env está no .gitignore**
- [ ] **Chaves privadas são únicas (não reutilizadas)**
- [ ] **Gnosis Safe criado e testado**
- [ ] **Todas carteiras são cold storage ou multisig**
- [ ] **BscScan API key configurada**
- [ ] **Saldo suficiente para gas (≈ 0.1 BNB)**

### Durante o Deploy:

- [ ] **Revisar TODAS as configurações antes de confirmar**
- [ ] **Verificar network (testnet/mainnet)**
- [ ] **Confirmar endereços estão corretos**
- [ ] **Aguardar confirmações completas**

### Após o Deploy:

- [ ] **Verificar contrato no BscScan**
- [ ] **Testar funções básicas**
- [ ] **Configurar monitoramento**
- [ ] **Documentar todos os endereços**
- [ ] **Backup de informações críticas**
- [ ] **Treinar equipe nas ferramentas**

---

## 📝 Exemplo de .env Completo (TESTNET)

```env
# Chave de teste do Hardhat (NUNCA use em mainnet!)
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# BscScan API
BSCSCAN_API_KEY=ABC123XYZ456DEF789GHI012JKL345MNO

# Gnosis Safe Testnet
MULTISIG_ADDRESS=0x1234567890123456789012345678901234567890

# Carteiras de teste
LIQUIDITY_POOL=0x2345678901234567890123456789012345678901
INFRASTRUCTURE_WALLET=0x3456789012345678901234567890123456789012
COMPANY_WALLET=0x4567890123456789012345678901234567890123

# Após deploy
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

## 🚨 Troubleshooting

### Erro: "Insufficient funds"
**Solução:** Adicione mais BNB na carteira de deploy
- Testnet: Use faucet
- Mainnet: Transfira BNB

### Erro: "Invalid API Key"
**Solução:** Verifique BscScan API key
- Copie novamente do site
- Remova espaços em branco

### Erro: "Cannot connect to network"
**Solução:**
- Verifique sua internet
- Tente novamente em alguns segundos
- Use RPC alternativo se necessário

### Contrato não verifica no BscScan
**Solução:**
- Aguarde 30-60 segundos após deploy
- Execute comando de verificação manual
- Verifique se API key está correta

---

## 📞 Suporte

Para dúvidas sobre configuração:
1. Revise este guia completamente
2. Verifique ROADMAP_V9_SECURE_2.md
3. Consulte documentação do Hardhat

Para problemas técnicos:
- Hardhat: https://hardhat.org/docs
- Gnosis Safe: https://docs.safe.global
- BscScan: https://docs.bscscan.com

---

## ✅ Próximos Passos

Após configurar o .env:

1. **Testnet:**
   ```bash
   npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscTestnet
   ```

2. **Monitorar:**
   ```bash
   node monitoring/monitor.js
   ```

3. **Testar 7+ dias**

4. **Mainnet** (após testes e auditoria)

---

**🎯 Lembre-se: SEGURANÇA EM PRIMEIRO LUGAR!**

Nunca apresse o deploy em mainnet. Teste exaustivamente em testnet primeiro.
