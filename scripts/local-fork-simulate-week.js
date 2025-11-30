/**
 * 📅 SIMULAR DISTRIBUIÇÃO SEMANAL - iDeepX v3.1
 *
 * Simula uma semana completa de distribuição de performance
 *
 * O que faz:
 * 1. Gera performance semanal simulada
 * 2. Calcula 35% de performance fee
 * 3. Deposita no contrato
 * 4. Distribui MLM automaticamente
 * 5. Mostra resultado detalhado
 *
 * Uso:
 * npx hardhat run scripts/local-fork-simulate-week.js --network localhost
 *
 * Opções via ENV:
 * PERFORMANCE=50000 npx hardhat run scripts/local-fork-simulate-week.js --network localhost
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 SIMULAR DISTRIBUIÇÃO SEMANAL - iDeepX v3.1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. CARREGAR CONFIGURAÇÃO
    const configFile = path.join(__dirname, '..', 'local-fork-config', 'setup.json');

    if (!fs.existsSync(configFile)) {
        console.error('❌ Setup não encontrado!');
        console.error('   Execute: npx hardhat run scripts/local-fork-setup.js --network localhost');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    // 2. CONECTAR AOS CONTRATOS
    const [owner] = await ethers.getSigners();

    const contract = await ethers.getContractAt("iDeepXUnified", config.contractAddress);
    const usdt = await ethers.getContractAt("MockUSDT", config.usdtAddress);

    console.log('✅ Conectado aos contratos');
    console.log(`   Contrato: ${config.contractAddress}`);
    console.log(`   USDT: ${config.usdtAddress}`);
    console.log('');

    // 3. ESTADO ANTES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO ANTES DA DISTRIBUIÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const weekBefore = await contract.currentWeek();
    const userCountBefore = await contract.userCount();
    const activeUsersBefore = await contract.getActiveUsers();

    console.log('📋 Contrato:');
    console.log(`   Semana atual: ${weekBefore.toString()}`);
    console.log(`   Total usuários: ${userCountBefore.toString()}`);
    console.log(`   Usuários ativos: ${activeUsersBefore.length}`);
    console.log('');

    // Saldos das carteiras antes
    const liquidityBalanceBefore = await usdt.balanceOf(config.wallets.liquidity);
    const infraBalanceBefore = await usdt.balanceOf(config.wallets.infrastructure);
    const companyBalanceBefore = await usdt.balanceOf(config.wallets.company);

    console.log('💰 Saldos carteiras (antes):');
    console.log(`   Liquidity: $${ethers.formatUnits(liquidityBalanceBefore, 6)}`);
    console.log(`   Infrastructure: $${ethers.formatUnits(infraBalanceBefore, 6)}`);
    console.log(`   Company: $${ethers.formatUnits(companyBalanceBefore, 6)}`);
    console.log('');

    // 4. GERAR PERFORMANCE SEMANAL
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 GERAR PERFORMANCE SEMANAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Performance configurável ou aleatória
    const performanceUSD = parseFloat(process.env.PERFORMANCE || (10000 + Math.random() * 90000).toFixed(2));
    const performanceFee = performanceUSD * 0.35; // 35%

    console.log('📊 Performance da semana:');
    console.log(`   Performance total: $${performanceUSD.toLocaleString()}`);
    console.log(`   Performance fee (35%): $${performanceFee.toLocaleString()}`);
    console.log('');

    console.log('💸 Distribuição:');
    const liquidity = performanceFee * 0.05;
    const infrastructure = performanceFee * 0.15;
    const company = performanceFee * 0.35;
    const mlmDistributed = performanceFee * 0.30;
    const mlmLocked = performanceFee * 0.15;

    console.log(`   - Liquidity (5%): $${liquidity.toFixed(2)}`);
    console.log(`   - Infrastructure (15%): $${infrastructure.toFixed(2)}`);
    console.log(`   - Company (35%): $${company.toFixed(2)}`);
    console.log(`   - MLM Distribuído (30%): $${mlmDistributed.toFixed(2)}`);
    console.log(`   - MLM Locked (15%): $${mlmLocked.toFixed(2)}`);
    console.log(`   - TOTAL: $${performanceFee.toFixed(2)}`);
    console.log('');

    // 5. DEPOSITAR PERFORMANCE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💎 DEPOSITAR PERFORMANCE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const amountInWei = ethers.parseUnits(performanceFee.toFixed(6), 6);

    // Aprovar USDT
    console.log('⏳ Aprovando USDT...');
    await usdt.connect(owner).approve(config.contractAddress, amountInWei);
    console.log('✅ USDT aprovado');
    console.log('');

    // Criar IPFS hash simulado
    const ipfsHash = `QmSimulated${Date.now()}Week${weekBefore}`;
    console.log(`📦 IPFS Hash: ${ipfsHash}`);
    console.log('');

    // Depositar
    console.log('⏳ Depositando performance no contrato...');
    const tx = await contract.depositWeeklyPerformance(amountInWei, ipfsHash);

    console.log(`📤 TX enviada: ${tx.hash}`);
    console.log('⏳ Aguardando confirmação...');

    const receipt = await tx.wait();

    console.log(`✅ Confirmado no bloco ${receipt.blockNumber}`);
    console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);
    console.log('');

    // 6. ANALISAR EVENTOS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 ANALISAR EVENTOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const events = receipt.logs
        .map(log => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .filter(e => e !== null);

    console.log(`📋 Total de eventos: ${events.length}`);
    console.log('');

    // Performance Deposited
    const performanceEvent = events.find(e => e.name === 'PerformanceDeposited');
    if (performanceEvent) {
        console.log('✅ PerformanceDeposited:');
        console.log(`   Semana: ${performanceEvent.args.week.toString()}`);
        console.log(`   Valor: $${ethers.formatUnits(performanceEvent.args.amount, 6)}`);
        console.log(`   IPFS: ${performanceEvent.args.ipfsHash}`);
        console.log('');
    }

    // MLM Distributed
    const mlmEvent = events.find(e => e.name === 'MLMDistributed');
    if (mlmEvent) {
        console.log('✅ MLMDistributed:');
        console.log(`   Total: $${ethers.formatUnits(mlmEvent.args.amount, 6)}`);
        console.log(`   Usuários recompensados: ${mlmEvent.args.usersRewarded.toString()}`);
        console.log('');
    }

    // Commission Events
    const commissionEvents = events.filter(e => e.name === 'CommissionCredited');
    console.log(`✅ Comissões individuais: ${commissionEvents.length}`);

    if (commissionEvents.length > 0 && commissionEvents.length <= 10) {
        console.log('');
        console.log('   Detalhes (primeiras 10):');
        commissionEvents.slice(0, 10).forEach((event, idx) => {
            console.log(`   ${idx + 1}. ${event.args.user}: $${ethers.formatUnits(event.args.amount, 6)} (L${event.args.level})`);
        });
    }
    console.log('');

    // 7. ESTADO DEPOIS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO APÓS DISTRIBUIÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const weekAfter = await contract.currentWeek();
    const activeUsersAfter = await contract.getActiveUsers();

    console.log('📋 Contrato:');
    console.log(`   Semana atual: ${weekAfter.toString()} (era ${weekBefore.toString()})`);
    console.log(`   Usuários ativos: ${activeUsersAfter.length}`);
    console.log('');

    // Saldos das carteiras depois
    const liquidityBalanceAfter = await usdt.balanceOf(config.wallets.liquidity);
    const infraBalanceAfter = await usdt.balanceOf(config.wallets.infrastructure);
    const companyBalanceAfter = await usdt.balanceOf(config.wallets.company);

    console.log('💰 Saldos carteiras (depois):');
    console.log(`   Liquidity: $${ethers.formatUnits(liquidityBalanceAfter, 6)} (+$${ethers.formatUnits(liquidityBalanceAfter - liquidityBalanceBefore, 6)})`);
    console.log(`   Infrastructure: $${ethers.formatUnits(infraBalanceAfter, 6)} (+$${ethers.formatUnits(infraBalanceAfter - infraBalanceBefore, 6)})`);
    console.log(`   Company: $${ethers.formatUnits(companyBalanceAfter, 6)} (+$${ethers.formatUnits(companyBalanceAfter - companyBalanceBefore, 6)})`);
    console.log('');

    // 8. ANÁLISE DE USUÁRIOS COM COMISSÕES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 USUÁRIOS COM COMISSÕES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const signers = await ethers.getSigners();
    const [, , , , ...testUsers] = signers;

    let usersWithCommission = 0;
    let totalCommissionsPaid = 0n;
    let totalLockedMLM = 0n;
    const topEarners = [];

    console.log('⏳ Analisando usuários...');

    for (const user of testUsers.slice(0, 100)) { // Analisa até 100 usuários
        const userInfo = await contract.getUserInfo(user.address);

        if (userInfo.availableBalance > 0n || userInfo.lockedMLM > 0n) {
            usersWithCommission++;
            totalCommissionsPaid += userInfo.availableBalance;
            totalLockedMLM += userInfo.lockedMLM;

            topEarners.push({
                address: user.address,
                available: userInfo.availableBalance,
                locked: userInfo.lockedMLM,
                total: userInfo.totalEarned,
                level: userInfo.networkLevel
            });
        }
    }

    // Ordenar por total earned
    topEarners.sort((a, b) => Number(b.total - a.total));

    console.log('');
    console.log('📊 Resumo:');
    console.log(`   Usuários que receberam: ${usersWithCommission}`);
    console.log(`   Total disponível: $${ethers.formatUnits(totalCommissionsPaid, 6)}`);
    console.log(`   Total locked: $${ethers.formatUnits(totalLockedMLM, 6)}`);
    console.log(`   Total pago: $${ethers.formatUnits(totalCommissionsPaid + totalLockedMLM, 6)}`);
    console.log('');

    console.log('🏆 Top 10 Earners:');
    topEarners.slice(0, 10).forEach((earner, idx) => {
        console.log(`   ${idx + 1}. ${earner.address.slice(0, 10)}... (L${earner.level})`);
        console.log(`      Disponível: $${ethers.formatUnits(earner.available, 6)}`);
        console.log(`      Locked: $${ethers.formatUnits(earner.locked, 6)}`);
        console.log(`      Total ganho: $${ethers.formatUnits(earner.total, 6)}`);
    });
    console.log('');

    // 9. SALVAR RESULTADOS
    const simulationResults = {
        timestamp: new Date().toISOString(),
        week: weekAfter.toString(),
        performance: {
            total: performanceUSD,
            fee: performanceFee,
            distribution: {
                liquidity,
                infrastructure,
                company,
                mlmDistributed,
                mlmLocked
            }
        },
        transaction: {
            hash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        },
        results: {
            usersRewarded: mlmEvent ? mlmEvent.args.usersRewarded.toString() : '0',
            totalCommissionsPaid: ethers.formatUnits(totalCommissionsPaid, 6),
            totalLockedMLM: ethers.formatUnits(totalLockedMLM, 6),
            usersWithCommission
        },
        topEarners: topEarners.slice(0, 10).map(e => ({
            address: e.address,
            level: e.level,
            available: ethers.formatUnits(e.available, 6),
            locked: ethers.formatUnits(e.locked, 6),
            total: ethers.formatUnits(e.total, 6)
        }))
    };

    const resultsFile = path.join(__dirname, '..', 'local-fork-config', `week-${weekBefore}-results.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(simulationResults, null, 2));

    console.log('💾 Resultados salvos:');
    console.log(`   ${resultsFile}`);
    console.log('');

    // 10. RESUMO FINAL
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   Performance: $${performanceUSD.toLocaleString()}`);
    console.log(`   Fee (35%): $${performanceFee.toLocaleString()}`);
    console.log(`   MLM Distribuído: $${mlmDistributed.toLocaleString()}`);
    console.log(`   Usuários: ${mlmEvent ? mlmEvent.args.usersRewarded.toString() : '0'}`);
    console.log(`   Semana: ${weekBefore.toString()} → ${weekAfter.toString()}`);
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('');
    console.log('1. Simular mais semanas:');
    console.log('   npx hardhat run scripts/local-fork-simulate-week.js --network localhost');
    console.log('');
    console.log('2. Com performance específica:');
    console.log('   PERFORMANCE=75000 npx hardhat run scripts/local-fork-simulate-week.js --network localhost');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return simulationResults;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO NA SIMULAÇÃO');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        console.error('');
        process.exit(1);
    });
