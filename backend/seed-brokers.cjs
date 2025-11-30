/**
 * Seed de Brokers e Servidores MT5
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brokers = [
    {
        name: 'Doo Prime',
        displayName: 'Doo Prime',
        logoUrl: '/brokers/doo-prime.png',
        website: 'https://www.dooprime.com',
        servers: [
            { serverName: 'DooTechnology-Live', serverAddress: 'mt5.dooprime.com:443', isDemo: false, isLive: true },
            { serverName: 'DooTechnology-Demo', serverAddress: 'mt5demo.dooprime.com:443', isDemo: true, isLive: false }
        ]
    },
    {
        name: 'GMI Markets',
        displayName: 'GMI Markets',
        logoUrl: '/brokers/gmi.png',
        website: 'https://www.gmimarkets.com',
        servers: [
            { serverName: 'GMI-Live', serverAddress: 'mt5.gmi.com:443', isDemo: false, isLive: true },
            { serverName: 'GMI-Demo', serverAddress: 'mt5demo.gmi.com:443', isDemo: true, isLive: false }
        ]
    }
];

async function main() {
    console.log('Populando brokers e servidores...');

    for (const broker of brokers) {
        console.log('Broker:', broker.name);

        const createdBroker = await prisma.broker.upsert({
            where: { name: broker.name },
            update: { displayName: broker.displayName, logoUrl: broker.logoUrl },
            create: {
                name: broker.name,
                displayName: broker.displayName,
                logoUrl: broker.logoUrl,
                website: broker.website,
                supportsMT5: true,
                supportsMT4: false,
                active: true
            }
        });

        for (const server of broker.servers) {
            await prisma.brokerServer.upsert({
                where: {
                    brokerId_serverName: {
                        brokerId: createdBroker.id,
                        serverName: server.serverName
                    }
                },
                update: { serverAddress: server.serverAddress, isDemo: server.isDemo, isLive: server.isLive },
                create: {
                    brokerId: createdBroker.id,
                    serverName: server.serverName,
                    serverAddress: server.serverAddress,
                    isDemo: server.isDemo,
                    isLive: server.isLive,
                    active: true
                }
            });
            console.log('  Server:', server.serverName);
        }
    }

    console.log('Brokers populados com sucesso!');
}

main()
    .catch(e => {
        console.error('Erro:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
