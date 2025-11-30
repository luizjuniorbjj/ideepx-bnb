# 🧪 PLANO DE TESTE COMPLETO - iDeepX MLM

**Objetivo:** Validar TODAS as funções do contrato antes de deploy em mainnet.

---

## 🎯 ESTRATÉGIA: ABORDAGEM HÍBRIDA (4 FASES)

### **Por que 4 fases?**

1. **Fase 1 (Local):** Valida lógica básica → rápido
2. **Fase 2 (Fork):** Testa em ESCALA → massivo
3. **Fase 3 (Testnet):** Valida ambiente REAL → seguro
4. **Fase 4 (Mainnet):** Deploy final → confiante

**Resultado:** 99.9% de confiança antes de produção! 🎯

---

## ⚙️ FASE 1: TESTES LOCAIS (Hardhat Network)

**Objetivo:** Validar lógica básica de cada função

**Onde:** Hardhat local (sem fork)

**Duração:** 1-2 horas

**Ferramentas:** Hardhat + Mocha + Chai

---

### **✅ CHECKLIST DE TESTE (Fase 1):**

#### **1. Deploy & Inicialização**
- [ ] Contrato deploya sem erros
- [ ] Construtor aceita endereço USDT válido
- [ ] Variáveis inicializadas corretamente
- [ ] Owner configurado corretamente

#### **2. Função selfRegister()**
- [ ] Usuário consegue se registrar com sponsor válido
- [ ] Rejeita se já registrado
- [ ] Rejeita se sponsor é zero address
- [ ] Rejeita se sponsor não está registrado
- [ ] Event UserRegistered emitido corretamente
- [ ] Referral count atualizado no sponsor

#### **3. Função selfSubscribe()**
- [ ] Usuário consegue ativar assinatura
- [ ] Rejeita se não está registrado
- [ ] Rejeita se já está ativo
- [ ] Rejeita se USDT não aprovado
- [ ] USDT transferido corretamente
- [ ] Timestamp e expiration setados
- [ ] Event UserSubscribed emitido
- [ ] Pode renovar após expirar

#### **4. Função registerAndSubscribe()**
- [ ] Combo funciona (registro + ativação)
- [ ] Rejeita em todas as validações combinadas
- [ ] Events emitidos na ordem

#### **5. Distribuição MLM (batchProcessPerformanceFees)**
- [ ] Admin consegue processar batch
- [ ] Non-admin é rejeitado
- [ ] Distribui nos 10 níveis corretamente
- [ ] Percentuais BETA corretos (6%, 3%, 2.5%, 2%, 1%...)
- [ ] Percentuais PERMANENTES corretos (4%, 2%, 1.5%, 1%, 1%...)
- [ ] Pools recebem corretamente (Liquidez 5%, Infra 12%, Empresa 23%)
- [ ] totalEarned atualizado
- [ ] Events emitidos para cada distribuição

#### **6. Função withdraw()**
- [ ] Usuário consegue sacar saldo
- [ ] Rejeita saque > saldo disponível
- [ ] totalWithdrawn atualizado
- [ ] USDT transferido

#### **7. getUserInfo()**
- [ ] Retorna dados corretos
- [ ] Funciona para qualquer usuário

#### **8. Pausable**
- [ ] Owner consegue pausar
- [ ] Funções críticas bloqueadas quando pausado
- [ ] Owner consegue despausar

#### **9. Modo BETA**
- [ ] Owner consegue ativar/desativar
- [ ] Percentuais mudam corretamente
- [ ] Event emitido

#### **10. Edge Cases**
- [ ] Sponsor inativo não recebe comissão
- [ ] Usuário sem upline em nível N não causa erro
- [ ] Batch com array vazio
- [ ] Batch com usuário duplicado

---

### **📝 Como executar (Fase 1):**

```bash
# Rodar testes unitários
npx hardhat test

# Rodar com cobertura
npx hardhat coverage

# Rodar teste específico
npx hardhat test --grep "selfRegister"
```

---

## 🔬 FASE 2: FORK LOCAL BSC (BNB ILIMITADO!) ⭐

**Objetivo:** Testar em ESCALA (100-1000 usuários)

**Onde:** Fork da BSC mainnet (local)

**Duração:** 1 dia

**Vantagens:**
- 🚀 BNB ILIMITADO
- 🚀 Mining instantâneo
- 🚀 1000+ usuários em minutos
- 🚀 Reset fácil
- 🚀 Debug completo

---

### **✅ CHECKLIST DE TESTE (Fase 2):**

#### **1. Setup**
- [ ] Fork configurado (hardhat.config.js)
- [ ] Node Hardhat rodando
- [ ] Contratos deployados no fork
- [ ] Bot configurado

#### **2. Testes de Carga**
- [ ] 100 usuários criados com sucesso
- [ ] 500 usuários criados
- [ ] 1000 usuários criados (se hardware permitir)
- [ ] Distribuição MLM em todos os níveis
- [ ] Batch processing de 100+ usuários

#### **3. Estrutura MLM**
- [ ] Rede com 10 níveis profunda
- [ ] Múltiplos patrocinadores
- [ ] Árvore balanceada
- [ ] Usuários inativos não recebem

#### **4. Performance**
- [ ] Gas usage aceitável (<5M por batch)
- [ ] Tempo de execução razoável
- [ ] Sem timeouts
- [ ] Sem erros de memória

#### **5. Distribuição Financeira**
- [ ] USDT distribuído corretamente
- [ ] Pools recebem valores corretos
- [ ] totalEarned soma corretamente
- [ ] Sem perda de fundos

#### **6. Edge Cases em Escala**
- [ ] Usuário com 10+ filhos diretos
- [ ] Rede com 10 níveis completos
- [ ] Batch com 200+ usuários
- [ ] Múltiplos batches sequenciais

---

### **📝 Como executar (Fase 2):**

```bash
# Terminal 1: Iniciar fork local
npx hardhat node

# Terminal 2: Rodar bot
node backend/scripts/mlm-bot-fork-local.js

# Verificar resultados
cat backend/scripts/mlm-bot-fork-progress.json
```

---

## 🌐 FASE 3: TESTNET PÚBLICA (Validação Final)

**Objetivo:** Simular ambiente REAL

**Onde:** BSC Testnet pública

**Duração:** 2-3 dias

**Valida:**
- Network latency real
- Gas price variável
- RPC issues
- Frontend/Backend integração
- User experience

---

### **✅ CHECKLIST DE TESTE (Fase 3):**

#### **1. Deploy**
- [ ] Contrato deployado em testnet
- [ ] Verificado no BSCScan
- [ ] Ownership configurado
- [ ] Pools configurados

#### **2. Frontend + Backend**
- [ ] Frontend conecta ao contrato
- [ ] Dashboard exibe dados corretos
- [ ] Registro funciona via UI
- [ ] Ativação funciona via UI
- [ ] Upline tree exibe corretamente
- [ ] GMI Edge integrado

#### **3. Usuários Reais (50+)**
- [ ] Bot criou 50 usuários
- [ ] 40 ativados
- [ ] 10 inativos
- [ ] Estrutura MLM visível no BSCScan

#### **4. Batch Processing**
- [ ] Admin consegue processar via backend
- [ ] Distribuição visível no frontend
- [ ] Usuários recebem comissões

#### **5. Experiência do Usuário**
- [ ] Flow de registro intuitivo
- [ ] Mensagens de erro claras
- [ ] Loading states funcionando
- [ ] Transações confirmam em tempo razoável

#### **6. Monitoramento**
- [ ] Events indexados corretamente
- [ ] Logs do backend funcionando
- [ ] Métricas sendo coletadas

---

### **📝 Como executar (Fase 3):**

```bash
# Deploy em testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Verificar no BSCScan
npx hardhat verify --network bscTestnet CONTRACT_ADDRESS

# Rodar bot em testnet
node backend/scripts/mlm-activity-bot.js

# Iniciar frontend e backend
cd frontend && PORT=5000 npm run dev
cd backend && npm run dev

# Testar manualmente no navegador
# http://localhost:5000
```

---

## 🚀 FASE 4: MAINNET (Produção)

**Objetivo:** Deploy final

**Onde:** BSC Mainnet

**Quando:** Apenas quando TODAS as fases anteriores passaram 100%

---

### **✅ CHECKLIST FINAL (Antes de Mainnet):**

#### **Pré-requisitos Obrigatórios:**
- [ ] ✅ Fase 1 100% concluída
- [ ] ✅ Fase 2 100% concluída
- [ ] ✅ Fase 3 100% concluída
- [ ] ✅ Auditoria de segurança (recomendado)
- [ ] ✅ Time de resposta preparado
- [ ] ✅ Plano de emergência documentado
- [ ] ✅ Funções pausable testadas
- [ ] ✅ Backup de private keys seguro
- [ ] ✅ Monitoring configurado
- [ ] ✅ Budget de gas aprovado

#### **Validações Finais:**
- [ ] Código do contrato finalizado (sem mudanças)
- [ ] Frontend finalizado
- [ ] Backend finalizado
- [ ] Documentação completa
- [ ] Termos de uso preparados
- [ ] Marketing pronto
- [ ] Suporte preparado

#### **Deploy em Mainnet:**
- [ ] Deploy executado com sucesso
- [ ] Contrato verificado no BSCScan
- [ ] Ownership transferido (se necessário)
- [ ] Pools configurados
- [ ] Primeiros usuários testaram
- [ ] Monitoring ativo
- [ ] Equipe de plantão

---

## 📊 MÉTRICAS DE SUCESSO

### **Fase 1 (Local):**
- ✅ 100% dos testes passando
- ✅ 0 erros críticos
- ✅ Cobertura > 90%

### **Fase 2 (Fork):**
- ✅ 500+ usuários testados
- ✅ Gas < 5M por batch
- ✅ 0 erros em distribuição MLM
- ✅ 0 perda de fundos

### **Fase 3 (Testnet):**
- ✅ 50+ usuários reais
- ✅ Frontend funcionando
- ✅ Backend funcionando
- ✅ 0 erros de UX
- ✅ Feedback positivo de testadores

### **Fase 4 (Mainnet):**
- ✅ Deploy bem-sucedido
- ✅ Primeiros 10 usuários OK
- ✅ 0 incidentes nas primeiras 24h
- ✅ Monitoring estável

---

## 🛡️ PLANO DE EMERGÊNCIA

### **Se algo der errado em Mainnet:**

#### **Cenário 1: Bug Crítico Descoberto**
1. ⏸️ **Pausar contrato** imediatamente
2. 🔍 **Investigar** o problema
3. 📢 **Comunicar** usuários (Twitter, Telegram, etc)
4. 🛠️ **Corrigir** e testar fix
5. 🔄 **Migrar** para novo contrato (se necessário)

#### **Cenário 2: Ataque Detectado**
1. ⏸️ **Pausar contrato**
2. 🔒 **Isolar** o problema
3. 📞 **Contatar** especialistas em segurança
4. 📢 **Avisar** usuários
5. 💰 **Proteger** fundos restantes

#### **Cenário 3: Gas Price Alto Demais**
1. ⏱️ **Aguardar** gas price baixar
2. 📊 **Ajustar** parâmetros de batch
3. ⚙️ **Otimizar** processamento
4. 💡 **Comunicar** usuários sobre delays

---

## 📅 CRONOGRAMA SUGERIDO

### **Semana 1:**
- **Dia 1-2:** Fase 1 (Testes locais)
- **Dia 3:** Fase 2 (Fork local - setup)
- **Dia 4-5:** Fase 2 (Fork local - testes em escala)

### **Semana 2:**
- **Dia 1:** Deploy em testnet
- **Dia 2-4:** Fase 3 (Testes em testnet)
- **Dia 5:** Validação final + preparação mainnet

### **Semana 3:**
- **Dia 1:** Deploy em mainnet
- **Dia 2-5:** Monitoramento intensivo
- **Dia 6-7:** Ajustes finos

---

## 🎯 PRÓXIMO PASSO (AGORA!)

**Começar pela FASE 2 (Fork Local):**

```bash
# 1. Verificar Hardhat configurado
cat hardhat.config.js
# (fork deve estar enabled: true)

# 2. Terminal 1: Iniciar fork
npx hardhat node

# 3. Terminal 2: Rodar bot
node backend/scripts/mlm-bot-fork-local.js

# 4. Aguardar resultados (5-10 min para 100 usuários)

# 5. Verificar arquivo gerado
cat backend/scripts/mlm-bot-fork-progress.json
```

---

## 📞 SUPORTE

**Problemas durante testes?**

1. **Fork não inicia:**
   - Verifique RPC URL no hardhat.config.js
   - Tente outro RPC (veja opções comentadas)
   - Desabilite firewall temporariamente

2. **Bot falha:**
   - Veja logs: `mlm-bot-fork-activity.log`
   - Veja progresso: `mlm-bot-fork-progress.json`
   - Reinicie e tente novamente

3. **Testes falham:**
   - Veja erro específico
   - Corrija código
   - Re-execute testes

---

## ✅ CRITÉRIO DE APROVAÇÃO

**Mainnet só acontece se:**

1. ✅ **Fase 1:** 100% testes passando
2. ✅ **Fase 2:** 500+ usuários sem erros
3. ✅ **Fase 3:** 50+ usuários reais + frontend OK
4. ✅ **Auditoria:** Aprovada (se fizer)
5. ✅ **Time:** Preparado e confiante

**Se qualquer item falhar → NÃO VAI PARA MAINNET!**

---

**🎯 Objetivo: Chegar no mainnet com 99.9% de confiança!**

---

## 🎉 CONCLUSÃO

Com este plano, você vai para mainnet **sabendo que tudo funciona perfeitamente**.

**Nenhuma surpresa desagradável em produção! 🚀**

**Pronto para começar? Execute o fork local agora! 💪**
