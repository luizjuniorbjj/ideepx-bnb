# 🔍 TESTE DEBUG - Conexão GMI Edge

## 🎯 OBJETIVO

Identificar EXATAMENTE onde o estado `connected` está falhando quando o usuário conecta uma conta GMI Edge.

---

## 🚨 LOGS ADICIONADOS

### Frontend (`frontend/hooks/useGMIData.ts`):
```typescript
// Linha 140-147: Logs dos dados retornados da API
console.log('🔍 [useGMIData] DADOS COMPLETOS RETORNADOS:');
console.log('   - success:', result.success);
console.log('   - connected:', result.connected);
console.log('   - source:', result.source);
console.log('   - account exists:', !!result.account);
console.log('   - account.balance:', result.account?.balance);

// Linha 304-312: Logs quando estado connected muda
console.log('🎁 [useGMIData] Estado connected mudou:');
console.log('   - connected:', data.connected);
console.log('   - source:', data.source);
console.log('   - account exists:', !!data.account);
console.log('   - balance:', data.account?.balance);
```

### Backend (`backend/src/server.js`):
```javascript
// Linha 1222-1231: Debug do que está no banco de dados
console.log('🔍 [GET-GMI] DEBUG BANCO:');
console.log('   - user exists:', !!user);
console.log('   - user.gmiAccount exists:', !!user.gmiAccount);
console.log('   - user.gmiAccount:', user.gmiAccount);
if (user.gmiAccount) {
  console.log('   - user.gmiAccount.connected:', user.gmiAccount.connected);
  console.log('   - user.gmiAccount.accountNumber:', user.gmiAccount.accountNumber);
  console.log('   - user.gmiAccount.balance:', user.gmiAccount.balance);
  console.log('   - user.gmiAccount.equity:', user.gmiAccount.equity);
}

// Linha 1306-1307: Debug quando cai no ELSE (não conectado)
console.log('❌ [GET-GMI] CAIU NO ELSE! Conta desconectada ou inexistente');
console.log('   - Motivo: user.gmiAccount =', !!user.gmiAccount, '&& connected =', user.gmiAccount?.connected);
```

---

## 📝 PROCEDIMENTO DE TESTE

### ✅ PASSO 1: Preparar ambiente

1. **Parar todos os processos Node.js:**
   ```bash
   # No terminal, execute:
   taskkill /F /IM node.exe
   ```

2. **Limpar console:**
   - Feche todos os terminais
   - Abra 2 novos terminais

### ✅ PASSO 2: Iniciar backend com logs

1. **Terminal 1 - Backend:**
   ```bash
   cd C:\ideepx-bnb\backend
   npm run dev
   ```

2. **Aguarde mensagens:**
   ```
   ✅ Database connected
   🚀 Backend server running on port 5001
   ```

3. **Mantenha este terminal VISÍVEL** (lado a lado com o navegador)

### ✅ PASSO 3: Iniciar frontend

1. **Terminal 2 - Frontend:**
   ```bash
   cd C:\ideepx-bnb\frontend
   npm run dev
   ```

2. **Aguarde:**
   ```
   ✓ Ready in X ms
   ✓ Frontend running on port 5000
   ```

### ✅ PASSO 4: Preparar navegador

1. **Abrir Chrome/Edge**
2. **Abrir DevTools (F12)**
3. **Ir para aba "Console"**
4. **Limpar console (Ctrl+L)**
5. **Acessar:** http://localhost:5000/gmi-hedge

### ✅ PASSO 5: Executar teste de conexão

1. **No formulário GMI Edge, preencher:**
   - Número da Conta: `[SUA CONTA]`
   - Senha Mestra: `[SUA SENHA]`
   - Servidor: `GMIEdge-Live` (ou seu servidor)

2. **Clicar em "Conectar Conta"**

3. **OBSERVAR ATENTAMENTE** os logs em:
   - Console do navegador (F12)
   - Terminal do backend

---

## 🔍 O QUE PROCURAR NOS LOGS

### 📊 FLUXO ESPERADO COMPLETO

#### 1. **POST /api/dev/link-gmi** (Backend salva no banco)
```
🔗 [LINK-GMI] Conectando conta 123456 para 0xAbCd...
[GMI] Linking account 123456 for 0xAbCd...
[GMI] Validando credenciais e buscando histórico...
[GMI] ✅ Credenciais válidas! Conta: 123456, Histórico: SIM/NÃO
✅ [LINK-GMI] Salvo! Balance: 1000
[GMI] ✅ Account 123456 linked successfully with REAL data from GMI Edge API
```

#### 2. **Frontend confirma** (Console do navegador)
```
📡 [GMI] Chamando api.linkGmiAccount...
✅ [GMI] Resposta da API: {...}
   - Balance: 1000
   - Equity: 1050
   - Source: gmi-edge-api
⏳ [GMI] Aguardando 2s para banco salvar...
```

#### 3. **Frontend faz refetch** (após 2s)
```
🔃 [GMI] Fazendo refetch de GMI Data...
🔄 [useGMIData] Fetching account data (attempt 1/3)...
```

#### 4. **GET /api/dev/gmi/account/:address** (Backend lê do banco)
```
🔍 [GET-GMI] DEBUG BANCO:
   - user exists: true
   - user.gmiAccount exists: true
   - user.gmiAccount: { id: 1, accountNumber: '123456', connected: true, balance: '1000', equity: '1050', ... }
   - user.gmiAccount.connected: true  👈 DEVE SER TRUE!
   - user.gmiAccount.accountNumber: 123456
   - user.gmiAccount.balance: 1000
   - user.gmiAccount.equity: 1050
✅ [GET-GMI] Conta conectada: 123456
📤 [GET-GMI] Retornando dados: { accountId: '123456', balance: 1000, equity: 1050, source: 'gmi-edge-api' }
```

#### 5. **Frontend recebe dados** (Console do navegador)
```
🔍 [useGMIData] DADOS COMPLETOS RETORNADOS:
   - success: true
   - connected: true  👈 DEVE SER TRUE!
   - source: gmi-edge-api
   - account exists: true
   - account.balance: 1000
📝 [useGMIData] Salvando no estado setData(result)...
✅ [useGMIData] Estado atualizado!
```

#### 6. **Estado React atualiza** (Console do navegador)
```
🎁 [useGMIData] Estado connected mudou:
   - connected: true  👈 DEVE SER TRUE!
   - source: gmi-edge-api
   - account exists: true
   - balance: 1000
```

#### 7. **Componente re-renderiza**
```
✅ [GMI] GMI Data atualizado!
🔃 [GMI] Fazendo refetch de Weekly Profit...
✅ [GMI] Weekly Profit atualizado!
🎉 [GMI] Conexão completa! Dados disponíveis.
```

---

## 🚨 CENÁRIOS DE FALHA POSSÍVEIS

### ❌ CENÁRIO A: Backend não salva `connected: true`
**Sintoma:** No passo 4, você verá:
```
🔍 [GET-GMI] DEBUG BANCO:
   - user.gmiAccount.connected: false  ❌ FALSE!
```

**Causa:** POST /api/dev/link-gmi não está setando `connected: true`
**Solução:** Verificar linha 1541/1556 em `backend/src/server.js`

---

### ❌ CENÁRIO B: Backend retorna `connected: false`
**Sintoma:** No passo 4, você verá:
```
❌ [GET-GMI] CAIU NO ELSE! Conta desconectada ou inexistente
   - Motivo: user.gmiAccount = true && connected = false
```

**Causa:** Campo `connected` no banco está `false` ou `null`
**Solução:** Verificar schema Prisma e banco de dados

---

### ❌ CENÁRIO C: Frontend não recebe `connected: true`
**Sintoma:** No passo 5, você verá:
```
🔍 [useGMIData] DADOS COMPLETOS RETORNADOS:
   - connected: false  ❌ FALSE!
```

**Causa:** Backend não está retornando `connected: true` no JSON
**Solução:** Verificar linha 1252 em `backend/src/server.js`

---

### ❌ CENÁRIO D: Estado React não atualiza
**Sintoma:** No passo 6, você NÃO verá:
```
🎁 [useGMIData] Estado connected mudou:
```

**Causa:** `setData(result)` não está disparando useEffect
**Solução:** Verificar dependências do useEffect linha 304 em `useGMIData.ts`

---

### ❌ CENÁRIO E: Componente não re-renderiza
**Sintoma:** Logs mostram `connected: true`, mas tela mostra formulário

**Causa:** Conditional rendering não está funcionando
**Solução:** Verificar linha 183 em `page.tsx` (`{!connected ? ...}`)

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Ao executar o teste, **copie e cole** os seguintes logs:

### ✅ Log 1: POST /api/dev/link-gmi (Backend)
```
[Cole aqui os logs do terminal do backend quando você clicar em "Conectar"]
```

### ✅ Log 2: Confirmação frontend (Console navegador)
```
[Cole aqui os logs do console do navegador logo após clicar]
```

### ✅ Log 3: GET /api/dev/gmi/account/:address (Backend)
```
[Cole aqui os logs do backend após 2 segundos]
```

### ✅ Log 4: Dados recebidos (Console navegador)
```
[Cole aqui os logs do navegador com "DADOS COMPLETOS RETORNADOS"]
```

### ✅ Log 5: Estado React (Console navegador)
```
[Cole aqui os logs do navegador com "Estado connected mudou"]
```

---

## 🎯 RESULTADO ESPERADO

Após executar o teste:

1. **Todos os logs devem mostrar `connected: true`**
2. **Tela deve mostrar:**
   - Badge "DADOS REAIS" (verde)
   - Conta conectada com número da conta
   - Balance e Equity
   - Botão "Desconectar"
3. **NÃO deve mostrar:**
   - Formulário de conexão
   - Campos em branco

---

## 📞 PRÓXIMOS PASSOS

Após executar o teste:

1. **Copie TODOS os logs** (Backend + Frontend)
2. **Tire uma CAPTURA DE TELA** da página
3. **Me envie:**
   - Logs do backend (terminal)
   - Logs do frontend (console F12)
   - Screenshot da página

Com essas informações, vou identificar EXATAMENTE onde está o problema e corrigi-lo!

---

## 🔧 COMANDOS ÚTEIS

### Reiniciar tudo do zero:
```bash
# Matar todos os Node.js
taskkill /F /IM node.exe

# Limpar cache do Prisma (se necessário)
cd C:\ideepx-bnb\backend
npx prisma generate

# Reiniciar backend
npm run dev

# Em outro terminal
cd C:\ideepx-bnb\frontend
npm run dev
```

### Ver logs em tempo real:
```bash
# Backend
cd C:\ideepx-bnb\backend
npm run dev | findstr "[GMI]"

# Ou filtrar apenas logs críticos
npm run dev | findstr "DEBUG"
```

---

**🚀 BOA SORTE NO TESTE!**

Vamos descobrir exatamente onde está o problema! 💪
