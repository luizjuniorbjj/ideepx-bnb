import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function createTestWallet() {
  console.log('🔐 Criando carteira de teste...\n');

  // Criar carteira determinística para testes
  const wallet = ethers.Wallet.createRandom();

  const now = Math.floor(Date.now() / 1000);
  const expiry = now + (90 * 24 * 60 * 60); // 90 dias de assinatura

  const userData = {
    walletAddress: wallet.address.toLowerCase(),
    active: true,
    kycStatus: 1,
    subscriptionExpiry: expiry,
    sponsorAddress: null, // Sem sponsor (primeiro usuário)
    maxLevel: 10, // Todos os níveis desbloqueados
    totalEarned: '15000.00',
    totalWithdrawn: '5000.00',
    internalBalance: '10000.00',
    monthlyVolume: '25000.00',
    totalVolume: '150000.00'
  };

  try {
    const user = await prisma.user.create({
      data: userData
    });

    console.log('✅ Carteira de teste criada com sucesso!\n');
    console.log('━'.repeat(70));
    console.log('📋 INFORMAÇÕES DA CARTEIRA DE TESTE');
    console.log('━'.repeat(70));
    console.log(`\n🔑 Endereço da Carteira:\n   ${wallet.address}`);
    console.log(`\n🔐 Private Key (GUARDAR COM SEGURANÇA!):\n   ${wallet.privateKey}`);
    console.log(`\n📊 Status da Conta:`);
    console.log(`   - Status: ${user.active ? '✅ ATIVA' : '❌ INATIVA'}`);
    console.log(`   - KYC: ${user.kycStatus === 1 ? '✅ Aprovado' : '⏳ Pendente'}`);
    console.log(`   - Max Level MLM: ${user.maxLevel}`);
    console.log(`   - Total Earned: $${user.totalEarned}`);
    console.log(`   - Internal Balance: $${user.internalBalance}`);
    console.log(`   - Monthly Volume: $${user.monthlyVolume}`);
    console.log(`   - Total Volume: $${user.totalVolume}`);

    const expiryDate = new Date(expiry * 1000);
    console.log(`   - Assinatura válida até: ${expiryDate.toLocaleDateString('pt-BR')}`);

    console.log('\n━'.repeat(70));
    console.log('💡 COMO USAR:');
    console.log('━'.repeat(70));
    console.log('\n1. Abra o MetaMask');
    console.log('2. Clique em "Importar Conta"');
    console.log('3. Cole a Private Key acima');
    console.log('4. Acesse http://localhost:3000');
    console.log('5. Conecte com esta carteira\n');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('❌ Erro ao criar carteira:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestWallet().catch(console.error);
