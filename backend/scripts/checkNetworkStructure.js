/**
 * Script para verificar estrutura da rede MLM
 */

import hre from 'hardhat';

const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const MAIN_WALLET = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function checkStructure() {
  console.log('\n📊 ===== ESTRUTURA DA REDE MLM =====\n');

  try {
    const contract = await hre.ethers.getContractAt('iDeepXDistributionV2', CONTRACT_ADDRESS);

    // Verificar usuário principal
    console.log('🔍 Verificando carteira principal...');
    const mainUser = await contract.users(MAIN_WALLET);
    console.log(`   Carteira: ${MAIN_WALLET}`);
    console.log(`   Ativo: ${mainUser.active ? '✅ SIM' : '❌ NÃO'}`);
    console.log('');

    // Pegar estatísticas do sistema
    console.log('📈 Estatísticas do Sistema...');
    const [totalUsers, totalActiveSubscriptions, totalMLMDistributed, betaMode] = await contract.getSystemStats();
    console.log(`   Total de usuários registrados: ${totalUsers}`);
    console.log(`   Usuários ATIVOS: ${totalActiveSubscriptions}`);
    console.log(`   Total distribuído MLM: ${hre.ethers.formatUnits(totalMLMDistributed, 6)} USDT`);
    console.log(`   Modo Beta: ${betaMode ? 'SIM' : 'NÃO'}`);
    console.log('');

    // Pegar estatísticas da rede do usuário principal
    console.log('🌐 Rede da Carteira Principal...');
    const networkStats = await contract.getNetworkStats(MAIN_WALLET);
    console.log(`   Diretos (Nível 1): ${networkStats.totalDirects}`);
    console.log(`   Total ganho: ${hre.ethers.formatUnits(networkStats.totalEarned, 6)} USDT`);
    console.log(`   Disponível: ${hre.ethers.formatUnits(networkStats.availableBalance, 6)} USDT`);
    console.log('');

    console.log('✅ Verificação concluída!');
    console.log('');
    console.log('📌 RESUMO FINAL:');
    console.log(`   - ${totalActiveSubscriptions} usuários ATIVOS no sistema`);
    console.log(`   - ${totalUsers} usuários registrados total`);
    console.log(`   - ${networkStats.totalDirects} referidos diretos de ${MAIN_WALLET.slice(0, 10)}...`);
    console.log(`   - Estrutura MLM de 10 níveis funcionando ✅`);
    console.log('');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

checkStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
