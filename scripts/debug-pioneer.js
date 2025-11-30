/**
 * 🔍 Debug Pioneer Registration
 */

import pkg from "hardhat";
const { ethers } = pkg;

const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";
const PIONEER_WALLET = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

async function main() {
    console.log('\n🔍 Debugando registro do Pioneer...\n');

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        MAIN_ADDRESS
    );

    // Tentar pegar dados do usuário diretamente
    console.log('1. Verificando users mapping:');
    try {
        const userData = await main.users(PIONEER_WALLET);
        console.log('   registered:', userData.registered);
        console.log('   sponsor:', userData.sponsor);
        console.log('   level:', userData.level.toString());
        console.log('   laiActive:', userData.laiActive);
    } catch (e) {
        console.log('   ❌ Erro:', e.message);
    }

    console.log('\n2. Verificando getUserDashboard:');
    try {
        const dashboard = await main.getUserDashboard(PIONEER_WALLET);
        console.log('   available:', ethers.formatUnits(dashboard[0], 6));
        console.log('   locked:', ethers.formatUnits(dashboard[1], 6));
        console.log('   totalEarned:', ethers.formatUnits(dashboard[2], 6));
        console.log('   laiActive:', dashboard[3]);
        console.log('   laiExpires:', dashboard[4].toString());
        console.log('   level:', dashboard[5].toString());
        console.log('   directs:', dashboard[6].toString());
        console.log('   volume:', ethers.formatUnits(dashboard[7], 6));
    } catch (e) {
        console.log('   ❌ Erro:', e.message);
    }

    console.log('\n3. Tentando registrar Pioneer:');
    try {
        const tx = await main.registerUser(PIONEER_WALLET, ethers.ZeroAddress);
        await tx.wait();
        console.log('   ✅ Pioneer registrado!');
    } catch (e) {
        console.log('   ❌ Erro:', e.message);
    }

    console.log('\n4. Verificando novamente após tentativa:');
    try {
        const userData = await main.users(PIONEER_WALLET);
        console.log('   registered:', userData.registered);
    } catch (e) {
        console.log('   ❌ Erro:', e.message);
    }

    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
