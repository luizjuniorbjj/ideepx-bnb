// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDooServers() {
  try {
    console.log('🔧 Corrigindo servidores da Doo Prime...\n');

    // Buscar Doo Prime
    const dooPrime = await prisma.broker.findUnique({
      where: { name: 'dooprime' }
    });

    if (!dooPrime) {
      console.error('❌ Corretora Doo Prime não encontrada!');
      return;
    }

    console.log(`✅ Corretora Doo Prime encontrada: ${dooPrime.id}\n`);

    // Deletar TODOS os servidores antigos da Doo Prime
    console.log('🗑️  Deletando servidores antigos...');
    const deleted = await prisma.brokerServer.deleteMany({
      where: { brokerId: dooPrime.id }
    });
    console.log(`   Deletados ${deleted.count} servidores antigos\n`);

    // Servidores CORRETOS da Doo Prime (apenas 2)
    const correctServers = [
      {
        brokerId: dooPrime.id,
        serverName: 'DooTechnology-Live',
        serverAddress: 'DooTechnology-Live',
        isDemo: false,
        isLive: true,
        active: true
      },
      {
        brokerId: dooPrime.id,
        serverName: 'DooTechnology-Demo',
        serverAddress: 'DooTechnology-Demo',
        isDemo: true,
        isLive: false,
        active: true
      }
    ];

    console.log('✨ Criando servidores corretos...');
    for (const server of correctServers) {
      const created = await prisma.brokerServer.create({
        data: server
      });

      const type = server.isLive ? '(Live)' : '(Demo)';
      console.log(`   ✅ ${server.serverName} ${type} - ID: ${created.id}`);
    }

    console.log('\n📊 Servidores finais da Doo Prime:');
    const allServers = await prisma.brokerServer.findMany({
      where: { brokerId: dooPrime.id, active: true },
      orderBy: { isLive: 'desc' } // Live primeiro
    });

    allServers.forEach((s) => {
      const type = s.isLive ? '(Live)' : '(Demo)';
      console.log(`   - ${s.serverName} ${type}`);
    });

    console.log('\n🎉 Servidores corrigidos com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDooServers();
