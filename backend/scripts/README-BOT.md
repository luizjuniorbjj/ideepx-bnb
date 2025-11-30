# 🤖 BOT DE SIMULAÇÃO MLM - iDeepX

Bot automatizado para simular atividade realista no contrato MLM em testnet.

---

## 📋 O QUE O BOT FAZ?

O bot simula o comportamento de múltiplos usuários reais:

1. ✅ **Cria carteiras** automaticamente
2. ✅ **Envia BNB** para gas de cada usuário
3. ✅ **Minta USDT** para cada usuário (MockUSDT)
4. ✅ **Registra usuários** no contrato (`selfRegister`)
5. ✅ **Ativa assinaturas** (`selfSubscribe` com $29 USDT)
6. ✅ **Distribui inteligentemente** na rede MLM (evita concentração)
7. ✅ **Simula usuários inativos** (apenas registrados, não ativados)
8. ✅ **Gera relatórios** detalhados
9. ✅ **Salva progresso** (pode retomar se parar)

---

## ⚙️ CONFIGURAÇÃO

### **1. Pré-requisitos**

- Node.js v18+
- Carteira com BNB suficiente na testnet
- Contratos deployados (MLM + MockUSDT)

### **2. Configurar Private Key**

Edite `backend/.env` e adicione sua private key:

```bash
# ---------- PRIVATE KEYS ----------
# BOT: Private key da carteira com BNB para o bot de simulação
PRIVATE_KEY=sua_private_key_aqui
```

⚠️ **IMPORTANTE:** Esta carteira precisa ter BNB suficiente!

**Cálculo de BNB necessário:**
```
BNB necessário = USERS_TO_CREATE × BNB_FOR_GAS
Exemplo: 50 usuários × 0.01 BNB = 0.5 BNB
```

### **3. Ajustar Configurações (Opcional)**

Edite `backend/scripts/mlm-activity-bot.js` na seção `CONFIG`:

```javascript
const CONFIG = {
  // Quantos usuários criar
  USERS_TO_CREATE: 50,

  // % de usuários que ativam assinatura (0.8 = 80%)
  ACTIVATION_RATE: 0.8,

  // BNB para gas por usuário
  BNB_FOR_GAS: '0.01',

  // Delays (em ms)
  DELAY_BETWEEN_USERS: 3000,      // 3 segundos
  DELAY_BETWEEN_ACTIONS: 1500,    // 1.5 segundos

  // Máximo de filhos diretos por sponsor
  MAX_CHILDREN_PER_SPONSOR: 5,
};
```

---

## 🚀 EXECUTAR O BOT

### **Comando:**

```bash
cd C:\ideepx-bnb\backend
node scripts/mlm-activity-bot.js
```

### **Saída esperada:**

```
🚀 Inicializando Bot de Simulação MLM...
ℹ️  Conectado ao RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
✅ Rede verificada: BSC Testnet (Chain ID: 97)
ℹ️  Deployer: 0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2
ℹ️  Saldo BNB: 0.618 BNB
ℹ️  MLM Contract: 0x30aa684Bf585380BFe460ce7d7A90085339f18Ef
ℹ️  USDT Contract: 0x6B38Da364B41880fc20B8eF88E7045AC4AAd2cdA
✅ Inicialização completa!

🤖 Iniciando criação de 50 usuários...

============================================================
PROCESSANDO USUÁRIO 1/50
============================================================

📝 Criando usuário #1...
   Endereço: 0x1234...
   ✅ BNB enviado
   ✅ USDT mintado
   ✅ Usuário #1 criado com sucesso!

📋 Registrando usuário 0x1234...
   Sponsor: 0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2
   ✅ Registrado! Gas usado: 123456
   TX: 0xabcd...

💳 Ativando assinatura para 0x1234...
   ✅ USDT aprovado
   ✅ Assinatura ativada! Gas usado: 234567
   TX: 0xef12...

⏳ Aguardando 3000ms antes do próximo usuário...
```

---

## 📊 RELATÓRIO FINAL

Ao finalizar, o bot exibe um relatório completo:

```
============================================================
🎉 BOT FINALIZADO COM SUCESSO!
============================================================

📊 RELATÓRIO FINAL:

   ✅ Usuários criados: 50
   ✅ Usuários registrados: 50
   ✅ Usuários ativados: 40
   ⏱️ Duração: 15m 30s

📁 Arquivos gerados:
   - mlm-bot-progress.json (dados dos usuários)
   - mlm-bot-activity.log (log completo)

🔗 Verificar no BSCScan:
   https://testnet.bscscan.com/address/0x30aa684Bf585380BFe460ce7d7A90085339f18Ef
```

---

## 📁 ARQUIVOS GERADOS

### **1. `mlm-bot-progress.json`**

Contém todos os dados dos usuários criados:

```json
{
  "config": {...},
  "users": [
    {
      "index": 1,
      "address": "0x1234...",
      "privateKey": "0xabcd...",
      "registered": true,
      "activated": true,
      "sponsor": "0xEB24...",
      "children": ["0x5678...", "0x9abc..."]
    }
  ],
  "stats": {
    "usersCreated": 50,
    "usersRegistered": 50,
    "usersActivated": 40,
    "errors": []
  }
}
```

### **2. `mlm-bot-activity.log`**

Log completo de todas as ações:

```
[2025-11-05T10:30:00.000Z] 🚀 Inicializando Bot de Simulação MLM...
[2025-11-05T10:30:01.234Z] ✅ Rede verificada: BSC Testnet (Chain ID: 97)
[2025-11-05T10:30:02.456Z] 📝 Criando usuário #1...
[2025-11-05T10:30:03.678Z] ✅ Usuário #1 criado com sucesso!
...
```

---

## 🔄 RETOMAR PROGRESSO

Se o bot parar (erro, CTRL+C, etc), execute novamente:

```bash
node scripts/mlm-activity-bot.js
```

O bot **carrega automaticamente** o arquivo `mlm-bot-progress.json` e continua de onde parou!

```
✅ Progresso carregado: 25 usuários existentes
🤖 Continuando criação de usuários...
```

---

## 🎯 CASOS DE USO

### **1. Teste de Carga (50 usuários)**

```javascript
USERS_TO_CREATE: 50,
ACTIVATION_RATE: 0.8,  // 80% ativam
DELAY_BETWEEN_USERS: 3000
```

**Resultado esperado:**
- 50 usuários criados
- 40 ativados (80%)
- 10 inativos (20%)
- Duração: ~15-20 minutos

---

### **2. Teste Rápido (10 usuários)**

```javascript
USERS_TO_CREATE: 10,
ACTIVATION_RATE: 1.0,  // 100% ativam
DELAY_BETWEEN_USERS: 1000
```

**Resultado esperado:**
- 10 usuários criados e ativados
- Duração: ~2-3 minutos

---

### **3. Simulação Realista (100 usuários)**

```javascript
USERS_TO_CREATE: 100,
ACTIVATION_RATE: 0.7,  // 70% ativam
DELAY_BETWEEN_USERS: 5000
```

**Resultado esperado:**
- 100 usuários criados
- 70 ativados (70%)
- 30 inativos (30%)
- Duração: ~40-50 minutos

---

## 🛡️ SEGURANÇA

### **Proteções Implementadas:**

✅ **Testnet Only:**
- Bot verifica Chain ID antes de executar
- Se detectar mainnet (Chain ID 56), **para imediatamente**

✅ **Validação de Rede:**
- Verifica se está conectado à BSC Testnet (Chain ID 97)
- Impede execução em rede errada

✅ **Limite de Gas:**
- Gas máximo: 10 gwei
- Impede transações muito caras

✅ **Tratamento de Erros:**
- Captura erros de cada ação
- Salva no relatório
- Continua processamento dos próximos usuários

---

## 🐛 TROUBLESHOOTING

### **Erro: "PRIVATE_KEY não encontrada no .env"**

**Solução:**
```bash
# Edite backend/.env
PRIVATE_KEY=sua_private_key_aqui
```

---

### **Erro: "Insufficient funds for gas"**

**Solução:**
- Sua carteira não tem BNB suficiente
- Obtenha BNB testnet: https://testnet.bnbchain.org/faucet-smart

**Cálculo:**
```
BNB necessário = USERS_TO_CREATE × BNB_FOR_GAS
Exemplo: 50 × 0.01 = 0.5 BNB
```

---

### **Erro: "Network error" ou "Transaction failed"**

**Solução:**
- Verifique conexão com RPC
- Tente RPC alternativo:
  - `https://data-seed-prebsc-1-s2.binance.org:8545/`
  - `https://data-seed-prebsc-2-s1.binance.org:8545/`

---

### **Bot está lento**

**Solução:**
- Reduza delays:
  ```javascript
  DELAY_BETWEEN_USERS: 1000,
  DELAY_BETWEEN_ACTIONS: 500
  ```

---

### **Quer cancelar no meio**

**Solução:**
- Pressione `CTRL+C`
- Progresso será salvo automaticamente
- Execute novamente para continuar

---

## 📈 MONITORAMENTO

### **1. Durante Execução:**

- Acompanhe logs em tempo real no terminal
- Verifique transações no BSCScan testnet

### **2. Após Execução:**

**Verificar contrato:**
```
https://testnet.bscscan.com/address/0x30aa684Bf585380BFe460ce7d7A90085339f18Ef
```

**Verificar usuários criados:**
```bash
# Ler arquivo de progresso
cat backend/scripts/mlm-bot-progress.json
```

**Verificar logs:**
```bash
# Ler arquivo de logs
cat backend/scripts/mlm-bot-activity.log
```

---

## 🎨 PERSONALIZAÇÃO

### **Alterar Taxa de Ativação:**

```javascript
// 100% dos usuários ativam
ACTIVATION_RATE: 1.0,

// 50% dos usuários ativam
ACTIVATION_RATE: 0.5,

// 25% dos usuários ativam
ACTIVATION_RATE: 0.25,
```

---

### **Alterar Velocidade:**

```javascript
// Muito rápido (risco de RPC throttle)
DELAY_BETWEEN_USERS: 500,
DELAY_BETWEEN_ACTIONS: 200,

// Médio (recomendado)
DELAY_BETWEEN_USERS: 3000,
DELAY_BETWEEN_ACTIONS: 1500,

// Lento (mais seguro)
DELAY_BETWEEN_USERS: 10000,
DELAY_BETWEEN_ACTIONS: 5000,
```

---

### **Alterar BNB por Usuário:**

```javascript
// Menos BNB (econômico)
BNB_FOR_GAS: '0.005',

// Médio (recomendado)
BNB_FOR_GAS: '0.01',

// Mais BNB (muito gas)
BNB_FOR_GAS: '0.02',
```

---

## 🎯 PRÓXIMOS PASSOS APÓS EXECUÇÃO

1. **Verificar Usuários:**
   - Abra `mlm-bot-progress.json`
   - Veja endereços e private keys
   - Verifique estrutura MLM

2. **Testar Frontend:**
   - Conecte com carteiras criadas
   - Veja dados no dashboard
   - Teste navegação na rede

3. **Simular Distribuição:**
   - Execute script de batch processing
   - Distribua comissões MLM
   - Verifique saques

4. **Análise de Performance:**
   - Monitore gas usado
   - Verifique tempo de execução
   - Identifique gargalos

---

## 🚨 AVISOS IMPORTANTES

⚠️ **TESTNET ONLY:**
- Bot só funciona em testnet (Chain ID 97)
- Não use em mainnet!

⚠️ **PRIVATE KEYS:**
- Nunca compartilhe private keys
- Salve `mlm-bot-progress.json` com segurança
- Não commite no git (está no .gitignore)

⚠️ **BNB TESTNET:**
- Obtenha BNB grátis no faucet
- https://testnet.bnbchain.org/faucet-smart

---

## 📞 SUPORTE

**Problemas?**
- Verifique logs em `mlm-bot-activity.log`
- Verifique erros em `mlm-bot-progress.json`
- Veja troubleshooting acima

---

**🎉 Boa sorte com os testes!**
