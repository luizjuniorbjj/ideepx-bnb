# 🌐 Configuração de Acesso Externo com ngrok

Este guia explica como configurar túneis ngrok para acesso externo ao dashboard iDeepX.

---

## 🎯 O que é ngrok?

Ngrok cria túneis seguros para expor servidores locais à internet. Perfeito para:
- Testar webhook de produção
- Demonstrar aplicação para clientes
- Acessar dashboard de qualquer lugar
- Testar em dispositivos móveis

---

## 📋 Pré-requisitos

✅ Ngrok instalado em: `C:\ngrok-v3-stable-windows-amd64`
✅ Backend rodando na porta: `3001`
✅ Frontend rodando na porta: `3000`

---

## 🚀 Opção 1: Script PowerShell (RECOMENDADO)

### Executar:

```powershell
# Abrir PowerShell e executar:
cd C:\ideepx-bnb
.\start-ngrok.ps1
```

### Caso erro de execução:

Se aparecer erro de política de execução:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-ngrok.ps1
```

---

## 🚀 Opção 2: Executar Manualmente

### 1. Abrir 2 janelas de comando (CMD ou PowerShell)

**Janela 1 - Frontend (Dashboard):**
```cmd
cd C:\ngrok-v3-stable-windows-amd64
ngrok http 3000
```

**Janela 2 - Backend (API):**
```cmd
cd C:\ngrok-v3-stable-windows-amd64
ngrok http 3001
```

### 2. Pegar as URLs públicas

Cada janela mostrará algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

---

## 🔧 Opção 3: Arquivo .bat

```cmd
cd C:\ideepx-bnb
start-ngrok.bat
```

---

## 📍 Acessar Interface Web do ngrok

Após iniciar os túneis:

- **Frontend**: http://localhost:4040
- **Backend**: http://localhost:4041 (se iniciar segundo túnel)

A interface web mostra:
- URL pública
- Requisições em tempo real
- Estatísticas de tráfego
- Logs detalhados

---

## 🌐 URLs Públicas

Após executar qualquer opção acima, você receberá 2 URLs:

### Frontend (Dashboard):
```
https://abc123.ngrok.io
```
Use esta URL para:
- ✅ Acessar dashboard de qualquer lugar
- ✅ Testar em celular/tablet
- ✅ Compartilhar com clientes
- ✅ Demo remoto

### Backend (API):
```
https://def456.ngrok.io
```
Use esta URL para:
- ✅ Configurar frontend para API externa
- ✅ Testes de integração
- ✅ Webhooks

---

## ⚙️ Configurar Frontend para usar Backend ngrok

Se você quiser que o frontend use o backend via ngrok:

1. **Editar `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://def456.ngrok.io
```

2. **Reiniciar frontend:**
```bash
cd frontend
npm run dev
```

**IMPORTANTE**: Troque `https://def456.ngrok.io` pela URL real do seu túnel backend!

---

## 🔐 Autenticação ngrok (Opcional)

Se for a primeira vez usando ngrok, pode precisar autenticar:

### 1. Criar conta gratuita:
https://dashboard.ngrok.com/signup

### 2. Pegar authtoken:
https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Configurar:
```cmd
cd C:\ngrok-v3-stable-windows-amd64
ngrok authtoken SEU_TOKEN_AQUI
```

---

## 📊 Verificar Túneis Ativos

### Via API:
```bash
curl http://localhost:4040/api/tunnels
```

### Via PowerShell:
```powershell
(Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels").tunnels | Select-Object name,public_url,proto
```

---

## 🛑 Parar Túneis

### Opção 1: Fechar janelas do ngrok

### Opção 2: Matar processos:
```cmd
taskkill /F /IM ngrok.exe
```

### Opção 3: PowerShell:
```powershell
Get-Process ngrok | Stop-Process -Force
```

---

## ⚠️ Limitações do Plano Gratuito

- ✅ 1 processo ngrok ativo por vez (conta free)
- ✅ URL muda a cada reinício
- ✅ 40 conexões/minuto
- ⏰ Sessão expira após 2 horas de inatividade

### Plano Pro:
- 🎯 3+ túneis simultâneos
- 🎯 Domínio customizado (ex: ideepx.ngrok.io)
- 🎯 URL fixa
- 🎯 Sem limite de tempo

---

## 🎯 Casos de Uso

### 1. Demo para Cliente:
```
1. Iniciar túneis
2. Enviar URL frontend: https://abc123.ngrok.io
3. Cliente acessa de qualquer lugar
4. Cliente pode testar dashboard, registro, MLM, etc.
```

### 2. Teste em Celular:
```
1. Iniciar túneis
2. Abrir https://abc123.ngrok.io no celular
3. Conectar wallet mobile (MetaMask, Trust Wallet)
4. Testar UX mobile
```

### 3. Integração com GMI Markets:
```
1. Configurar webhook GMI para: https://def456.ngrok.io/api/gmi/webhook
2. Receber dados reais do MT5
3. Testar integração em tempo real
```

---

## 🐛 Troubleshooting

### Erro: "Failed to start tunnel"

**Causa**: Porta já em uso ou ngrok já rodando

**Solução**:
```cmd
taskkill /F /IM ngrok.exe
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Erro: "authentication failed"

**Solução**: Configure authtoken (ver seção "Autenticação" acima)

### Erro: "tunnel not found"

**Causa**: Túnel não iniciou corretamente

**Solução**:
1. Verificar se backend/frontend estão rodando
2. Reiniciar ngrok
3. Verificar logs em http://localhost:4040

### URL não abre

**Causas possíveis**:
- Backend/frontend não estão rodando
- Firewall bloqueando
- CORS não configurado

**Solução**:
```bash
# Verificar se serviços estão rodando:
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # Backend

# Se backend tem erro CORS, adicionar URL ngrok ao CORS
```

---

## 📝 Arquivo de URLs

Após executar o script PowerShell, as URLs são salvas em:
```
C:\ideepx-bnb\ngrok-urls.txt
```

Conteúdo exemplo:
```
FRONTEND_URL=https://abc123.ngrok.io
BACKEND_URL=https://def456.ngrok.io
```

---

## 🎯 Próximos Passos

Após configurar ngrok:

1. ✅ Testar acesso externo ao dashboard
2. ✅ Configurar CORS no backend para aceitar URL ngrok
3. ✅ Testar registro e login via URL pública
4. ✅ Testar conexão wallet (MetaMask)
5. ✅ Compartilhar com stakeholders para feedback

---

## 📞 Suporte

**Documentação ngrok**: https://ngrok.com/docs
**Dashboard ngrok**: https://dashboard.ngrok.com
**Status ngrok**: https://status.ngrok.com

---

**✅ Setup completo! Dashboard iDeepX agora acessível externamente! 🚀**
