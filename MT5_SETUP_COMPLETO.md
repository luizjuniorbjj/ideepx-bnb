# 🎯 GUIA COMPLETO - CONFIGURAÇÃO MT5 PARA COLETOR

## ❌ PROBLEMA IDENTIFICADO

```
❌ ERRO ao inicializar MT5: (-10005, 'IPC timeout')
```

**Causa:** O MetaTrader 5 não está respondendo às requisições Python.

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ ABRIR O METATRADER 5

**IMPORTANTE:** O MT5 **DEVE ESTAR ABERTO** para o collector funcionar!

1. Abrir: `C:\mt5_terminal1\terminal64.exe`
2. Aguardar carregar completamente
3. **NÃO precisa fazer login em nenhuma conta!**
4. **DEIXAR O MT5 ABERTO** em segundo plano

---

### 2️⃣ HABILITAR "AlgoTrading" (CRÍTICO!)

No MetaTrader 5 aberto:

1. Clicar no menu **"Tools"** (Ferramentas)
2. Clicar em **"Options"** (Opções)
3. Ir na aba **"Expert Advisors"**
4. ✅ **MARCAR:** "Allow automated trading"
5. ✅ **MARCAR:** "Allow DLL imports"
6. Clicar em **OK**

**SEM ISSO, O PYTHON NÃO CONSEGUE CONECTAR!**

---

### 3️⃣ VERIFICAR SE MT5 ESTÁ RESPONDENDO

Execute o script de verificação:

```bash
cd C:\ideepx-bnb\mt5-collector
python test_mt5_disponibilidade.py
```

**Deve retornar:**
```
✅ MT5 está rodando e respondendo!
✅ Versão MT5: 5.xxxx
✅ Pronto para conectar contas!
```

---

### 4️⃣ TESTAR CONEXÃO COM CREDENCIAIS

Após confirmar que MT5 está respondendo:

```bash
cd C:\ideepx-bnb\mt5-collector
python test_connection_doo_prime.py
```

**Deve retornar:**
```
✅ Login realizado com sucesso!
✅ DADOS DA CONTA COLETADOS COM SUCESSO!
💰 Saldo: US$ X.XX
```

---

### 5️⃣ INICIAR COLETOR MULTI-CONTA

Quando tudo estiver funcionando:

```bash
cd C:\ideepx-bnb\mt5-collector
python collect_all_accounts.py
```

---

## 🚨 PROBLEMAS COMUNS

### ❌ "IPC timeout"

**Causa:** MT5 não está aberto ou não tem permissão

**Solução:**
1. Abrir MT5: `C:\mt5_terminal1\terminal64.exe`
2. Habilitar "Allow automated trading" (Tools → Options → Expert Advisors)
3. Deixar MT5 aberto

---

### ❌ "Invalid account"

**Causa:** Credenciais incorretas ou servidor errado

**Solução:**
1. Verificar login: `9941739`
2. Verificar servidor EXATO: `DooTechnology-Live`
3. Verificar senha

---

### ❌ "Not authorized"

**Causa:** Conta bloqueada ou inativa

**Solução:**
1. Fazer login manual no MT5 primeiro
2. Verificar se conta está ativa
3. Contatar corretora se necessário

---

## 🎯 CHECKLIST ANTES DE RODAR

- [ ] MT5 instalado em `C:\mt5_terminal1\terminal64.exe`
- [ ] MT5 **ABERTO** e rodando
- [ ] "Allow automated trading" **HABILITADO**
- [ ] "Allow DLL imports" **HABILITADO**
- [ ] Python 3.12.6 instalado
- [ ] Biblioteca `MetaTrader5` instalada (`pip install MetaTrader5`)
- [ ] Credenciais corretas no banco ou script de teste

---

## 📊 ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────┐
│  MT5 TERMINAL (terminal64.exe)                      │
│  - DEVE ESTAR ABERTO                                │
│  - DEVE TER "AlgoTrading" HABILITADO                │
│  - NÃO PRECISA ESTAR LOGADO                         │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ IPC (Inter-Process Communication)
                        │
┌─────────────────────────────────────────────────────┐
│  PYTHON COLLECTOR (collect_all_accounts.py)         │
│  - Conecta via biblioteca MetaTrader5               │
│  - Faz login programaticamente                      │
│  - Coleta dados                                     │
│  - Desconecta                                       │
└─────────────────────────────────────────────────────┘
                        ▲
                        │
┌─────────────────────────────────────────────────────┐
│  DATABASE (backend/prisma/dev.db)                   │
│  - Armazena credenciais criptografadas              │
│  - Recebe dados coletados                           │
└─────────────────────────────────────────────────────┘
                        ▲
                        │
┌─────────────────────────────────────────────────────┐
│  FRONTEND DASHBOARD                                 │
│  - Exibe dados em tempo real                        │
│  - Atualiza a cada 30s                              │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE COLETA

```
1. Collector busca contas do banco de dados
   ↓
2. Para cada conta:
   - Descriptografa senha
   - mt5.initialize()
   - mt5.login(login, password, server)
   - mt5.account_info() → Pega saldo, equity, etc
   - mt5.positions_get() → Pega trades abertos
   - Atualiza banco de dados
   - mt5.shutdown()
   ↓
3. Aguarda 30 segundos
   ↓
4. Repete (volta ao passo 1)
```

---

## 💡 DICAS

### Para Desenvolvimento:
- Usar intervalo de 30s (configuração padrão)
- Testar com 1-2 contas primeiro
- Monitorar logs do collector

### Para Produção:
- Aumentar intervalo para 60s se tiver >20 contas
- Considerar múltiplas máquinas para >50 contas
- Implementar sistema de alertas
- Backup regular do banco de dados

---

## 🚀 PRÓXIMOS PASSOS

Após confirmar que collector está funcionando:

1. ✅ Conectar 2-3 contas de teste via frontend
2. ✅ Verificar se dados aparecem no dashboard
3. ✅ Monitorar por 5-10 minutos
4. ✅ Validar precisão dos dados
5. ✅ Escalar para mais contas

---

**🎉 Pronto! Agora você tem um sistema completo de coleta multi-conta MT5!**
