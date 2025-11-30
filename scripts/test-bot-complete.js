/**
 * 🤖 iDeepX Test Bot - Versão Completa
 *
 * Agora que Pioneer está registrado, vamos:
 * 1. Gerar 50 novos usuários (salvando private keys)
 * 2. Financiar
 * 3. Registrar (vai funcionar!)
 * 4. Ativar LAI
 * 5. Testar distribuição
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    CONTRACT_ADDRESS: "0x1dEdE431aa189fc5790c4837014192078A89870F",
    USDT_ADDRESS: "0x89173cb21b8f8Ac8Bf6680c85541f5826B992C0f",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    // Quantidade reduzida para teste rápido
    USERS_TO_CREATE: 20, // Vamos criar apenas 20 usuários para teste rápido

    LAI_FEE: ethers.parseUnits("19", 6),
    BNB_AMOUNT: ethers.parseEther("0.03"),
    USDT_AMOUNT: ethers.parseUnits("500", 6)
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 iDeepX Test Bot - VERSÃO COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [deployer] = await ethers.getSigners();
    console.log('🔧 Deployer:', deployer.address);
    console.log('⭐ Pioneer:', CONFIG.PIONEER_WALLET);
    console.log(`👥 Criando ${CONFIG.USERS_TO_CREATE} usuários de teste`);
    console.log('');

    // Conectar contratos
    const contract = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONFIG.CONTRACT_ADDRESS
    );

    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDT.sol:MockUSDT",
        CONFIG.USDT_ADDRESS
    );

    // Verificar Pioneer
    console.log('🔍 Verificando Pioneer...');
    try {
        const dashboard = await contract.getUserDashboard(CONFIG.PIONEER_WALLET);
        console.log('✅ Pioneer registrado');
        console.log(`   Diretos atuais: ${dashboard.directs}`);
        console.log(`   LAI ativo: ${dashboard.laiActive ? 'Sim' : 'Não'}\n`);
    } catch (error) {
        console.log('❌ Pioneer não está registrado! Execute register-pioneer.js primeiro');
        process.exit(1);
    }

    // Gerar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 GERANDO ${CONFIG.USERS_TO_CREATE} USUÁRIOS`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const users = [];

    for (let i = 0; i < CONFIG.USERS_TO_CREATE; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

        users.push({
            id: i + 1,
            address: wallet.address,
            privateKey: wallet.privateKey,
            wallet: wallet,
            name: `USER_${(i + 1).toString().padStart(2, '0')}`,
            sponsor: CONFIG.PIONEER_WALLET
        });

        if ((i + 1) % 5 === 0) {
            console.log(`  ✅ ${i + 1}/${CONFIG.USERS_TO_CREATE} usuários gerados...`);
        }
    }

    console.log(`\n✅ ${users.length} usuários gerados\n`);

    // Financiar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 FINANCIANDO USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let funded = 0;

    for (const user of users) {
        try {
            // Send BNB
            const bnbTx = await deployer.sendTransaction({
                to: user.address,
                value: CONFIG.BNB_AMOUNT
            });
            await bnbTx.wait();

            // Mint USDT
            const usdtTx = await usdt.mint(user.address, CONFIG.USDT_AMOUNT);
            await usdtTx.wait();

            funded++;

            if (funded % 5 === 0) {
                console.log(`  ✅ ${funded}/${users.length} financiados...`);
            }

        } catch (error) {
            console.log(`  ❌ Erro ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${funded} usuários financiados\n`);

    // Registrar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 REGISTRANDO USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let registered = 0;

    for (const user of users) {
        try {
            const tx = await contract.registerUser(
                user.address,
                CONFIG.PIONEER_WALLET
            );
            await tx.wait();

            registered++;

            if (registered % 5 === 0) {
                console.log(`  ✅ ${registered}/${users.length} registrados...`);
            }

        } catch (error) {
            console.log(`  ❌ Erro ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${registered} usuários registrados\n`);

    // Ativar LAI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎫 ATIVANDO LAI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let activated = 0;

    for (const user of users) {
        try {
            // Approve
            const approveTx = await usdt
                .connect(user.wallet)
                .approve(CONFIG.CONTRACT_ADDRESS, CONFIG.LAI_FEE);
            await approveTx.wait();

            // Activate
            const activateTx = await contract
                .connect(user.wallet)
                .activateLAI();
            await activateTx.wait();

            activated++;

            if (activated % 5 === 0) {
                console.log(`  ✅ ${activated}/${users.length} LAIs ativados...`);
            }

        } catch (error) {
            console.log(`  ❌ Erro ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${activated} LAIs ativados\n`);

    // Verificar Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ VERIFICAR PIONEER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pioneerDashboard = await contract.getUserDashboard(CONFIG.PIONEER_WALLET);
    console.log('📊 Dashboard do Pioneer:');
    console.log('   Diretos:', pioneerDashboard.directs.toString());
    console.log('   LAI Ativo:', pioneerDashboard.laiActive ? 'Sim' : 'Não');
    console.log('   Balance:', ethers.formatUnits(pioneerDashboard.available, 6), 'USDT');
    console.log('');

    // Salvar dados
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 SALVANDO DADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const data = {
        timestamp: new Date().toISOString(),
        pioneer: CONFIG.PIONEER_WALLET,
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
            sponsor: u.sponsor
        }))
    };

    const filename = `test-users-complete-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Dados salvos em: ${filename}`);
    console.log('');

    // Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTE COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo:');
    console.log(`   Usuários criados: ${users.length}`);
    console.log(`   Financiados: ${funded}`);
    console.log(`   Registrados: ${registered}`);
    console.log(`   LAI ativados: ${activated}`);
    console.log(`   Pioneer diretos: ${pioneerDashboard.directs}`);
    console.log('');

    console.log('📋 Próximos passos:');
    console.log('   1. Depositar performance (deploy já fez $10k)');
    console.log('   2. Processar batch');
    console.log('   3. Verificar distribuição');
    console.log('');

    console.log('🔗 Links úteis:');
    console.log(`   Contrato: https://testnet.bscscan.com/address/${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`   Pioneer: https://testnet.bscscan.com/address/${CONFIG.PIONEER_WALLET}`);
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    });
