import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ============================================================================
  // BROKERS (Corretoras)
  // ============================================================================

  console.log('\n📊 Criando corretoras...');

  // 1. GMI Markets
  const gmiMarkets = await prisma.broker.upsert({
    where: { name: 'GMI Markets' },
    update: {},
    create: {
      name: 'GMI Markets',
      displayName: 'GMI Markets',
      logoUrl: 'https://gmimarkets.com/assets/images/logo.png',
      website: 'https://gmimarkets.com',
      supportsMT5: true,
      supportsMT4: true,
      active: true,
    },
  });
  console.log(`✅ Criada: ${gmiMarkets.displayName} (${gmiMarkets.id})`);

  // 2. DooPrime
  const dooPrime = await prisma.broker.upsert({
    where: { name: 'DooPrime' },
    update: {},
    create: {
      name: 'DooPrime',
      displayName: 'Doo Prime',
      logoUrl: 'https://dooprime.com/assets/images/logo.png',
      website: 'https://dooprime.com',
      supportsMT5: true,
      supportsMT4: true,
      active: true,
    },
  });
  console.log(`✅ Criada: ${dooPrime.displayName} (${dooPrime.id})`);

  // ============================================================================
  // BROKER SERVERS (Servidores MT5/MT4)
  // ============================================================================

  console.log('\n🖥️  Criando servidores MT5...');

  // GMI Markets Servers
  const gmiLive = await prisma.brokerServer.upsert({
    where: {
      brokerId_serverName: {
        brokerId: gmiMarkets.id,
        serverName: 'GMIMarkets-Live',
      },
    },
    update: {},
    create: {
      brokerId: gmiMarkets.id,
      serverName: 'GMIMarkets-Live',
      serverAddress: 'gmimarkets-live.mt5.com:443',
      isDemo: false,
      isLive: true,
      active: true,
    },
  });
  console.log(`  ✅ ${gmiLive.serverName} (Live)`);

  const gmiDemo = await prisma.brokerServer.upsert({
    where: {
      brokerId_serverName: {
        brokerId: gmiMarkets.id,
        serverName: 'GMIMarkets-Demo',
      },
    },
    update: {},
    create: {
      brokerId: gmiMarkets.id,
      serverName: 'GMIMarkets-Demo',
      serverAddress: 'gmimarkets-demo.mt5.com:443',
      isDemo: true,
      isLive: false,
      active: true,
    },
  });
  console.log(`  ✅ ${gmiDemo.serverName} (Demo)`);

  // DooPrime Servers
  const dooLive = await prisma.brokerServer.upsert({
    where: {
      brokerId_serverName: {
        brokerId: dooPrime.id,
        serverName: 'DooTechnology-Live',
      },
    },
    update: {},
    create: {
      brokerId: dooPrime.id,
      serverName: 'DooTechnology-Live',
      serverAddress: 'dootechnology-live.mt5.com:443',
      isDemo: false,
      isLive: true,
      active: true,
    },
  });
  console.log(`  ✅ ${dooLive.serverName} (Live)`);

  const dooDemo = await prisma.brokerServer.upsert({
    where: {
      brokerId_serverName: {
        brokerId: dooPrime.id,
        serverName: 'DooTechnology-Demo',
      },
    },
    update: {},
    create: {
      brokerId: dooPrime.id,
      serverName: 'DooTechnology-Demo',
      serverAddress: 'dootechnology-demo.mt5.com:443',
      isDemo: true,
      isLive: false,
      active: true,
    },
  });
  console.log(`  ✅ ${dooDemo.serverName} (Demo)`);

  console.log('\n✅ Seed concluído com sucesso!');
  console.log(`\n📊 Resumo:`);
  console.log(`   - Corretoras: 2 (GMI Markets, DooPrime)`);
  console.log(`   - Servidores MT5: 4 (2 live + 2 demo)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
