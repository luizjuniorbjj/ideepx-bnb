import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import config from '../src/config/index.js';

const prisma = new PrismaClient();

const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const MAIN_WALLET = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function addMainWallet() {
  console.log('📝 Adicionando carteira principal no banco...\n');

  try {
    // Conectar ao smart contract
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const abi = [
      'function getUserInfo(address) external view returns (address wallet, address sponsor, bool isRegistered, bool subscriptionActive, uint256 subscriptionTimestamp, uint256 subscriptionExpiration, uint256 totalEarned, uint256 totalWithdrawn, uint256 directReferrals)'
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Buscar dados do contrato
    console.log('🔍 Buscando dados do smart contract...');
    const [wallet, sponsor, isRegistered, subscriptionActive, , , totalEarned, totalWithdrawn, directReferrals] = await contract.getUserInfo(MAIN_WALLET);

    console.log(`   Registrado: ${isRegistered}`);
    console.log(`   Ativo: ${subscriptionActive}`);
    console.log(`   Diretos: ${directReferrals}`);
    console.log('');

    // Salvar no banco
    console.log('💾 Salvando no banco de dados...');
    const user = await prisma.user.upsert({
      where: { walletAddress: MAIN_WALLET.toLowerCase() },
      create: {
        walletAddress: MAIN_WALLET.toLowerCase(),
        sponsorAddress: sponsor === '0x0000000000000000000000000000000000000000' ? null : sponsor.toLowerCase(),
        active: subscriptionActive,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        sponsorAddress: sponsor === '0x0000000000000000000000000000000000000000' ? null : sponsor.toLowerCase(),
        active: subscriptionActive,
        updatedAt: new Date()
      }
    });

    console.log('✅ Usuário salvo no banco!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Wallet: ${user.walletAddress}`);
    console.log(`   Sponsor: ${user.sponsorAddress || 'Nenhum'}`);
    console.log(`   Ativo: ${user.active}`);
    console.log('');
    console.log('🎉 Pronto! Agora o frontend deve funcionar.');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addMainWallet();
