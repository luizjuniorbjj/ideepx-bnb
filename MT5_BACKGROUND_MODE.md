# 🔇 MT5 Background Mode - Modo Invisível

## 🎯 Objetivo

Executar o MT5 Collector em background (invisível) para que o cliente nunca veja o terminal MT5.

---

## ✅ Como Funciona

### 1. Cliente no Dashboard
```
http://localhost:3000/mt5/connect
```

Cliente preenche:
- **Login**: 12345678
- **Senha**: abc123
- **Servidor**: GMI Trading Platform Demo
- **Clica**: "Conectar Conta"

### 2. Backend Salva no Banco
```javascript
// backend/src/routes/mt5.js
POST /api/mt5/connect
```

- Criptografa senha com AES-256
- Salva no banco SQLite:
  - `TradingAccount` (login, server, status: PENDING)
  - `TradingAccountCredential` (senha criptografada)

### 3. Collector Pega do Banco
```python
# mt5-collector/collector_pool.py
A cada 30 segundos:
```

1. Busca contas `PENDING` ou `CONNECTED`
2. Para cada conta:
   - Descriptografa senha
   - Conecta no MT5 (`mt5.login()`)
   - Coleta dados (balance, equity, P/L)
   - Salva no banco
   - Desconecta (`mt5.shutdown()`)

### 4. Dashboard Atualiza Automaticamente
```
http://localhost:3000/mt5/dashboard
Auto-refresh a cada 30s
```

- Status muda: PENDING → CONNECTED
- Dados aparecem: Balance, Equity, P/L

---

## 🔇 MT5 em Background (Invisível)

### ⚠️ Limitação do MT5

**O MetaTrader 5 SEMPRE abre uma janela** quando `mt5.initialize()` é chamado.

Isso é uma limitação da MetaQuotes (empresa do MT5) - não é possível rodar 100% headless.

### ✅ Solução: Minimizar Automaticamente

O collector **minimiza automaticamente** a janela do MT5 para a bandeja do Windows.

**Como funciona:**

```python
# collector_pool.py

def initialize_mt5():
    mt5.initialize(path=MT5_PATH)
    time.sleep(1)  # Aguardar janela abrir
    minimize_mt5_windows()  # Minimiza automaticamente
```

**Usa biblioteca `pywin32`:**
- Detecta janelas do MetaTrader
- Minimiza para bandeja (SW_MINIMIZE)
- Cliente não vê nada!

---

## 📊 Fluxo Completo (Visão do Cliente)

### Cliente Vê:

```
1. Acessa: http://localhost:3000/mt5/connect
2. Preenche: Login, Senha, Servidor
3. Clica: "Conectar Conta"
4. Vê mensagem: "✅ Conta MT5 conectada!"
5. Redirecionado para: /mt5/dashboard
6. Aguarda 30s (collector processa)
7. Vê dados: Balance, Equity, P/L
```

### Cliente NÃO Vê:
- ❌ Terminal MT5 (está minimizado)
- ❌ Python rodando
- ❌ Processos de coleta
- ❌ Conexões/desconexões

---

## 🛠️ Setup do Modo Background

### 1. Instalar pywin32

```bash
cd mt5-collector
venv\Scripts\activate
pip install pywin32
```

**Já incluído em `requirements.txt`!**

### 2. Executar Collector

```bash
python collector_pool.py
```

**Output:**
```
MT5 COLLECTOR - WORKER POOL
Workers: 5
...
✅ 1 janela(s) MT5 minimizada(s)  ← Automático!
```

### 3. Manter Collector Rodando

**Opção A: Terminal em background**
```bash
START-MT5-SYSTEM.bat
```

Abre 3 terminais (Backend, Frontend, Collector) - podem ser minimizados.

**Opção B: Rodar como Serviço Windows (Produção)**

Usar `NSSM` (Non-Sucking Service Manager):

```powershell
# Baixar NSSM: https://nssm.cc/download
nssm install MT5Collector "C:\ideepx-bnb\mt5-collector\venv\Scripts\python.exe" "C:\ideepx-bnb\mt5-collector\collector_pool.py"
nssm start MT5Collector
```

Agora o collector roda como serviço Windows (inicia automaticamente com Windows).

---

## 🔍 Verificar se Está Rodando

### MT5 Collector

```bash
# Ver processo Python
tasklist | findstr python

# Ver logs
type mt5-collector\collector.log
```

### MT5 Terminal

```bash
# Ver processo MT5
tasklist | findstr terminal64
```

**Se aparecer: MT5 está rodando em background!**

---

## 🐛 Troubleshooting

### Janela MT5 não minimiza

**Causa**: `pywin32` não instalado

**Solução**:
```bash
cd mt5-collector
venv\Scripts\activate
pip install pywin32
```

### MT5 aparece toda vez que collector roda

**Normal!** O MT5 abre a janela, mas é minimizado automaticamente após 1 segundo.

Se quiser evitar o "flash" da janela:
- Rodar collector como serviço Windows
- Usar VPS/servidor sem interface gráfica

### Cliente vê terminal MT5

**Causa**: Collector não está rodando ou pywin32 falhou

**Verificar logs**:
```bash
type mt5-collector\collector.log
```

**Deve ter**:
```
✅ 1 janela(s) MT5 minimizada(s)
```

Se não tiver: reinstalar pywin32

---

## 📈 Produção - Rodar 24/7

### Opção 1: Manter Terminal Aberto (Desenvolvimento)

```bash
START-MT5-SYSTEM.bat
# Deixar terminais abertos (minimizados)
```

### Opção 2: Serviço Windows (Produção)

```powershell
# Instalar NSSM
# https://nssm.cc/download

# Instalar serviços
nssm install iDeepXBackend "C:\ideepx-bnb\backend\node.exe" "C:\ideepx-bnb\backend\src\server.js"
nssm install iDeepXFrontend "C:\ideepx-bnb\frontend\node.exe" "C:\ideepx-bnb\frontend\server.js"
nssm install MT5Collector "C:\ideepx-bnb\mt5-collector\venv\Scripts\python.exe" "C:\ideepx-bnb\mt5-collector\collector_pool.py"

# Iniciar serviços
nssm start iDeepXBackend
nssm start iDeepXFrontend
nssm start MT5Collector
```

Agora tudo roda como serviço Windows:
- ✅ Inicia automaticamente com Windows
- ✅ Reinicia automaticamente se cair
- ✅ Roda em background (invisível)

### Opção 3: Docker (Avançado)

Não recomendado para MT5 (precisa de Windows GUI).

---

## ✅ Checklist Final

- [ ] pywin32 instalado (`pip install pywin32`)
- [ ] Collector minimiza MT5 automaticamente
- [ ] Cliente conecta conta via dashboard (/mt5/connect)
- [ ] Dados aparecem em 30s (/mt5/dashboard)
- [ ] Cliente não vê terminal MT5
- [ ] Collector rodando em background (ou como serviço)

---

## 🎉 Resultado Final

**Cliente vê:**
- ✅ Dashboard bonito com dados em tempo real
- ✅ Interface web simples (login, senha, servidor)
- ✅ Métricas atualizadas automaticamente

**Cliente NÃO vê:**
- ❌ Terminal MT5
- ❌ Python
- ❌ Processos técnicos

**Tudo automático e invisível!** 🚀

---

## 📝 Resumo Executivo

```
CLIENTE → Dashboard Web → Conecta conta
   ↓
BACKEND → Salva no banco (criptografado)
   ↓
COLLECTOR → Pega do banco → Login MT5 → Coleta dados → Salva
   ↓
MT5 → Roda em background (minimizado automaticamente)
   ↓
DASHBOARD → Atualiza automaticamente (auto-refresh 30s)
```

**Experiência do cliente: 100% web, zero complexidade técnica!**
