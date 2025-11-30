import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  // Buscar alguns usuários com seus sponsors
  const users = await prisma.user.findMany({
    take: 10,
    where: {
      active: true
    },
    include: {
      sponsor: {
        select: {
          walletAddress: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\n📊 VERIFICANDO SPONSORS:\n');

  let withSponsor = 0;
  let withoutSponsor = 0;

  users.forEach((user, i) => {
    console.log(`${i+1}. ${user.walletAddress.slice(0,8)}...${user.walletAddress.slice(-6)}`);
    console.log(`   SponsorId: ${user.sponsorId || 'N/A'}`);
    console.log(`   Sponsor: ${user.sponsor?.walletAddress?.slice(0,8)}...${user.sponsor?.walletAddress?.slice(-6) || 'N/A'}`);
    console.log('');

    if (user.sponsorId) {
      withSponsor++;
    } else {
      withoutSponsor++;
    }
  });

  console.log(`✅ Com sponsor: ${withSponsor}`);
  console.log(`❌ Sem sponsor: ${withoutSponsor}`);

  await prisma.$disconnect();
})();
