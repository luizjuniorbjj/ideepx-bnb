/**
 * 🌟 Criar 5 DIRETOS para o Pioneer
 *
 * Pioneer PRECISA de 5 diretos para qualificar níveis 6-10
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    USDT_ADDRESS: "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc",
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    USER_BNB: ethers.parseEther("0.03"), // Gas
    USER_USDT: ethers.parseUnits("5000", 6), // $5k cada
    LAI_FEE: ethers.parseUnits("19", 6) // $19
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌟 CRIANDO 5 DIRETOS PARA O PIONEER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);
    console.log('Pioneer:', CONFIG.PIONEER_WALLET);
    console.log('');

    // Conectar contratos
    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        CONFIG.USDT_ADDRESS
    );

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONFIG.MAIN_ADDRESS
    );

    // PRIMEIRO: Registrar Pioneer se necessário
    console.log('⭐ Verificando Pioneer...');
    try {
        const dashboard = await main.getUserDashboard(CONFIG.PIONEER_WALLET);
        console.log('✅ Pioneer já registrado');
        console.log('   Diretos atuais:', dashboard.directs.toString());
    } catch (error) {
        console.log('📝 Registrando Pioneer...');
        const tx = await main.registerUser(CONFIG.PIONEER_WALLET, ethers.ZeroAddress);
        await tx.wait();
        console.log('✅ Pioneer registrado!');
    }
    console.log('');

    // Gerar 5 usuários
    console.log('👥 Gerando 5 usuários...\n');
    const users = [];

    for (let i = 1; i <= 5; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        users.push({
            id: i,
            name: `DIRECT_${i}`,
            address: wallet.address,
            privateKey: wallet.privateKey,
            wallet: wallet
        });
        console.log(`  ${i}. ${wallet.address.substring(0, 12)}...`);
    }

    console.log('\n✅ 5 usuários gerados!\n');

    // Financiar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 FINANCIANDO USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let funded = 0;

    for (const user of users) {
        try {
            // BNB para gas
            const bnbTx = await deployer.sendTransaction({
                to: user.address,
                value: CONFIG.USER_BNB
            });
            await bnbTx.wait();

            // USDT grátis
            const usdtTx = await usdt.mint(user.address, CONFIG.USER_USDT);
            await usdtTx.wait();

            funded++;
            console.log(`  ✅ ${user.name} financiado`);

        } catch (error) {
            console.log(`  ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${funded}/5 usuários financiados\n`);

    // Registrar como diretos do Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 REGISTRANDO COMO DIRETOS DO PIONEER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let registered = 0;

    for (const user of users) {
        try {
            const tx = await main.registerUser(
                user.address,
                CONFIG.PIONEER_WALLET
            );
            await tx.wait();

            registered++;
            console.log(`  ✅ ${user.name} → PIONEER`);

        } catch (error) {
            console.log(`  ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${registered}/5 registrados como diretos\n`);

    // Ativar LAI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎫 ATIVANDO LAI ($19 cada)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let activated = 0;

    for (const user of users) {
        try {
            // Approve
            const approveTx = await usdt
                .connect(user.wallet)
                .approve(CONFIG.MAIN_ADDRESS, CONFIG.LAI_FEE);
            await approveTx.wait();

            // Activate
            const activateTx = await main
                .connect(user.wallet)
                .activateLAI();
            await activateTx.wait();

            activated++;
            console.log(`  ✅ ${user.name} LAI ativo`);

        } catch (error) {
            console.log(`  ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${activated}/5 LAIs ativados\n`);

    // Verificar Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ VERIFICANDO PIONEER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pioneerDashboard = await main.getUserDashboard(CONFIG.PIONEER_WALLET);
    console.log('📊 Dashboard do Pioneer:');
    console.log('   Diretos:', pioneerDashboard.directs.toString());
    console.log('   LAI Ativo:', pioneerDashboard.laiActive ? 'Sim' : 'Não');
    console.log('   Nível:', pioneerDashboard.level.toString());
    console.log('   Balance:', ethers.formatUnits(pioneerDashboard.available, 6), 'USDT');
    console.log('');

    if (pioneerDashboard.directs >= 5) {
        console.log('🎉 PIONEER QUALIFICADO para níveis 6-10!');
    } else {
        console.log('⚠️  Pioneer ainda não tem 5 diretos');
    }

    // Salvar dados
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 SALVANDO DADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const data = {
        timestamp: new Date().toISOString(),
        network: "bscTestnet",
        pioneer: CONFIG.PIONEER_WALLET,
        contracts: {
            usdt: CONFIG.USDT_ADDRESS,
            main: CONFIG.MAIN_ADDRESS
        },
        stats: {
            created: users.length,
            funded: funded,
            registered: registered,
            activated: activated
        },
        users: users.map(u => ({
            id: u.id,
            name: u.name,
            address: u.address,
            privateKey: u.privateKey,
            sponsor: CONFIG.PIONEER_WALLET
        }))
    };

    const filename = `pioneer-5-directs-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Dados salvos: ${filename}\n`);

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SETUP COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo:');
    console.log(`   ⭐ Pioneer: ${pioneerDashboard.directs} diretos`);
    console.log(`   👥 Usuários criados: ${users.length}`);
    console.log(`   💰 Financiados: ${funded}`);
    console.log(`   📝 Registrados: ${registered}`);
    console.log(`   🎫 LAIs ativos: ${activated}`);
    console.log('');

    console.log('📋 Próximo passo:');
    console.log('   1. Pioneer ativar LAI ($19 dos $100k)');
    console.log('   2. Admin depositar performance');
    console.log('   3. Processar batch');
    console.log('   4. Verificar distribuição!');
    console.log('');

    console.log('🔗 Links:');
    console.log(`   Main: https://testnet.bscscan.com/address/${CONFIG.MAIN_ADDRESS}`);
    console.log(`   Pioneer: https://testnet.bscscan.com/address/${CONFIG.PIONEER_WALLET}`);
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    });
