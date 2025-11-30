# 🚀 GUIA RÁPIDO - INICIAR COLETOR MT5

## ✅ PRÉ-REQUISITOS

Antes de rodar o coletor, você precisa:

### 1. MetaTrader 5 Instalado

**Verificar se está instalado:**
- Procurar por "MetaTrader 5" no Menu Iniciar
- Caminho padrão: `C:\Program Files\MetaTrader 5\terminal64.exe`

**Se NÃO estiver instalado:**
1. Baixar de: https://www.metatrader5.com/pt/download
2. Instalar normalmente
3. **NÃO precisa configurar nenhuma conta** (o script faz isso automaticamente)

### 2. Python Instalado

✅ **Você já tem!** (Python 3.12.6)

### 3. Dependências Python

Instalar bibliotecas necessárias:

```bash
# Abrir terminal no diretório mt5-collector
cd C:\ideepx-bnb\mt5-collector

# Instalar dependências
pip install MetaTrader5 cryptography python-dotenv
```

## 🎯 COMO EXECUTAR

### Opção 1: Via Python Direto

```bash
cd C:\ideepx-bnb\mt5-collector
python collect_all_accounts.py
```

### Opção 2: Via Script .BAT (Duplo clique)

Criar arquivo `START-MT5-COLLECTOR.bat` na pasta raiz:

```batch
@echo off
cd mt5-collector
python collect_all_accounts.py
pause
```

Depois é só dar duplo clique no arquivo!

## 📊 O QUE VAI ACONTECER

Quando você executar, o script vai:

1. ✅ Buscar TODAS as contas conectadas no banco
2. ✅ Descriptografar as senhas
3. ✅ Conectar em CADA conta MT5
4. ✅ Coletar dados (saldo, equity, trades abertos, etc)
5. ✅ Atualizar o banco de dados
6. ✅ Repetir a cada 30 segundos

### Output Esperado:

```
================================================================================
🤖 MT5 MULTI-ACCOUNT COLLECTOR
================================================================================
📁 Database: ../backend/prisma/dev.db
🔑 Encryption: Configurada
⏱️  Intervalo: 30s
📍 MT5 Path: C:\Program Files\MetaTrader 5\terminal64.exe
================================================================================


🔄 CICLO #1 - 14:30:15
--------------------------------------------------------------------------------
📋 1 conta(s) encontrada(s)

📊 [Doo Prime] Doo Prime 9941739 (9941739@DooTechnology-Live)
   ✅ Saldo: US$ 10000.00 | Equity: US$ 10250.50 | Trades: 3

📊 Resultados: ✅ 1 sucesso | ❌ 0 erros

⏳ Aguardando 30s até próximo ciclo...
--------------------------------------------------------------------------------
```

## 🔧 AJUSTAR CONFIGURAÇÕES

Editar `collect_all_accounts.py` se necessário:

### Caminho do MT5 (se instalado em local diferente)

```python
MT5_PATH = r"C:\Program Files\MetaTrader 5\terminal64.exe"  # ← Ajustar aqui
```

### Intervalo de Coleta

```python
COLLECT_INTERVAL = 30  # ← Alterar para 15s (mais rápido) ou 60s (mais lento)
```

## ⚠️ PROBLEMAS COMUNS

### ❌ "MT5 initialize() failed"

**Problema:** MetaTrader 5 não instalado ou caminho incorreto

**Solução:**
1. Instalar MT5: https://www.metatrader5.com/pt/download
2. Verificar caminho em `MT5_PATH`
3. Ajustar se necessário

### ❌ "Erro ao connectar: Invalid account"

**Problema:** Credenciais incorretas ou servidor errado

**Solução:**
1. Verificar login/senha no MT5 manualmente
2. Confirmar nome exato do servidor
3. Remover e reconectar conta via frontend

### ❌ "ENCRYPTION_KEY não encontrada"

**Problema:** Arquivo .env não existe ou chave errada

**Solução:**
1. Criar arquivo `mt5-collector/.env`
2. Adicionar: `ENCRYPTION_KEY=ghcrgM0DSS1UMddKSbOLXVXCsgbI4T106KrG5aAfR84=`
3. **DEVE SER A MESMA** chave do `backend/.env`

## 🎯 PRÓXIMOS PASSOS APÓS INICIAR

1. ✅ **Abrir frontend** em http://localhost:3000/mt5
2. ✅ **Aguardar 30s** (primeiro ciclo)
3. ✅ **Atualizar página** - Dados devem aparecer!
4. ✅ **Conectar mais contas** se quiser testar múltiplas contas

## 📈 ESCALABILIDADE

| Contas | Status      |
|--------|-------------|
| 1-5    | ✅ Perfeito |
| 5-20   | ✅ Bom      |
| 20-50  | ⚠️ Ajustar intervalo para 60s |
| 50+    | ⚠️ Considerar múltiplas máquinas |

## 🛑 PARAR O COLETOR

Pressionar `Ctrl+C` no terminal onde está rodando.

---

**🎉 Pronto! Agora é só executar e ver os dados aparecendo em tempo real!**
