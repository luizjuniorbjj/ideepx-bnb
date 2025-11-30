# 🚀 iDeepX - SETUP PARA TESTES PÚBLICOS

## 🌐 **ACESSE O SITE:**

```
https://small-comics-divide.loca.lt
```

**Senha do túnel:** `146.70.98.125`

---

## 📋 **INFORMAÇÕES DO CONTRATO (BSC TESTNET)**

### **Contratos Deployados:**
```
📜 iDeepX Distribution: 0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
💰 USDT Mock:            0xf484a22555113Cebac616bC84451Bf04085097b8
🌐 Rede:                 BSC Testnet (Chain ID: 97)
```

### **Links BSCScan:**
- **Contrato:** https://testnet.bscscan.com/address/0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
- **USDT Mock:** https://testnet.bscscan.com/address/0xf484a22555113Cebac616bC84451Bf04085097b8

---

## 🔑 **CARTEIRAS DE TESTE**

### **CARTEIRA 1 (Usuário Teste):**
```
Endereço:    0xA3fd0b97412AF316C7292197fF9b94681a19C538
Private Key: 0xe22f8db4704d1a036f1315a5b3d37e96bb8135b7dc76433cf207dbe981db3ff6
```

### **CARTEIRA 2 (Sponsor para Carteira 1):**
```
Endereço:    0xf4a1ab0f97dCB47f5f019ce509581a10fd0A24Cc
Private Key: 0x6d852ed74e0344ed47a6c7be2c928283b59537329170f4ffd31978aa948684c7
```

### **CARTEIRA OWNER (Deploy):**
```
Endereço:    0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
Private Key: 0xca4e07b26e5284e394b7dc9b5f03d22e6b66ddd5791be8ae57b6d3c358f9ea46
```

---

## 📱 **COMO TESTAR (PASSO A PASSO)**

### **1️⃣ CONFIGURAR METAMASK**

#### **A) Adicionar BSC Testnet:**
1. Abra MetaMask
2. Clique no seletor de rede (topo)
3. Clique em "Adicionar rede"
4. Preencha:
   ```
   Nome da rede:     BSC Testnet
   RPC URL:          https://data-seed-prebsc-1-s1.binance.org:8545
   Chain ID:         97
   Símbolo:          tBNB
   Block Explorer:   https://testnet.bscscan.com
   ```
5. Salve e selecione "BSC Testnet"

#### **B) Importar Carteira de Teste:**
1. MetaMask → Clique no ícone da conta (topo direito)
2. "Importar conta"
3. Cole a Private Key da CARTEIRA 1 ou 2 (acima)
4. Importar

---

### **2️⃣ PEGAR BNB DE TESTNET (GRÁTIS)**

#### **Opção A - Faucet Oficial:**
1. Acesse: https://www.bnbchain.org/en/testnet-faucet
2. Cole o endereço da sua carteira
3. Clique em "Give me BNB"
4. Aguarde ~30 segundos

#### **Opção B - Faucet Alternativo:**
1. Acesse: https://testnet.binance.org/faucet-smart
2. Cole o endereço
3. Solicitar tBNB

**Você receberá:** 0.3 - 0.5 tBNB (suficiente para vários testes!)

---

### **3️⃣ ACESSAR O SITE**

1. **Acesse:** https://small-comics-divide.loca.lt
2. **Digite a senha:** `146.70.98.125`
3. **Clique em "Connect Wallet"**
4. **Selecione MetaMask**
5. **Aprove a conexão**

---

## ✅ **FUNCIONALIDADES DISPONÍVEIS PARA TESTE**

### **📍 Página Inicial:**
- ✅ Visualizar informações do projeto
- ✅ Conectar carteira
- ✅ Navegação responsiva

### **📊 Dashboard** (`/dashboard`):
- ✅ Ver saldo de USDT
- ✅ Ver informações do usuário
- ✅ Estatísticas da rede MLM
- ✅ Histórico de ganhos

### **👥 Rede MLM** (`/network`):
- ✅ Visualizar upline (patrocinadores acima)
- ✅ Visualizar downline (rede abaixo)
- ✅ Estatísticas da rede
- ✅ 10 níveis MLM

### **📝 Registro** (`/register`):
- ✅ Registrar-se com endereço do sponsor
- ✅ Aprovar USDT
- ✅ Pagar assinatura ($29 USDT)
- ✅ Combo: Registro + Assinatura

### **💰 Saque** (`/withdraw`):
- ✅ Sacar comissões (mínimo $10)
- ✅ Saque parcial
- ✅ Histórico de saques

### **🔧 Admin** (`/admin`) - Apenas Owner:
- ✅ Processar performance fees
- ✅ Pausar/Despausar sistema
- ✅ Ver estatísticas globais
- ✅ Gerenciar usuários

---

## 🎯 **CENÁRIO DE TESTE SUGERIDO**

### **Teste Básico (Solo):**
1. ✅ Conectar Carteira 1
2. ✅ Ver dashboard (sem dados ainda)
3. ✅ Tentar registrar (precisa de sponsor)
4. ✅ Desconectar

### **Teste MLM (2 Usuários):**

#### **Passo 1 - Setup Carteira 2 (Sponsor):**
1. Importar Carteira 2 no MetaMask
2. Pegar tBNB no faucet
3. Conectar no site
4. Se registrar usando endereço do Owner como sponsor:
   ```
   Sponsor: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
   ```
5. Aprovar USDT
6. Pagar assinatura

#### **Passo 2 - Registrar Carteira 1:**
1. Importar Carteira 1 no MetaMask
2. Pegar tBNB no faucet
3. Conectar no site
4. Se registrar usando endereço da Carteira 2 como sponsor:
   ```
   Sponsor: 0xf4a1ab0f97dCB47f5f019ce509581a10fd0A24Cc
   ```
5. Aprovar USDT
6. Pagar assinatura

#### **Passo 3 - Testar Rede:**
1. Na Carteira 1: Ver página `/network`
2. Verificar que Carteira 2 aparece como sponsor (L1)
3. Verificar que Owner aparece como L2
4. Verificar estatísticas da rede

---

## ⚠️ **IMPORTANTE - LIMITAÇÕES DE TESTE**

### **✅ O que funciona:**
- Visualização de todas as páginas
- Conexão com MetaMask
- Leitura de dados do contrato
- Interface completa

### **❌ O que pode NÃO funcionar:**
- **USDT Mock:** As carteiras de teste não têm USDT ainda
  - **Solução:** Owner precisa distribuir USDT mock primeiro
- **Transações:** Requerem tBNB (pegar no faucet)

---

## 🔧 **TROUBLESHOOTING**

### **Problema: "Access Denied" no /admin**
**Solução:** Apenas a carteira Owner pode acessar
```
Owner: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
```

### **Problema: "Insufficient BNB"**
**Solução:** Pegar mais tBNB no faucet (links acima)

### **Problema: "Insufficient USDT"**
**Solução:** USDT Mock precisa ser distribuído primeiro
- Opção 1: Owner distribui USDT mock via contrato
- Opção 2: Mint USDT mock diretamente (se owner do USDT)

### **Problema: "Wrong Network"**
**Solução:** Mudar para BSC Testnet no MetaMask

### **Problema: Site não carrega**
**Solução:**
1. Verificar se LocalTunnel está ativo
2. Verificar senha do túnel
3. Limpar cache do navegador

---

## 📊 **ESTATÍSTICAS DO SISTEMA**

```
💰 Taxa de Assinatura: $29 USDT/mês
💸 Bônus Direto:       $5 USDT (para sponsor L1)
📈 MLM Níveis:         10 níveis
💵 Saque Mínimo:       $10 USDT
🔄 Renovação:          7 dias antes de expirar
```

### **Distribuição MLM (Beta Mode):**
```
Nível 1:  6.0%
Nível 2:  3.0%
Nível 3:  2.5%
Nível 4:  2.0%
Níveis 5-10: 1.0% cada
```

---

## 🎬 **DEMONSTRAÇÃO EM VÍDEO**

### **Para criar demonstração:**
1. Grave tela mostrando:
   - Conexão da carteira
   - Navegação pelas páginas
   - Registro de usuário
   - Visualização da rede MLM
   - Dashboard com estatísticas

---

## 🔗 **LINKS ÚTEIS**

- **Site:** https://small-comics-divide.loca.lt
- **Contrato:** https://testnet.bscscan.com/address/0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
- **Faucet BNB:** https://www.bnbchain.org/en/testnet-faucet
- **BSC Testnet Explorer:** https://testnet.bscscan.com

---

## 💡 **PRÓXIMOS PASSOS (PARA PRODUÇÃO)**

1. ✅ Deploy na BSC Mainnet
2. ✅ Usar USDT real (BEP-20)
3. ✅ Configurar domínio próprio
4. ✅ Implementar sistema de afiliados
5. ✅ Adicionar analytics
6. ✅ Criar painel administrativo completo

---

**Data de Criação:** 03/11/2025
**Última Atualização:** 03/11/2025
**Status:** ✅ ATIVO E FUNCIONANDO

---

**🚀 Divirta-se testando!**
