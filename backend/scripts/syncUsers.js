import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import config from '../src/config/index.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Carregar ABI
const abiPath = path.resolve(process.cwd(), '../iDeepXCoreV10_abi.json');
const contractAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Provider e contrato
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const contract = new ethers.Contract(config.contractV10Address, contractAbi, provider);

async function getUsersFromContract() {
  console.log('🔍 Buscando eventos UserRegistered do contrato...\n');

  // Buscar eventos UserRegistered desde o bloco de deploy
  const filter = contract.filters.UserRegistered();
  const events = await contract.queryFilter(filter, 0, 'latest');

  console.log(`   Encontrados ${events.length} eventos de registro\n`);

  // Extrair endereços únicos
  const uniqueUsers = [...new Set(events.map(event => event.args[0]))];

  console.log(`   Total de usuários únicos: ${uniqueUsers.length}\n`);

  return uniqueUsers;
}

async function syncUsers() {
  console.log('🔄 Iniciando sincronização de usuários...\n');

  // Buscar usuários registrados no contrato
  const wallets = await getUsersFromContract();

  if (wallets.length === 0) {
    console.log('⚠️  Nenhum usuário registrado encontrado no contrato!\n');
    await prisma.$disconnect();
    return;
  }

  let synced = 0;
  let errors = 0;

  for (const walletAddress of wallets) {
    try {
      console.log(`📥 Buscando dados de ${walletAddress}...`);

      // Buscar dados on-chain
      const userData = await contract.userView(walletAddress);

      // Verificar se usuário está registrado
      if (!userData.registered) {
        console.log(`   ⚠️  Não registrado no contrato - pulando\n`);
        continue;
      }

      // Preparar dados para o database
      const now = Math.floor(Date.now() / 1000);
      const active = userData.subscriptionExpiry > now;

      // Criar ou atualizar usuário no database
      const user = await prisma.user.upsert({
        where: { walletAddress: walletAddress.toLowerCase() },
        update: {
          active,
          kycStatus: Number(userData.kycStatus),
          subscriptionExpiry: Number(userData.subscriptionExpiry),
          sponsorAddress: userData.sponsor.toLowerCase(),
          maxLevel: Number(userData.maxLevel),
          totalEarned: userData.totalEarned.toString(),
          totalWithdrawn: userData.totalWithdrawn.toString(),
          internalBalance: userData.internalBalance.toString(),
          updatedAt: new Date()
        },
        create: {
          walletAddress: walletAddress.toLowerCase(),
          active,
          kycStatus: Number(userData.kycStatus),
          subscriptionExpiry: Number(userData.subscriptionExpiry),
          sponsorAddress: userData.sponsor.toLowerCase(),
          maxLevel: Number(userData.maxLevel),
          totalEarned: userData.totalEarned.toString(),
          totalWithdrawn: userData.totalWithdrawn.toString(),
          internalBalance: userData.internalBalance.toString(),
          monthlyVolume: '0',
          totalVolume: '0'
        }
      });

      console.log(`   ✅ Sincronizado: ${user.id}`);
      console.log(`   Status: ${active ? 'Ativo' : 'Inativo'}`);
      console.log(`   Patrocinador: ${userData.sponsor}`);
      console.log(`   Max Level: ${userData.maxLevel}\n`);

      synced++;

    } catch (error) {
      console.error(`   ❌ Erro ao sincronizar ${walletAddress}:`);
      console.error(`   ${error.message}\n`);
      errors++;
    }
  }

  console.log('━'.repeat(60));
  console.log(`✅ Sincronização concluída!`);
  console.log(`   Sucesso: ${synced}`);
  console.log(`   Erros: ${errors}`);
  console.log(`   Total: ${wallets.length}`);
  console.log('━'.repeat(60));

  await prisma.$disconnect();
}

syncUsers().catch(console.error);
