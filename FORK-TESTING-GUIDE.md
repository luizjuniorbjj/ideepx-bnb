# 🚀 GUIA COMPLETO - TESTANDO COM FORK DA BSC MAINNET

**Última atualização:** 2025-11-03

---

## 🎯 O QUE É ISSO?

Este guia te ensina a **testar seu contrato REAL da mainnet LOCALMENTE**, sem gastar NADA de gas!

**Como funciona:**
- ✅ Hardhat cria uma cópia EXATA da BSC Mainnet no seu PC
- ✅ Seu contrato (0xA64bD...) está lá, funcionando
- ✅ USDT real está lá
- ✅ Mas tudo é LOCAL = SEM CUSTOS!
- ✅ Frontend funciona normalmente conectando no localhost

**Vantagens:**
- 💰 **100% GRÁTIS** - Zero custos de gas
- ⚡ **RÁPIDO** - Transações instantâneas
- 🔄 **RESETÁVEL** - Deu ruim? Restart e começa de novo
- 🎯 **REALISTA** - Testa com dados REAIS da mainnet
- 🛡️ **SEGURO** - Não afeta a mainnet de verdade

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ Node.js instalado (v18+)
- ✅ MetaMask instalado no navegador
- ✅ Projeto iDeepX clonado
- ✅ Dependências instaladas (`npm install`)

---

## 🚀 PASSO A PASSO COMPLETO

### **PASSO 1: Configurar o Frontend para Fork Local**

```bash
# 1. Vá para a pasta frontend
cd C:\ideepx-bnb\frontend

# 2. Copie o arquivo de configuração do fork
cp .env.local.fork .env.local

# 3. Verifique se o arquivo foi criado
ls -la .env.local
```

**O que isso faz:**
- Configura o frontend para conectar em `http://localhost:8545`
- Usa Chain ID `31337` (Hardhat local)
- Mantém os mesmos endereços de contrato (porque é um fork!)

---

### **PASSO 2: Subir o Fork da BSC Mainnet**

```bash
# 1. Volte para a pasta raiz
cd C:\ideepx-bnb

# 2. Suba o fork da mainnet
npx hardhat node
```

**O que você vai ver:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

... (mais 98 contas)
```

**⚠️ IMPORTANTE:**
- **DEIXE ESTE TERMINAL ABERTO** - O fork está rodando aqui
- Você verá logs de cada transação que fizer
- Para parar: `Ctrl + C`

---

### **PASSO 3: Configurar MetaMask**

#### **3.1. Adicionar a rede Hardhat Fork no MetaMask:**

1. Abra MetaMask
2. Clique na rede atual (topo)
3. Clique em "Adicionar rede"
4. Clique em "Adicionar rede manualmente"
5. Preencha:
   ```
   Nome da rede: Hardhat Fork (BSC Mainnet)
   URL RPC: http://127.0.0.1:8545
   ID da cadeia: 31337
   Símbolo da moeda: BNB
   URL do explorador de bloco: (deixe em branco)
   ```
6. Clique em "Salvar"

#### **3.2. Importar conta de teste no MetaMask:**

1. No MetaMask, clique no ícone da conta
2. Selecione "Importar conta"
3. Cole a chave privada da Account #0:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Clique em "Importar"
5. **Opcional:** Renomeie para "Hardhat Test 1"

**Repita para mais contas se quiser:**
- Account #1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Account #2: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

---

### **PASSO 4: Rodar o Frontend**

```bash
# Em um NOVO terminal (deixe o fork rodando no outro)

# 1. Vá para a pasta frontend
cd C:\ideepx-bnb\frontend

# 2. Rode o servidor de desenvolvimento
npm run dev -- -p 3005
```

**O que você vai ver:**
```
✓ Ready in 2.5s
○ Local:        http://localhost:3005
○ Network:      http://192.168.x.x:3005
```

**Acesse:** http://localhost:3005

---

### **PASSO 5: Conectar e Testar!**

1. **Abra o navegador em:** http://localhost:3005

2. **Conecte a carteira:**
   - Clique em "Conectar Carteira"
   - Selecione MetaMask
   - **IMPORTANTE:** Selecione a rede "Hardhat Fork (BSC Mainnet)"
   - Selecione a conta "Hardhat Test 1"
   - Aprove a conexão

3. **Você está conectado!**
   - Frontend mostra seus dados
   - Contrato é o REAL (0xA64bD...)
   - Mas tudo é local!

---

## 🧪 TESTANDO FUNCIONALIDADES

### **Opção A: Teste Manual (via Frontend)**

**1. Dashboard:**
- Vá para `/dashboard`
- Veja seus dados (se já registrado na mainnet, aparecerão aqui!)

**2. Registrar novo usuário:**
- Se não estiver registrado, clique em "Registrar"
- Use Account #0 como sponsor (ou deixe ZeroAddress)

**3. Assinar:**
- **PROBLEMA:** Você não tem USDT ainda!
- **SOLUÇÃO:** Use o script de teste (próxima seção)

### **Opção B: Teste Automatizado (Recomendado) ⭐**

Em um terceiro terminal:

```bash
# 1. Volte para a pasta raiz
cd C:\ideepx-bnb

# 2. Execute o teste completo
npx hardhat run scripts/test-fork-mainnet.js --network localhost
```

**O que esse script faz:**
1. ✅ Conecta no fork local
2. ✅ Pega USDT de uma "whale" (conta com muito USDT)
3. ✅ Distribui para 10 usuários de teste
4. ✅ Registra todos em cadeia (10 níveis MLM)
5. ✅ Ativa assinaturas
6. ✅ Processa performance fees ($1000)
7. ✅ Distribui MLM para todos os níveis
8. ✅ Testa saques
9. ✅ Testa renovações
10. ✅ Testa funções admin

**Tempo de execução:** ~2-3 minutos

### **Opção C: Smoke Test (Teste Rápido)**

```bash
# Teste rápido (30 segundos)
npx hardhat run scripts/smoke-test.js --network localhost
```

**O que testa:**
- ✅ Conexão com contrato
- ✅ Estado inicial
- ✅ Distribuição de USDT
- ✅ Registro
- ✅ Assinatura

---

## 🔄 FLUXO COMPLETO DE TRABALHO

**Recomendação para desenvolvimento:**

```
Terminal 1: Fork rodando
cd C:\ideepx-bnb
npx hardhat node

Terminal 2: Frontend rodando
cd C:\ideepx-bnb\frontend
npm run dev -- -p 3005

Terminal 3: Testes e experimentos
cd C:\ideepx-bnb
npx hardhat run scripts/test-fork-mainnet.js --network localhost
```

---

## 🐛 PROBLEMAS COMUNS

### **1. "Error: could not detect network"**

**Causa:** Fork não está rodando ou MetaMask não conectou

**Solução:**
```bash
# Verifique se o fork está rodando
# Deve ter um terminal com "Started HTTP and WebSocket JSON-RPC server"

# Se não tiver, rode:
npx hardhat node
```

### **2. "Insufficient funds for gas"**

**Causa:** Conta não tem BNB para pagar gas

**Solução:**
```bash
# As contas do Hardhat já vêm com 10,000 BNB!
# Certifique-se de estar usando uma das contas do Hardhat
# Exemplo: Account #0 (0xf39Fd...)
```

### **3. "User already registered"**

**Causa:** No fork, o contrato tem o estado REAL da mainnet

**Solução:**
```bash
# Reinicie o fork para limpar o estado
# Terminal 1: Ctrl + C (para o fork)
# Terminal 1: npx hardhat node (reinicia)
```

### **4. Frontend não conecta**

**Causa:** Variável de ambiente não configurada

**Solução:**
```bash
cd frontend

# Verifique se .env.local existe e tem NEXT_PUBLIC_USE_FORK=true
cat .env.local | grep USE_FORK

# Se não aparecer, copie o arquivo:
cp .env.local.fork .env.local

# Reinicie o frontend
npm run dev -- -p 3005
```

### **5. "Cannot find module"**

**Causa:** Dependências não instaladas

**Solução:**
```bash
# Na pasta raiz
npm install

# Na pasta frontend
cd frontend
npm install
```

---

## 📊 VERIFICANDO SE ESTÁ FUNCIONANDO

### **Checklist:**

1. ✅ **Fork rodando:**
   - Terminal mostra "Started HTTP and WebSocket JSON-RPC server"
   - Porta 8545 aberta

2. ✅ **Frontend rodando:**
   - Terminal mostra "Ready in X.Xs"
   - Acessa http://localhost:3005

3. ✅ **MetaMask conectado:**
   - Rede: "Hardhat Fork (BSC Mainnet)"
   - Chain ID: 31337
   - Conta importada com saldo de BNB

4. ✅ **Contrato acessível:**
   - Dashboard mostra dados
   - Não dá erro de conexão

### **Teste Final:**

```bash
# Execute o smoke test
npx hardhat run scripts/smoke-test.js --network localhost

# Deve mostrar:
# ✅ Conectado ao contrato
# ✅ Estado do contrato
# ✅ USDT distribuído
# ✅ Registro funcionando
# ✅ Assinatura funcionando
# 🎉 Teste concluído!
```

---

## 🎓 DICAS AVANÇADAS

### **1. Resetar o Fork Rapidamente**

```bash
# Terminal 1 (fork):
Ctrl + C
npx hardhat node
```

### **2. Ver Logs Detalhados**

```bash
# No terminal do fork, você vê TODAS as transações:
# - Registros
# - Assinaturas
# - Distribuições MLM
# - Saques
# - Etc.
```

### **3. Testar Cenários Específicos**

**Exemplo: Testar saque parcial**

```javascript
// Crie scripts/test-partial-withdrawal.js
import hre from "hardhat";
const { ethers } = hre;

// ... código para testar saque parcial
```

### **4. Usar Console do Hardhat**

```bash
# Interagir manualmente com o contrato
npx hardhat console --network localhost

# Dentro do console:
const contract = await ethers.getContractAt("iDeepXDistributionV2", "0xA64bD...")
const totalUsers = await contract.totalUsers()
console.log(totalUsers.toString())
```

---

## 🔄 VOLTAR PARA MAINNET

Quando terminar os testes e quiser voltar para mainnet:

```bash
cd frontend

# Opção 1: Copiar config de produção
cp .env.local.production .env.local

# Opção 2: Editar manualmente
# Mude NEXT_PUBLIC_USE_FORK=false no .env.local

# Reinicie o frontend
npm run dev -- -p 3005
```

**No MetaMask:**
- Mude a rede de volta para "BSC Mainnet"
- Use sua carteira real (não as de teste)

---

## 📚 ARQUIVOS IMPORTANTES

```
C:\ideepx-bnb\
├── hardhat.config.js                    ← Fork ATIVADO (linha 84-89)
├── scripts/
│   ├── test-fork-mainnet.js             ← Teste completo (2-3 min)
│   └── smoke-test.js                    ← Teste rápido (30 seg)
├── frontend/
│   ├── .env.local                       ← Config atual (copiar do .fork)
│   ├── .env.local.fork                  ← Config para fork
│   ├── .env.local.production            ← Config para mainnet
│   └── config/wagmi.ts                  ← Chain customizada (linha 6-22)
└── FORK-TESTING-GUIDE.md                ← Este arquivo
```

---

## ❓ FAQ

**P: É seguro usar as chaves privadas do Hardhat?**
R: SIM! São chaves de TESTE conhecidas publicamente. NUNCA use em mainnet real.

**P: Posso quebrar algo na mainnet?**
R: NÃO! Tudo é local. A mainnet não é afetada.

**P: Quanto custa testar?**
R: ZERO! Tudo é grátis e local.

**P: Posso testar com usuários reais da mainnet?**
R: SIM! O fork copia o estado real. Se há usuários na mainnet, estarão no fork.

**P: Como adiciono mais USDT para testes?**
R: O script `test-fork-mainnet.js` já faz isso, pegando de uma "whale".

**P: Posso fazer múltiplos testes?**
R: SIM! Restart do fork (`Ctrl+C` e `npx hardhat node` de novo).

---

## 🎉 CONCLUSÃO

Agora você pode:

✅ Testar seu contrato REAL localmente
✅ Sem gastar NADA de gas
✅ Com máximo realismo (fork da mainnet)
✅ Frontend funcionando perfeitamente
✅ Testes automatizados prontos
✅ Desenvolvimento rápido e seguro

**Próximos passos:**

1. Teste todas as funcionalidades
2. Identifique problemas
3. Corrija no código
4. Deploy quando tudo estiver perfeito!

---

**Dúvidas?** Veja os arquivos de script (`test-fork-mainnet.js`) para exemplos práticos!

**Boa sorte nos testes! 🚀**
