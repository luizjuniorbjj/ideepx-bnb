/**
 * 🚀 SCRIPT - Adicionar 30 Usuários na Rede MLM
 *
 * Distribui 30 novos usuários nos níveis abaixo da carteira principal
 */

import hre from 'hardhat';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Carteira principal (topo da rede)
const MAIN_WALLET = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

// Contrato MLM V10
const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';

/**
 * Gerar carteira fake determinística
 */
function generateWallet(index) {
  const hash = crypto.createHash('sha256').update(`user_${index}_v2`).digest('hex');
  return '0x' + hash.slice(0, 40);
}

/**
 * Adicionar usuários na rede
 */
async function addUsers() {
  console.log('\n🚀 ===== ADICIONANDO 30 USUÁRIOS =====\n');

  try {
    // Conectar ao contrato
    const contract = await hre.ethers.getContractAt('iDeepXDistributionV2', CONTRACT_ADDRESS);
    console.log('✅ Conectado ao contrato:', CONTRACT_ADDRESS);
    console.log('');

    // Pegar signer (carteira que vai pagar gas)
    const [deployer] = await hre.ethers.getSigners();
    console.log('💰 Deployer:', deployer.address);
    console.log('');

    // Estrutura da rede:
    // Nível 1: 3 usuários (filhos diretos do MAIN_WALLET)
    // Nível 2: 9 usuários (3 filhos para cada L1)
    // Nível 3: 18 usuários (2 filhos para cada L2)
    // Total: 30 usuários

    let userIndex = 10; // Começar do índice 10 (usuários 1-9 já existem)
    const newUsers = [];

    // NÍVEL 1 - 3 usuários diretos
    console.log('📍 NÍVEL 1: Adicionando 3 usuários diretos...');
    const level1Users = [];
    for (let i = 0; i < 3; i++) {
      const wallet = generateWallet(userIndex++);
      level1Users.push(wallet);
      newUsers.push({ wallet, sponsor: MAIN_WALLET, level: 1 });
    }
    console.log(`   ✅ ${level1Users.length} usuários no Nível 1`);
    console.log('');

    // NÍVEL 2 - 9 usuários (3 para cada L1)
    console.log('📍 NÍVEL 2: Adicionando 9 usuários...');
    const level2Users = [];
    for (let l1Index = 0; l1Index < level1Users.length; l1Index++) {
      const sponsor = level1Users[l1Index];
      for (let i = 0; i < 3; i++) {
        const wallet = generateWallet(userIndex++);
        level2Users.push(wallet);
        newUsers.push({ wallet, sponsor, level: 2 });
      }
    }
    console.log(`   ✅ ${level2Users.length} usuários no Nível 2`);
    console.log('');

    // NÍVEL 3 - 18 usuários (2 para cada L2)
    console.log('📍 NÍVEL 3: Adicionando 18 usuários...');
    const level3Users = [];
    for (let l2Index = 0; l2Index < level2Users.length; l2Index++) {
      const sponsor = level2Users[l2Index];
      for (let i = 0; i < 2; i++) {
        const wallet = generateWallet(userIndex++);
        level3Users.push(wallet);
        newUsers.push({ wallet, sponsor, level: 3 });
      }
    }
    console.log(`   ✅ ${level3Users.length} usuários no Nível 3`);
    console.log('');

    console.log(`📊 TOTAL DE NOVOS USUÁRIOS: ${newUsers.length}`);
    console.log('');

    // Registrar todos no contrato
    console.log('🔗 REGISTRANDO NO SMART CONTRACT...');
    console.log('');

    for (let i = 0; i < newUsers.length; i++) {
      const user = newUsers[i];

      try {
        console.log(`[${i + 1}/${newUsers.length}] Registrando ${user.wallet.slice(0, 10)}... (Nível ${user.level}, Sponsor: ${user.sponsor.slice(0, 10)}...)`);

        // Registrar no contrato
        const tx = await contract.registerClient(user.wallet, user.sponsor);
        await tx.wait();

        console.log(`   ✅ Registrado! TX: ${tx.hash.slice(0, 15)}...`);

        // Salvar no banco de dados
        await prisma.user.upsert({
          where: { walletAddress: user.wallet.toLowerCase() },
          create: {
            walletAddress: user.wallet.toLowerCase(),
            sponsorAddress: user.sponsor.toLowerCase(),
            active: false, // Ainda não ativou
            registeredAt: new Date(),
            referralCode: crypto.randomBytes(4).toString('hex')
          },
          update: {
            sponsorAddress: user.sponsor.toLowerCase()
          }
        });

        console.log(`   💾 Salvo no banco!`);
        console.log('');

        // Delay para evitar problemas de nonce
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ ERRO ao registrar ${user.wallet}:`, error.message);
      }
    }

    console.log('');
    console.log('🎉 ===== CONCLUÍDO =====');
    console.log(`✅ ${newUsers.length} novos usuários adicionados!`);
    console.log('');

    // Mostrar estrutura final
    console.log('📊 ESTRUTURA DA REDE:');
    console.log(`   Nível 0: 1 usuário (${MAIN_WALLET.slice(0, 10)}...)`);
    console.log(`   Nível 1: ${level1Users.length} usuários`);
    console.log(`   Nível 2: ${level2Users.length} usuários`);
    console.log(`   Nível 3: ${level3Users.length} usuários`);
    console.log(`   TOTAL: ${1 + newUsers.length} usuários`);
    console.log('');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
