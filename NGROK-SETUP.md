# 🌐 CONFIGURAÇÃO DO NGROK - iDeepX

## ✅ CONFIGURAÇÃO CORRETA (1 DOMÍNIO)

### Como funciona:
- ✅ **Frontend (porta 5000)** → Exposto via ngrok
- ✅ **Backend (porta 5001)** → Acessível internamente pelo frontend
- ✅ Usuários externos acessam apenas o ngrok do frontend
- ✅ Frontend faz requisições para backend via localhost

---

## 🚀 PASSOS PARA CONFIGURAR

### 1️⃣ Parar todos os túneis ngrok ativos

No terminal onde o ngrok está rodando, pressione:
```
Ctrl + C
```

### 2️⃣ Iniciar apenas 1 túnel ngrok (porta 5000)

Execute este comando:
```bash
ngrok http 5000 --domain=casuistically-wittiest-elizabeth.ngrok-free.dev
```

### 3️⃣ Verificar se está funcionando

Você deve ver algo assim:
```
ngrok

Session Status                online
Account                       [seu-email] (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://casuistically-wittiest-elizabeth.ngrok-free.dev -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**✅ CORRETO:** Apenas 1 linha de "Forwarding"

**❌ ERRADO:** 2 linhas de "Forwarding" com o mesmo domínio

---

## 🧪 TESTAR O ACESSO

### Teste Local (deve funcionar):
```
http://localhost:5000
```

### Teste Ngrok (deve funcionar):
```
https://casuistically-wittiest-elizabeth.ngrok-free.dev
```

### Console do Navegador:
Abra o console (F12) e verifique:
- ✅ Não deve haver erros de API
- ✅ Requisições devem ir para `http://localhost:5001/api`

---

## 🔧 ARQUITETURA

```
┌─────────────────────────────────────────────────┐
│  USUÁRIO EXTERNO                                │
│  (Qualquer lugar do mundo)                      │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│  NGROK                                          │
│  https://casuistically-wittiest-elizabeth...    │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTP
                   ▼
┌─────────────────────────────────────────────────┐
│  SEU COMPUTADOR                                 │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ FRONTEND (porta 5000)                  │    │
│  │ Next.js                                │    │
│  └─────────────┬──────────────────────────┘    │
│                │                                 │
│                │ localhost:5001/api              │
│                ▼                                 │
│  ┌────────────────────────────────────────┐    │
│  │ BACKEND (porta 5001)                   │    │
│  │ Express + Prisma                       │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÃO ATUAL DO PROJETO

**Arquivo:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_PORT=5001
NEXT_PUBLIC_BACKEND_NGROK_URL=
```

**Por que está vazio?**
- Quando vazio, o frontend detecta automaticamente:
  - Se acessado via `localhost` → usa `http://localhost:5001/api`
  - Se acessado via `ngrok` → usa `http://localhost:5001/api` (mesma máquina)

**Lógica no código:** `frontend/lib/api.js` (linhas 9-36)

---

## ❌ ERROS COMUNS

### Erro 1: Dois túneis para o mesmo domínio
```
❌ ERRADO:
Forwarding: https://casuistically-wittiest-elizabeth.ngrok-free.dev -> http://localhost:5001
Forwarding: https://casuistically-wittiest-elizabeth.ngrok-free.dev -> http://localhost:5000
```

**Solução:** Rodar apenas 1 comando ngrok (porta 5000)

### Erro 2: Backend não responde
**Sintoma:** Console mostra erro "Failed to fetch" ou "Network error"

**Solução:**
1. Verificar se backend está rodando: `curl http://localhost:5001/api/health`
2. Verificar se frontend está rodando: `curl http://localhost:5000`

### Erro 3: CORS Error
**Sintoma:** Console mostra "CORS policy blocked"

**Solução:** Backend já está configurado para aceitar localhost. Se aparecer erro, verificar `backend/src/index.js` (configuração do CORS).

---

## 🎯 COMANDOS ÚTEIS

### Verificar portas em uso:
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :5001
```

### Matar processos em portas específicas:
```bash
npx kill-port 5000
npx kill-port 5001
```

### Reiniciar frontend:
```bash
cd frontend
PORT=5000 npm run dev
```

### Reiniciar backend:
```bash
cd backend
npm run dev
```

### Ver logs do ngrok em tempo real:
```
http://127.0.0.1:4040
```

---

## 📞 TROUBLESHOOTING

### Dashboard não carrega via ngrok:

1. **Verificar se ngrok está rodando:**
   - Apenas 1 túnel ativo (porta 5000)

2. **Verificar se serviços estão rodando:**
   ```bash
   curl http://localhost:5000
   curl http://localhost:5001/api/health
   ```

3. **Limpar cache e reiniciar:**
   ```bash
   # Parar tudo
   npx kill-port 5000
   npx kill-port 5001

   # Remover cache do frontend
   cd frontend
   rm -rf .next

   # Reiniciar backend
   cd ../backend
   npm run dev

   # Reiniciar frontend (novo terminal)
   cd ../frontend
   PORT=5000 npm run dev

   # Reiniciar ngrok (novo terminal)
   ngrok http 5000 --domain=casuistically-wittiest-elizabeth.ngrok-free.dev
   ```

4. **Hard refresh no navegador:**
   - Chrome/Edge: `Ctrl + Shift + R`
   - Firefox: `Ctrl + F5`

---

## ✅ CHECKLIST FINAL

Antes de acessar via ngrok, certifique-se:

- [ ] Backend rodando em `http://localhost:5001`
- [ ] Frontend rodando em `http://localhost:5000`
- [ ] Apenas 1 túnel ngrok ativo (porta 5000)
- [ ] `.env.local` configurado corretamente (API_URL vazio)
- [ ] Dashboard funciona em `http://localhost:5000/dashboard`
- [ ] Dashboard funciona via ngrok

---

**Última atualização:** 2025-11-05
