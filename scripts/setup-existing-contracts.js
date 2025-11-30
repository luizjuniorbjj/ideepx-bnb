/**
 * 🎁 Setup para Contratos Já Deployados
 *
 * Use este script quando os contratos já existem
 */

import pkg from "hardhat";
const { ethers } = pkg;

// ⚠️ EDITE AQUI os endereços dos contratos JÁ deployados:
const DEPLOYED_USDT = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
const DEPLOYED_MAIN = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

const CONFIG = {
    ADMIN_WALLET: "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    ADMIN_TOKENS: ethers.parseUnits("10000000", 6), // $10M
    PIONEER_TOKENS: ethers.parseUnits("100000", 6), // $100k
    USER_TOKENS: ethers.parseUnits("5000", 6), // $5k
    USER_BNB: ethers.parseEther("0.03")
};

async function main() {
    console.log('\n🔗 Conectando aos contratos existentes...\n');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);
    console.log('USDT:', DEPLOYED_USDT);
    console.log('Main:', DEPLOYED_MAIN);
    console.log('');

    // Conectar
    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        DEPLOYED_USDT
    );

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        DEPLOYED_MAIN
    );

    // Mint para Admin e Pioneer
    console.log('💰 Minting test tokens...');

    try {
        const adminTx = await usdt.mint(CONFIG.ADMIN_WALLET, CONFIG.ADMIN_TOKENS, {
            gasLimit: 100000
        });
        await adminTx.wait();
        console.log('✅ Admin: $10,000,000');
    } catch (e) {
        console.log('⚠️ Admin mint failed:', e.message);
    }

    try {
        const pioneerTx = await usdt.mint(CONFIG.PIONEER_WALLET, CONFIG.PIONEER_TOKENS, {
            gasLimit: 100000
        });
        await pioneerTx.wait();
        console.log('✅ Pioneer: $100,000');
    } catch (e) {
        console.log('⚠️ Pioneer mint failed:', e.message);
    }

    // Verificar saldos
    console.log('\n📊 Verificando saldos...');
    const adminBalance = await usdt.balanceOf(CONFIG.ADMIN_WALLET);
    const pioneerBalance = await usdt.balanceOf(CONFIG.PIONEER_WALLET);
    console.log('Admin:', ethers.formatUnits(adminBalance, 6), 'USDT');
    console.log('Pioneer:', ethers.formatUnits(pioneerBalance, 6), 'USDT');

    // Registrar Pioneer se necessário
    console.log('\n⭐ Registrando Pioneer...');
    try {
        const dashboard = await main.getUserDashboard(CONFIG.PIONEER_WALLET);
        console.log('✅ Pioneer já registrado');
        console.log('   Diretos:', dashboard.directs.toString());
    } catch (error) {
        console.log('Registrando Pioneer...');
        const tx = await main.registerUser(CONFIG.PIONEER_WALLET, ethers.ZeroAddress);
        await tx.wait();
        console.log('✅ Pioneer registrado!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SETUP COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Próximos passos:\n');
    console.log('1. Pioneer deve ativar LAI:');
    console.log(`   - USDT: ${DEPLOYED_USDT}`);
    console.log(`   - approve(${DEPLOYED_MAIN}, 19000000)`);
    console.log('   - activateLAI()');
    console.log('');

    console.log('2. Admin pode depositar performance:');
    console.log('   - depositWeeklyPerformance(35000000000, "test-1")');
    console.log('');

    console.log('3. Criar usuários de teste:');
    console.log('   - Execute: npx hardhat run scripts/create-test-users.js --network bscTestnet');
    console.log('');

    console.log('🔗 Links:');
    console.log(`   Main: https://testnet.bscscan.com/address/${DEPLOYED_MAIN}`);
    console.log(`   USDT: https://testnet.bscscan.com/address/${DEPLOYED_USDT}`);
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
