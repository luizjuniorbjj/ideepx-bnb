/**
 * Diagnóstico da conexão GMI
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('\n🔍 DIAGNÓSTICO GMI\n');

  try {
    // Buscar o usuário específico que você está usando
    const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669'; // Endereço conectado

    console.log(`📍 Buscando usuário: ${address}\n`);

    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco!');
      console.log('   Primeiro registre este usuário no sistema.\n');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Wallet: ${user.walletAddress}`);
    console.log(`   Active: ${user.active}\n`);

    // Tentar buscar conta GMI (com try-catch para capturar erro específico)
    console.log('🔍 Buscando conta GMI...\n');

    try {
      const gmiAccount = await prisma.gmiAccount.findUnique({
        where: { userId: user.id }
      });

      if (!gmiAccount) {
        console.log('❌ Nenhuma conta GMI encontrada para este usuário!');
        console.log('   A conta não foi salva no banco após conectar.\n');
      } else {
        console.log('✅ Conta GMI encontrada:');
        console.log(`   Account Number: ${gmiAccount.accountNumber}`);
        console.log(`   Server: ${gmiAccount.server}`);
        console.log(`   Connected: ${gmiAccount.connected ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`   Balance: ${gmiAccount.balance}`);
        console.log(`   Equity: ${gmiAccount.equity}`);
        console.log(`   Last Sync: ${gmiAccount.lastSyncAt}\n`);

        if (!gmiAccount.connected) {
          console.log('⚠️ PROBLEMA: Conta existe mas connected = false');
          console.log('   Tentando corrigir...\n');

          await prisma.gmiAccount.update({
            where: { userId: user.id },
            data: { connected: true }
          });

          console.log('✅ Campo connected atualizado para true!\n');
        }
      }
    } catch (err) {
      console.log('❌ ERRO ao buscar conta GMI:');
      console.log(`   ${err.message}\n`);

      if (err.message.includes('Conversion failed')) {
        console.log('⚠️ BANCO DE DADOS CORROMPIDO!');
        console.log('   Soluções possíveis:');
        console.log('   1. Deletar dev.db e recriar');
        console.log('   2. Fazer migrate reset');
        console.log('   3. Criar novo usuário\n');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
