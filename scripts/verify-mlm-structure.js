/**
 * 🔍 VERIFICAR ESTRUTURA MLM COMPLETA
 *
 * Mostra árvore visual da rede MLM
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669"
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VERIFICAR ESTRUTURA MLM COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONFIG.MAIN_ADDRESS
    );

    // Carregar dados dos usuários criados
    const mlmFiles = fs.readdirSync('.').filter(f => f.startsWith('mlm-') && f.endsWith('.json'));

    if (mlmFiles.length === 0) {
        console.log('⚠️  Nenhum arquivo MLM encontrado!\n');
        return;
    }

    const latestFile = mlmFiles[mlmFiles.length - 1];
    console.log(`📖 Carregando: ${latestFile}\n`);

    const mlmData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

    // Estado do sistema
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO DO SISTEMA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

    console.log('Total Usuários:', totalUsersCount.toString());
    console.log('Usuários Ativos (LAI):', activeCount.toString());
    console.log('Pool Liquidez:', ethers.formatUnits(poolReserve, 6), 'USDT');
    console.log('Infraestrutura:', ethers.formatUnits(infrastructure, 6), 'USDT');
    console.log('Empresa:', ethers.formatUnits(company, 6), 'USDT');
    console.log('MLM Locked:', ethers.formatUnits(mlmLocked, 6), 'USDT');
    console.log('Total Depositado:', ethers.formatUnits(deposited, 6), 'USDT');
    console.log('Total Distribuído:', ethers.formatUnits(distributed, 6), 'USDT');
    console.log('Semana Atual:', week.toString());
    console.log('');

    // Pioneer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ PIONEER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pioneerDashboard = await main.getUserDashboard(CONFIG.PIONEER_WALLET);

    console.log('Endereço:', CONFIG.PIONEER_WALLET);
    console.log('Diretos:', pioneerDashboard.directs.toString());
    console.log('LAI Ativo:', pioneerDashboard.laiActive ? 'Sim' : 'Não');
    console.log('Nível:', pioneerDashboard.level.toString());
    console.log('Balance Disponível:', ethers.formatUnits(pioneerDashboard.available, 6), 'USDT');
    console.log('Balance Locked:', ethers.formatUnits(pioneerDashboard.locked, 6), 'USDT');
    console.log('Total Earned:', ethers.formatUnits(pioneerDashboard.totalEarned, 6), 'USDT');
    console.log('');

    if (pioneerDashboard.directs >= 5) {
        console.log('✅ Pioneer QUALIFICADO para níveis 6-10!');
    } else {
        console.log('❌ Pioneer NÃO qualificado para níveis 6-10 (precisa 5+ diretos)');
    }
    console.log('');

    // Distribuição por nível
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DISTRIBUIÇÃO POR NÍVEL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const byLevel = mlmData.stats.byLevel || {};

    console.log('L0: 1 (Pioneer)');
    console.log('L1: 5 (Diretos)');

    for (let i = 2; i <= 10; i++) {
        const level = `L${i}`;
        const count = byLevel[level] || 0;
        const icon = count > 0 ? '✅' : '❌';
        console.log(`${level}: ${count} ${icon}`);
    }

    console.log('─────────────');
    console.log(`Total: ${mlmData.stats.totalUsers} usuários`);
    console.log('');

    // Árvore visual por branch
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌳 ESTRUTURA DA REDE MLM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Carregar diretos
    const directsFiles = fs.readdirSync('.').filter(f => f.startsWith('pioneer-5-directs-'));
    const directsData = JSON.parse(fs.readFileSync(directsFiles[directsFiles.length - 1], 'utf8'));

    console.log('                    Pioneer (L0)');
    console.log('                        │');
    console.log('        ┌───────┬───────┼───────┬───────┐');
    console.log('        │       │       │       │       │');
    console.log('      D1(L1)  D2(L1)  D3(L1)  D4(L1)  D5(L1)');
    console.log('');

    // Mostrar estrutura de cada direto
    for (let i = 1; i <= 5; i++) {
        console.log(`\n🌿 DIRECT_${i} Branch:`);

        const branchUsers = mlmData.users.filter(u => u.directBranch === i);

        if (branchUsers.length === 0) {
            console.log('   (sem rede)');
            continue;
        }

        // Organizar por nível
        const levels = {};
        branchUsers.forEach(u => {
            const level = u.level;
            if (!levels[level]) levels[level] = [];
            levels[level].push(u);
        });

        // Mostrar cada nível
        for (let level = 2; level <= 10; level++) {
            const users = levels[level];
            if (!users || users.length === 0) continue;

            const indent = '   '.repeat(level - 1);
            users.forEach(u => {
                console.log(`${indent}└─ ${u.name} (${u.address.substring(0, 10)}...)`);
            });
        }
    }

    console.log('');

    // Verificar usuários com LAI ativo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎫 VERIFICANDO LAIs ATIVOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let laiActiveCount = 0;
    let laiInactiveCount = 0;

    // Pioneer
    const pioneerLAI = pioneerDashboard.laiActive;
    if (pioneerLAI) {
        laiActiveCount++;
        console.log('✅ Pioneer: LAI ATIVO');
    } else {
        laiInactiveCount++;
        console.log('❌ Pioneer: LAI INATIVO');
    }

    // Diretos
    for (const direct of directsData.users) {
        const dashboard = await main.getUserDashboard(direct.address);
        if (dashboard.laiActive) {
            laiActiveCount++;
        } else {
            laiInactiveCount++;
        }
    }

    // Novos usuários
    for (const user of mlmData.users.slice(0, 10)) { // Apenas primeiros 10 para não demorar
        const dashboard = await main.getUserDashboard(user.address);
        if (dashboard.laiActive) {
            laiActiveCount++;
        } else {
            laiInactiveCount++;
        }
    }

    console.log('');
    console.log(`Total verificados: ${laiActiveCount + laiInactiveCount}`);
    console.log(`✅ LAIs ativos: ${laiActiveCount}`);
    console.log(`❌ LAIs inativos: ${laiInactiveCount}`);
    console.log('');

    // Sumário final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICAÇÃO COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo:');
    console.log(`   🌳 Total: ${totalUsersCount} usuários`);
    console.log(`   ⭐ Pioneer: ${pioneerDashboard.directs} diretos`);
    console.log(`   🎫 LAIs ativos: ${activeCount}`);
    console.log(`   💰 Total earned (Pioneer): ${ethers.formatUnits(pioneerDashboard.totalEarned, 6)} USDT`);
    console.log('');

    const allLevelsTested = byLevel.L10 && byLevel.L10 > 0;

    if (allLevelsTested) {
        console.log('🎉 TODOS OS 10 NÍVEIS TESTADOS! ✅');
    } else {
        console.log('⚠️  Alguns níveis ainda não testados');
    }

    console.log('');

    console.log('📋 Próximo passo:');
    console.log('   Admin depositar performance: npx hardhat run scripts/admin-deposit-performance.js --network bscTestnet');
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
