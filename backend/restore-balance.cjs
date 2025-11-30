const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const updated = await prisma.user.update({
      where: {
        walletAddress: '0xdf3051d2982660ea265add9ef0323e9f2badc292'
      },
      data: {
        internalBalance: '100.00',
        totalWithdrawn: '0.00'
      }
    });

    console.log('✅ Saldo restaurado com sucesso!');
    console.log('💰 Novo saldo:', updated.internalBalance);
    console.log('💸 Total sacado resetado:', updated.totalWithdrawn);
    console.log('');
    console.log('Agora você pode testar os saques novamente em:');
    console.log('http://localhost:3000/withdraw');

  } catch (error) {
    console.error('❌ Erro ao restaurar saldo:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
