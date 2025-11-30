import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const allPerf = await prisma.performanceRecord.findMany({
    select: {
      month: true,
      year: true,
      profitUsd: true,
      createdAt: true
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n📊 PERFORMANCE RECORDS RECENTES:\n');
  allPerf.forEach((p, i) => {
    console.log(`${i+1}. Mês: ${p.month}/${p.year} | Lucro: $${p.profitUsd} | Criado: ${p.createdAt.toISOString().slice(0,10)}`);
  });

  await prisma.$disconnect();
})();
