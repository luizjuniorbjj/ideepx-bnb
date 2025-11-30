# 🔑 GUIA DE CREDENCIAIS GMI MARKETS

**Data:** 2025-11-04

---

## 🎯 RESUMO: VOCÊ TEM 2 OPÇÕES

### ✅ OPÇÃO 1: MT5 Conexão Direta (RECOMENDADO - JÁ FUNCIONA!)

**Status:** ✅ **FUNCIONANDO 100%**

**Credenciais (já configuradas):**
```env
MT5_LOGIN=32650015
MT5_PASSWORD=6sU'3Al89qs8
MT5_SERVER=GMI3-Real
```

**O que faz:**
- ✅ Conecta diretamente no MetaTrader5
- ✅ Busca dados da conta (saldo, equity, lucro)
- ✅ Calcula estatísticas mensais (volume, trades)
- ✅ **SEM CUSTOS** - Totalmente gratuito
- ✅ **JÁ TESTADO** - Funcionando no projeto

**Como usar:**
```bash
cd backend
python sync-mt5-real.py
```

**Resultado esperado:**
```
✅ Conectado na conta 32650015 @ GMI3-Real
📊 Saldo: $100,737.46
📈 Volume Mensal: $15,134.37
✅ Banco de dados atualizado com sucesso!
```

**⭐ Use esta opção se:**
- Você só precisa **ler dados** da conta (não fazer trades)
- Você quer integração **simples e direta**
- Você já tem MT5 instalado no servidor

---

### 🔄 OPÇÃO 2: GMI Edge API (ALTERNATIVA)

**Status:** ⚠️ **REQUER CREDENCIAIS SEPARADAS**

**Credenciais necessárias:**
```env
GMI_EDGE_API_URL=https://api.gmimarkets.com
GMI_EDGE_BOT_ID=??? (você precisa obter)
GMI_EDGE_PASSWORD=??? (você precisa obter)
```

**O que faz:**
- ✅ Conecta via REST API HTTP
- ✅ Busca dados da conta
- ✅ **PODE FAZER TRADES** (criar/fechar ordens)
- ✅ Funciona de qualquer lugar (não precisa MT5 instalado)

**⭐ Use esta opção se:**
- Você quer fazer **trading automatizado** (criar/fechar ordens)
- Você quer rodar em servidor **sem MT5**
- Você precisa de **controle remoto** total da conta

---

## 📋 COMO OBTER CREDENCIAIS GMI EDGE API

### Passo 1: Acessar Members Area

**URL:** https://app.gmimarkets.com/account/signin

- Use suas credenciais normais da GMI Markets
- Se não tiver conta, criar uma em: https://gmimarkets.com

### Passo 2: Criar Conta GMI Edge Trading

No painel do Members Area:

1. Procurar por **"GMI Edge"** ou **"API Trading"**
2. Clicar em **"Open GMI Edge Trading Account"**
3. Seguir o processo de abertura de conta

### Passo 3: Obter Credenciais

Após criar a conta GMI Edge:

1. Ir em **"API Credentials"** ou **"Trading API"**
2. Copiar o **BotId** (ex: `gmi_bot_123456`)
3. Copiar o **Password** (ex: `api_pass_xyz789`)

**⚠️ IMPORTANTE:**
- BotId ≠ Número da conta MT5 (32650015)
- Password API ≠ Senha do MT5 (6sU'3Al89qs8)
- São credenciais **completamente diferentes**!

### Passo 4: Configurar no Projeto

**Editar arquivo:** `backend/.env`

```env
GMI_EDGE_BOT_ID=seu_bot_id_aqui
GMI_EDGE_PASSWORD=sua_senha_api_aqui
```

### Passo 5: Testar Conexão

```bash
cd backend
node test-gmi-edge-api.js
```

**Resultado esperado:**
```
✅ Login bem-sucedido!
✅ Saldo: $100,737.46
✅ TODOS OS TESTES PASSARAM!
```

---

## ❓ QUAL USAR: MT5 ou GMI Edge API?

### Use **MT5 Direta** se:
- ✅ Você só precisa **ler dados** (não fazer trades)
- ✅ Você tem MT5 **instalado no servidor**
- ✅ Você quer a **solução mais simples**
- ✅ **JÁ ESTÁ FUNCIONANDO** no seu caso!

### Use **GMI Edge API** se:
- ✅ Você quer **fazer trades automatizados**
- ✅ Você quer rodar **sem MT5 instalado**
- ✅ Você precisa de **controle remoto** da conta
- ✅ Você quer fazer **trading via código**

### Use **AMBOS** se:
- ✅ MT5 para **sincronização de dados** (mais confiável)
- ✅ GMI Edge API para **trading automatizado** (quando necessário)
- ✅ Máxima flexibilidade!

---

## 🔍 DIFERENÇAS TÉCNICAS

| Característica | MT5 Direta | GMI Edge API |
|----------------|------------|--------------|
| **Tipo** | Biblioteca Python | REST API HTTP |
| **Instalação** | Requer MT5 instalado | Não requer MT5 |
| **Credenciais** | Login + Senha MT5 | BotId + Password |
| **Leitura de Dados** | ✅ Sim | ✅ Sim |
| **Criar Ordens** | ❌ Não (apenas leitura) | ✅ Sim |
| **Histórico** | ✅ Completo | ✅ Recente |
| **Custo** | ✅ Grátis | ✅ Grátis |
| **Status no Projeto** | ✅ **FUNCIONANDO** | ⚠️ Requer credenciais |

---

## 🚀 RECOMENDAÇÃO PARA O PROJETO iDeepX

### Para Produção Imediata:

**Use MT5 Direta:**
- ✅ Já está funcionando
- ✅ Credenciais já validadas
- ✅ Zero configuração adicional
- ✅ Atende 100% das necessidades atuais

**Script:** `backend/sync-mt5-real.py`

### Para Futuro (Opcional):

**Adicione GMI Edge API se:**
- Quiser fazer trading automatizado
- Precisar rodar em servidor sem MT5
- Quiser criar bots de trading

**Script:** `backend/test-gmi-edge-api.js`

---

## 🐛 TROUBLESHOOTING

### Erro: "❌ Erro ao fazer login na conta MT5"

**Causa:** Senha do MT5 incorreta ou servidor offline

**Solução:**
1. Verificar senha: `MT5_PASSWORD=6sU'3Al89qs8`
2. Verificar servidor: `MT5_SERVER=GMI3-Real`
3. Testar login manual no MT5

### Erro: "❌ GMI Edge: Erro ao autenticar"

**Causa:** Credenciais GMI Edge não configuradas ou inválidas

**Solução:**
1. Obter credenciais em: https://app.gmimarkets.com
2. Verificar BotId e Password no `.env`
3. Garantir que a conta GMI Edge está ativa

### Erro: "Not authenticated. Call login() first"

**Causa:** Token expirado ou não autenticado

**Solução:**
```javascript
await client.login(); // Autentica antes de usar
```

---

## 📞 SUPORTE

**Problemas com credenciais MT5:**
- Suporte GMI Markets: https://gmimarkets.com/contact
- Verificar no MetaTrader5 se a senha está correta

**Problemas com GMI Edge API:**
- Members Area: https://app.gmimarkets.com
- Suporte técnico da GMI Markets
- Documentação: https://gmimarkets.com/gmi-edge-api-documentation

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Para MT5 Direta (RECOMENDADO):
- [x] Credenciais configuradas no `.env`
- [x] Script Python `sync-mt5-real.py` criado
- [x] Testado e funcionando
- [x] Conecta e busca dados com sucesso
- [ ] Automatizar com cron job (opcional)
- [ ] Integrar no backend Express (opcional)

### Para GMI Edge API (OPCIONAL):
- [ ] Criar conta GMI Edge Trading
- [ ] Obter BotId e Password
- [ ] Configurar no `.env`
- [ ] Testar com `node test-gmi-edge-api.js`
- [ ] Integrar endpoints no backend
- [ ] Criar interface no frontend

---

## 🎯 CONCLUSÃO

**Status atual:**
- ✅ **MT5 Direta está 100% funcional**
- ✅ Conectando na conta `32650015 @ GMI3-Real`
- ✅ Buscando dados: $100k saldo, $15k volume mensal
- ✅ Sincronizando com banco SQLite

**Ação recomendada:**
- ✅ **Continue usando MT5 Direta** (já funciona!)
- ⚠️ GMI Edge API é **opcional** (apenas se quiser fazer trades)

**Você está no caminho certo!** 🚀

---

**Fim do Guia**

_Dúvidas? Consulte GMI_EDGE_API_DOCUMENTATION.md ou MT5_INTEGRATION_PROGRESS.md_
