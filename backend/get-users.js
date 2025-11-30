/**
 * Script para listar endereços dos usuários
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUsers() {
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      walletAddress: true,
      active: true
    }
  });

  console.log('Primeiros 5 usuários:');
  users.forEach((user, i) => {
    console.log(`${i + 1}. ${user.walletAddress} (${user.active ? 'Ativo' : 'Inativo'})`);
  });

  await prisma.$disconnect();
}

getUsers().catch(console.error);
