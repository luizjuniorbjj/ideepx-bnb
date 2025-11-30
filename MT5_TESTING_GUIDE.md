# 🧪 Guia de Testes - Sistema MT5 Multi-Conta

## 🎯 Objetivo

Testar completamente o sistema MT5 do início ao fim:
1. Instalação do MT5 Terminal
2. Configuração do Python Collector
3. Conexão de conta via Frontend
4. Monitoramento no Dashboard
5. Validação de dados

---

## ✅ TESTE 1: Verificar MT5 Terminal

### 1.1 Verificar se MT5 está instalado

```powershell
# Windows PowerShell
Test-Path "C:\Program Files\MetaTrader 5\terminal64.exe"
```

**Resultado esperado**: `True`

**Se retornar False**:
```bash
# Baixar e instalar MT5
# https://www.metatrader5.com/en/download
```

### 1.2 Abrir MT5 manualmente (teste visual)

1. Menu Iniciar → "MetaTrader 5"
2. MT5 deve abrir uma janela
3. Fechar MT5

**✅ PASSOU**: MT5 abre e fecha normalmente

---

## ✅ TESTE 2: Criar Conta Demo (para testar)

### 2.1 Criar conta demo GMI Markets

**Opção A: Via MT5 Terminal**

1. Abrir MT5
2. **Arquivo** → **Conectar a Conta** → **Abrir conta demo**
3. Selecionar broker: **MetaQuotes Software Corp.** ou **GMI Markets** (se disponível)
4. Preencher formulário:
   - Nome: Seu nome
   - Email: seu@email.com
   - Telefone: seu telefone
   - Tipo de conta: **Standard**
   - Depósito: **$10,000**
   - Moeda: **USD**
5. Clicar **Next**
6. Anotar credenciais:
   - **Login**: 12345678 (exemplo)
   - **Senha**: abc123XYZ (exemplo)
   - **Servidor**: GMI Trading Platform Demo

**Opção B: Via Site (GMI Markets)**

1. Acessar: https://www.gmimarkets.com/
2. Criar conta demo online
3. Receber credenciais por email

### 2.2 Testar login manual

1. Abrir MT5
2. **Arquivo** → **Conectar a Conta**
3. Inserir:
   - Login: (seu login)
   - Senha: (sua senha)
   - Servidor: (seu servidor)
4. Conectar

**✅ PASSOU**: MT5 conecta e mostra saldo

⚠️ **IMPORTANTE**: Anotar essas credenciais, vamos usar no teste frontend!

```
Login: __________________
Senha: __________________
Servidor: ________________
```

---

## ✅ TESTE 3: Python Environment

### 3.1 Criar e ativar venv

```bash
cd C:\ideepx-bnb\mt5-collector

# Criar venv (se não existir)
python -m venv venv

# Ativar
venv\Scripts\activate

# Verificar ativação (deve mostrar (venv) no prompt)
```

**Resultado esperado**:
```
(venv) C:\ideepx-bnb\mt5-collector>
```

### 3.2 Instalar dependências

```bash
pip install -r requirements.txt
```

**Resultado esperado**:
```
Successfully installed MetaTrader5-5.0.45 cryptography-41.0.7 ...
```

### 3.3 Verificar importação

```bash
python -c "import MetaTrader5 as mt5; print('✅ MT5 Version:', mt5.__version__)"
```

**Resultado esperado**:
```
✅ MT5 Version: 5.0.45
```

**✅ PASSOU**: Python environment configurado

---

## ✅ TESTE 4: Conexão MT5 Python

### 4.1 Executar teste de conexão

```bash
cd C:\ideepx-bnb\mt5-collector
python test_mt5_connection.py
```

**Resultado esperado**:
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
   Nome..........: MetaTrader 5
   Conectado.....: False
   Trade Allowed.: True
   ...

✅ TESTE CONCLUÍDO COM SUCESSO!
================================================================================
```

**✅ PASSOU**: Python consegue acessar MT5 Terminal

**Se FALHAR**:
- Verificar se MT5 está instalado
- Fechar todas as janelas do MT5
- Verificar Task Manager (terminar terminal64.exe)

---

## ✅ TESTE 5: Configurar Encryption

### 5.1 Gerar ENCRYPTION_KEY

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**Copiar output** (exemplo):
```
VGhpc0lzQVNhbXBsZUtleUZvclRlc3Rpbmc=
```

### 5.2 Criar .env do collector

```bash
cd C:\ideepx-bnb\mt5-collector
copy .env.example .env
notepad .env
```

**Editar .env**:
```env
NUM_WORKERS=5
COLLECT_INTERVAL=30
DATABASE_URL=file:../backend/prisma/dev.db
ENCRYPTION_KEY=VGhpc0lzQVNhbXBsZUtleUZvclRlc3Rpbmc=  # ← Colar sua key aqui
```

### 5.3 Adicionar no .env do backend

```bash
cd C:\ideepx-bnb\backend
notepad .env
```

**Adicionar linha no final**:
```env
ENCRYPTION_KEY=VGhpc0lzQVNhbXBsZUtleUZvclRlc3Rpbmc=  # ← Mesma key do collector!
```

⚠️ **CRÍTICO**: As duas keys devem ser **IDÊNTICAS**!

**✅ PASSOU**: Encryption configurada

---

## ✅ TESTE 6: Backend e Frontend rodando

### 6.1 Verificar backend

**Terminal 1**:
```bash
cd C:\ideepx-bnb\backend
npm run dev
```

**Aguardar**:
```
[INFO] Server running on port 5001
```

**Testar endpoint**:
```bash
# Outro terminal ou navegador
curl http://localhost:5001/api/health
```

**Resultado esperado**:
```json
{"status":"ok","timestamp":"2025-11-17T...","version":"1.0.0"}
```

### 6.2 Verificar frontend

**Terminal 2**:
```bash
cd C:\ideepx-bnb\frontend
npm run dev
```

**Aguardar**:
```
ready - started server on 0.0.0.0:3000
```

**Testar navegador**:
```
http://localhost:3000
```

**Resultado esperado**: Homepage carrega

**✅ PASSOU**: Backend e Frontend rodando

---

## ✅ TESTE 7: Conectar Carteira (Pré-requisito)

### 7.1 Acessar homepage

```
http://localhost:3000
```

### 7.2 Conectar MetaMask

1. Clicar em **"Connect Wallet"**
2. Selecionar MetaMask
3. Aprovar conexão
4. Verificar endereço aparece no header

**✅ PASSOU**: Carteira conectada

---

## ✅ TESTE 8: Conectar Conta MT5 via Frontend

### 8.1 Acessar página de conexão

```
http://localhost:3000/mt5/connect
```

### 8.2 Preencher formulário

**Dados da conta demo criada no TESTE 2**:

- **Nome da Conta**: Minha Conta GMI Demo
- **Corretora**: GMI Markets
- **Servidor**: GMI Trading Platform Demo
- **Login**: [seu login demo]
- **Senha**: [sua senha demo]
- **Plataforma**: MT5

### 8.3 Clicar "Conectar Conta"

**Resultado esperado**:
```
✅ Conta MT5 conectada com sucesso!
```

**Redirecionamento automático para**: `/mt5/dashboard`

**✅ PASSOU**: Conta conectada e salva no banco

---

## ✅ TESTE 9: Verificar Banco de Dados

### 9.1 Verificar conta no banco

**Opção A: Via Prisma Studio**

```bash
cd C:\ideepx-bnb\backend
npx prisma studio
```

Abre navegador em `http://localhost:5555`

1. Clicar em **TradingAccount**
2. Verificar se aparece sua conta
3. Verificar campos:
   - `status`: PENDING
   - `login`: seu login
   - `server`: seu servidor
   - `balance`: "0" (ainda não coletado)

**Opção B: Via SQLite Browser**

Abrir `C:\ideepx-bnb\backend\prisma\dev.db` com SQLite Browser

**Opção C: Via query SQL**

```bash
cd C:\ideepx-bnb\backend
npx prisma db execute --stdin <<< "SELECT id, login, server, status FROM TradingAccount;"
```

**✅ PASSOU**: Conta aparece no banco com status PENDING

---

## ✅ TESTE 10: Executar Collector (Momento da Verdade!)

### 10.1 Iniciar collector

**Terminal 3** (novo terminal):
```bash
cd C:\ideepx-bnb\mt5-collector
venv\Scripts\activate
python collector_pool.py
```

**Output esperado** (primeiro ciclo):
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
Encontradas 1 contas ativas para processar
Processando 1 contas com 5 workers...

[Worker] Processando conta 12345678@GMI Trading Platform Demo
[Worker] ✅ Conta 12345678@GMI Trading Platform Demo processada com sucesso
✅ Conta [uuid] atualizada: CONNECTED

================================================================================
✅ Ciclo concluído em 3.45s
   - Sucesso: 1/1
   - Falhas: 0/1
================================================================================
⏳ Aguardando 30s até próximo ciclo...
```

**Se aparecer ERRO**:
```
[Worker] ❌ Erro ao processar 12345678@GMI Trading Platform Demo: Login failed
```

**Verificar**:
1. Credenciais corretas?
2. Servidor correto (case-sensitive)?
3. Conta demo ainda ativa?
4. Testar login manual no MT5 novamente

**✅ PASSOU**: Collector conectou e coletou dados com sucesso

### 10.2 Verificar logs

```bash
# Em outro terminal
cd C:\ideepx-bnb\mt5-collector
cat collector.log  # Windows: type collector.log
```

**Verificar linhas**:
```
INFO - ✅ Conta [uuid] atualizada: CONNECTED
```

---

## ✅ TESTE 11: Verificar Dashboard

### 11.1 Acessar dashboard

```
http://localhost:3000/mt5/dashboard
```

**Aguardar 5 segundos** (para garantir que collector terminou)

**Clicar em "Atualizar"** (botão com ícone de refresh)

### 11.2 Verificar dados da conta

**Deve aparecer card com**:

- ✅ **Status**: Badge verde "Conectado"
- ✅ **Nome**: Minha Conta GMI Demo
- ✅ **Broker**: GMI Markets
- ✅ **Login**: seu login @ seu servidor
- ✅ **Saldo**: $10,000.00 (ou valor da sua conta demo)
- ✅ **Equity**: $10,000.00 (ou próximo do saldo)
- ✅ **Trades Abertos**: 0 (se não tiver posições abertas)
- ✅ **P/L Aberto**: $0.00
- ✅ **Margem %**: 0.00% ou vazio
- ✅ **Dia**: $0.00
- ✅ **Semana**: $0.00
- ✅ **Mês**: $0.00
- ✅ **Total**: $0.00 (ou P/L histórico se conta já teve trades)

**Última atualização**: "Xs atrás" (X < 60 segundos)

**✅ PASSOU**: Dados aparecem corretamente no dashboard!

---

## ✅ TESTE 12: Auto-Refresh

### 12.1 Aguardar 30 segundos

Deixar dashboard aberto, **não clicar em nada**.

### 12.2 Verificar atualização automática

Após ~30 segundos:

- ✅ **"Última atualização"** deve mudar (Xs atrás diminui)
- ✅ Badge de loading rápido aparece e desaparece
- ✅ Dados continuam atualizados

**✅ PASSOU**: Auto-refresh funcionando

---

## ✅ TESTE 13: Fazer Trade Demo (Opcional - Teste Avançado)

### 13.1 Abrir MT5 e fazer trade demo

1. Abrir MT5
2. Conectar com sua conta demo
3. Abrir trade:
   - Market Watch → EUR/USD
   - Clique direito → New Order
   - Type: Buy
   - Volume: 0.01
   - Executar

### 13.2 Aguardar collector (30s)

### 13.3 Verificar dashboard

**Deve aparecer**:
- ✅ **Trades Abertos**: 1
- ✅ **P/L Aberto**: $X.XX (positivo ou negativo)

### 13.4 Fechar trade no MT5

Botão direito no trade → Close Order

### 13.5 Aguardar collector (30s)

### 13.6 Verificar dashboard

**Deve aparecer**:
- ✅ **Trades Abertos**: 0
- ✅ **P/L Aberto**: $0.00
- ✅ **Dia**: $X.XX (lucro ou perda do trade)
- ✅ **Total**: $X.XX (acumulado)

**✅ PASSOU**: P/L sendo calculado corretamente!

---

## ✅ TESTE 14: Remover Conta

### 14.1 No dashboard, clicar ícone de lixeira

Botão vermelho com ícone de lixeira ao lado da conta

### 14.2 Confirmar remoção

Popup: "Tem certeza que deseja remover esta conta?"

Clicar **OK**

### 14.3 Verificar resultado

**Dashboard deve**:
- ✅ Mostrar mensagem: "Conta removida com sucesso"
- ✅ Card da conta desaparece
- ✅ Aparecer tela vazia: "Nenhuma conta conectada"

### 14.4 Verificar collector

Logs do collector (próximo ciclo):
```
Encontradas 0 contas ativas para processar
Nenhuma conta ativa para processar
```

**✅ PASSOU**: Conta removida com sucesso

---

## ✅ TESTE 15: Múltiplas Contas (Teste Avançado)

### 15.1 Criar segunda conta demo

Criar outra conta demo (Teste 2), **servidor diferente** se possível:
- GMI Trading Platform Demo (primeira)
- GMIEdge-Live (segunda) - se tiver credenciais

### 15.2 Conectar via frontend

Repetir Teste 8 com as novas credenciais

### 15.3 Verificar dashboard

**Deve aparecer**:
- ✅ 2 cards (uma para cada conta)
- ✅ Cada uma com seus próprios dados
- ✅ Ambas com status "Conectado"

### 15.4 Verificar logs do collector

```
Encontradas 2 contas ativas para processar
Processando 2 contas com 5 workers...
[Worker] Processando conta 12345@GMI Trading Platform Demo
[Worker] Processando conta 67890@GMIEdge-Live
✅ Ciclo concluído em 6.78s
   - Sucesso: 2/2
```

**✅ PASSOU**: Sistema suporta múltiplas contas!

---

## 📊 Checklist Completo

| # | Teste | Status | Tempo |
|---|-------|--------|-------|
| 1 | Verificar MT5 Terminal instalado | ⬜ | 1 min |
| 2 | Criar conta demo | ⬜ | 3 min |
| 3 | Python environment | ⬜ | 2 min |
| 4 | Conexão MT5 Python | ⬜ | 1 min |
| 5 | Configurar Encryption | ⬜ | 2 min |
| 6 | Backend e Frontend rodando | ⬜ | 2 min |
| 7 | Conectar carteira | ⬜ | 1 min |
| 8 | Conectar conta via Frontend | ⬜ | 2 min |
| 9 | Verificar banco de dados | ⬜ | 2 min |
| 10 | Executar Collector | ⬜ | 2 min |
| 11 | Verificar Dashboard | ⬜ | 1 min |
| 12 | Auto-refresh | ⬜ | 1 min |
| 13 | Fazer trade demo (opcional) | ⬜ | 5 min |
| 14 | Remover conta | ⬜ | 1 min |
| 15 | Múltiplas contas (opcional) | ⬜ | 5 min |

**Tempo total**: ~15-30 minutos

---

## 🐛 Troubleshooting Rápido

### Collector não conecta

**Verificar sequência**:
```bash
# 1. MT5 instalado?
Test-Path "C:\Program Files\MetaTrader 5\terminal64.exe"

# 2. Teste Python funcionou?
cd mt5-collector
python test_mt5_connection.py

# 3. ENCRYPTION_KEY igual?
# backend/.env
cat ..\backend\.env | findstr ENCRYPTION_KEY

# mt5-collector/.env
cat .env | findstr ENCRYPTION_KEY

# Devem ser IDÊNTICAS!
```

### Dashboard mostra PENDING sempre

**Causa**: Collector não está rodando ou deu erro

**Solução**:
```bash
# Verificar se collector está rodando
# Deve ter um terminal com:
# ⏳ Aguardando 30s até próximo ciclo...

# Se não estiver, iniciar:
cd mt5-collector
venv\Scripts\activate
python collector_pool.py
```

### Login failed

**Testar manualmente**:
1. Abrir MT5
2. Tentar conectar com mesmas credenciais
3. Se falhar, credenciais estão erradas
4. Se funcionar, verificar nome do servidor (case-sensitive!)

---

## 🎉 Teste Completo Bem-Sucedido!

**Se todos os testes passaram**:

✅ MT5 Terminal instalado e funcionando
✅ Python collector conectando e coletando dados
✅ Frontend conectando contas
✅ Dashboard exibindo dados em tempo real
✅ Auto-refresh funcionando
✅ Múltiplas contas suportadas

**Sistema 100% operacional! 🚀**

---

## 📝 Próximos Passos

1. **Produção**: Configurar collector para rodar como serviço (PM2, systemd)
2. **Monitoramento**: Configurar alertas quando conta desconecta
3. **Backup**: Configurar backup automático do banco de dados
4. **Escalabilidade**: Testar com 10+ contas simultâneas
5. **Integração**: Conectar com sistema de performance fees do iDeepX

---

**Divirta-se testando! 🎮**
