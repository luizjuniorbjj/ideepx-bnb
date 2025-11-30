# 🚀 GUIA COMPLETO - BSC + USDT BEP-20

## 📋 ÍNDICE
1. [Setup Inicial](#setup-inicial)
2. [Conseguir BNB Testnet](#conseguir-bnb-testnet)
3. [Deploy em BSC Testnet](#deploy-testnet)
4. [Deploy em BSC Mainnet](#deploy-mainnet)
5. [Integração com USDT BEP-20](#integracao-usdt)
6. [Custos e Estimativas](#custos)

---

## 🎯 SETUP INICIAL

### 1. Instalar Dependências

```bash
cd ideepx-contracts
npm install
```

### 2. Configurar .env

```bash
cp .env.example .env
nano .env
```

Preencher:
```env
# Sua chave privada (SEM 0x no início)
PRIVATE_KEY=sua_chave_privada_aqui

# Backend address (pode ser igual ao deployer inicialmente)
BACKEND_ADDRESS=0x_seu_endereco_backend

# BSCScan API Key (para verificação)
BSCSCAN_API_KEY=sua_api_key_bscscan

# RPC URLs (opcional, já tem defaults)
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

### 3. Adicionar BSC no MetaMask

#### BSC TESTNET:
```
Network Name: BNB Smart Chain Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: tBNB
Block Explorer: https://testnet.bscscan.com
```

#### BSC MAINNET:
```
Network Name: BNB Smart Chain
RPC URL: https://bsc-dataseed1.binance.org
Chain ID: 56
Currency Symbol: BNB
Block Explorer: https://bscscan.com
```

**Ou usar ChainList:**
- Testnet: https://chainlist.org/chain/97
- Mainnet: https://chainlist.org/chain/56

---

## 💰 CONSEGUIR BNB TESTNET

### Método 1: Faucet Oficial (RECOMENDADO)

```
🔗 URL: https://testnet.bnbchain.org/faucet-smart

PASSO A PASSO:
1. Acesse o site
2. Conecte sua wallet ou cole endereço
3. Escolha verificação:
   - Twitter: Tweet e cole link
   - GitHub: Autorize acesso
4. Complete CAPTCHA
5. Clique "Give me BNB"
6. Aguarde 1-2 minutos

RECEBE: 0.1 - 0.5 tBNB ✅
LIMITE: 1x por 24 horas
```

### Método 2: BNB Chain Discord

```
1. Entre no Discord: https://discord.gg/bnbchain
2. Vá para canal #testnet-faucet
3. Digite: /faucet seu_endereco_aqui
4. Aguarde aprovação (10-30 min)
5. Receba ~0.5 tBNB
```

### Método 3: Faucets Alternativos

```
CHAINSTACK:
└─ https://faucet.chainstack.com/bsc-testnet-faucet
└─ Requer conta gratuita

BNBCHAIN FAUCET:
└─ https://www.bnbchain.org/en/testnet-faucet
└─ Verificação via social media
```

---

## 🧪 DEPLOY EM BSC TESTNET

### 1. Compilar Contratos

```bash
npx hardhat compile
```

### 2. Testar Localmente

```bash
npx hardhat test
```

### 3. Deploy no Testnet

```bash
# Verificar saldo antes
npx hardhat run scripts/check-balance.js --network bscTestnet

# Deploy
npm run deploy:bscTestnet
```

### 4. Verificar no Explorer

Após deploy, copie endereço do contrato e verifique:
```
https://testnet.bscscan.com/address/SEU_ENDERECO_CONTRATO
```

### 5. Verificar Código Fonte

```bash
# Verificar Rulebook
npx hardhat verify --network bscTestnet ENDERECO_RULEBOOK "IPFS_CID" "CONTENT_HASH"

# Verificar Proof
npx hardhat verify --network bscTestnet ENDERECO_PROOF BACKEND_ADDRESS RULEBOOK_ADDRESS
```

---

## 🚀 DEPLOY EM BSC MAINNET

### 1. Preparação (IMPORTANTE!)

```bash
# ✅ CHECKLIST PRÉ-DEPLOY:
[ ] Contratos testados 100% no testnet
[ ] Wallet tem BNB suficiente (~$10-15)
[ ] .env configurado corretamente
[ ] Backend address correto
[ ] Rulebook JSON no IPFS com contentHash
[ ] Backup da private key em lugar seguro
[ ] BSCScan API key configurada
```

### 2. Deploy Rulebook (Primeiro)

```bash
# Deploy Rulebook (plano imutável)
npx hardhat run scripts/deploy-rulebook.js --network bsc

# ANOTAR: Endereço do Rulebook
# Exemplo: 0x1234...
```

### 3. Deploy Proof Contract (Segundo)

```bash
# Editar deploy.js com endereço do Rulebook
# Depois executar:
npx hardhat run scripts/deploy-proof.js --network bsc

# ANOTAR: Endereço do Proof
# Exemplo: 0x5678...
```

### 4. Verificar Contratos

```bash
# Verificar Rulebook
npx hardhat verify --network bsc ENDERECO_RULEBOOK "IPFS_CID" "0x..."

# Verificar Proof
npx hardhat verify --network bsc ENDERECO_PROOF BACKEND_ADDRESS RULEBOOK_ADDRESS
```

### 5. Verificar no BSCScan

```
https://bscscan.com/address/SEU_ENDERECO_CONTRATO
```

---

## 💲 INTEGRAÇÃO COM USDT BEP-20

### Endereços USDT:

```javascript
// MAINNET
const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";

// TESTNET (Mock - você precisa criar)
const USDT_TESTNET = "SEU_MOCK_USDT_AQUI";
```

### Como Usar USDT no Testnet:

#### Opção A: Deploy Mock USDT

Vou criar um contrato mock:

```solidity
// MockUSDT.sol (para testnet)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUSDT {
    string public name = "Mock USDT";
    string public symbol = "USDT";
    uint8 public decimals = 18;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Qualquer um pode mintar (apenas testnet!)
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}
```

Deploy do Mock:
```bash
npx hardhat run scripts/deploy-mock-usdt.js --network bscTestnet
```

Depois mintar USDT para testes:
```bash
npx hardhat run scripts/mint-usdt.js --network bscTestnet
```

#### Opção B: Usar tBNB no Testnet

Para testes, pode usar tBNB diretamente sem USDT.

---

### Script de Pagamento USDT (Batch)

```javascript
// scripts/batch-pay-usdt.js
const { ethers } = require("hardhat");

async function main() {
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    
    const [signer] = await ethers.getSigners();
    
    // Conectar ao USDT
    const USDT = await ethers.getContractAt(
        "IERC20",
        USDT_ADDRESS,
        signer
    );
    
    // Lista de pagamentos (userId => address => amount)
    const payments = [
        { address: "0x123...", amount: ethers.parseUnits("10.50", 18) },
        { address: "0x456...", amount: ethers.parseUnits("25.75", 18) },
        // ... até 100 por batch
    ];
    
    // Batch transfer
    for (const payment of payments) {
        const tx = await USDT.transfer(
            payment.address,
            payment.amount
        );
        await tx.wait();
        console.log(`✅ Paid ${ethers.formatUnits(payment.amount, 18)} USDT to ${payment.address}`);
    }
    
    console.log(`✅ Batch complete! ${payments.length} payments sent`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

---

## 💰 CUSTOS ESTIMADOS

### Deploy (Uma Vez):

```
BSC MAINNET:
├─ Rulebook: ~350k gas × 3 gwei = 0.00105 BNB (~$0.63)
├─ Proof: ~750k gas × 3 gwei = 0.00225 BNB (~$1.35)
└─ TOTAL DEPLOY: ~$2.00 ✅

BSC TESTNET:
└─ GRÁTIS (tBNB do faucet)
```

### Operação Semanal:

```
submitWeeklyProof():
├─ ~200k gas × 3 gwei = 0.0006 BNB
└─ ~$0.36/semana

finalizeWeek():
├─ ~50k gas × 3 gwei = 0.00015 BNB
└─ ~$0.09/semana

TOTAL SEMANAL: ~$0.45
TOTAL ANUAL: 52 × $0.45 = ~$23.40 ✅
```

### Pagamentos USDT:

```
INDIVIDUAL (200 usuários):
├─ 200 × 50k gas × 3 gwei = 30M gas
├─ 30M gas = 0.09 BNB
└─ ~$54/semana = $2.808/ano ❌ CARO!

BATCH (100 usuários por TX):
├─ 500k gas × 3 gwei = 0.0015 BNB
├─ 2 batches = 0.003 BNB
└─ ~$1.80/semana = $93.60/ano ✅ MELHOR!

ECONOMIA: 97% com batch transfers!
```

---

## 📊 RESUMO DE CUSTOS (BSC MAINNET)

```
╔═══════════════════════════════════════════╗
║  CUSTOS BSC + USDT BEP-20                ║
╠═══════════════════════════════════════════╣
║  Deploy inicial (1x):      $2.00         ║
║  Operação/semana:          $0.45         ║
║  Operação/ano:             $23.40        ║
║                                           ║
║  Pagamentos USDT:                         ║
║  - Individual (200):       $2.808/ano    ║
║  - Batch (200):            $93.60/ano    ║
║                                           ║
║  TOTAL ANO 1 (batch):      $119          ║
║  TOTAL ANOS 2+ (batch):    $117/ano      ║
╠═══════════════════════════════════════════╣
║  Per user/ano (200 users): $0.58         ║
╚═══════════════════════════════════════════╝

💡 Com 1.000 usuários: ~$0.50/user/ano
💡 Com 10.000 usuários: ~$0.15/user/ano
```

---

## 🔧 SCRIPTS ÚTEIS

### Verificar Saldo BNB:

```javascript
// scripts/check-balance.js
const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(signer.address);
    
    console.log("Address:", signer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB");
}

main();
```

```bash
npx hardhat run scripts/check-balance.js --network bscTestnet
npx hardhat run scripts/check-balance.js --network bsc
```

### Verificar Saldo USDT:

```javascript
// scripts/check-usdt-balance.js
const { ethers } = require("hardhat");

async function main() {
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    const [signer] = await ethers.getSigners();
    
    const USDT = await ethers.getContractAt("IERC20", USDT_ADDRESS);
    const balance = await USDT.balanceOf(signer.address);
    
    console.log("Address:", signer.address);
    console.log("USDT Balance:", ethers.formatUnits(balance, 18), "USDT");
}

main();
```

```bash
npx hardhat run scripts/check-usdt-balance.js --network bsc
```

---

## 🆘 TROUBLESHOOTING

### Erro: "insufficient funds for gas"

```
SOLUÇÃO:
1. Verificar saldo BNB
2. Adicionar mais BNB na wallet
3. Testnet: pegar mais no faucet
4. Mainnet: comprar BNB
```

### Erro: "nonce too high"

```
SOLUÇÃO:
npx hardhat clean
rm -rf cache artifacts
npx hardhat compile
```

### Erro: "transaction underpriced"

```
SOLUÇÃO:
Aumentar gasPrice no hardhat.config.js:
gasPrice: 5000000000, // 5 gwei → 10 gwei
```

### Faucet não funciona:

```
SOLUÇÕES:
1. Tentar em horário diferente
2. Usar Discord oficial
3. Pedir ajuda na comunidade
4. Usar outro faucet alternativo
5. Pedir para alguém enviar tBNB
```

---

## ✅ CHECKLIST FINAL

```
ANTES DE IR PARA MAINNET:

[ ] Testado 100% no testnet
[ ] Deploy funcionou sem erros
[ ] Submit proof testado
[ ] Finalize week testado
[ ] Verificação no BSCScan ok
[ ] Backend integrado e testado
[ ] IPFS funcionando corretamente
[ ] Wallet de produção separada
[ ] Backup de private keys feito
[ ] Documentação atualizada
[ ] Time avisado sobre deploy
[ ] Monitoring configurado

APÓS DEPLOY MAINNET:

[ ] Endereços anotados (Rulebook + Proof)
[ ] Contratos verificados no BSCScan
[ ] Testes em produção realizados
[ ] Backend apontando para mainnet
[ ] Frontend atualizado com endereços
[ ] Usuários notificados
[ ] Primeiras provas submetidas ok
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Conseguir tBNB no faucet
2. ✅ Deploy no testnet
3. ✅ Testar fluxo completo
4. ✅ Corrigir bugs se houver
5. ✅ Deploy no mainnet
6. ✅ Começar operação!

---

**Boa sorte com o deploy! 🚀**

Se precisar de ajuda, estou aqui!
