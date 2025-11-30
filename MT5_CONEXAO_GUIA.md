# Guia de Conexao MT5 - iDeepX

**Data:** 2025-11-26
**Status:** FUNCIONANDO
**Modo:** Carrossel (Multi-Account)

---

## Resumo do Sistema

O sistema de monitoramento MT5 esta 100% funcional, coletando dados em tempo real das contas conectadas.

### Dados Exibidos no Dashboard:
- Saldo (Balance)
- Equity
- Trades Abertos
- P/L Aberto
- Margem %
- P/L Dia, Semana, Mes e Total
- Atualizacao automatica a cada 30 segundos

---

## Pre-Requisitos

### 1. MetaTrader 5 Terminal
- **Instalado em:** `C:\mt5_terminal1\terminal64.exe`
- **Deve estar ABERTO** para o collector funcionar

### 2. Configuracoes do MT5
No MetaTrader 5:
1. Menu **Tools** > **Options**
2. Aba **Expert Advisors**
3. Marcar: **Allow automated trading**
4. Marcar: **Allow DLL imports**
5. Clicar **OK**

---

## Como Conectar uma Conta MT5

### Via Dashboard (Recomendado)

1. Acessar: `http://localhost:3000/mt5`
2. Selecionar a **Corretora** (ex: Doo Prime)
3. Selecionar o **Servidor** (ex: DooTechnology-Live)
4. Inserir o **Login** da conta
5. Inserir a **Senha** da conta
6. Clicar em **Conectar**

### Conta de Teste Funcionando

| Campo | Valor |
|-------|-------|
| Corretora | Doo Prime |
| Servidor | DooTechnology-Live |
| Login | 9942058 |
| Senha | 5cc41!eE |
| Titular | Luiz Carlos Da Silva Junior |

---

## Iniciar o Sistema

### Ordem de Inicializacao:

1. **Abrir MT5 Terminal**
   ```
   C:\mt5_terminal1\terminal64.exe
   ```
   (Deixar aberto em segundo plano)

2. **Iniciar Backend**
   ```powershell
   cd C:\ideepx-bnb\backend
   npm run dev
   ```
   Porta: 5001

3. **Iniciar Frontend**
   ```powershell
   cd C:\ideepx-bnb\frontend
   npm run dev
   ```
   Porta: 3000

4. **Acessar Dashboard**
   ```
   http://localhost:3000/mt5
   ```

---

## Testar Conexao MT5 via Python

### Verificar se MT5 esta respondendo:
```powershell
cd C:\ideepx-bnb\mt5-collector
python test_mt5_disponibilidade.py
```

### Testar conexao com conta especifica:
```powershell
cd C:\ideepx-bnb\mt5-collector
python test_conta_nova.py
```

---

## Arquitetura do Sistema

```
+------------------+     +------------------+     +------------------+
|   MT5 Terminal   | --> |  Python Collector | --> |    Database     |
|  (terminal64.exe)|     |  (MetaTrader5 lib)|     |   (SQLite)      |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
|    Frontend      | <-- |    Backend API   | <-- |   Prisma ORM    |
|  (Next.js:3000)  |     |  (Express:5001)  |     |                 |
+------------------+     +------------------+     +------------------+
```

---

## Brokers Configurados

| Broker | Servidores |
|--------|------------|
| Doo Prime | DooTechnology-Live, DooTechnology-Demo |
| GMI Markets | GMI-Live, GMI-Demo |

### Adicionar Novos Brokers:
Editar e executar: `C:\ideepx-bnb\backend\seed-brokers.cjs`

---

## Troubleshooting

### Erro: IPC Timeout (-10005)
**Causa:** MT5 nao esta aberto ou sem permissao

**Solucao:**
1. Abrir MT5 Terminal
2. Habilitar "Allow automated trading"
3. Deixar MT5 aberto

### Corretoras nao aparecem no dropdown
**Causa:** Tabela Broker vazia

**Solucao:**
```powershell
cd C:\ideepx-bnb\backend
node seed-brokers.cjs
```

### Dashboard nao carrega
**Causa:** Backend ou Frontend nao iniciados

**Solucao:**
1. Verificar se backend esta rodando na porta 5001
2. Verificar se frontend esta rodando na porta 3000

---

## Scripts Uteis

| Script | Descricao |
|--------|-----------|
| `mt5-collector/test_mt5_disponibilidade.py` | Verifica se MT5 responde |
| `mt5-collector/test_conta_nova.py` | Testa conexao com conta Doo Prime |
| `mt5-collector/test_conta_gmi.py` | Testa conexao com conta GMI |
| `mt5-collector/mt5_carrossel.py` | **CARROSSEL** - Coleta multi-conta |
| `backend/seed-brokers.cjs` | Popula brokers no banco |

---

## CARROSSEL - Sistema Multi-Account

### O Problema
O MT5 Terminal permite apenas **UMA sessao ativa por vez**. Se voce tem 10 contas, nao da para coletar dados de todas simultaneamente.

### A Solucao: Carrossel
O script `mt5_carrossel.py` implementa rotacao sequencial:

1. Busca TODAS as contas do backend
2. Para CADA conta:
   - Faz login
   - Coleta dados
   - Envia para backend
   - Passa para proxima
3. Repete o ciclo a cada 60 segundos

### Como Usar

**Modo Ciclo Unico (teste):**
```powershell
cd C:\ideepx-bnb\mt5-collector
python mt5_carrossel.py --once
```

**Modo Loop Continuo (producao):**
```powershell
cd C:\ideepx-bnb\mt5-collector
python mt5_carrossel.py
```

### Configuracoes

No inicio do arquivo `mt5_carrossel.py`:
```python
BACKEND_URL = "http://localhost:5001"
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"
CYCLE_INTERVAL = 60   # segundos entre ciclos
ACCOUNT_DELAY = 5     # segundos entre contas
```

### Contas Cadastradas

| Carteira | Corretora | Login | Titular | Balance |
|----------|-----------|-------|---------|---------|
| 0x75d1...1669 | Doo Prime | 9942058 | Luiz Carlos | $10,311.56 |
| 0xf172...e762 | GMI | 32650016 | Paola Frassinetti | $115,716.62 |

---

## Resultado Final

**Sistema MT5 Carrossel funcionando com:**
- 2 contas conectadas (Doo Prime + GMI)
- Coleta automatica em rotacao
- Cada carteira ve apenas SUA conta no dashboard
- Atualizacao a cada 60 segundos

---

## Proximos Passos (Escala)

Para **centenas de clientes**, considerar:
- **MetaApi Cloud** - Conexao direta sem MT5 Terminal
- Cobra por uso da API (1x/dia = baixo custo)
- Suporta conexoes ilimitadas

---

**Sistema 100% Operacional!**
