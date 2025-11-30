const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    console.log('=== USUARIOS ===');
    const users = await p.user.findMany({
        where: {
            walletAddress: {
                in: [
                    '0x75d1a8ac59003088c60a20bde8953cbecfe41669',
                    '0xf172771b808e6cdc2cfe802b7a93edd006cce762'
                ]
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\n=== CONTAS MT5 ===');
    const accounts = await p.tradingAccount.findMany({
        include: { user: true }
    });
    console.log(JSON.stringify(accounts, null, 2));
}

main().finally(() => p.$disconnect());
