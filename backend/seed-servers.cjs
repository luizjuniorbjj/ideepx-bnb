// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedServers() {
  try {
    console.log('🌱 Populando servidores MT5...\n');

    // Buscar Doo Prime
    const dooPrime = await prisma.broker.findUnique({
      where: { name: 'dooprime' }
    });

    if (!dooPrime) {
      console.error('❌ Corretora Doo Prime não encontrada! Execute seed-brokers.cjs primeiro.');
      return;
    }

    console.log(`✅ Corretora Doo Prime encontrada: ${dooPrime.id}\n`);

    // Servidores conhecidos da Doo Prime
    const servers = [
      {
        brokerId: dooPrime.id,
        serverName: 'DooFinancialAU-Live',
        serverAddress: 'DooFinancialAU-Live',
        isDemo: false,
        isLive: true,
        active: true
      },
      {
        brokerId: dooPrime.id,
        serverName: 'DooFinancialAU-Demo',
        serverAddress: 'DooFinancialAU-Demo',
        isDemo: true,
        isLive: false,
        active: true
      },
      {
        brokerId: dooPrime.id,
        serverName: 'DooPrimeVN-Live',
        serverAddress: 'DooPrimeVN-Live',
        isDemo: false,
        isLive: true,
        active: true
      },
      {
        brokerId: dooPrime.id,
        serverName: 'DooPrimeVN-Demo',
        serverAddress: 'DooPrimeVN-Demo',
        isDemo: true,
        isLive: false,
        active: true
      }
    ];

    for (const server of servers) {
      // Verifica se já existe
      const existing = await prisma.brokerServer.findFirst({
        where: {
          brokerId: server.brokerId,
          serverName: server.serverName
        }
      });

      if (existing) {
        console.log(`⚠️  Servidor ${server.serverName} já existe, pulando...`);
        continue;
      }

      // Cria o servidor
      const created = await prisma.brokerServer.create({
        data: server
      });

      const type = server.isLive ? '(Live)' : '(Demo)';
      console.log(`✅ Servidor ${server.serverName} ${type} criado com ID: ${created.id}`);
    }

    console.log('\n📊 Buscando todos os servidores da Doo Prime...');
    const allServers = await prisma.brokerServer.findMany({
      where: { brokerId: dooPrime.id, active: true }
    });

    console.log(`\n✅ Total de ${allServers.length} servidores ativos:`);
    allServers.forEach((s) => {
      const type = s.isLive ? '(Live)' : '(Demo)';
      console.log(`   - ${s.serverName} ${type}`);
    });

    console.log('\n🎉 Seed de servidores concluído!');

  } catch (error) {
    console.error('❌ Erro ao popular servidores:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedServers();
