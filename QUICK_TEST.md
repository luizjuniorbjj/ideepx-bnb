# ⚡ TESTE RÁPIDO - BSC MAINNET

## 🔍 MÉTODO MAIS FÁCIL: VIA BSCSCAN

### 1️⃣ Verificar Contratos Deployados

Abra cada link e confirme que aparece "Contract":

```
✅ Core:
https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54

✅ MLM:
https://bscscan.com/address/0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da

✅ Governance:
https://bscscan.com/address/0x57ea5e1E49190B9EC2e7eEE658168E1626039442
```

**O que você deve ver:**
- ✅ Badge "Contract" (não "Address")
- ✅ Pelo menos 1 transação (deploy)
- ✅ Saldo: 0 BNB (normal)

---

### 2️⃣ Testar Registro (SEM GASTAR DINHEIRO)

#### Passo 1: Conectar Carteira
1. Acesse: https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#readContract
2. Role até "Read Contract" ou "Read as Proxy"
3. Teste estas funções (GRÁTIS):

```
📖 isUserRegistered
   - Coloque seu endereço: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2
   - Resultado esperado: false (ainda não registrado)

📖 SUBSCRIPTION_PRICE
   - Resultado esperado: 19000000000000000000 (19 USDT)
```

---

### 3️⃣ Fazer Primeiro Registro (GASTA BNB + USDT)

⚠️ **ANTES DE COMEÇAR:**
- Tenha pelo menos **25 USDT** na carteira
- Tenha pelo menos **0.01 BNB** para gas

#### Passo A: Aprovar USDT
```
1. Acesse USDT:
   https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955#writeContract

2. Clique "Connect to Web3" → MetaMask

3. Encontre função: approve(address spender, uint256 amount)
   - spender: 0xA64bD448aEECed62d02F0deb8305ecd30f79fb54
   - amount: 100000000000000000000

4. Clique "Write" → Confirme no MetaMask

5. Aguarde 15-30 segundos
```

#### Passo B: Registrar
```
1. Acesse Core:
   https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#writeContract

2. Clique "Connect to Web3" (se ainda não conectou)

3. Encontre função: registerWithSponsor(address sponsor)
   - sponsor: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2

   ⚠️ Como você é o PRIMEIRO usuário, use seu PRÓPRIO endereço como sponsor!

4. Clique "Write" → Confirme no MetaMask

5. Aguarde confirmação
```

#### Passo C: Ativar Assinatura
```
1. Mesma página (Write Contract)

2. Encontre função: activateSubscription(uint256 months, uint8 paymentMode)
   - months: 1
   - paymentMode: 0 (pagar com USDT)

3. Clique "Write" → Confirme no MetaMask

4. Aguarde confirmação

💰 Custo: 19 USDT + ~0.005 BNB (gas)
```

#### Passo D: Verificar Status
```
1. Volte para "Read Contract"

2. Função: isUserRegistered(SEU_ENDERECO)
   Resultado: true ✅

3. Função: users(SEU_ENDERECO)
   Deve mostrar:
   - isActive: true
   - subscriptionEnd: timestamp futuro
   - sponsor: seu endereço
```

---

## 📊 RESUMO DOS CUSTOS

### Registro + Assinatura 1 Mês:
```
Aprovar USDT:      ~0.0005 BNB (~$0.30 USD)
Registrar:         ~0.0015 BNB (~$0.90 USD)
Ativar Assinatura: ~0.0030 BNB (~$1.80 USD) + 19 USDT

TOTAL: ~0.005 BNB + 19 USDT
       ≈ $3.00 + $19.00 = $22.00
```

---

## 🎯 TESTE COMPLETO (Com Comissões)

### Cenário: Registrar 2 pessoas

#### Pessoa A (Você):
```
1. Registra com sponsor: seu próprio endereço
2. Ativa assinatura: 19 USDT
3. Status: Ativo ✅
4. Comissões: 0 (você não tem upline)
```

#### Pessoa B (Amigo):
```
1. Registra com sponsor: endereço da Pessoa A
2. Ativa assinatura: 19 USDT
3. Status: Ativo ✅
```

#### Resultado:
```
Pessoa A recebe:
- Comissão nível 1: 8% de 19 USDT = 1.52 USDT ✅
- Saldo disponível: 1.52 USDT
- Pode sacar ou usar para renovar assinatura
```

---

## 🔧 VERIFICAR CONTRATOS (OPCIONAL)

Se quiser código verificado no BscScan:

```bash
# Core
npx hardhat verify --network bscMainnet \
  0xA64bD448aEECed62d02F0deb8305ecd30f79fb54 \
  "0x55d398326f99059fF775485246999027B3197955" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2"

# MLM
npx hardhat verify --network bscMainnet \
  0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da \
  "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2"

# Governance
npx hardhat verify --network bscMainnet \
  0x57ea5e1E49190B9EC2e7eEE658168E1626039442 \
  "0x55d398326f99059fF775485246999027B3197955" \
  "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2" \
  "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2"
```

**Benefício:** Código fonte visível no BscScan, mais confiança dos usuários.

---

## ✅ CHECKLIST

- [ ] Contratos aparecem no BscScan como "Contract"
- [ ] Aprovei USDT (100 USDT de allowance)
- [ ] Registrei com meu próprio endereço como sponsor
- [ ] Ativei assinatura de 1 mês
- [ ] Verifico que `isUserRegistered` retorna `true`
- [ ] Verifico que `users` mostra status ativo
- [ ] (Opcional) Registrei segundo usuário para testar comissões
- [ ] (Opcional) Verifiquei contratos no BscScan

---

## 🆘 PROBLEMAS COMUNS

### "Transaction Reverted"
```
✅ Certifique-se de aprovar USDT ANTES de registrar
✅ Use allowance de pelo menos 100 USDT
```

### "Invalid Sponsor"
```
✅ Como primeiro usuário, use SEU PRÓPRIO endereço como sponsor
✅ Próximos usuários devem usar endereço de alguém JÁ REGISTRADO
```

### "Insufficient Balance"
```
✅ Tenha pelo menos 25 USDT
✅ Tenha pelo menos 0.01 BNB para gas
```

---

**Seus contratos estão LIVE e prontos para usar! 🚀**
