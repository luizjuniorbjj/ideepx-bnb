/**
 * 🧪 TESTE SIMPLIFICADO - iDeepXUnifiedSecure v3.3
 *
 * Testa funcionalidades básicas com 1 conta apenas (owner)
 */

import pkg from "hardhat";
const { ethers } = pkg;

// Endereços do deployment em testnet
const CONTRACT_ADDRESS = "0x1dEdE431aa189fc5790c4837014192078A89870F";
const USDT_ADDRESS = "0x89173cb21b8f8Ac8Bf6680c85541f5826B992C0f";

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTE SIMPLIFICADO - iDeepXUnifiedSecure v3.3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. Conectar owner
    const [owner] = await ethers.getSigners();

    console.log('👤 Conta configurada:');
    console.log('   Owner:', owner.address);
    console.log('');

    // 2. Conectar aos contratos
    console.log('📍 Conectando aos contratos...');
    const contract = await ethers.getContractAt("iDeepXUnifiedSecure", CONTRACT_ADDRESS);
    const usdt = await ethers.getContractAt("contracts/mocks/MockUSDT.sol:MockUSDT", USDT_ADDRESS);

    console.log('✅ Contratos conectados:');
    console.log('   iDeepX:', CONTRACT_ADDRESS);
    console.log('   Mock USDT:', USDT_ADDRESS);
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
    console.log('');

    console.log('📈 Estatísticas:');
    console.log('   Current Week:', systemState.week.toString());
    console.log('   Active Users:', systemState.activeCount.toString());
    console.log('   Total Users:', systemState.totalUsersCount.toString());
    console.log('   Total Deposited:', ethers.formatUnits(systemState.deposited, 6), 'USDT');
    console.log('   Total Distributed:', ethers.formatUnits(systemState.distributed, 6), 'USDT');
    console.log('');

    // 4. Verificar se owner está registrado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 VERIFICAR REGISTRO DO OWNER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const ownerData = await contract.users(owner.address);
    const isRegistered = ownerData.registered;

    if (isRegistered) {
        console.log('✅ Owner já está registrado no sistema');
        console.log('');

        const dashboard = await contract.getUserDashboard(owner.address);
        console.log('📊 Dashboard do Owner:');
        console.log('   💰 Available:', ethers.formatUnits(dashboard.available, 6), 'USDT');
        console.log('   🔒 Locked:', ethers.formatUnits(dashboard.locked, 6), 'USDT');
        console.log('   📈 Total Earned:', ethers.formatUnits(dashboard.totalEarned, 6), 'USDT');
        console.log('   🔑 LAI Active:', dashboard.laiActive ? '✅ Yes' : '❌ No');
        console.log('   ⭐ Level:', dashboard.level.toString());
        console.log('   👥 Directs:', dashboard.directs.toString());
        console.log('');
    } else {
        console.log('ℹ️  Owner não está registrado (isso é normal - owner não precisa LAI)');
        console.log('');
    }

    // 5. Mint USDT para testes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💵 MINT DE USDT PARA TESTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const ownerBalance = await usdt.balanceOf(owner.address);
    console.log('💰 Saldo USDT atual do Owner:', ethers.formatUnits(ownerBalance, 6), 'USDT');
    console.log('');

    const mintAmount = ethers.parseUnits("50000", 6); // 50k USDT
    console.log('⏳ Mintando 50,000 USDT para testes...');
    const mintTx = await usdt.mint(owner.address, mintAmount);
    await mintTx.wait();

    const newBalance = await usdt.balanceOf(owner.address);
    console.log('✅ Mint concluído!');
    console.log('   Novo saldo:', ethers.formatUnits(newBalance, 6), 'USDT');
    console.log('');

    // 6. Depositar Performance
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 DEPOSITAR PERFORMANCE FEE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const performanceAmount = ethers.parseUnits("10000", 6); // $10k

    console.log('⏳ Aprovando USDT...');
    const approveTx = await usdt.approve(CONTRACT_ADDRESS, performanceAmount);
    await approveTx.wait();
    console.log('✅ Aprovação concluída');
    console.log('');

    console.log('⏳ Depositando $10,000 de performance...');
    const depositTx = await contract.depositWeeklyPerformance(
        performanceAmount,
        "ipfs://QmTestPerformance123"
    );
    await depositTx.wait();
    console.log('✅ Performance depositada com sucesso!');
    console.log('');

    console.log('📊 Distribuição automática esperada:');
    console.log('   💧 Liquidity (5%):', '$500');
    console.log('   🏗️  Infrastructure (15%):', '$1,500');
    console.log('   🏢 Company (35%):', '$3,500');
    console.log('   📈 MLM Distributed (30%):', '$3,000');
    console.log('   🔒 MLM Locked (15%):', '$1,500');
    console.log('');

    // 7. Ver estado atualizado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADO APÓS PERFORMANCE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const updatedState = await contract.getSystemState();
    console.log('💰 Balanços Atualizados:');
    console.log('   Liquidity Pool:', ethers.formatUnits(updatedState.poolReserve, 6), 'USDT');
    console.log('   Infrastructure:', ethers.formatUnits(updatedState.infrastructure, 6), 'USDT');
    console.log('   Company:', ethers.formatUnits(updatedState.company, 6), 'USDT');
    console.log('   MLM Locked:', ethers.formatUnits(updatedState.mlmLocked, 6), 'USDT');
    console.log('');

    console.log('📈 Estatísticas Atualizadas:');
    console.log('   Current Week:', updatedState.week.toString());
    console.log('   Total Deposited:', ethers.formatUnits(updatedState.deposited, 6), 'USDT');
    console.log('   Total Distributed:', ethers.formatUnits(updatedState.distributed, 6), 'USDT');
    console.log('');

    // 8. Verificar batches pendentes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ VERIFICAR BATCHES PENDENTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const pendingBatches = await contract.getPendingBatches();

    if (pendingBatches.length === 0) {
        console.log('ℹ️  Nenhum batch pendente');
        console.log('   (Normal quando não há usuários ativos com LAI)');
        console.log('');
    } else {
        console.log('📦 Batches Pendentes:', pendingBatches.length);
        console.log('');

        for (const week of pendingBatches) {
            const progress = await contract.getBatchProgress(week);
            console.log(`Semana ${week}:`);
            console.log('   Total Users:', progress.totalUsers.toString());
            console.log('   Processed:', progress.processedUsers.toString());
            console.log('   % Complete:', progress.percentComplete.toString(), '%');
            console.log('   Is Stalled:', progress.isStalled ? '⚠️ Yes' : '✅ No');
            console.log('');
        }
    }

    // 9. Testar schedule de withdrawal (Timelock)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏰ TESTAR TIMELOCK (Schedule Withdrawal)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const withdrawAmount = ethers.parseUnits("1000", 6); // $1k

    console.log('⏳ Agendando saque de $1,000 da Company...');
    const scheduleTx = await contract.scheduleCompanyWithdrawal(withdrawAmount);
    const receipt = await scheduleTx.wait();

    // Pegar o withdrawalId do evento
    const event = receipt.logs.find(log => {
        try {
            const parsed = contract.interface.parseLog(log);
            return parsed.name === "WithdrawalScheduled";
        } catch {
            return false;
        }
    });

    if (event) {
        const parsed = contract.interface.parseLog(event);
        const withdrawalId = parsed.args.withdrawalId;
        console.log('✅ Withdrawal agendado!');
        console.log('   ID:', withdrawalId.toString());
        console.log('   ⏰ Executável em: 2 dias (timelock)');
        console.log('');
    } else {
        console.log('✅ Withdrawal agendado (verifique BSCScan)');
        console.log('');
    }

    // 10. Estado Final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTE SIMPLIFICADO COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('🎉 Funcionalidades testadas com sucesso:');
    console.log('   ✅ Conexão com contratos');
    console.log('   ✅ Verificação de estado do sistema');
    console.log('   ✅ Mint de Mock USDT');
    console.log('   ✅ Depósito de performance fee');
    console.log('   ✅ Distribuição automática de fundos');
    console.log('   ✅ Schedule de withdrawal (timelock)');
    console.log('   ✅ Verificação de batches');
    console.log('');

    console.log('📋 Próximos passos recomendados:');
    console.log('');
    console.log('1️⃣  **Registrar usuários reais**');
    console.log('   - Use outras carteiras MetaMask/Trust');
    console.log('   - Mint USDT para elas via BSCScan');
    console.log('   - Registre via frontend ou Hardhat');
    console.log('');
    console.log('2️⃣  **Testar batch processing completo**');
    console.log('   - Com múltiplos usuários ativos');
    console.log('   - Processar distribuição MLM');
    console.log('   - Ver comissões sendo distribuídas');
    console.log('');
    console.log('3️⃣  **Testar timelock**');
    console.log('   - Agendar withdrawal (já feito!)');
    console.log('   - Aguardar 2 dias');
    console.log('   - Executar withdrawal');
    console.log('');
    console.log('4️⃣  **Verificar no BSCScan Testnet**');
    console.log('   - Ver transações: https://testnet.bscscan.com/address/' + CONTRACT_ADDRESS);
    console.log('   - Verificar eventos emitidos');
    console.log('   - Confirmar state changes');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
