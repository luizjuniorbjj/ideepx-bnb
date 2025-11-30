/**
 * 📊 ANÁLISE DETALHADA DE GANHOS MLM POR NÍVEL
 *
 * Analisa distribuição de $35k entre 33 usuários nos 10 níveis MLM
 * Mostra estatísticas completas por nível
 */

import pkg from "hardhat";
import fs from 'fs';
const { ethers } = pkg;

const CONFIG = {
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740",
    PIONEER: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",
    USERS_FILE: "./mlm-28-users-1762444377830.json"
};

// Percentuais esperados MLM (Beta)
const EXPECTED_PERCENTAGES = {
    L1: 6.0,
    L2: 3.0,
    L3: 2.5,
    L4: 2.0,
    L5: 1.0,
    L6: 1.0,
    L7: 1.0,
    L8: 1.0,
    L9: 1.0,
    L10: 1.0
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ANÁLISE DETALHADA DE GANHOS MLM POR NÍVEL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Carregar arquivo de usuários
    const usersData = JSON.parse(fs.readFileSync(CONFIG.USERS_FILE, 'utf8'));

    // Conectar ao contrato
    const main = await ethers.getContractAt("iDeepXUnifiedSecure", CONFIG.MAIN_ADDRESS);

    console.log('📁 Usuários carregados:', usersData.stats.totalUsers);
    console.log('📊 Estrutura: 1 Pioneer + 5 Diretos + 27 descendentes');
    console.log('');

    // Identificar endereços dos 5 diretos pelos sponsors dos L2
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 IDENTIFICANDO ENDEREÇOS DOS DIRETOS (L1)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Diretos são os sponsors dos usuários L2
    const directAddresses = [];
    const directsSet = new Set();

    for (const user of usersData.users) {
        if (user.level === 2) {
            directsSet.add(user.sponsor);
        }
    }

    directAddresses.push(...directsSet);

    for (let i = 0; i < directAddresses.length; i++) {
        console.log(`  DIRECT_${i + 1}: ${directAddresses[i]}`);
    }
    console.log('');

    // Coletar saldos de todos os usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 COLETANDO SALDOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allUsers = [
        {
            level: 0,
            name: 'Pioneer',
            address: CONFIG.PIONEER,
            balance: 0n
        }
    ];

    // Adicionar diretos (L1)
    for (let i = 0; i < directAddresses.length; i++) {
        const userInfo = await main.users(directAddresses[i]);
        const earnings = userInfo.totalEarned;

        allUsers.push({
            level: 1,
            name: `DIRECT_${i + 1}`,
            address: directAddresses[i],
            balance: earnings
        });

        console.log(`  DIRECT_${i + 1}: ${ethers.formatUnits(earnings, 6)} USDT`);
    }

    // Adicionar descendentes (L2-L10)
    for (const user of usersData.users) {
        const userInfo = await main.users(user.address);
        const earnings = userInfo.totalEarned;

        allUsers.push({
            level: user.level,
            name: user.name,
            address: user.address,
            balance: earnings
        });

        console.log(`  ${user.name}: ${ethers.formatUnits(earnings, 6)} USDT`);
    }

    // Adicionar Pioneer
    const pioneerInfo = await main.users(CONFIG.PIONEER);
    allUsers[0].balance = pioneerInfo.totalEarned;
    console.log(`\n  Pioneer: ${ethers.formatUnits(pioneerInfo.totalEarned, 6)} USDT`);

    console.log('');

    // Agrupar por nível
    const byLevel = {};
    let totalDistributed = 0n;

    for (const user of allUsers) {
        if (!byLevel[user.level]) {
            byLevel[user.level] = {
                users: [],
                totalBalance: 0n,
                count: 0
            };
        }

        byLevel[user.level].users.push(user);
        byLevel[user.level].totalBalance += user.balance;
        byLevel[user.level].count++;
        totalDistributed += user.balance;
    }

    // Exibir análise por nível
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 ANÁLISE POR NÍVEL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const totalDistributedFloat = parseFloat(ethers.formatUnits(totalDistributed, 6));

    for (let level = 0; level <= 10; level++) {
        const data = byLevel[level];
        if (!data) continue;

        const totalForLevel = parseFloat(ethers.formatUnits(data.totalBalance, 6));
        const avgPerUser = data.count > 0 ? totalForLevel / data.count : 0;
        const percentOfTotal = totalDistributedFloat > 0
            ? (totalForLevel / totalDistributedFloat * 100)
            : 0;

        const levelName = level === 0 ? 'Pioneer (L0)' : `Nível ${level}`;
        const expectedPercent = EXPECTED_PERCENTAGES[`L${level}`] || 0;

        console.log(`🔹 ${levelName}`);
        console.log(`  └─ Usuários: ${data.count}`);
        console.log(`  └─ Total recebido: $${totalForLevel.toFixed(2)} USDT`);
        console.log(`  └─ Média por usuário: $${avgPerUser.toFixed(2)} USDT`);
        console.log(`  └─ % do total distribuído: ${percentOfTotal.toFixed(2)}%`);

        if (level >= 1) {
            console.log(`  └─ % esperado MLM: ${expectedPercent}%`);

            // Verificar se está próximo do esperado (com margem de ±0.5%)
            const difference = Math.abs(percentOfTotal - expectedPercent);
            if (difference < 0.5) {
                console.log(`  └─ ✅ Distribuição correta!`);
            } else {
                console.log(`  └─ ⚠️  Diferença: ${difference.toFixed(2)}%`);
            }
        }

        // Mostrar top 3 earners do nível
        if (data.count > 0) {
            const sorted = [...data.users].sort((a, b) =>
                Number(b.balance - a.balance)
            );

            const topCount = Math.min(3, sorted.length);
            console.log(`  └─ Top ${topCount} earners:`);

            for (let i = 0; i < topCount; i++) {
                const user = sorted[i];
                const balance = parseFloat(ethers.formatUnits(user.balance, 6));
                console.log(`       ${i + 1}. ${user.name}: $${balance.toFixed(2)}`);
            }
        }

        console.log('');
    }

    // Resumo geral
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO GERAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`💰 Total distribuído: $${totalDistributedFloat.toFixed(2)} USDT`);
    console.log(`👥 Total de usuários: ${allUsers.length}`);
    console.log(`📊 Média por usuário: $${(totalDistributedFloat / allUsers.length).toFixed(2)} USDT`);
    console.log('');

    // Verificar percentuais totais MLM
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 VERIFICAÇÃO PERCENTUAIS MLM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let totalMLMPercent = 0;
    for (let level = 1; level <= 10; level++) {
        const data = byLevel[level];
        if (!data) continue;

        const totalForLevel = parseFloat(ethers.formatUnits(data.totalBalance, 6));
        const percentOfTotal = totalDistributedFloat > 0
            ? (totalForLevel / totalDistributedFloat * 100)
            : 0;
        const expected = EXPECTED_PERCENTAGES[`L${level}`];

        totalMLMPercent += percentOfTotal;

        const status = Math.abs(percentOfTotal - expected) < 0.5 ? '✅' : '⚠️';
        console.log(`  L${level}: Real ${percentOfTotal.toFixed(2)}% | Esperado ${expected}% ${status}`);
    }

    console.log('');
    console.log(`  Total MLM: ${totalMLMPercent.toFixed(2)}%`);
    console.log(`  Esperado: ${Object.values(EXPECTED_PERCENTAGES).reduce((a, b) => a + b, 0)}%`);
    console.log('');

    // Top 10 earners gerais
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 TOP 10 EARNERS GERAIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sortedAll = [...allUsers].sort((a, b) => Number(b.balance - a.balance));

    for (let i = 0; i < Math.min(10, sortedAll.length); i++) {
        const user = sortedAll[i];
        const balance = parseFloat(ethers.formatUnits(user.balance, 6));
        const levelName = user.level === 0 ? 'L0' : `L${user.level}`;

        console.log(`  ${i + 1}. ${user.name.padEnd(20)} | ${levelName} | $${balance.toFixed(2)} USDT`);
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ANÁLISE COMPLETA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Salvar relatório em JSON
    const report = {
        timestamp: new Date().toISOString(),
        totalDistributed: totalDistributedFloat,
        totalUsers: allUsers.length,
        byLevel: Object.entries(byLevel).map(([level, data]) => ({
            level: parseInt(level),
            users: data.count,
            total: parseFloat(ethers.formatUnits(data.totalBalance, 6)),
            average: parseFloat(ethers.formatUnits(data.totalBalance, 6)) / data.count,
            percentOfTotal: parseFloat(ethers.formatUnits(data.totalBalance, 6)) / totalDistributedFloat * 100,
            expectedPercent: EXPECTED_PERCENTAGES[`L${level}`] || 0
        })),
        topEarners: sortedAll.slice(0, 10).map(user => ({
            name: user.name,
            level: user.level,
            balance: parseFloat(ethers.formatUnits(user.balance, 6))
        }))
    };

    const reportFile = `mlm-earnings-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Relatório salvo em: ${reportFile}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
    });
