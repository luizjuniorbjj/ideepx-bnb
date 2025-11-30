// scripts/check-balance.js
// Verifica saldo BNB da carteira

const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking wallet balance...\n");

    const [signer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log(`📡 Network: ${network.name} (chainId: ${network.chainId})`);
    console.log(`👤 Address: ${signer.address}`);
    
    const balance = await ethers.provider.getBalance(signer.address);
    const balanceInEther = ethers.formatEther(balance);
    
    console.log(`💰 Balance: ${balanceInEther} BNB/ETH/MATIC\n`);
    
    // Verificar se tem saldo suficiente
    const minRequired = ethers.parseEther("0.01"); // 0.01 BNB mínimo
    
    if (balance < minRequired) {
        console.log("⚠️  WARNING: Balance is low!");
        console.log("   You may not have enough funds for deployment.");
        console.log(`   Recommended minimum: 0.01 BNB\n`);
    } else {
        console.log("✅ Balance is sufficient for deployment!\n");
    }
    
    return {
        address: signer.address,
        balance: balanceInEther,
        network: network.name
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
