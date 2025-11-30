# 🧪 GUIA DE TESTE - CONEXÃO GMI NO DASHBOARD

## ✅ LOGS COMPLETOS ADICIONADOS

Adicionei logs em **TODA A CADEIA** de conexão:
- ✅ Página `/gmi-hedge`
- ✅ Componente `MT5DetailedStats`
- ✅ Hook `useGMIData`
- ✅ Backend já tinha logs

---

## 🎯 PASSO A PASSO PARA TESTAR

### 1. Abra o Console do Navegador (F12)

Antes de começar, abra o console para ver TODOS os logs.

### 2. Acesse o Dashboard

```
http://localhost:5000/dashboard
```
ou via ngrok

### 3. Conecte a Carteira MetaMask

- Clique no botão "Conectar Carteira"
- Aprove no MetaMask
- **Verifique no console:** Deve aparecer `Wallet Connected: true`

### 4. Acesse a Página GMI Edge

No dashboard, clique no botão **"GMI Edge"** que leva para `/gmi-hedge`

**Console deve mostrar:**
```
📍 [GMI-HEDGE PAGE] Renderizando página
👤 [GMI-HEDGE PAGE] Address: 0x...
🔌 [GMI-HEDGE PAGE] Wallet Connected: true
📊 [GMI-HEDGE PAGE] GMI Data: {...}
✅ [GMI-HEDGE PAGE] GMI Connected: false (antes de conectar)
```

### 5. Preencha o Formulário

```
Número da Conta: 3237386
Senha Mestra: 7oH(y`EGgenX
Servidor: GMI Trading Platform Demo
```

### 6. Clique em "Conectar Conta"

**Console deve mostrar ESTA SEQUÊNCIA:**

```
🚀 [GMI-HEDGE] INICIANDO CONEXÃO...
📋 [GMI-HEDGE] Dados do formulário: {
  accountNumber: "3237386",
  server: "GMI Trading Platform Demo",
  platform: "The Edge",
  address: "0x...",
  passwordLength: 12
}
🌐 [GMI-HEDGE] Chamando API linkGmiAccount...
```

**Aguarde ~2 segundos...**

```
✅ [GMI-HEDGE] API respondeu com sucesso! {...}
🔄 [GMI-HEDGE] Aguardando 2 segundos para recarregar dados...
```

**Mais 2 segundos...**

```
🔃 [GMI-HEDGE] Chamando refetch()...
🎭 [useGMIData] Data fetched in XXms (DATABASE)
✨ [GMI-HEDGE] Refetch executado!
```

**E então o componente deve re-renderizar:**

```
📊 [MT5DetailedStats] Renderizando componente
📊 [MT5DetailedStats] Loading: false
📊 [MT5DetailedStats] Connected: true
📊 [MT5DetailedStats] Balance: 199890.20
📊 [MT5DetailedStats] Equity: 199787.60
```

---

## ❓ O QUE VERIFICAR SE NÃO FUNCIONAR

### Cenário 1: Console mostra "Address: undefined"
**Problema:** Carteira não está conectada
**Solução:** Reconecte a carteira MetaMask

### Cenário 2: API retorna erro 404 "User not found"
**Problema:** Esse endereço de carteira não existe no banco
**Solução:** Execute `node backend/get-users.js` para pegar um endereço válido

### Cenário 3: Console mostra "Connected: false" após refetch
**Problema:** Banco não salvou `connected: true`
**Solução:** Cole aqui o console COMPLETO para análise

### Cenário 4: Balance fica em 0
**Problema:** Dados não foram buscados corretamente
**Solução:** Verifique se o console mostra `source: 'database'` ou `source: 'mock'`

---

## 📊 DADOS ESPERADOS

Quando funcionar, você deve ver na tela:

**Saldo:** $199,890.20
**Equity:** $199,787.60
**Volume Mensal:** (valor da conta)
**Taxa de Acerto:** ~60%
**Número da Conta:** 3237386

---

## 🚨 SE AINDA NÃO FUNCIONAR

Cole aqui NO CHAT:

1. **TODO o console** (copie e cole)
2. **Screenshot da tela** `/gmi-hedge` após tentar conectar
3. **Confirme:** Qual endereço de carteira você usou?

Com essas informações vou identificar EXATAMENTE onde está falhando!

---

## 📝 RESUMO DO QUE FIZ

✅ Adicionei logs em:
- `frontend/app/gmi-hedge/page.tsx` - Página principal
- `frontend/components/MT5DetailedStats.tsx` - Componente de estatísticas
- `frontend/hooks/useGMIData.ts` - Hook já tinha logs

✅ Aumentei timeout de refetch para 2 segundos

✅ Adicionei logs de:
- Address da carteira
- Dados do formulário
- Resposta da API
- Dados carregados
- Estado de conexão

**AGORA É SÓ TESTAR E ME REPORTAR O RESULTADO! 🚀**
