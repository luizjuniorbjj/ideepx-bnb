// Script para atualizar senha da conta MT5
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Mesma função de criptografia do backend
function encryptPassword(password) {
  try {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(ENCRYPTION_KEY, 'base64');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv);
    let encrypted = cipher.update(password, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return Buffer.concat([iv, Buffer.from(encrypted, 'base64')]).toString('base64');
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    throw new Error('Failed to encrypt password');
  }
}

async function updatePassword() {
  try {
    console.log('\n🔐 Atualizando senha da conta MT5...\n');

    const newPassword = '110677Pa*';
    const encryptedPassword = encryptPassword(newPassword);

    const updated = await prisma.tradingAccountCredential.update({
      where: { tradingAccountId: '31b4d891-4f84-4743-b464-303a814f4661' },
      data: {
        encryptedPassword: encryptedPassword
      }
    });

    console.log('✅ Senha atualizada com sucesso!');
    console.log(`   Conta ID: ${updated.tradingAccountId}`);
    console.log(`   Senha criptografada e armazenada com segurança\n`);

  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
