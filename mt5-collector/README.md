# 🤖 MT5 Collector - iDeepX

Coletor automático de dados MT5 usando Worker Pool Architecture.

## 📋 Pré-requisitos

### 1. MT5 Terminal Instalado no Windows

⚠️ **IMPORTANTE**: O MetaTrader 5 Terminal precisa estar instalado no Windows!

**Download**: https://www.metatrader5.com/en/download

**Instalação padrão**: `C:\Program Files\MetaTrader 5\`

### 2. Python 3.8+

Verifique: `python --version`

---

## 🚀 Quick Start

### 1. Criar ambiente virtual

```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Testar conexão MT5

```bash
python test_mt5_connection.py
```

**Output esperado:**
```
================================================================================
TESTE DE CONEXÃO MT5 TERMINAL
================================================================================

✅ MetaTrader5 library importada com sucesso
   Versão: 5.0.45

🔄 Tentando inicializar MT5 Terminal...
✅ MT5 Terminal inicializado com sucesso!

📊 INFORMAÇÕES DO TERMINAL:
--------------------------------------------------------------------------------
   Caminho.......: C:\Program Files\MetaTrader 5
   Build.........: 4340
   Empresa.......: MetaQuotes Software Corp.
   ...
```

### 4. Gerar ENCRYPTION_KEY

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**Copiar output** (exemplo: `VGhpc0lzQVNlY3JldEtleUZvckVuY3J5cHRpb24=`)

### 5. Configurar .env

```bash
# Copiar exemplo
copy .env.example .env

# Editar .env e adicionar:
```

**.env:**
```env
NUM_WORKERS=5
COLLECT_INTERVAL=30
DATABASE_URL=file:../backend/prisma/dev.db
ENCRYPTION_KEY=VGhpc0lzQVNlY3JldEtleUZvckVuY3J5cHRpb24=  # ← Sua key aqui
```

⚠️ **CRÍTICO**: A mesma `ENCRYPTION_KEY` deve estar no `.env` do backend!

### 6. Executar collector

```bash
python collector_pool.py
```

**Output esperado:**
```
================================================================================
MT5 COLLECTOR - WORKER POOL
================================================================================
Workers: 5
Intervalo: 30s
Database: ../backend/prisma/dev.db
================================================================================
🚀 Iniciando ciclo de coleta MT5
================================================================================

[Worker] Processando conta 12345@GMI-Live
✅ Conta 12345 atualizada: CONNECTED
...

================================================================================
✅ Ciclo concluído em 15.32s
   - Sucesso: 5/5
   - Falhas: 0/5
================================================================================
⏳ Aguardando 30s até próximo ciclo...
```

---

## 📁 Arquivos

- **collector_pool.py** - Script principal (worker pool)
- **test_mt5_connection.py** - Teste de conexão MT5
- **requirements.txt** - Dependências Python
- **.env.example** - Configuração exemplo
- **.env** - Sua configuração (não commitar!)
- **collector.log** - Logs do collector (gerado automaticamente)

---

## ⚙️ Configurações (.env)

| Variável          | Padrão | Descrição                              |
|-------------------|--------|----------------------------------------|
| NUM_WORKERS       | 5      | Número de workers paralelos (5-10)     |
| COLLECT_INTERVAL  | 30     | Intervalo entre ciclos (segundos)      |
| DATABASE_URL      | file:../backend/prisma/dev.db | Caminho do banco SQLite |
| ENCRYPTION_KEY    | -      | Chave Fernet (obrigatório)             |

---

## 🐛 Troubleshooting

### ❌ "MT5 initialize() failed"

**Solução**: Instalar MT5 Terminal
```
https://www.metatrader5.com/en/download
```

### ❌ "Failed to decrypt password"

**Solução**: ENCRYPTION_KEY diferente entre backend/collector

Verificar:
- `backend/.env` → ENCRYPTION_KEY=...
- `mt5-collector/.env` → ENCRYPTION_KEY=...

Devem ser **IGUAIS**!

### ❌ "Login failed"

**Solução**: Credenciais incorretas ou servidor errado

1. Testar manualmente no MT5 Terminal
2. Verificar nome EXATO do servidor (GMIEdge-Live, não gmiedge-live)
3. Verificar login e senha

### ⚠️ Conta fica em "PENDING"

**Causa**: Collector não está rodando

**Solução**: Iniciar collector
```bash
python collector_pool.py
```

---

## 📊 Como Funciona

```
┌─────────────────────────────────────────────────────┐
│  1. Frontend: Usuário conecta conta                │
│     /mt5/connect → POST /api/mt5/connect            │
│     - Senha criptografada com AES-256               │
│     - Salva no banco (status: PENDING)              │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  2. Collector: A cada 30s                           │
│     - Busca contas PENDING/CONNECTED no banco       │
│     - Divide entre 5 workers (parallel)             │
│     - Cada worker processa sequencialmente          │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  3. Worker: Para cada conta                         │
│     - Descriptografa senha                          │
│     - Login MT5 Terminal                            │
│     - Coleta: Balance, Equity, P/L, etc             │
│     - Calcula P/L (Day/Week/Month/Total)            │
│     - Salva snapshot no banco                       │
│     - Atualiza status (CONNECTED/ERROR)             │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  4. Frontend: Auto-refresh 30s                      │
│     /mt5/dashboard → GET /api/mt5/accounts          │
│     - Exibe dados atualizados                       │
│     - Status: Conectado/Desconectado/Erro           │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Performance

| Contas | Workers | Tempo/Ciclo | Recomendação |
|--------|---------|-------------|--------------|
| 1-50   | 5       | ~10-20s     | ✅ Ideal     |
| 50-200 | 10      | ~30-50s     | ✅ Bom       |
| 200+   | 15-20   | ~60-90s     | ⚠️ Aumentar COLLECT_INTERVAL |

---

## 🔐 Segurança

- ✅ Senhas criptografadas com Fernet (AES-256)
- ✅ Key armazenada em .env (não commitada)
- ✅ Apenas collector tem acesso às senhas descriptografadas
- ✅ MT5 Terminal local (não cloud)

---

## 📚 Documentação Completa

Consulte: `../MT5_SYSTEM_GUIDE.md` e `../MT5_INSTALLATION_GUIDE.md`

---

## 🆘 Suporte

**Logs**: `collector.log`

**Verificar backend rodando**: `http://localhost:5001/api/health`

**Verificar frontend rodando**: `http://localhost:3000/mt5/dashboard`

---

**🎉 Pronto! Seu collector está configurado e rodando.**
