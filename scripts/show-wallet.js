import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const [signer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(signer.address);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 INFORMAÇÕES DA CARTEIRA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📍 Endereço:', signer.address);
    console.log('💰 Saldo:', ethers.formatEther(balance), 'BNB');
    console.log('');

    // Necessário para deploy
    const needed = ethers.parseEther("0.006"); // ~0.006 BNB
    const hasEnough = balance >= needed;

    if (hasEnough) {
        console.log('✅ Saldo suficiente para deploy!');
    } else {
        const missing = needed - balance;
        console.log('⚠️  Saldo insuficiente!');
        console.log('   Necessário:', ethers.formatEther(needed), 'BNB');
        console.log('   Faltam:', ethers.formatEther(missing), 'BNB');
        console.log('');
        console.log('🚰 Pegue BNB testnet em:');
        console.log('   https://testnet.bnbchain.org/faucet-smart');
    }
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
