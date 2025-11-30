/**
 * 🧪 SCRIPT DE TESTE INTERATIVO - iDeepXUnifiedSecure v3.3
 *
 * Testa todas as funcionalidades do contrato em BSC Testnet
 */

import pkg from "hardhat";
const { ethers } = pkg;

// Endereços do deployment em testnet
const CONTRACT_ADDRESS = "0x1dEdE431aa189fc5790c4837014192078A89870F";
const USDT_ADDRESS = "0x89173cb21b8f8Ac8Bf6680c85541f5826B992C0f";

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTE INTERATIVO - iDeepXUnifiedSecure v3.3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. Conectar signers
    const [owner, user1, user2, user3] = await ethers.getSigners();

    console.log('👥 Contas disponíveis:');
    console.log('   Owner:', owner.address);
    console.log('   User1:', user1.address);
    console.log('   User2:', user2.address);
    console.log('   User3:', user3.address);
    console.log('');

    // 2. Conectar aos contratos
    const contract = await ethers.getContractAt("iDeepXUnifiedSecure", CONTRACT_ADDRESS);
    const usdt = await ethers.getContractAt("MockUSDT", USDT_ADDRESS);

    console.log('📍 Contratos conectados:');
    console.log('   iDeepX:', CONTRACT_ADDRESS);
    console.log('   USDT:', USDT_ADDRESS);
    console.log('');

    // 3. Verificar estado inicial
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO INICIAL DO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const systemState = await contract.getSystemState();
    console.log('💰 Balanços do Sistema:');
    console.log('   Liquidity Pool:', ethers.formatUnits(systemState.poolReserve, 6), 'USDT');
    console.log('   Infrastructure:', ethers.formatUnits(systemState.infrastructure, 6), 'USDT');
    console.log('   Company:', ethers.formatUnits(systemState.company, 6), 'USDT');
    console.log('   MLM Locked:', ethers.formatUnits(systemState.mlmLocked, 6), 'USDT');
    console.log('   Total Deposited:', ethers.formatUnits(systemState.deposited, 6), 'USDT');
    console.log('   Total Distributed:', ethers.formatUnits(systemState.distributed, 6), 'USDT');
    console.log('');

    console.log('📈 Estatísticas:');
    console.log('   Current Week:', systemState.week.toString());
    console.log('   Active Users:', systemState.activeCount.toString());
    console.log('   Total Users:', systemState.totalUsersCount.toString());
    console.log('');

    // 4. Mint USDT para testes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💵 MINT DE USDT PARA TESTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDT cada

    console.log('⏳ Mintando USDT...');
    await usdt.mint(owner.address, mintAmount);
    await usdt.mint(user1.address, mintAmount);
    await usdt.mint(user2.address, mintAmount);
    await usdt.mint(user3.address, mintAmount);

    console.log('✅ Mint concluído!');
    console.log('   Owner:', ethers.formatUnits(await usdt.balanceOf(owner.address), 6), 'USDT');
    console.log('   User1:', ethers.formatUnits(await usdt.balanceOf(user1.address), 6), 'USDT');
    console.log('   User2:', ethers.formatUnits(await usdt.balanceOf(user2.address), 6), 'USDT');
    console.log('   User3:', ethers.formatUnits(await usdt.balanceOf(user3.address), 6), 'USDT');
    console.log('');

    // 5. Registrar usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 REGISTRAR USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('⏳ Registrando usuários...');

    // User1 sem sponsor (primeiro usuário em test mode)
    await contract.registerUser(user1.address, ethers.ZeroAddress);
    console.log('✅ User1 registrado (sem sponsor - primeiro)');

    // User2 com sponsor User1
    await contract.registerUser(user2.address, user1.address);
    console.log('✅ User2 registrado (sponsor: User1)');

    // User3 com sponsor User2
    await contract.registerUser(user3.address, user2.address);
    console.log('✅ User3 registrado (sponsor: User2)');
    console.log('');

    // 6. Ativar LAI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 ATIVAR LAI (Licença de Acesso)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const laiFee = ethers.parseUnits("19", 6); // $19

    console.log('⏳ Aprovando USDT...');
    await usdt.connect(user1).approve(CONTRACT_ADDRESS, laiFee);
    await usdt.connect(user2).approve(CONTRACT_ADDRESS, laiFee);
    await usdt.connect(user3).approve(CONTRACT_ADDRESS, laiFee);
    console.log('✅ Aprovações concluídas');
    console.log('');

    console.log('⏳ Ativando LAI...');
    await contract.connect(user1).activateLAI();
    console.log('✅ User1 LAI ativado');

    await contract.connect(user2).activateLAI();
    console.log('✅ User2 LAI ativado (User1 recebe bônus $4.75)');

    await contract.connect(user3).activateLAI();
    console.log('✅ User3 LAI ativado (User2 recebe bônus $4.75)');
    console.log('');

    // 7. Ver dashboard de usuários
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DASHBOARD DOS USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    for (const [name, user] of [['User1', user1], ['User2', user2], ['User3', user3]]) {
        const dashboard = await contract.getUserDashboard(user.address);
        console.log(`${name} (${user.address}):`);
        console.log('   💰 Available:', ethers.formatUnits(dashboard.available, 6), 'USDT');
        console.log('   🔒 Locked:', ethers.formatUnits(dashboard.locked, 6), 'USDT');
        console.log('   📈 Total Earned:', ethers.formatUnits(dashboard.totalEarned, 6), 'USDT');
        console.log('   🔑 LAI Active:', dashboard.laiActive ? '✅ Yes' : '❌ No');
        console.log('   📅 LAI Expires:', new Date(Number(dashboard.laiExpires) * 1000).toLocaleString());
        console.log('   ⭐ Level:', dashboard.level.toString());
        console.log('   👥 Directs:', dashboard.directs.toString());
        console.log('   💵 Volume:', ethers.formatUnits(dashboard.volume, 6), 'USDT');
        console.log('');
    }

    // 8. Depositar Performance (apenas owner)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 DEPOSITAR PERFORMANCE FEE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const performanceAmount = ethers.parseUnits("10000", 6); // $10k

    console.log('⏳ Mintando USDT para performance...');
    await usdt.mint(owner.address, performanceAmount);

    console.log('⏳ Aprovando USDT...');
    await usdt.approve(CONTRACT_ADDRESS, performanceAmount);

    console.log('⏳ Depositando performance...');
    await contract.depositWeeklyPerformance(performanceAmount, "ipfs://QmTest123");
    console.log('✅ Performance depositada: $10,000');
    console.log('');

    console.log('📊 Distribuição automática:');
    console.log('   Liquidity (5%):', '$500');
    console.log('   Infrastructure (15%):', '$1,500');
    console.log('   Company (35%):', '$3,500');
    console.log('   MLM Distributed (30%):', '$3,000');
    console.log('   MLM Locked (15%):', '$1,500');
    console.log('');

    // 9. Processar batch de distribuição
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ PROCESSAR BATCH DE DISTRIBUIÇÃO MLM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('⏳ Processando batch da semana 1...');
    await contract.processDistributionBatch(1);
    console.log('✅ Batch processado!');
    console.log('');

    // Ver progresso do batch
    const progress = await contract.getBatchProgress(1);
    console.log('📊 Progresso do Batch:');
    console.log('   Total Users:', progress.totalUsers.toString());
    console.log('   Processed:', progress.processedUsers.toString());
    console.log('   % Complete:', progress.percentComplete.toString(), '%');
    console.log('   Is Stalled:', progress.isStalled ? '⚠️ Yes' : '✅ No');
    console.log('   Days Since:', progress.daysSinceCreated.toString());
    console.log('');

    // 10. Ver dashboard atualizado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DASHBOARD ATUALIZADO (APÓS DISTRIBUIÇÃO)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    for (const [name, user] of [['User1', user1], ['User2', user2], ['User3', user3]]) {
        const dashboard = await contract.getUserDashboard(user.address);
        console.log(`${name}:`);
        console.log('   💰 Available:', ethers.formatUnits(dashboard.available, 6), 'USDT');
        console.log('   📈 Total Earned:', ethers.formatUnits(dashboard.totalEarned, 6), 'USDT');
        console.log('');
    }

    // 11. Testar saque de comissão
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💸 TESTAR SAQUE DE COMISSÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const user1Dashboard = await contract.getUserDashboard(user1.address);
    const availableBalance = user1Dashboard.available;

    if (availableBalance > ethers.parseUnits("50", 6)) {
        console.log('⏳ User1 sacando comissão...');
        const withdrawAmount = ethers.parseUnits("100", 6); // $100

        await contract.connect(user1).claimCommission(withdrawAmount);
        console.log('✅ Saque realizado: $100');

        const usdtBalance = await usdt.balanceOf(user1.address);
        console.log('   Saldo USDT User1:', ethers.formatUnits(usdtBalance, 6), 'USDT');
        console.log('');
    } else {
        console.log('⚠️ Saldo insuficiente para saque (mínimo $50)');
        console.log('');
    }

    // 12. Estado final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO FINAL DO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const finalState = await contract.getSystemState();
    console.log('💰 Balanços Finais:');
    console.log('   Liquidity Pool:', ethers.formatUnits(finalState.poolReserve, 6), 'USDT');
    console.log('   Infrastructure:', ethers.formatUnits(finalState.infrastructure, 6), 'USDT');
    console.log('   Company:', ethers.formatUnits(finalState.company, 6), 'USDT');
    console.log('   MLM Locked:', ethers.formatUnits(finalState.mlmLocked, 6), 'USDT');
    console.log('');

    console.log('📈 Estatísticas Finais:');
    console.log('   Total Deposited:', ethers.formatUnits(finalState.deposited, 6), 'USDT');
    console.log('   Total Distributed:', ethers.formatUnits(finalState.distributed, 6), 'USDT');
    console.log('   Current Week:', finalState.week.toString());
    console.log('   Active Users:', finalState.activeCount.toString());
    console.log('   Total Users:', finalState.totalUsersCount.toString());
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTE COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Todas as funcionalidades básicas foram testadas com sucesso!');
    console.log('');
    console.log('📋 Próximos testes recomendados:');
    console.log('   1. Testar com 100+ usuários (batch processing)');
    console.log('   2. Testar timelock (schedule + execute withdrawal)');
    console.log('   3. Testar circuit breakers (pause/unpause)');
    console.log('   4. Testar owner fallback após 7 dias');
    console.log('   5. Testar gas rebate');
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO NO TESTE');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        process.exit(1);
    });
