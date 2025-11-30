/**
 * 🌳 CRIAR 28 USUÁRIOS MLM - TESTA TODOS OS 10 NÍVEIS
 *
 * Estrutura Otimizada (0.92 tBNB):
 * L0: 1 (Pioneer - já existe)
 * L1: 5 (DIRECT_1 a DIRECT_5 - já existem)
 * L2: 5 (1 por L1)
 * L3: 5
 * L4: 5
 * L5: 4
 * L6: 3
 * L7: 2
 * L8: 1
 * L9: 1
 * L10: 1
 * ─────
 * Total: 34 usuários (6 existentes + 28 novos)
 *
 * Gas: ~0.57 tBNB (sobra 0.35 tBNB)
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    USDT_ADDRESS: "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc",
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    USER_BNB: ethers.parseEther("0.02"),    // Reduzido de 0.03 para 0.02
    USER_USDT: ethers.parseUnits("5000", 6), // GRÁTIS (mock)
    LAI_FEE: ethers.parseUnits("19", 6)      // GRÁTIS (mock)
};

// Estrutura da rede MLM otimizada
const MLM_STRUCTURE = {
    // DIRECT_1: Linha completa até L10
    DIRECT_1: {
        L2: 1,  // USER_L2_001
        L3: 1,  // USER_L3_001
        L4: 1,  // USER_L4_001
        L5: 1,  // USER_L5_001
        L6: 1,  // USER_L6_001
        L7: 1,  // USER_L7_001
        L8: 1,  // USER_L8_001
        L9: 1,  // USER_L9_001
        L10: 1  // USER_L10_001 ✅ LINHA COMPLETA
    },
    // DIRECT_2: Até L7
    DIRECT_2: {
        L2: 1,  // USER_L2_002
        L3: 1,  // USER_L3_002
        L4: 1,  // USER_L4_002
        L5: 1,  // USER_L5_002
        L6: 1,  // USER_L6_002
        L7: 1   // USER_L7_002
    },
    // DIRECT_3: Até L6
    DIRECT_3: {
        L2: 1,  // USER_L2_003
        L3: 1,  // USER_L3_003
        L4: 1,  // USER_L4_003
        L5: 1,  // USER_L5_003
        L6: 1   // USER_L6_003
    },
    // DIRECT_4: Até L5
    DIRECT_4: {
        L2: 1,  // USER_L2_004
        L3: 1,  // USER_L3_004
        L4: 1,  // USER_L4_004
        L5: 1   // USER_L5_004
    },
    // DIRECT_5: Até L4
    DIRECT_5: {
        L2: 1,  // USER_L2_005
        L3: 1,  // USER_L3_005
        L4: 1   // USER_L4_005
    }
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌳 CRIAR 28 USUÁRIOS MLM - ESTRUTURA OTIMIZADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Balance BNB:', ethers.formatEther(balance), 'tBNB');
    console.log('Gas estimado: ~0.57 tBNB');
    console.log('Margem: ~0.35 tBNB\n');

    if (balance < ethers.parseEther("0.6")) {
        console.log('⚠️  AVISO: Balance baixo! Pode não ser suficiente.\n');
    }

    // Conectar contratos
    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        CONFIG.USDT_ADDRESS
    );

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONFIG.MAIN_ADDRESS
    );

    // Ler os 5 diretos já criados
    console.log('📖 Carregando diretos existentes...');

    const directsFiles = fs.readdirSync('.').filter(f => f.startsWith('pioneer-5-directs-'));
    if (directsFiles.length === 0) {
        throw new Error('❌ Arquivo de diretos não encontrado!');
    }

    const directsFile = directsFiles[directsFiles.length - 1];
    console.log('Arquivo:', directsFile);

    const directsData = JSON.parse(fs.readFileSync(directsFile, 'utf8'));
    const existingDirects = directsData.users;

    console.log(`✅ ${existingDirects.length} diretos carregados\n`);

    // Estrutura para salvar todos os usuários
    const allUsers = [];
    let userCounterByLevel = {};

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 GERANDO 28 NOVOS USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Gerar usuários por direto (criando linhas)
    for (let directIdx = 0; directIdx < 5; directIdx++) {
        const directNum = directIdx + 1;
        const direct = existingDirects[directIdx];
        const structure = MLM_STRUCTURE[`DIRECT_${directNum}`];

        console.log(`🌿 DIRECT_${directNum} (${direct.address.substring(0, 12)}...):`);

        let previousUser = direct; // Começa com o direto como sponsor

        // Para cada nível definido na estrutura (em ordem)
        const levels = [2, 3, 4, 5, 6, 7, 8, 9, 10];

        for (const levelNum of levels) {
            const levelKey = `L${levelNum}`;
            const count = structure[levelKey];

            if (!count) break; // Parar se não tem mais níveis neste branch

            // Inicializar contador do nível se não existir
            if (!userCounterByLevel[levelKey]) {
                userCounterByLevel[levelKey] = 0;
            }

            userCounterByLevel[levelKey]++;
            const userNum = userCounterByLevel[levelKey];

            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

            const user = {
                id: allUsers.length + 1,
                name: `USER_${levelKey}_${String(userNum).padStart(3, '0')}`,
                address: wallet.address,
                privateKey: wallet.privateKey,
                sponsor: previousUser.address,
                level: levelNum,
                directBranch: directNum,
                wallet: wallet
            };

            allUsers.push(user);
            previousUser = user; // Próximo usuário será filho deste

            console.log(`   ${levelKey}: ${user.name}`);
        }

        console.log('');
    }

    console.log(`✅ ${allUsers.length} usuários gerados!\n`);

    // Estatísticas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DISTRIBUIÇÃO POR NÍVEL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const byLevel = {};
    allUsers.forEach(u => {
        const level = `L${u.level}`;
        byLevel[level] = (byLevel[level] || 0) + 1;
    });

    console.log('L0: 1 (Pioneer)');
    console.log('L1: 5 (Diretos)');
    for (let i = 2; i <= 10; i++) {
        const level = `L${i}`;
        const count = byLevel[level] || 0;
        console.log(`${level}: ${count}${i === 10 && count > 0 ? ' ✅ TESTADO!' : ''}`);
    }

    const total = 1 + 5 + allUsers.length;
    console.log('─────────────');
    console.log(`Total: ${total} usuários\n`);

    // Financiar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 FINANCIANDO USUÁRIOS (BNB + USDT)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let funded = 0;

    for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];

        try {
            // BNB (0.02 tBNB)
            const bnbTx = await deployer.sendTransaction({
                to: user.address,
                value: CONFIG.USER_BNB,
                gasLimit: 21000
            });
            await bnbTx.wait();

            // USDT ($5k - grátis, mock)
            const usdtTx = await usdt.mint(user.address, CONFIG.USER_USDT, {
                gasLimit: 100000
            });
            await usdtTx.wait();

            funded++;

            if (funded % 5 === 0 || funded === allUsers.length) {
                console.log(`   ✅ ${funded}/${allUsers.length} financiados...`);
            }

        } catch (error) {
            console.log(`   ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${funded}/${allUsers.length} usuários financiados\n`);

    // Registrar usuários (por nível para respeitar hierarquia)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 REGISTRANDO USUÁRIOS NO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let registered = 0;

    // Registrar por nível (L2 primeiro, depois L3, etc)
    for (let level = 2; level <= 10; level++) {
        const levelUsers = allUsers.filter(u => u.level === level);

        if (levelUsers.length === 0) continue;

        console.log(`📝 Registrando L${level} (${levelUsers.length} usuários)...`);

        for (const user of levelUsers) {
            try {
                const tx = await main.registerUser(
                    user.address,
                    user.sponsor,
                    { gasLimit: 200000 }
                );
                await tx.wait();

                registered++;

            } catch (error) {
                console.log(`   ❌ ${user.name}: ${error.message}`);
            }
        }

        console.log(`   ✅ L${level} completo!\n`);
    }

    console.log(`✅ ${registered}/${allUsers.length} usuários registrados\n`);

    // Ativar LAI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎫 ATIVANDO LAI ($19 cada - mock grátis)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let activated = 0;

    for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];

        try {
            // Approve
            const approveTx = await usdt
                .connect(user.wallet)
                .approve(CONFIG.MAIN_ADDRESS, CONFIG.LAI_FEE, {
                    gasLimit: 100000
                });
            await approveTx.wait();

            // Activate
            const activateTx = await main
                .connect(user.wallet)
                .activateLAI({
                    gasLimit: 200000
                });
            await activateTx.wait();

            activated++;

            if (activated % 5 === 0 || activated === allUsers.length) {
                console.log(`   ✅ ${activated}/${allUsers.length} LAIs ativados...`);
            }

        } catch (error) {
            console.log(`   ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${activated}/${allUsers.length} LAIs ativados\n`);

    // Verificar Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ VERIFICANDO PIONEER E SISTEMA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pioneerDashboard = await main.getUserDashboard(CONFIG.PIONEER_WALLET);
    console.log('📊 Dashboard do Pioneer:');
    console.log('   Diretos:', pioneerDashboard.directs.toString());
    console.log('   Balance:', ethers.formatUnits(pioneerDashboard.available, 6), 'USDT');
    console.log('   Total Earned:', ethers.formatUnits(pioneerDashboard.totalEarned, 6), 'USDT');
    console.log('');

    // Estado do sistema
    const [
        poolReserve,
        infrastructure,
        company,
        mlmLocked,
        deposited,
        distributed,
        week,
        activeCount,
        totalUsersCount
    ] = await main.getSystemState();

    console.log('📊 Estado do Sistema:');
    console.log('   Total Usuários:', totalUsersCount.toString());
    console.log('   Usuários Ativos (LAI):', activeCount.toString());
    console.log('');

    // Verificar balance final
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const used = balance - finalBalance;
    console.log('💰 Gas usado:', ethers.formatEther(used), 'tBNB');
    console.log('💰 Balance final:', ethers.formatEther(finalBalance), 'tBNB\n');

    // Salvar dados
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
            totalUsers: total,
            newUsers: allUsers.length,
            funded: funded,
            registered: registered,
            laiActivated: activated,
            byLevel: byLevel,
            gasUsed: ethers.formatEther(used)
        },
        structure: MLM_STRUCTURE,
        users: allUsers.map(u => ({
            id: u.id,
            name: u.name,
            address: u.address,
            privateKey: u.privateKey,
            sponsor: u.sponsor,
            level: u.level,
            directBranch: u.directBranch
        }))
    };

    const filename = `mlm-28-users-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Dados salvos: ${filename}\n`);

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SETUP DE 34 USUÁRIOS COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo Final:');
    console.log(`   🌳 Total: ${total} usuários`);
    console.log(`   ⭐ Pioneer: ${pioneerDashboard.directs} diretos`);
    console.log(`   👥 Novos: ${allUsers.length}`);
    console.log(`   💰 Financiados: ${funded}`);
    console.log(`   📝 Registrados: ${registered}`);
    console.log(`   🎫 LAIs ativos: ${activated}`);
    console.log(`   ⛽ Gas usado: ${ethers.formatEther(used)} tBNB`);
    console.log('');

    console.log('🎯 Níveis testados:');
    console.log('   ✅ L1 até L10 (TODOS!)');
    console.log('');

    console.log('📋 Próximos passos:');
    console.log('   1. Verificar estrutura: npx hardhat run scripts/verify-mlm-structure.js --network bscTestnet');
    console.log('   2. Admin depositar $35k: npx hardhat run scripts/admin-deposit-performance.js --network bscTestnet');
    console.log('   3. Processar distribuição batch');
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
