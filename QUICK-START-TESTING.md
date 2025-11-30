# ⚡ Quick Start - Testando Sistema MT5 em 5 Minutos

## 🎯 Teste Completo em 5 Passos

### ✅ Passo 1: Verificar Pré-requisitos (1 min)

**Executar script de verificação:**
```bash
test-mt5-quick.bat
```

**O que verifica:**
- ✅ MT5 Terminal instalado
- ✅ Python instalado
- ✅ Virtual environment criado
- ✅ Dependências instaladas
- ✅ Backend rodando
- ✅ Frontend rodando
- ✅ ENCRYPTION_KEY configurada

**Se ALGO falhar**, o script avisa o que fazer.

---

### ✅ Passo 2: Criar Conta Demo MT5 (2 min)

**Abrir MT5 Terminal:**
1. Menu Iniciar → "MetaTrader 5"
2. **Arquivo** → **Conectar a Conta** → **Abrir conta demo**
3. Preencher:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Tipo: Standard
   - Depósito: $10,000
4. **Next** → Anotar credenciais:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ANOTAR AQUI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Login:    ____________________
Senha:    ____________________
Servidor: ____________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Testar login manual no MT5** (verificar que funciona)

---

### ✅ Passo 3: Iniciar Sistema Completo (30 seg)

**Clicar duas vezes em:**
```
START-MT5-SYSTEM.bat
```

**Isso vai:**
1. Abrir 3 terminais (Backend, Frontend, Collector)
2. Aguardar 5 segundos
3. Abrir navegador em `http://localhost:3000/mt5/dashboard`

**Aguardar mensagem**: "SISTEMA INICIADO!"

---

### ✅ Passo 4: Conectar Conta (1 min)

**No navegador que abriu:**

1. **Conectar carteira** (MetaMask)
   - Se não tiver: usar modo E2E (F12 → Console → `localStorage.setItem('E2E_TESTING', 'true')` → F5)

2. Clicar **"Nova Conta"**

3. Preencher com dados do **Passo 2**:
   - Nome da Conta: Minha Conta Demo
   - Corretora: GMI Markets (ou outra)
   - Servidor: [seu servidor]
   - Login: [seu login]
   - Senha: [sua senha]
   - Plataforma: MT5

4. **Conectar Conta**

**Aguardar mensagem**: "Conta MT5 conectada com sucesso!"

---

### ✅ Passo 5: Verificar Dados (30 seg)

**Dashboard deve mostrar:**

✅ Status: **Conectado** (badge verde)
✅ Saldo: **$10,000.00**
✅ Equity: **$10,000.00**
✅ Trades Abertos: **0**
✅ P/L Aberto: **$0.00**
✅ Última atualização: **Xs atrás**

**Aguardar 30 segundos** → Auto-refresh → "Última atualização" muda

**🎉 FUNCIONOU! Sistema 100% operacional!**

---

## 🐛 Se Algo Deu Errado

### ❌ Dashboard mostra "PENDING"

**Causa**: Collector não conectou

**Verificar terminal "MT5 Collector"**:
- Se mostrar erro de login → Credenciais erradas
- Se mostrar "initialize() failed" → MT5 não instalado
- Se não mostrar nada → Collector não iniciou

**Solução**:
1. Fechar terminal do Collector
2. Abrir novo terminal:
   ```bash
   cd mt5-collector
   venv\Scripts\activate
   python test_mt5_connection.py
   ```
3. Se passar → executar collector:
   ```bash
   python collector_pool.py
   ```

### ❌ Dashboard mostra "ERROR"

**Causa**: Credenciais incorretas ou servidor errado

**Solução**:
1. Testar login manual no MT5 Terminal
2. Se funcionar → Verificar nome EXATO do servidor (case-sensitive)
3. Remover conta no dashboard (lixeira)
4. Reconectar com dados corretos

### ❌ Backend não inicia

**Causa**: Porta 5001 ocupada ou dependências faltando

**Solução**:
```bash
cd backend
npm install
npm run dev
```

### ❌ Frontend não inicia

**Causa**: Porta 3000 ocupada ou dependências faltando

**Solução**:
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Teste Avançado: Fazer Trade Demo

### 1. Abrir Trade no MT5

1. Conectar conta demo no MT5 Terminal
2. Market Watch → EUR/USD → Clique direito → **New Order**
3. Type: **Buy**
4. Volume: **0.01**
5. **Buy** (executar)

### 2. Aguardar Collector (30s)

Verificar terminal "MT5 Collector":
```
[Worker] Processando conta...
✅ Conta atualizada: CONNECTED
```

### 3. Verificar Dashboard

Atualizar página (F5) ou aguardar auto-refresh:

✅ **Trades Abertos**: 1
✅ **P/L Aberto**: $X.XX (verde se positivo, vermelho se negativo)

### 4. Fechar Trade

MT5 → Clique direito no trade → **Close Order**

### 5. Verificar P/L Acumulado

Dashboard após 30s:

✅ **Trades Abertos**: 0
✅ **P/L Aberto**: $0.00
✅ **Dia**: $X.XX (lucro/perda do trade)
✅ **Total**: $X.XX (acumulado)

**🎉 P/L sendo calculado corretamente!**

---

## 📝 Checklist Rápido

- [ ] **1 min** - Executar `test-mt5-quick.bat` (tudo OK?)
- [ ] **2 min** - Criar conta demo MT5 (anotar credenciais)
- [ ] **30 seg** - Executar `START-MT5-SYSTEM.bat`
- [ ] **1 min** - Conectar conta via frontend
- [ ] **30 seg** - Verificar dashboard (dados aparecem?)

**✅ Total: ~5 minutos**

---

## 🔗 Links Úteis

**Dashboard**: http://localhost:3000/mt5/dashboard
**Conectar Conta**: http://localhost:3000/mt5/connect
**Backend Health**: http://localhost:5001/api/health

**Documentação**:
- `MT5_TESTING_GUIDE.md` - Guia completo de testes (15 testes)
- `MT5_INSTALLATION_GUIDE.md` - Instalação detalhada do MT5
- `MT5_SYSTEM_GUIDE.md` - Arquitetura e API completa
- `mt5-collector/README.md` - README do collector

---

## 🚀 Próximos Passos

Após testar com sucesso:

1. **Múltiplas contas**: Conectar 2-3 contas demo
2. **Fazer trades**: Testar cálculo de P/L em tempo real
3. **Monitorar performance**: Deixar rodando por algumas horas
4. **Produção**: Usar credenciais reais (conta live)
5. **Auto-start**: Configurar collector para iniciar com Windows

---

**🎮 Divirta-se testando! Se tudo funcionou, você tem um sistema MT5 multi-conta completo rodando!**
