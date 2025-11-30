// ================================================================================
// ATIVAR ASSINATURAS DE TESTE
// ================================================================================
// Ativa assinaturas para os primeiros 5 usuários do banco de dados
// para permitir testes do sistema de Weekly Proof

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateTestSubscriptions() {
  try {
    console.log('\n🔧 ATIVANDO ASSINATURAS DE TESTE\n');

    // Buscar primeiros 5 usuários
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'asc' }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco!');
      console.log('   Crie usuários primeiro antes de ativar assinaturas.');
      return;
    }

    console.log(`Encontrados ${users.length} usuários para ativar:\n`);

    // Ativar assinatura por 30 dias para cada usuário
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60);

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          active: true,
          subscriptionExpiry: thirtyDaysFromNow
        }
      });

      const expiresAt = new Date(thirtyDaysFromNow * 1000).toISOString();
      console.log(`✅ ${user.walletAddress}`);
      console.log(`   Assinatura ativa até: ${expiresAt}`);
      console.log('');
    }

    console.log(`\n🎉 ${users.length} assinaturas ativadas com sucesso!`);
    console.log('   Duração: 30 dias');
    console.log(`   Expira em: ${new Date(thirtyDaysFromNow * 1000).toISOString()}`);
    console.log('\n✅ Agora você pode executar o teste do weekly proof!\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

activateTestSubscriptions();
