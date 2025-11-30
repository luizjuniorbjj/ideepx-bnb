# 🧪 GUIA DE TESTES - BSC MAINNET

## ✅ CONTRATOS DEPLOYADOS

```
iDeepXCore:       0xA64bD448aEECed62d02F0deb8305ecd30f79fb54
iDeepXMLM:        0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da
iDeepXGovernance: 0x57ea5e1E49190B9EC2e7eEE658168E1626039442
USDT (BSC):       0x55d398326f99059fF775485246999027B3197955
```

---

## 🔍 MÉTODO 1: VERIFICAR NO BSCSCAN (Recomendado para começar)

### Passo 1: Acessar BscScan
```
Core: https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54
```

### Passo 2: Ver Informações Básicas
- ✅ **Contract:** Deve mostrar que é um contrato (não uma EOA)
- ✅ **Balance:** Mostra saldo atual do contrato
- ✅ **Transactions:** Deve ter pelo menos 1 (deploy)

### Passo 3: Ler Funções (Sem gastar gas)
1. Clique na aba **"Contract"**
2. Se aparecer código verificado: ótimo! Se não, continue mesmo assim
3. Clique em **"Read Contract"** ou **"Read as Proxy"**
4. Teste estas funções:

```
📖 Funções para LER (Grátis - Sem Gas):

✅ owner()
   Deve retornar: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2

✅ usdt()
   Deve retornar: 0x55d398326f99059fF775485246999027B3197955

✅ mlmModule()
   Deve retornar: 0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da

✅ governanceModule()
   Deve retornar: 0x57ea5e1E49190B9EC2e7eEE658168E1626039442

✅ isUserRegistered(SEU_ENDERECO)
   Deve retornar: false (ainda não registrado)

✅ SUBSCRIPTION_PRICE()
   Deve retornar: 19000000000000000000 (19 USDT)
```

---

## 💻 MÉTODO 2: TESTAR VIA BSCSCAN (Interação Real)

### ⚠️ ANTES DE COMEÇAR:
- Conecte sua carteira MetaMask (rede BSC Mainnet)
- Tenha BNB para gas (~0.01 BNB é suficiente)
- Tenha USDT (mínimo 19 USDT para teste)

### Passo 1: Conectar Carteira
1. Vá para: https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#writeContract
2. Clique em **"Connect to Web3"**
3. Conecte sua MetaMask
4. Certifique-se de estar na **BSC Mainnet** (Chain ID: 56)

### Passo 2: Aprovar USDT (OBRIGATÓRIO)
```
⚠️ Antes de qualquer operação, você DEVE aprovar USDT!

1. Acesse o contrato USDT:
   https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955#writeContract

2. Conecte carteira (Connect to Web3)

3. Encontre a função: approve()
   - spender: 0xA64bD448aEECed62d02F0deb8305ecd30f79fb54
   - amount: 100000000000000000000 (100 USDT com 18 decimais)

4. Clique em "Write" e confirme transação

5. Aguarde confirmação (15-30 segundos)
```

### Passo 3: Registrar Usuário
```
Volte ao Core: https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#writeContract

📝 Função: registerWithSponsor(address sponsor)

Primeiro usuário (você é o root):
- sponsor: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2 (seu próprio endereço)

Clique em "Write" → Confirme transação
```

### Passo 4: Ativar Assinatura
```
📝 Função: activateSubscription(uint256 months, uint8 paymentMode)

Parâmetros:
- months: 1 (1 mês de teste)
- paymentMode: 0 (pagar com USDT)

Clique em "Write" → Confirme transação
Custo: 19 USDT + gas
```

### Passo 5: Verificar Registro
```
Volte para "Read Contract"

📖 Função: isUserRegistered(SEU_ENDERECO)
Deve retornar: true ✅

📖 Função: users(SEU_ENDERECO)
Deve mostrar:
- isActive: true
- subscriptionEnd: timestamp futuro
- sponsor: endereço do sponsor
- totalEarned: 0 (por enquanto)
```

---

## 🖥️ MÉTODO 3: TESTAR VIA FRONTEND (Após upload Pinata)

### Quando seu frontend estiver no ar:

```
URL: https://gateway.pinata.cloud/ipfs/SEU_CID
```

### Fluxo de Teste Completo:

#### 1. Landing Page
```
✅ Acesse a home
✅ Verifique se mostra "BSC Mainnet"
✅ Clique em "Conectar Carteira"
✅ Conecte MetaMask (BSC Mainnet)
```

#### 2. Registro
```
✅ Vá para /register?ref=0xeb2451a8dd58734134dd7bde64a5f86725b75ef2
✅ Preencha nome/email
✅ Clique em "Registrar"
✅ Confirme transação no MetaMask
✅ Aguarde confirmação
```

#### 3. Ativar Assinatura
```
✅ Vá para /dashboard
✅ Escolha duração (1, 3, 6 ou 12 meses)
✅ Escolha método de pagamento:
   - USDT: Paga tudo em USDT
   - Saldo: Usa saldo interno (se tiver)
   - Misto: Combina saldo + USDT
✅ Clique em "Aprovar USDT"
✅ Clique em "Ativar Assinatura"
✅ Confirme transações
```

#### 4. Convidar Pessoas
```
✅ No dashboard, copie seu link de indicação:
   https://SEU_SITE/register?ref=SEU_ENDERECO
✅ Compartilhe com alguém
✅ Quando pessoa se registrar, você verá em /network
```

#### 5. Ver Comissões
```
✅ Vá para /network
✅ Veja sua árvore de 10 níveis
✅ Quando alguém ativar assinatura, você recebe comissão automaticamente
✅ Comissões vão para "Saldo Disponível"
```

#### 6. Sacar
```
✅ Vá para /withdraw
✅ Digite valor a sacar
✅ Clique em "Sacar"
✅ Confirme transação
✅ USDT vai direto para sua carteira
```

---

## 🔧 MÉTODO 4: TESTAR VIA HARDHAT (Desenvolvedores)

### Criar Script de Teste
```javascript
// scripts/test_mainnet.cjs
const hre = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();
  console.log("Testing from:", user.address);

  // Connect to deployed contracts
  const core = await ethers.getContractAt(
    "iDeepXCore",
    "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54"
  );

  // Test 1: Read owner
  console.log("\n📖 Test 1: Owner");
  const owner = await core.owner();
  console.log("Owner:", owner);

  // Test 2: Check if registered
  console.log("\n📖 Test 2: Is Registered?");
  const isRegistered = await core.isUserRegistered(user.address);
  console.log("Is Registered:", isRegistered);

  // Test 3: Get subscription price
  console.log("\n📖 Test 3: Subscription Price");
  const price = await core.SUBSCRIPTION_PRICE();
  console.log("Price:", ethers.formatEther(price), "USDT");

  // Test 4: Check modules
  console.log("\n📖 Test 4: Modules");
  const mlm = await core.mlmModule();
  const governance = await core.governanceModule();
  console.log("MLM:", mlm);
  console.log("Governance:", governance);
}

main().catch(console.error);
```

### Rodar Teste
```bash
npx hardhat run scripts/test_mainnet.cjs --network bscMainnet
```

---

## 📊 CHECKLIST DE TESTES

### Fase 1: Verificação Básica ✅
- [ ] Contratos aparecem no BscScan
- [ ] Owner é o endereço correto
- [ ] USDT address está correto
- [ ] Módulos (MLM e Governance) estão conectados

### Fase 2: Registro e Assinatura ✅
- [ ] Aprovar USDT no contrato
- [ ] Registrar primeiro usuário (root)
- [ ] Ativar assinatura de 1 mês
- [ ] Verificar status ativo

### Fase 3: MLM ✅
- [ ] Registrar segundo usuário com referral
- [ ] Segundo usuário ativa assinatura
- [ ] Verificar comissão creditada no primeiro usuário
- [ ] Verificar rede no frontend (/network)

### Fase 4: Saques ✅
- [ ] Tentar sacar sem saldo (deve falhar)
- [ ] Sacar valor menor que saldo
- [ ] Verificar USDT chegou na carteira
- [ ] Verificar saldo atualizado

### Fase 5: Segurança ✅
- [ ] Tentar registrar com sponsor inválido (deve falhar)
- [ ] Tentar ativar sem aprovar USDT (deve falhar)
- [ ] Tentar sacar mais que saldo (deve falhar)
- [ ] Verificar pausability (owner pode pausar)

---

## 🚨 PROBLEMAS COMUNS

### "Transaction Reverted"
```
Causa: Você não aprovou USDT
Solução: Aprovar USDT primeiro (ver Passo 2)
```

### "Insufficient Allowance"
```
Causa: Aprovação de USDT insuficiente
Solução: Aprovar mais USDT (recomendado: 100 USDT)
```

### "Invalid Sponsor"
```
Causa: Sponsor não está registrado
Solução: Use seu próprio endereço como primeiro sponsor
```

### "Subscription Expired"
```
Causa: Assinatura venceu
Solução: Ativar assinatura novamente
```

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique no BscScan se transação foi confirmada
2. Leia a mensagem de erro
3. Verifique se tem BNB para gas
4. Verifique se aprovou USDT
5. Certifique-se de estar na BSC Mainnet (não testnet!)

---

## 🎯 PRÓXIMOS PASSOS

Depois de testar:
1. ✅ Verificar contratos no BscScan (opcional)
2. ✅ Upload frontend no Pinata
3. ✅ Testar fluxo completo via frontend
4. ✅ Compartilhar com usuários reais
5. ✅ Monitorar transações e comissões

**Boa sorte! Seus contratos estão LIVE na mainnet! 🚀**
