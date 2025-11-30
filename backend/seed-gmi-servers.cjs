// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedGMIServers() {
  try {
    console.log('🌱 Adicionando servidores GMI Edge...\n');

    // Buscar GMI Edge
    const gmiEdge = await prisma.broker.findFirst({
      where: { name: 'gmiedge' }
    });

    if (!gmiEdge) {
      console.error('❌ GMI Edge não encontrada no banco!');
      console.log('   Execute seed-brokers.cjs primeiro.');
      process.exit(1);
    }

    console.log(`✅ GMI Edge encontrada: ${gmiEdge.displayName} (ID: ${gmiEdge.id})\n`);

    // Servidores oficiais GMI Edge (conforme seus logs MT5)
    const servers = [
      {
        brokerId: gmiEdge.id,
        serverName: 'GMI3-Real',
        serverAddress: 'GMI3-Real',
        isDemo: false,
        isLive: true,
        active: true
      },
      {
        brokerId: gmiEdge.id,
        serverName: 'GMI3-Demo',
        serverAddress: 'GMI3-Demo',
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

      // Cria servidor
      const created = await prisma.brokerServer.create({
        data: server
      });

      const type = server.isLive ? '(Live)' : '(Demo)';
      console.log(`✅ Servidor ${server.serverName} ${type} criado com ID: ${created.id}`);
    }

    console.log('\n📊 Buscando todos os servidores GMI Edge...');
    const allServers = await prisma.brokerServer.findMany({
      where: { brokerId: gmiEdge.id, active: true }
    });

    console.log(`\n✅ Total de ${allServers.length} servidores ativos:`);
    allServers.forEach((s) => {
      const type = s.isLive ? '(Live)' : '(Demo)';
      console.log(`   - ${s.serverName} ${type}`);
    });

    console.log('\n✨ Agora você pode conectar contas GMI Edge em: http://localhost:3000/mt5/connect');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGMIServers();
