# 🧪 GUIA COMPLETO - TESTE DE CONEXÃO GMI EDGE

## ✅ LOGS IMPLEMENTADOS EM TODA A CADEIA

Adicionei logs detalhados em **TODAS** as etapas do fluxo de conexão:

### 📍 Frontend (Navegador - Console F12)
1. ✅ Página `/gmi-hedge` (page.tsx)
   - Log do endereço da carteira
   - Log dos dados do formulário
   - Log da resposta da API
   - Log do refetch()

2. ✅ Componente `MT5DetailedStats`
   - Log dos dados recebidos
   - Log do status de conexão
   - Log de Balance e Equity

3. ✅ Hook `useGMIData`
   - Log do fetch inicial
   - Log do refetch
   - Log dos dados retornados

### 🖥️ Backend (Terminal - nodemon)
1. ✅ POST `/api/dev/link-gmi`
   - Log dos dados recebidos
   - Log do usuário encontrado
   - Log do gmiAccount salvo no banco

2. ✅ GET `/api/dev/gmi/account/:address`
   - Log do address recebido
   - Log do usuário encontrado
   - Log da conta GMI conectada (ou MOCK se não conectada)

---

## 🚀 COMO FAZER O TESTE

### 1️⃣ PREPARAR O AMBIENTE

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
📝 Deixe este terminal VISÍVEL para ver os logs do servidor!

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

### 2️⃣ ABRIR O NAVEGADOR

1. Abra **Chrome/Edge/Firefox**
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. **IMPORTANTE:** Clique com botão direito no console e selecione:
   - ✅ "Preserve log" (para não perder logs ao navegar)
   - ✅ "Show timestamps" (ver horários)

---

### 3️⃣ ACESSAR E CONECTAR CARTEIRA

1. Acesse: `http://localhost:5000/dashboard`
   - OU se estiver usando ngrok: `https://seu-link.ngrok.app/dashboard`

2. Conecte sua carteira MetaMask
   - ⚠️ **ANOTE O ENDEREÇO DA CARTEIRA CONECTADA!**

---

### 4️⃣ IR PARA PÁGINA GMI EDGE

1. Clique no botão **"GMI Edge"** (ou navegue para `/gmi-hedge`)

2. Observe no Console do navegador:
   ```
   📍 [GMI-HEDGE PAGE] Renderizando página
   👤 [GMI-HEDGE PAGE] Address: 0x1234...
   🔌 [GMI-HEDGE PAGE] Wallet Connected: true
   ```

---

### 5️⃣ PREENCHER O FORMULÁRIO

Preencha com os dados da conta DEMO:

```
📋 Conta: 3237386
🔐 Senha: 7oH(y`EGgenX
🌐 Servidor: GMI Trading Platform Demo
📱 Plataforma: MT5
```

**Clique em "Conectar Conta"**

---

### 6️⃣ OBSERVAR OS LOGS

### 🖥️ BACKEND (Terminal do nodemon):

Você DEVE ver algo como:

```bash
🔗 [LINK-GMI] === INICIANDO CONEXÃO DE CONTA GMI ===
📋 [LINK-GMI] Dados recebidos: {
  address: '0x1234...',
  accountNumber: '3237386',
  server: 'GMI Trading Platform Demo',
  platform: 'MT5',
  hasPassword: true,
  passwordLength: 12
}
🔍 [LINK-GMI] Buscando usuário... { addressLower: '0x1234...' }
✅ [LINK-GMI] Usuário encontrado: {
  userId: 1,
  walletAddress: '0x1234...'
}
💾 [LINK-GMI] Salvando gmiAccount no banco... {
  userId: 1,
  accountNumber: '3237386',
  balance: 199890.20,
  equity: 199787.60
}
✅ [LINK-GMI] gmiAccount salvo com sucesso! {
  id: 1,
  userId: 1,
  accountNumber: '3237386',
  connected: true,
  balance: '199890.20',
  equity: '199787.60'
}
```

Depois de 2 segundos, você DEVE ver:

```bash
🔍 [GET-GMI-ACCOUNT] === BUSCANDO DADOS DA CONTA GMI ===
📍 [GET-GMI-ACCOUNT] Address recebido: 0x1234...
🔍 [GET-GMI-ACCOUNT] Buscando user no banco...
✅ [GET-GMI-ACCOUNT] Usuário encontrado: {
  userId: 1,
  walletAddress: '0x1234...',
  hasGmiAccount: true,
  gmiAccountConnected: true
}
✅ [GET-GMI-ACCOUNT] Conta GMI conectada encontrada! {
  accountNumber: '3237386',
  balance: '199890.20',
  equity: '199787.60',
  connected: true
}
```

### 🌐 FRONTEND (Console do Navegador F12):

Você DEVE ver algo como:

```
🚀 [GMI-HEDGE] INICIANDO CONEXÃO...
📋 [GMI-HEDGE] Dados do formulário: {
  accountNumber: '3237386',
  server: 'GMI Trading Platform Demo',
  platform: 'MT5',
  address: '0x1234...',
  passwordLength: 12
}
🌐 [GMI-HEDGE] Chamando API linkGmiAccount...
✅ [GMI-HEDGE] API respondeu com sucesso! { success: true, ... }
🔄 [GMI-HEDGE] Aguardando 2 segundos para recarregar dados...
🔃 [GMI-HEDGE] Chamando refetch()...
✨ [GMI-HEDGE] Refetch executado!

📊 [MT5DetailedStats] Renderizando componente
📊 [MT5DetailedStats] Loading: false
📊 [MT5DetailedStats] Connected: true
📊 [MT5DetailedStats] Balance: 199890.20
📊 [MT5DetailedStats] Equity: 199787.60
```

---

### 7️⃣ VERIFICAR NA TELA

Se tudo funcionou, você DEVE ver na interface:

```
✅ Balance: $199,890.20
✅ Equity: $199,787.60
✅ Número da Conta: 3237386
✅ Nome: Luiz Carlos da Silva Jr (ou Demo Account 3237386)
```

---

## 🚨 SE NÃO FUNCIONAR

### ❌ Cenário 1: Address undefined

Se você ver no console do navegador:
```
👤 [GMI-HEDGE PAGE] Address: undefined
```

**Problema:** Carteira não está conectada corretamente
**Solução:** Reconecte a carteira MetaMask

---

### ❌ Cenário 2: Usuário não encontrado

Se você ver no backend:
```
❌ [LINK-GMI] Usuário não encontrado!
```

**Problema:** O endereço da carteira não está cadastrado no banco
**Solução:**
1. Acesse `/register` e cadastre a carteira primeiro
2. OU use a carteira que você já cadastrou antes

---

### ❌ Cenário 3: Dados não aparecem após conectar

Se o backend diz "salvo com sucesso" mas os dados não aparecem:

**Verifique:**
1. O console do navegador mostra `refetch()` sendo chamado?
2. O backend mostra a requisição GET sendo feita?
3. O GET retorna `connected: true`?

---

### ❌ Cenário 4: Retorna dados MOCK

Se você ver no backend:
```
⚠️ [GET-GMI-ACCOUNT] Nenhuma conta GMI conectada, retornando dados MOCK
🎭 [GET-GMI-ACCOUNT] Dados MOCK gerados: { connected: false, ... }
```

**Problema:** O gmiAccount não foi salvo OU `connected: false`
**Causa possível:**
1. userId diferente entre POST e GET
2. Transação de banco falhou
3. Campo `connected` ficou como `false`

---

## 📋 O QUE ME ENVIAR SE FALHAR

**Copie e cole TUDO (completo!):**

### 1. Console do Navegador (F12)
```
[Cole TODOS os logs do console aqui]
```

### 2. Terminal do Backend
```
[Cole TODOS os logs do nodemon aqui]
```

### 3. Endereço da carteira conectada
```
Endereço: 0x...
```

### 4. Screenshot da tela
- Tire print da página `/gmi-hedge` mostrando o que aparece

---

## ✅ RESULTADO ESPERADO

Se tudo funcionar corretamente:

1. ✅ Backend salva gmiAccount no banco
2. ✅ Frontend chama refetch() após 2s
3. ✅ Backend busca e retorna dados do banco
4. ✅ Frontend atualiza a interface com os dados
5. ✅ Você vê Balance, Equity, Account Number na tela

---

## 🎯 PRÓXIMOS PASSOS

Com os logs completos, vou conseguir identificar **EXATAMENTE** onde está o problema:

- Se o address não está sendo passado
- Se o usuário não está sendo encontrado
- Se o gmiAccount não está sendo salvo
- Se o GET não está buscando corretamente
- Se o frontend não está atualizando

**VAMOS RESOLVER ISSO AGORA! 🚀**
