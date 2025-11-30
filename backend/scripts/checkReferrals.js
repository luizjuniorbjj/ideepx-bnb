import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const address = '0xdf3051d2982660ea265add9ef0323e9f2badc292';

  console.log('Buscando referrals de:', address);

  const referrals = await prisma.user.findMany({
    where: {
      sponsorAddress: address
    },
    select: {
      walletAddress: true,
      active: true,
      totalEarned: true,
      monthlyVolume: true
    }
  });

  console.log('\n📊 Referrals encontrados:', referrals.length);
  referrals.forEach((r, i) => {
    console.log(`\n${i+1}. ${r.walletAddress}`);
    console.log(`   Active: ${r.active}`);
    console.log(`   Total Earned: $${r.totalEarned}`);
    console.log(`   Monthly Volume: $${r.monthlyVolume}`);
  });

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
