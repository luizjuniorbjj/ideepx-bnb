# 🦊 GUIA: CONECTAR METAMASK NO DASHBOARD

## ✅ PASSO 1: INSTALAR METAMASK

Se você ainda não tem o MetaMask:

1. Acesse: https://metamask.io/download/
2. Clique em "Install MetaMask for Chrome" (ou seu navegador)
3. Siga as instruções de instalação
4. Crie uma senha (você NÃO precisa criar uma nova wallet, vamos importar uma existente)

---

## 🔑 PASSO 2: IMPORTAR A PRIVATE KEY DO PIONEER

### Dados da Carteira:
```
Address: 0x75d1A8ac59003088c60A20bde8953cBECfe41669
Private Key: 0x54499b38fae729d771cbdb24e83a1212bea5bc47e7687a2785967f9f1098d3a5
```

### Como Importar:

1. **Abra o MetaMask**
   - Clique no ícone da raposa laranja no topo do navegador

2. **Clique no ícone da conta**
   - No topo direito, clique no círculo colorido (sua foto/ícone)

3. **Selecione "Importar Conta"**
   - No menu que aparece, procure por "Import Account" ou "Importar Conta"

4. **Cole a Private Key**
   ```
   0x54499b38fae729d771cbdb24e83a1212bea5bc47e7687a2785967f9f1098d3a5
   ```
   - Cole EXATAMENTE como está (com o 0x no início)

5. **Clique "Importar"**
   - A conta "Pioneer" será adicionada ao seu MetaMask

---

## 🌐 PASSO 3: ADICIONAR BSC TESTNET

### Opção A: Adicionar Automaticamente (Recomendado)

1. Acesse: https://chainlist.org/
2. Procure por "BSC Testnet" ou "97"
3. Clique em "Add to MetaMask"
4. Aprove no MetaMask

### Opção B: Adicionar Manualmente

1. **Abra o MetaMask**

2. **Clique no seletor de rede** (no topo, deve estar "Ethereum Mainnet")

3. **Clique em "Adicionar rede" ou "Add Network"**

4. **Preencha os dados:**
   ```
   Nome da Rede: BSC Testnet
   Nova URL de RPC: https://data-seed-prebsc-1-s1.binance.org:8545
   ID da Cadeia: 97
   Símbolo da Moeda: BNB
   URL do Explorador de Bloco: https://testnet.bscscan.com
   ```

5. **Clique "Salvar"**

6. **Selecione "BSC Testnet"**
   - Certifique-se de que está na rede BSC Testnet (não Ethereum Mainnet)

---

## 🔗 PASSO 4: CONECTAR NO DASHBOARD

1. **Abra o Dashboard**
   - URL: http://localhost:3001/dashboard

2. **Clique em "Connect Wallet"**
   - Botão geralmente no topo direito

3. **Selecione "MetaMask"**
   - Vai abrir um popup do MetaMask

4. **Aprove a Conexão**
   - Clique "Conectar" ou "Connect"
   - Selecione a conta "Pioneer" (0x75d1...1669)

5. **Aguarde o Carregamento**
   - O dashboard vai buscar os dados do backend
   - Pode levar 2-5 segundos

---

## 📊 PASSO 5: VERIFICAR OS DADOS

Você DEVE ver os seguintes dados:

### Cards Principais:
```
💰 Saldo Interno: $1,231.75
📈 Volume Mensal: $8,500.00
   Comissões: $1,250.75
📅 Assinatura: Ativa (19 dias)
🔓 Níveis MLM: 10/10 (Completo ✅)
```

### Card LAI (Verde):
```
✅ ATIVA - 19 dias restantes
Barra de progresso: ~63%
Expira: 05 de dezembro de 2025
```

### Card de Qualificação:
```
Seu Nível Atual: 10 de 10
Progress bar: 100% completo
🎉 Parabéns! Você alcançou o nível máximo
```

### Navegação Rápida:
```
🌐 Minha Rede → Ver 5 diretos + downlines
💵 Sacar → Sacar $1,231.75
📊 GMI Edge → Ver trading
🔒 Transparência → Proofs on-chain
```

---

## ❌ SOLUÇÃO DE PROBLEMAS

### Problema 1: "Connect Wallet" não aparece
**Solução:** Recarregue a página (F5)

### Problema 2: MetaMask não abre
**Solução:**
1. Verifique se a extensão está instalada
2. Clique no ícone da raposa no navegador
3. Desbloqueie com sua senha

### Problema 3: Dados não aparecem
**Solução:**
1. Verifique se está na rede BSC Testnet (não Ethereum)
2. Verifique se a conta Pioneer está selecionada
3. Abra o Console do navegador (F12) e veja se há erros
4. Recarregue a página

### Problema 4: "Network not supported"
**Solução:**
1. Mude para BSC Testnet no MetaMask
2. Recarregue o dashboard

---

## 🎯 DADOS ESPERADOS (CONFIRMAÇÃO)

Quando conectar, você verá:

**Pioneer:**
- Address: 0x75d1...1669
- Saldo: $1,231.75
- 5 Diretos
- Nível 10/10

**Diretos (5 pessoas):**
1. 0x5d32...0d65 - $243.00
2. 0xe31f...66ac - $270.00
3. 0xdb72...4b40 - $297.00
4. 0xb1f0...45fa - $324.00
5. 0x7eb0...28cd - $202.50

---

## 📞 SE NÃO FUNCIONAR

Me envie:
1. Print do erro (se houver)
2. Console do navegador (F12 → Console)
3. Rede selecionada no MetaMask
4. Conta selecionada no MetaMask

---

**🚀 BOA SORTE! Os dados estão todos lá esperando você conectar!**
