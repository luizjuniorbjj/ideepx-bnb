/**
 * 🌳 CRIAR 100 USUÁRIOS MLM - ESTRUTURA HÍBRIDA FOCADA
 *
 * Estrutura OPÇÃO C:
 * L0: 1 (Pioneer - já existe)
 * L1: 5 (DIRECT_1 a DIRECT_5 - já existem)
 * L2: 20 (4 por L1)
 * L3: 25
 * L4: 20
 * L5: 12
 * L6: 8
 * L7: 5
 * L8: 2
 * L9: 1
 * L10: 1
 * ─────
 * Total: 100 usuários
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    USDT_ADDRESS: "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc",
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    USER_BNB: ethers.parseEther("0.03"),
    USER_USDT: ethers.parseUnits("5000", 6),
    LAI_FEE: ethers.parseUnits("19", 6)
};

// Estrutura da rede MLM
const MLM_STRUCTURE = {
    // DIRECT_1: Linha completa até L10 + volume em L2-L3
    DIRECT_1: {
        L2: 4,  // 4 users em L2
        L3: 6,  // 1 linha até L10 + extras
        L4: 5,
        L5: 4,
        L6: 3,
        L7: 2,
        L8: 1,
        L9: 1,
        L10: 1
    },
    // DIRECT_2: Volume até L6
    DIRECT_2: {
        L2: 4,
        L3: 5,
        L4: 4,
        L5: 3,
        L6: 2
    },
    // DIRECT_3: Volume médio até L6
    DIRECT_3: {
        L2: 4,
        L3: 5,
        L4: 4,
        L5: 3,
        L6: 2
    },
    // DIRECT_4: Só até L4
    DIRECT_4: {
        L2: 4,
        L3: 5,
        L4: 4
    },
    // DIRECT_5: Só até L3
    DIRECT_5: {
        L2: 4,
        L3: 4
    }
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌳 CRIAR 100 USUÁRIOS MLM - ESTRUTURA HÍBRIDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Balance:', ethers.formatEther(balance), 'BNB');

    if (balance < ethers.parseEther("3")) {
        console.log('\n⚠️  AVISO: Balance baixo! Recomendado: 3+ BNB\n');
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
    console.log('\n📖 Carregando diretos existentes...');

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
    let userCounter = 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 GERANDO 95 NOVOS USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Gerar usuários por direto e por nível
    for (let directIdx = 0; directIdx < 5; directIdx++) {
        const directNum = directIdx + 1;
        const direct = existingDirects[directIdx];
        const structure = MLM_STRUCTURE[`DIRECT_${directNum}`];

        console.log(`\n🌿 DIRECT_${directNum} (${direct.address.substring(0, 12)}...):`);

        // Para cada nível definido na estrutura
        const levelsInStructure = Object.keys(structure).sort((a, b) => {
            const numA = parseInt(a.replace('L', ''));
            const numB = parseInt(b.replace('L', ''));
            return numA - numB;
        });

        let previousLevelUsers = [direct]; // Começa com o direto

        for (const level of levelsInStructure) {
            const levelNum = parseInt(level.replace('L', ''));
            const count = structure[level];

            console.log(`   ${level}: ${count} usuários`);

            const levelUsers = [];

            // Distribuir os usuários entre os sponsors do nível anterior
            for (let i = 0; i < count; i++) {
                userCounter++;
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

                // Escolher sponsor do nível anterior (round-robin)
                const sponsorIdx = i % previousLevelUsers.length;
                const sponsor = previousLevelUsers[sponsorIdx];

                const user = {
                    id: userCounter,
                    name: `USER_${level}_${String(i + 1).padStart(3, '0')}`,
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    sponsor: sponsor.address,
                    level: levelNum,
                    directBranch: directNum,
                    wallet: wallet
                };

                levelUsers.push(user);
                allUsers.push(user);
            }

            // Atualizar para próximo nível
            previousLevelUsers = levelUsers;
        }
    }

    console.log('\n✅ 95 usuários gerados!');
    console.log(`📊 Total com existentes: ${allUsers.length + 5 + 1} (95 novos + 5 diretos + Pioneer)\n`);

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
        console.log(`${level}: ${byLevel[level] || 0}`);
    }

    const total = 1 + 5 + allUsers.length;
    console.log('─────────────');
    console.log(`Total: ${total} usuários\n`);

    // Financiar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 FINANCIANDO USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let funded = 0;
    const batchSize = 10;

    for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);

        console.log(`💵 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allUsers.length / batchSize)} (${batch.length} users)...`);

        for (const user of batch) {
            try {
                // BNB
                const bnbTx = await deployer.sendTransaction({
                    to: user.address,
                    value: CONFIG.USER_BNB,
                    gasLimit: 21000
                });
                await bnbTx.wait();

                // USDT
                const usdtTx = await usdt.mint(user.address, CONFIG.USER_USDT, {
                    gasLimit: 100000
                });
                await usdtTx.wait();

                funded++;

            } catch (error) {
                console.log(`   ❌ ${user.name}: ${error.message}`);
            }
        }

        console.log(`   ✅ ${batch.length} financiados\n`);
    }

    console.log(`✅ ${funded}/${allUsers.length} usuários financiados\n`);

    // Registrar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 REGISTRANDO USUÁRIOS NO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let registered = 0;

    // Registrar por nível (L2 primeiro, depois L3, etc)
    for (let level = 2; level <= 10; level++) {
        const levelUsers = allUsers.filter(u => u.level === level);

        if (levelUsers.length === 0) continue;

        console.log(`\n📝 Registrando L${level} (${levelUsers.length} usuários)...`);

        for (const user of levelUsers) {
            try {
                const tx = await main.registerUser(
                    user.address,
                    user.sponsor,
                    { gasLimit: 200000 }
                );
                await tx.wait();

                registered++;

                if (registered % 10 === 0) {
                    console.log(`   ✅ ${registered}/${allUsers.length} registrados...`);
                }

            } catch (error) {
                console.log(`   ❌ ${user.name}: ${error.message}`);
            }
        }

        console.log(`   ✅ L${level} completo!`);
    }

    console.log(`\n✅ ${registered}/${allUsers.length} usuários registrados\n`);

    // Ativar LAI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎫 ATIVANDO LAI ($19 cada)');
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

            if (activated % 10 === 0) {
                console.log(`   ✅ ${activated}/${allUsers.length} LAIs ativados...`);
            }

        } catch (error) {
            console.log(`   ❌ ${user.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ ${activated}/${allUsers.length} LAIs ativados\n`);

    // Verificar Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ VERIFICANDO PIONEER');
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
            byLevel: byLevel
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

    const filename = `mlm-100-users-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Dados salvos: ${filename}\n`);

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SETUP DE 100 USUÁRIOS COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo Final:');
    console.log(`   🌳 Total: ${total} usuários`);
    console.log(`   ⭐ Pioneer: ${pioneerDashboard.directs} diretos`);
    console.log(`   👥 Novos: ${allUsers.length}`);
    console.log(`   💰 Financiados: ${funded}`);
    console.log(`   📝 Registrados: ${registered}`);
    console.log(`   🎫 LAIs ativos: ${activated}`);
    console.log('');

    console.log('📋 Próximos passos:');
    console.log('   1. Verificar estrutura: npx hardhat run scripts/verify-mlm-structure.js --network bscTestnet');
    console.log('   2. Admin depositar $35k: npx hardhat run scripts/admin-deposit-performance.js --network bscTestnet');
    console.log('   3. Processar distribuição');
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
