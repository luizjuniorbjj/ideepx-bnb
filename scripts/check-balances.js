/**
 * 💰 Verificar Balances de USDT
 */

import pkg from "hardhat";
const { ethers } = pkg;

const USDT_ADDRESS = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

const ADMIN = "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2";
const PIONEER = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 VERIFICANDO BALANCES DE CAPITAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Conectar ao USDT
    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        USDT_ADDRESS
    );

    // Conectar ao Main
    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        MAIN_ADDRESS
    );

    // ADMIN
    console.log('👨‍💼 ADMIN:');
    console.log(`   Endereço: ${ADMIN}`);

    const adminUSDT = await usdt.balanceOf(ADMIN);
    console.log(`   💵 USDT na carteira: ${ethers.formatUnits(adminUSDT, 6)} USDT`);

    try {
        const adminDashboard = await main.getUserDashboard(ADMIN);
        console.log(`   📊 No contrato:`);
        console.log(`      • Disponível: ${ethers.formatUnits(adminDashboard.available, 6)} USDT`);
        console.log(`      • Locked: ${ethers.formatUnits(adminDashboard.locked, 6)} USDT`);
        console.log(`      • Total Earned: ${ethers.formatUnits(adminDashboard.totalEarned, 6)} USDT`);
    } catch (e) {
        console.log(`   📊 Não registrado no contrato`);
    }

    console.log('');

    // PIONEER
    console.log('⭐ PIONEER:');
    console.log(`   Endereço: ${PIONEER}`);

    const pioneerUSDT = await usdt.balanceOf(PIONEER);
    console.log(`   💵 USDT na carteira: ${ethers.formatUnits(pioneerUSDT, 6)} USDT`);

    const pioneerDashboard = await main.getUserDashboard(PIONEER);
    console.log(`   📊 No contrato:`);
    console.log(`      • Disponível: ${ethers.formatUnits(pioneerDashboard.available, 6)} USDT`);
    console.log(`      • Locked: ${ethers.formatUnits(pioneerDashboard.locked, 6)} USDT`);
    console.log(`      • Total Earned: ${ethers.formatUnits(pioneerDashboard.totalEarned, 6)} USDT`);
    console.log(`      • Diretos: ${pioneerDashboard.directs.toString()}`);
    console.log(`      • LAI Ativo: ${pioneerDashboard.laiActive ? 'Sim' : 'Não'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO TOTAL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const adminTotal = adminUSDT;
    const pioneerTotal = pioneerUSDT + BigInt(pioneerDashboard.available);

    console.log(`💰 Admin: ${ethers.formatUnits(adminTotal, 6)} USDT (total)`);
    console.log(`⭐ Pioneer: ${ethers.formatUnits(pioneerTotal, 6)} USDT (carteira + contrato)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔗 Verificar no BSCScan:');
    console.log(`   USDT: https://testnet.bscscan.com/address/${USDT_ADDRESS}`);
    console.log(`   Main: https://testnet.bscscan.com/address/${MAIN_ADDRESS}`);
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    });
