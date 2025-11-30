# 🚀 HARDHAT NETWORK - TESTNET LOCAL INFINITO

---

## 🎯 O QUE É HARDHAT NETWORK?

```
Blockchain LOCAL no seu computador:
✅ BNB infinito (você controla tudo)
✅ Deploy instantâneo (sem esperar blocos)
✅ Reset quando quiser
✅ Fork da BSC mainnet (dados reais)
✅ ZERO custos
✅ Testes ilimitados
✅ Não depende de faucets!

= SOLUÇÃO PROFISSIONAL! 🏆
```

---

## 📦 INSTALAÇÃO (5 MIN)

### 1. Instalar Hardhat

```bash
# No seu projeto:
npm install --save-dev hardhat

# Ou se não instalou ainda:
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

---

## ⚙️ CONFIGURAÇÃO

### 2. Criar hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  
  networks: {
    // 🎯 HARDHAT NETWORK (LOCAL)
    hardhat: {
      chainId: 31337,
      
      // 💰 CONTAS PRÉ-FINANCIADAS (10,000 BNB cada!)
      accounts: {
        count: 100,              // 100 contas
        accountsBalance: "10000000000000000000000" // 10k BNB cada
      },
      
      // 🔄 FORK DA BSC MAINNET (opcional mas recomendado!)
      forking: {
        url: "https://bsc-dataseed.binance.org/",
        enabled: true
      },
      
      // ⚡ MINING INSTANTÂNEO
      mining: {
        auto: true,
        interval: 0  // Blocks imediatos
      }
    },
    
    // BSC Testnet (quando quiser testar de verdade)
    bscTestnet: {
      url: process.env.TESTNET_RPC_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY],
      chainId: 97
    },
    
    // BSC Mainnet (produção)
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [process.env.MAINNET_PRIVATE_KEY],
      chainId: 56
    }
  }
};
```

---

## 🚀 USAR HARDHAT NETWORK

### 3. Iniciar Nó Local

```bash
# Terminal 1: Iniciar blockchain local
npx hardhat node

# Vai mostrar:
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
... (98 more accounts!)

🎉 Você tem 100 contas com 10,000 BNB cada! ∞
```

---

### 4. Deploy no Local

```bash
# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network hardhat

# Ou se quer ver no console:
npx hardhat console --network hardhat
```

---

### 5. Conectar MetaMask (opcional)

```
ADICIONAR REDE NO METAMASK:

Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: BNB

IMPORTAR CONTA:
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Saldo: 10,000 BNB! 🎉
```

---

## 🤖 RODAR SEU BOT NO LOCAL

### 6. Configurar .env para Local

```bash
# .env para testes locais:

# Hardhat Network Local
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337

# Conta com 10k BNB
TESTNET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Seu contrato deployado no local
CONTRACT_ADDRESS=0x...endereço_do_deploy_local

# Mock USDT (você cria)
USDT_TESTNET=0x...endereço_mock_usdt

# Endereços locais
MULTISIG_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
LIQUIDITY_POOL_WALLET=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
INFRASTRUCTURE_WALLET=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
COMPANY_WALLET=0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

---

### 7. Rodar Bot

```bash
# Agora seu bot roda com BNB infinito!
python intelligent_test_bot.py

# Ou testes Hardhat:
npx hardhat test

# Tudo instantâneo, sem custos! ✅
```

---

## 💰 CRIAR MOCK USDT (NECESSÁRIO)

### 8. MockUSDT.sol

```solidity
// contracts/MockUSDT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        // Mint 1 milhão USDT para deployer
        _mint(msg.sender, 1000000 * 10**6);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // USDT tem 6 decimais
    }
    
    // Função para dar USDT para qualquer um (só testnet!)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
```

### 9. Deploy MockUSDT

```javascript
// scripts/deployMockUSDT.js
async function main() {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    
    console.log("Mock USDT deployed to:", await usdt.getAddress());
    
    // Mint para várias contas
    const accounts = await ethers.getSigners();
    for (let i = 0; i < 10; i++) {
        await usdt.mint(accounts[i].address, ethers.parseUnits("100000", 6));
        console.log(`Minted 100k USDT to ${accounts[i].address}`);
    }
}

main();
```

```bash
# Deploy:
npx hardhat run scripts/deployMockUSDT.js --network hardhat
```

---

## 🎯 WORKFLOW COMPLETO

```
📅 DIA-A-DIA:

1. DESENVOLVER (Local):
   npx hardhat node
   └─ Deploy e teste no local
   └─ BNB infinito
   └─ Iteração rápida

2. TESTAR (Testnet):
   npx hardhat run scripts/deploy.js --network bscTestnet
   └─ Validar em ambiente real
   └─ Usar faucets quando necessário

3. PRODUÇÃO (Mainnet):
   npx hardhat run scripts/deploy.js --network bscMainnet
   └─ Deploy final
   └─ BNB real
```

---

## ✅ VANTAGENS HARDHAT NETWORK

```
vs FAUCETS:
✅ BNB: Infinito vs 0.3-0.5/dia
✅ Velocidade: Instantâneo vs 10-60s
✅ Contas: 100 vs 1
✅ Reset: Sim vs Não
✅ Custo: $0 vs Tempo perdido
✅ Dependência: Zero vs Faucets
✅ Debugging: Excelente vs Limitado

= HARDHAT WINS! 🏆
```

---

## 🎯 QUANDO USAR CADA UM

```
🏠 HARDHAT LOCAL (90% do tempo):
- Desenvolvimento
- Testes unitários
- Testes de integração
- Debugging
- Iteração rápida

🌐 BSC TESTNET (5% do tempo):
- Validação final
- Testes com frontend real
- Simular ambiente real
- Antes do mainnet

🚀 BSC MAINNET (5% do tempo):
- Deploy produção
- Operação real
- Usuários reais
```

---

## 💡 DICA PRO: FORK DA MAINNET

```
FORK = Cópia da mainnet no seu PC!

VANTAGENS:
✅ Dados reais (contratos, saldos)
✅ Testa com USDT real (fork)
✅ Simula cenários reais
✅ Mas SEM gastar BNB real!

CONFIGURAÇÃO (já incluída acima):
forking: {
  url: "https://bsc-dataseed.binance.org/",
  enabled: true
}

USO:
npx hardhat node --fork https://bsc-dataseed.binance.org/

= Você tem a mainnet INTEIRA no seu PC! 🤯
```

---

## 🐛 TROUBLESHOOTING

### "Cannot find module hardhat"
```bash
npm install --save-dev hardhat
```

### "Forking not working"
```bash
# Desabilitar fork temporariamente:
forking: {
  enabled: false
}
```

### "Port 8545 already in use"
```bash
# Matar processo:
lsof -ti:8545 | xargs kill -9

# Ou usar porta diferente:
npx hardhat node --port 8546
```

---

## 📚 RECURSOS

```
📖 Docs Hardhat: https://hardhat.org/docs
📖 Hardhat Network: https://hardhat.org/hardhat-network
📖 Forking: https://hardhat.org/guides/mainnet-forking
📖 Testing: https://hardhat.org/tutorial/testing-contracts
```

---

## ✅ CHECKLIST

```
⏳ Hardhat instalado
⏳ hardhat.config.js configurado
⏳ MockUSDT criado e deployado
⏳ Nó local rodando (npx hardhat node)
⏳ Contrato deployado no local
⏳ Bot configurado para local
⏳ Testes rodando

= PRONTO PARA TESTAR INFINITAMENTE! ∞
```

---

## 🎉 RESULTADO FINAL

```
ANTES (com faucets):
❌ Dependente de faucets
❌ Limite de 0.3-0.5 BNB/dia
❌ Espera de 24h
❌ Carteira precisa histórico
❌ Slow

DEPOIS (com Hardhat):
✅ 100 contas com 10k BNB cada
✅ BNB ilimitado
✅ Instantâneo
✅ Zero dependências
✅ Fast!

= SOLUÇÃO PROFISSIONAL! 🏆
```

---

**Isso é o que grandes projetos fazam! Agora você também pode! 🚀**
