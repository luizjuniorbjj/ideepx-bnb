# 🔐 GUIA DE AUTENTICAÇÃO MANUAL - GMI EDGE API

Este guia mostra **EXATAMENTE** como o bot está conectando na API GMI.

---

## 📋 INFORMAÇÕES DA CONEXÃO

### Credenciais (do arquivo `.env`)
```
BotId: 3237386
Password: 7oH(y`EGgenX
Server: GMI-Demo
```

### API URL (do arquivo `config.demo.json`)
```
Base URL: https://demo-edge-api.gmimarkets.com:7530/api/v1
```

---

## 🚀 PASSO 1: LOGIN (Obter Token)

### Endpoint
```
POST https://demo-edge-api.gmimarkets.com:7530/api/v1/login
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "BotId": 3237386,
  "Password": "7oH(y`EGgenX"
}
```

### Resposta de Sucesso (200)
```json
{
  "AccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "RefreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ⚠️ IMPORTANTE
- **AccessToken** expira em ~1 hora
- Use o **AccessToken** em todas as requisições subsequentes
- Use o **RefreshToken** para renovar o AccessToken quando expirar

---

## 🔑 PASSO 2: USAR TOKEN NAS REQUISIÇÕES

Todas as requisições após o login devem incluir o header:

```
Authorization: Bearer {AccessToken}
```

---

## 📊 EXEMPLOS DE ENDPOINTS

### 1. Account Info
```
GET https://demo-edge-api.gmimarkets.com:7530/api/v1/accountinfo

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}
```

### 2. Account State (Balance/Equity)
```
GET https://demo-edge-api.gmimarkets.com:7530/api/v1/accountstate

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}
```

### 3. Posições Abertas
```
GET https://demo-edge-api.gmimarkets.com:7530/api/v1/positionlist

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}
```

### 4. Obter Preço de um Símbolo
```
POST https://demo-edge-api.gmimarkets.com:7530/api/v1/price

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}

Body:
{
  "Symbol": "XAUUSD"
}
```

### 5. Enviar Ordem (Market Buy)
```
POST https://demo-edge-api.gmimarkets.com:7530/api/v1/sendorder

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}

Body:
{
  "Symbol": "XAUUSD",
  "OrderSide": "BUY",
  "OrderType": "MARKET",
  "Amount": 0.10,
  "TakeProfit": 2700.00,
  "Comment": "Teste Manual"
}
```

### 6. Fechar Posição
```
POST https://demo-edge-api.gmimarkets.com:7530/api/v1/closeposition

Headers:
  Content-Type: application/json
  Authorization: Bearer {AccessToken}

Body:
{
  "OrderId": 12345678
}
```

---

## 🐍 PYTHON - Exemplo Completo

```python
import requests

# 1. LOGIN
login_url = "https://demo-edge-api.gmimarkets.com:7530/api/v1/login"
login_payload = {
    "BotId": 3237386,
    "Password": "7oH(y`EGgenX"
}

response = requests.post(
    login_url,
    json=login_payload,
    headers={"Content-Type": "application/json"},
    verify=False  # Desabilitar SSL para demo
)

if response.status_code == 200:
    data = response.json()
    access_token = data['AccessToken']
    print(f"✅ Login OK! Token: {access_token[:30]}...")

    # 2. USAR TOKEN
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    # 3. GET ACCOUNT STATE
    state_url = "https://demo-edge-api.gmimarkets.com:7530/api/v1/accountstate"
    state_response = requests.get(state_url, headers=headers, verify=False)

    if state_response.status_code == 200:
        state_data = state_response.json()
        balance = state_data['AccountState']['Balance']
        equity = state_data['AccountState']['Equity']
        print(f"💰 Balance: ${balance:,.2f}")
        print(f"💰 Equity: ${equity:,.2f}")
else:
    print(f"❌ Erro: {response.status_code}")
    print(response.text)
```

---

## 📮 POSTMAN - Guia Passo a Passo

### 1. Criar Nova Request (LOGIN)

**Step 1:** Criar nova request
- Method: `POST`
- URL: `https://demo-edge-api.gmimarkets.com:7530/api/v1/login`

**Step 2:** Configurar Headers
```
Content-Type: application/json
```

**Step 3:** Configurar Body (raw JSON)
```json
{
  "BotId": 3237386,
  "Password": "7oH(y`EGgenX"
}
```

**Step 4:** Desabilitar SSL Verification
- Settings → SSL certificate verification: OFF

**Step 5:** Send

**Step 6:** Copiar AccessToken da resposta

### 2. Criar Request para Account State

**Step 1:** Criar nova request
- Method: `GET`
- URL: `https://demo-edge-api.gmimarkets.com:7530/api/v1/accountstate`

**Step 2:** Configurar Headers
```
Content-Type: application/json
Authorization: Bearer {COLAR_ACCESS_TOKEN_AQUI}
```

**Step 3:** Send

---

## 🔄 RENOVAR TOKEN (Refresh)

Quando o AccessToken expirar (após ~1 hora):

```
POST https://demo-edge-api.gmimarkets.com:7530/api/v1/refresh

Headers:
  Content-Type: application/json

Body:
{
  "BotId": 3237386,
  "RefreshToken": "{SEU_REFRESH_TOKEN}"
}
```

Resposta:
```json
{
  "AccessToken": "novo_access_token...",
  "RefreshToken": "novo_refresh_token..."
}
```

---

## 🐛 TROUBLESHOOTING

### Erro 401 (Unauthorized)
- ✅ Verificar BotId e Password
- ✅ Verificar se token está sendo enviado no header
- ✅ Verificar se token não expirou

### Erro de Conexão
- ✅ Verificar URL (https://demo-edge-api.gmimarkets.com:7530/api/v1)
- ✅ Desabilitar verificação SSL (para demo)
- ✅ Verificar firewall/proxy

### Erro 429 (Rate Limit)
- ✅ Aguardar alguns segundos
- ✅ Bot respeita: 60 req/min geral, 30 orders/min

---

## 🧪 TESTAR MANUALMENTE

Execute o script de teste:

```bash
cd C:\bot_gmi_delta
python test_manual_auth.py
```

Este script vai:
1. ✅ Fazer login
2. ✅ Obter account info
3. ✅ Obter account state (balance/equity)
4. ✅ Listar posições abertas
5. ✅ Obter preço do XAUUSD
6. ✅ Exibir instruções completas

---

## 📚 DOCUMENTAÇÃO COMPLETA DA API

Consulte o arquivo:
```
C:\mt5_grid_hedge_bot\GMI_Edge_API_Documentation (1).md
```

---

## ⚡ QUICK START - CURL

### Login
```bash
curl -X POST https://demo-edge-api.gmimarkets.com:7530/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"BotId": 3237386, "Password": "7oH(y`EGgenX"}' \
  -k
```

### Account State (substitua {TOKEN})
```bash
curl -X GET https://demo-edge-api.gmimarkets.com:7530/api/v1/accountstate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -k
```

---

## 🎯 RESUMO

**Autenticação em 3 passos:**

1. **POST /login** → Obter AccessToken
2. **Incluir header** `Authorization: Bearer {token}` em todas as requisições
3. **Usar endpoints** (accountstate, positionlist, sendorder, etc.)

**Credenciais que estão funcionando no bot:**
- BotId: `3237386`
- Password: `7oH(y`EGgenX`
- URL: `https://demo-edge-api.gmimarkets.com:7530/api/v1`

---

✅ **Pronto! Agora você pode testar manualmente a autenticação exatamente como o bot faz.**
