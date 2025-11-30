# 🔄 SINCRONIZAÇÃO COMPLETA DO SISTEMA

**CRÍTICO:** Banco de Dados ↔️ Backend ↔️ Frontend ↔️ Dashboard Cliente ↔️ Painel Admin

**TUDO 100% SINCRONIZADO EM TEMPO REAL!**

---

## 🎯 OBJETIVO

**Os sócios devem ver:**
- ✅ Mesmos dados em TODOS os lugares
- ✅ Atualização em TEMPO REAL
- ✅ Consistência TOTAL
- ✅ Zero discrepâncias

**Exemplo:**
```
Quando performance fee é processada:

1. Smart Contract → Emite events
2. Backend → Captura events → Salva no banco
3. Dashboard Cliente → Mostra nova comissão (2 segundos)
4. Painel Admin → Atualiza KPIs (2 segundos)
5. Banco de Dados → Consultável imediatamente
```

---

## 🔗 FLUXO DE DADOS

### **CAMINHO COMPLETO:**

```
┌─────────────────────────────────────────────────────┐
│           SMART CONTRACT (BNB Chain)                │
│  - Estado definitivo (source of truth)              │
│  - Emite events para cada ação                      │
└─────────────────┬───────────────────────────────────┘
                  │ Events
                  ↓
┌─────────────────────────────────────────────────────┐
│              EVENT LISTENER (Backend)                │
│  - Escuta todos os events do contrato              │
│  - Processa em tempo real                          │
└─────────────────┬───────────────────────────────────┘
                  │ Processa
                  ↓
┌─────────────────────────────────────────────────────┐
│             BANCO DE DADOS (SQLite)                 │
│  - Armazena tudo                                    │
│  - Histórico completo                               │
│  - Queryable                                        │
└─────────┬───────────────────────┬───────────────────┘
          │                       │
          │ Query                 │ Query
          ↓                       ↓
┌─────────────────┐    ┌──────────────────────┐
│   BACKEND API   │    │   BACKEND API        │
│  (Cliente)      │    │   (Admin)            │
└────────┬────────┘    └──────────┬───────────┘
         │                        │
         │ HTTP/WebSocket         │ HTTP/WebSocket
         ↓                        ↓
┌─────────────────┐    ┌──────────────────────┐
│  DASHBOARD      │    │   PAINEL ADMIN       │
│  (Cliente)      │    │                      │
│  - Next.js      │    │   - Next.js          │
│  - localhost:5000    │   - localhost:5000/admin
└─────────────────┘    └──────────────────────┘
```

---

## 📊 EVENTOS DO CONTRATO → BANCO

### **Event Listeners Necessários:**

**Arquivo:** `backend/src/services/contractEventListener.js`

```javascript
/**
 * Escuta TODOS os events do contrato
 * Sincroniza IMEDIATAMENTE com banco de dados
 */

// Events a escutar:
1. UserRegistered(user, sponsor)
   → Salvar User no banco
   → Atualizar directReferrals do sponsor
   → Emitir WebSocket "new_user"

2. SubscriptionActivated(user, amount, expirationTimestamp)
   → Atualizar User.subscriptionActive = true
   → Criar Subscription no banco
   → Emitir WebSocket "subscription_activated"

3. SubscriptionRenewed(user, amount, newExpirationTimestamp)
   → Atualizar User.subscriptionExpiration
   → Criar Subscription no banco
   → Emitir WebSocket "subscription_renewed"

4. PerformanceFeeDistributed(user, amount, mlmAmount)
   → Criar PerformanceFee no banco
   → Emitir WebSocket "fee_processed"

5. MLMCommissionPaid(recipient, from, level, amount)
   → Criar MLMCommission no banco
   → Atualizar User.totalEarned
   → Emitir WebSocket "commission_received"

6. DirectBonusPaid(sponsor, newUser, amount)
   → Criar MLMCommission (tipo DIRECT_BONUS)
   → Atualizar User.totalEarned
   → Emitir WebSocket "bonus_received"

7. EarningsWithdrawn(user, amount)
   → Criar Withdrawal no banco
   → Atualizar User.totalWithdrawn
   → Emitir WebSocket "withdrawal_completed"

8. PoolDistribution(pool, amount, poolType)
   → Atualizar Pool no banco
   → Emitir WebSocket "pool_updated"

9. BetaModeToggled(betaMode)
   → Criar AdminAction
   → Emitir WebSocket "beta_mode_changed"

10. SubscriptionExpired(user, expiredAt)
    → Atualizar User.subscriptionActive = false
    → Emitir WebSocket "subscription_expired"
```

---

## 🔴 WEBSOCKETS EM TEMPO REAL

### **Por que WebSockets?**
- HTTP: Cliente pergunta "tem algo novo?" (polling)
- WebSocket: Servidor AVISA cliente "algo novo!" (push)
- **Resultado:** Atualização INSTANTÂNEA!

---

### **Implementação Backend:**

**Arquivo:** `backend/src/websocket/server.js`

```javascript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Armazena conexões por tipo
const connections = {
  clients: new Set(),  // Dashboards clientes
  admins: new Set()    // Painéis admin
};

// Quando cliente conecta
wss.on('connection', (ws, req) => {
  const type = req.url.includes('admin') ? 'admins' : 'clients';
  connections[type].add(ws);

  ws.on('close', () => {
    connections[type].delete(ws);
  });
});

// Função para emitir eventos
export function emitToClients(event, data) {
  connections.clients.forEach(ws => {
    ws.send(JSON.stringify({ event, data }));
  });
}

export function emitToAdmins(event, data) {
  connections.admins.forEach(ws => {
    ws.send(JSON.stringify({ event, data }));
  });
}

export function emitToAll(event, data) {
  emitToClients(event, data);
  emitToAdmins(event, data);
}
```

---

### **Implementação Frontend:**

**Arquivo:** `frontend/hooks/useWebSocket.ts`

```typescript
import { useEffect, useState } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [url]);

  return { ws, lastMessage };
}
```

**Uso no Dashboard Cliente:**

```typescript
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';

export default function Dashboard() {
  const { lastMessage } = useWebSocket('ws://localhost:8080/client');

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.event) {
        case 'commission_received':
          // Atualizar saldo
          // Mostrar notificação
          // Re-fetch dados
          break;
        case 'withdrawal_completed':
          // Atualizar saldo
          // Mostrar confirmação
          break;
        // ... outros eventos
      }
    }
  }, [lastMessage]);
}
```

**Uso no Painel Admin:**

```typescript
const { lastMessage } = useWebSocket('ws://localhost:8080/admin');

useEffect(() => {
  if (lastMessage) {
    switch (lastMessage.event) {
      case 'new_user':
        // Incrementar contador de usuários
        // Atualizar lista
        break;
      case 'fee_processed':
        // Atualizar KPIs
        // Atualizar gráficos
        break;
      case 'pool_updated':
        // Atualizar saldos dos pools
        break;
    }
  }
}, [lastMessage]);
```

---

## 🔄 SINCRONIZAÇÃO PERIÓDICA

**Além do tempo real via WebSocket, ter sync periódico como backup:**

**Arquivo:** `backend/src/jobs/syncJob.js`

```javascript
import cron from 'node-cron';

// A cada 5 minutos: Sincronizar tudo do contrato para o banco
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 Sincronização periódica iniciada');

  // 1. Sincronizar usuários
  await syncUsers();

  // 2. Sincronizar pools
  await syncPools();

  // 3. Calcular métricas
  await calculateMetrics();

  // 4. Detectar discrepâncias
  await detectDiscrepancies();

  console.log('✅ Sincronização completa');
});
```

---

## 📋 CHECKLIST DE SINCRONIZAÇÃO

### **Para cada ação do usuário:**

#### **1. Registro (selfRegister)**
- [ ] Event capturado pelo backend
- [ ] User salvo no banco
- [ ] Sponsor.directReferrals incrementado
- [ ] WebSocket emitido
- [ ] Dashboard cliente atualizado
- [ ] Painel admin atualizado (contador)

#### **2. Ativação (selfSubscribe)**
- [ ] Event capturado
- [ ] User.subscriptionActive = true
- [ ] Subscription criada no banco
- [ ] WebSocket emitido
- [ ] Dashboard mostra "Ativo"
- [ ] Painel admin incrementa activeUsers

#### **3. Performance Fee Processada**
- [ ] Event capturado
- [ ] PerformanceFee salva
- [ ] MLMCommission criada para cada nível
- [ ] User.totalEarned atualizado (todos os níveis)
- [ ] Pool.currentBalance atualizado (3 pools)
- [ ] WebSocket emitido (múltiplos eventos)
- [ ] Dashboard cliente mostra nova comissão
- [ ] Painel admin atualiza KPIs
- [ ] Gráficos atualizados

#### **4. Saque (withdrawEarnings)**
- [ ] Event capturado
- [ ] Withdrawal salva
- [ ] User.totalWithdrawn atualizado
- [ ] WebSocket emitido
- [ ] Dashboard mostra saldo atualizado
- [ ] Painel admin registra saque

---

## 🔍 VALIDAÇÃO DE CONSISTÊNCIA

**Script para verificar se tudo está sincronizado:**

**Arquivo:** `backend/scripts/validate-sync.js`

```javascript
/**
 * Valida que banco de dados está 100% sincronizado com contrato
 */

async function validateSync() {
  console.log('🔍 Validando sincronização...\n');

  let errors = 0;

  // 1. Validar usuários
  const usersInContract = await contract.totalUsers();
  const usersInDB = await prisma.user.count();

  if (usersInContract !== usersInDB) {
    console.error(`❌ ERRO: Usuários no contrato (${usersInContract}) != Usuários no banco (${usersInDB})`);
    errors++;
  } else {
    console.log(`✅ Usuários sincronizados: ${usersInContract}`);
  }

  // 2. Validar assinaturas ativas
  const activeInContract = await contract.totalActiveSubscriptions();
  const activeInDB = await prisma.user.count({
    where: { subscriptionActive: true }
  });

  if (activeInContract !== activeInDB) {
    console.error(`❌ ERRO: Assinaturas ativas no contrato (${activeInContract}) != Banco (${activeInDB})`);
    errors++;
  } else {
    console.log(`✅ Assinaturas ativas sincronizadas: ${activeInContract}`);
  }

  // 3. Validar totalEarned de cada usuário
  const users = await prisma.user.findMany();
  for (const user of users) {
    const onChainData = await contract.getUserInfo(user.walletAddress);
    const totalEarnedContract = ethers.formatUnits(onChainData.totalEarned, 6);
    const totalEarnedDB = user.totalEarned || '0';

    if (totalEarnedContract !== totalEarnedDB) {
      console.error(`❌ ERRO: totalEarned de ${user.walletAddress}`);
      console.error(`   Contrato: ${totalEarnedContract} USDT`);
      console.error(`   Banco: ${totalEarnedDB} USDT`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log('\n✅ Tudo sincronizado perfeitamente!');
  } else {
    console.log(`\n❌ ${errors} erros de sincronização encontrados`);
  }
}
```

**Executar:**
```bash
node backend/scripts/validate-sync.js
```

---

## 🎨 INDICADORES VISUAIS DE SINCRONIZAÇÃO

### **No Dashboard Cliente:**

```typescript
// Componente de status de sincronização
<div className="sync-indicator">
  {isSynced ? (
    <div className="flex items-center gap-2 text-green-500">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm">Sincronizado</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-yellow-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Atualizando...</span>
    </div>
  )}
  <span className="text-xs text-gray-500">
    Última atualização: {lastUpdate}
  </span>
</div>
```

---

### **No Painel Admin:**

```typescript
// Dashboard com status de todos os componentes
<div className="system-status">
  <StatusCard
    title="Smart Contract"
    status={contractStatus}
    icon={<Link className="w-5 h-5" />}
  />
  <StatusCard
    title="Banco de Dados"
    status={dbStatus}
    icon={<Database className="w-5 h-5" />}
  />
  <StatusCard
    title="Event Listener"
    status={listenerStatus}
    icon={<Activity className="w-5 h-5" />}
  />
  <StatusCard
    title="WebSocket"
    status={wsStatus}
    icon={<Zap className="w-5 h-5" />}
  />
</div>
```

---

## 🔄 FLUXO COMPLETO (EXEMPLO REAL)

### **Cenário: Admin processa performance fee de $100**

**1. Admin executa no painel:**
```
Painel Admin → Botão "Processar Fees"
→ POST /api/admin/process-fees
→ Backend chama contract.batchProcessPerformanceFees()
```

**2. Smart Contract processa:**
```
Contrato recebe $100
→ Distribui:
   - $60 MLM (10 níveis)
   - $5 Liquidez
   - $12 Infraestrutura
   - $23 Empresa
→ Emite eventos:
   - PerformanceFeeDistributed
   - MLMCommissionPaid (10x, um por nível)
   - PoolDistribution (3x)
```

**3. Event Listener captura (< 1 segundo):**
```
Backend escuta events
→ Processa cada um
→ Salva no banco:
   - PerformanceFee record
   - 10 MLMCommission records
   - Atualiza 10 Users (totalEarned)
   - Atualiza 3 Pools
```

**4. WebSocket emite (imediato):**
```
Backend emite:
→ Para admins: "fee_processed", "pool_updated"
→ Para clientes afetados: "commission_received"
```

**5. Frontends atualizam (< 2 segundos):**
```
Painel Admin:
→ KPI "Total Distribuído" +$100
→ Gráfico atualiza
→ Lista de fees mostra novo item
→ Saldos dos pools incrementam

Dashboard dos 10 clientes:
→ Notificação "Nova comissão!"
→ Saldo disponível incrementa
→ Histórico mostra novo ganho
```

**6. Banco de Dados consultável:**
```
Qualquer query retorna dados atualizados
→ User.totalEarned correto
→ PerformanceFee salva
→ MLMCommission rastreável
→ Pool.currentBalance atualizado
```

---

## ✅ GARANTIAS DE SINCRONIZAÇÃO

### **Com este sistema:**

1. ✅ **Contrato é source of truth**
   - Tudo começa lá
   - Events nunca mentem

2. ✅ **Banco SEMPRE reflete contrato**
   - Event listener automático
   - Sincronização periódica (backup)
   - Script de validação

3. ✅ **Frontends SEMPRE atualizados**
   - WebSocket em tempo real
   - Refresh manual disponível
   - Auto-refresh periódico

4. ✅ **Zero discrepâncias**
   - Validação automática
   - Alertas se detectar erro
   - Logs completos

---

## 🚨 MONITORAMENTO

**Arquivo:** `backend/src/monitoring/syncMonitor.js`

```javascript
/**
 * Monitora sincronização 24/7
 * Alerta se algo estiver fora de sync
 */

setInterval(async () => {
  const issues = await checkSync();

  if (issues.length > 0) {
    // Enviar alerta (email, Telegram, Discord)
    await sendAlert({
      title: '⚠️ Problema de Sincronização',
      issues: issues,
      timestamp: new Date()
    });
  }
}, 60000); // A cada 1 minuto
```

---

## 📊 DASHBOARD DE SINCRONIZAÇÃO (Admin)

**Página:** `/admin/system/sync`

**Mostra:**
- Status de sincronização (OK/Warning/Error)
- Última sincronização bem-sucedida
- Eventos processados (últimos 100)
- Discrepâncias detectadas
- Performance do event listener
- Conexões WebSocket ativas
- Botão "Forçar Sincronização"
- Botão "Validar Consistência"

---

## 🎯 RESULTADO FINAL

**Para os sócios:**
```
Quando olham para o sistema, veem:
✅ Números IGUAIS em todo lugar
✅ Atualizações INSTANTÂNEAS
✅ Consistência TOTAL
✅ Confiança MÁXIMA

Sistema parece PROFISSIONAL e ROBUSTO!
```

---

**🔥 SINCRONIZAÇÃO COMPLETA GARANTIDA!**
