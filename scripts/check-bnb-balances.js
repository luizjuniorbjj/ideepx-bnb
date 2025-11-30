/**
 * 💰 Verificar Balances de BNB
 */

import pkg from "hardhat";
const { ethers } = pkg;

const ADMIN = "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2";
const PIONEER = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

async function main() {
    console.log('\n💰 VERIFICANDO BALANCES DE BNB\n');

    // Admin
    const adminBnb = await ethers.provider.getBalance(ADMIN);
    console.log('👨‍💼 Admin:', ADMIN);
    console.log('   BNB:', ethers.formatEther(adminBnb), 'tBNB\n');

    // Pioneer
    const pioneerBnb = await ethers.provider.getBalance(PIONEER);
    console.log('⭐ Pioneer:', PIONEER);
    console.log('   BNB:', ethers.formatEther(pioneerBnb), 'tBNB\n');

    // Deployer
    const [deployer] = await ethers.getSigners();
    const deployerBnb = await ethers.provider.getBalance(deployer.address);
    console.log('🔧 Deployer:', deployer.address);
    console.log('   BNB:', ethers.formatEther(deployerBnb), 'tBNB\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO:');
    console.log(`   Admin: ${ethers.formatEther(adminBnb)} tBNB`);
    console.log(`   Pioneer: ${ethers.formatEther(pioneerBnb)} tBNB`);
    console.log(`   Deployer: ${ethers.formatEther(deployerBnb)} tBNB`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
