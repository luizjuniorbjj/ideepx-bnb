# 🧪 GUIA DE TESTE - LOGIN COM iDeepXCoreV10

**Data:** 2025-11-04
**Contrato:** iDeepXCoreV10 (BSC Testnet)
**20 Carteiras Prontas para Teste**

---

## ✅ PRÉ-REQUISITOS

- ✅ Frontend rodando em `http://localhost:3000`
- ✅ MetaMask instalado no navegador
- ✅ 20 carteiras com subscriptions ativas
- ✅ Contrato V10 deployado: `0x9F8bB784f96ADd0B139e90E652eDe926da3c3653`

---

## 📋 PASSO 1: CONFIGURAR METAMASK (BSC TESTNET)

### **1.1 Adicionar BSC Testnet:**

1. Abra o MetaMask
2. Clique na rede (topo)
3. Clique em "Adicionar rede"
4. Clique em "Adicionar manualmente"
5. Preencha:

```
Nome da Rede: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Símbolo: tBNB
Block Explorer: https://testnet.bscscan.com
```

6. Clique em "Salvar"
7. Selecione "BSC Testnet" como rede ativa

---

## 📋 PASSO 2: IMPORTAR CARTEIRA DE TESTE

### **2.1 Escolher uma carteira:**

Abra o arquivo: `testnet-population-v10-1762234431676.json`

**Carteira de Teste #1 (Recomendada):**
```json
{
  "index": 1,
  "address": "0xA2921d64Cd8C7BC5B4acbC20420238356199f649",
  "privateKey": "0xd84f2e9e47681764aacab3104324596832083e53b4432c4bcc218ae76233e6fe",
  "activatedByAdmin": true,
  "subscribed": true
}
```

### **2.2 Importar no MetaMask:**

1. Abra o MetaMask
2. Clique no ícone de conta (topo direita)
3. Selecione "Importar conta"
4. Selecione "Private Key"
5. Cole a private key:
   ```
   0xd84f2e9e47681764aacab3104324596832083e53b4432c4bcc218ae76233e6fe
   ```
6. Clique em "Importar"

**Conta importada com sucesso!** ✅

---

## 📋 PASSO 3: TESTAR LOGIN NO FRONTEND

### **3.1 Acessar o site:**

1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Página inicial do iDeepX deve aparecer

### **3.2 Conectar carteira:**

1. Clique em **"Conectar Carteira"** (topo direita)
2. Selecione **"MetaMask"**
3. MetaMask vai abrir popup
4. Confirme a conexão
5. Carteira conectada! ✅

Você verá:
- Endereço: `0xA292...f649`
- Rede: BSC Testnet
- Botão muda para seu endereço abreviado

### **3.3 Acessar Dashboard:**

1. Após conectar, você é redirecionado para `/dashboard`
2. OU clique em "Dashboard" no menu

---

## 📊 PASSO 4: VERIFICAR DADOS DO USUÁRIO

### **No Dashboard você deve ver:**

**Status do Usuário:**
- ✅ **Ativo:** true
- ✅ **Max Level:** 1
- ✅ **KYC Status:** 0 (não iniciado)
- ✅ **Subscription:** Ativa até 12/4/2025
- ✅ **Saldo Interno:** $0.00 USDT (sem performance fees creditados ainda)
- ✅ **Saldo USDT:** ~$81 USDT (100 - 19 de subscription)

**Informações do Contrato:**
- ✅ **Solvency Ratio:** ~115% (saudável)
- ✅ **Circuit Breaker:** Inativo
- ✅ **Subscription Fee:** $19 USDT

---

## 🧪 PASSO 5: TESTAR FUNCIONALIDADES

### **5.1 Visualizar Perfil:**

No Dashboard:
- Ver dados da sua conta
- Ver status de subscription
- Ver saldo disponível

### **5.2 Testar USDT (Opcional):**

Se quiser ver saldo USDT:
1. No MetaMask, clique em "Importar tokens"
2. Cole o endereço USDT: `0x8d06e1376F205Ca66E034be72F50c889321110fA`
3. Símbolo: USDT
4. Decimais: 6
5. Adicionar

Você deve ver: **~81 USDT**

### **5.3 Renovar Subscription (Opcional):**

⚠️ **Nota:** Sua subscription já está ativa até 12/4/2025, não precisa renovar agora.

Mas se quiser testar o fluxo:
1. Espere subscription expirar OU
2. Use outra carteira sem subscription

---

## 🎯 RESULTADOS ESPERADOS

### **✅ Sucesso se você vê:**

1. **Conexão MetaMask:**
   - Conectado com sucesso
   - Endereço aparece no topo
   - Rede: BSC Testnet

2. **Dashboard:**
   - Status: Ativo ✅
   - Subscription: Ativa até 12/4/2025 ✅
   - Max Level: 1 ✅
   - Saldo Interno: $0.00 (normal, sem performance fees ainda)

3. **Contrato:**
   - Dados carregam corretamente
   - Sem erros no console
   - Solvency Ratio aparece

### **❌ Problemas comuns:**

**"Falha ao conectar":**
- Verifique se MetaMask está na BSC Testnet (Chain ID 97)
- Verifique se tem tBNB para gas (mínimo 0.001 tBNB)

**"Dados não aparecem":**
- Aguarde 10-15 segundos (refetch automático)
- Recarregue a página (F5)
- Abra o console do navegador (F12) e verifique erros

**"Transaction failed":**
- Verifique saldo de tBNB
- Verifique se está na rede correta

---

## 🔧 DEBUGGING

### **Verificar console do navegador:**

1. Pressione **F12**
2. Vá para a aba "Console"
3. Procure por erros (texto vermelho)

### **Erros comuns:**

**"Chain not configured":**
- Frontend não reconhece BSC Testnet
- Solução: Recarregar página

**"Contract call reverted":**
- Função do contrato falhou
- Ver detalhes no console

**"Insufficient funds":**
- Sem tBNB para gas
- Solução: Pegar mais tBNB no faucet

---

## 📱 OUTRAS CARTEIRAS PARA TESTAR

**Você tem 19 outras carteiras disponíveis!**

Todas no arquivo: `testnet-population-v10-1762234431676.json`

**Carteira #2:**
```
Address: 0x6687f123ec8aC813a38B5B19277f9166a3E7FA04
Private Key: 0xf9a31be189467fa9c10e75823966cb056622737e788d6431747221b2819b8fe2
```

**Carteira #3:**
```
Address: 0x88BF8671cD49b32992cEf3Ca9854ca5bF57bB2dD
Private Key: 0x207830fbdf44f82c4d9a44ba968c51ba9165dc42351340ec43018ffb22d3c4c1
```

... e mais 17 carteiras!

---

## 🎯 PRÓXIMOS PASSOS APÓS LOGIN

Depois de confirmar que o login funciona:

1. **Creditar Performance Fees (Admin):**
   - Usar função `creditPerformance()` como admin
   - Simular ganhos de trading
   - Ver saldo interno aumentar

2. **Testar Saques:**
   - Ir para `/withdraw`
   - Tentar sacar (requer $50 mínimo)
   - Verificar circuit breaker

3. **Testar Renovação de Subscription:**
   - Aguardar expirar ou usar outra carteira
   - Testar fluxo completo de pagamento

4. **Teste de Rede (Network):**
   - Ver estrutura MLM (quando implementado no V10)
   - Visualizar upline/downline

---

## 📊 STATUS ATUAL DO SISTEMA

```
✅ Frontend: Rodando em localhost:3000
✅ Contrato V10: 0x9F8bB784f96ADd0B139e90E652eDe926da3c3653
✅ USDT Mock: 0x8d06e1376F205Ca66E034be72F50c889321110fA
✅ Rede: BSC Testnet (97)
✅ 20 Usuários: Todos ativos e com subscription paga
✅ Saldo total distribuído: 2.000 USDT (100 por carteira)
✅ Receita de subscriptions: $380 (20 × $19)
```

---

## 🆘 SUPORTE

**Se encontrar problemas:**

1. Verificar console do navegador (F12)
2. Verificar rede no MetaMask (deve ser BSC Testnet)
3. Verificar saldo de tBNB (mínimo 0.001)
4. Recarregar página (F5)
5. Desconectar e reconectar MetaMask

**Logs do servidor:**
- Console onde rodou `npm run dev`
- Erros aparecem em tempo real

---

## 🎉 TESTE COMPLETO!

Se você conseguiu:
- ✅ Importar carteira no MetaMask
- ✅ Conectar no frontend
- ✅ Ver dados do usuário no Dashboard
- ✅ Verificar subscription ativa

**Parabéns! O sistema está funcionando! 🚀**

---

**Arquivos de referência:**
- JSON com carteiras: `testnet-population-v10-1762234431676.json`
- Contrato: `contracts/iDeepXCoreV10.sol`
- ABI: `iDeepXCoreV10_abi.json`
- Frontend config: `frontend/.env.local`
