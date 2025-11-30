/**
 * Script para registrar conta MT5 no banco de dados
 * Conta: 9942058 @ DooTechnology-Live
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Dados da conta
const CONTA = {
    login: '9942058',
    server: 'DooTechnology-Live',
    password: '5cc41!eE',
    brokerName: 'Doo Prime',
    accountAlias: 'Luiz Carlos - Principal'
};

// Chave de criptografia (deve ser a mesma do .env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'aW5kZWVweC1ibmItZW5jcnlwdGlvbi1rZXktMzI=';

function encrypt(text) {
    const algorithm = 'aes-256-cbc';
    // Garantir que a chave tem 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY, 'base64').slice(0, 32);
    // Padding se necessário
    const keyPadded = Buffer.concat([key, Buffer.alloc(32 - key.length)]);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, keyPadded, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

async function main() {
    console.log('=' .repeat(80));
    console.log('📝 REGISTRANDO CONTA MT5 NO BANCO DE DADOS');
    console.log('=' .repeat(80));
    console.log();

    try {
        // 1. Verificar se já existe um usuário padrão ou criar um
        console.log('👤 Verificando/criando usuário...');

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { walletAddress: '0x0000000000000000000000000000000000000001' },
                    { email: 'admin@ideepx.com' }
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress: '0x0000000000000000000000000000000000000001',
                    email: 'admin@ideepx.com',
                    name: 'Admin iDeepX'
                }
            });
            console.log('✅ Usuário criado:', user.id);
        } else {
            console.log('✅ Usuário encontrado:', user.id);
        }

        // 2. Verificar se a conta já existe
        console.log('\n🔍 Verificando se conta já existe...');

        const existingAccount = await prisma.tradingAccount.findFirst({
            where: {
                login: CONTA.login,
                server: CONTA.server
            }
        });

        if (existingAccount) {
            console.log('⚠️  Conta já existe no banco!');
            console.log('   ID:', existingAccount.id);
            console.log('   Login:', existingAccount.login);
            console.log('   Servidor:', existingAccount.server);
            console.log('\n🔄 Atualizando credenciais...');

            // Atualizar credenciais
            const encryptedPassword = encrypt(CONTA.password);

            await prisma.tradingAccountCredential.upsert({
                where: { tradingAccountId: existingAccount.id },
                update: { encryptedPassword },
                create: {
                    tradingAccountId: existingAccount.id,
                    encryptedPassword
                }
            });

            console.log('✅ Credenciais atualizadas!');
            return;
        }

        // 3. Criar a conta
        console.log('\n📝 Criando conta MT5...');

        const tradingAccount = await prisma.tradingAccount.create({
            data: {
                userId: user.id,
                accountAlias: CONTA.accountAlias,
                brokerName: CONTA.brokerName,
                login: CONTA.login,
                server: CONTA.server,
                platform: 'MT5',
                status: 'ACTIVE',
                connected: false
            }
        });

        console.log('✅ Conta criada!');
        console.log('   ID:', tradingAccount.id);

        // 4. Salvar credenciais criptografadas
        console.log('\n🔐 Salvando credenciais criptografadas...');

        const encryptedPassword = encrypt(CONTA.password);

        await prisma.tradingAccountCredential.create({
            data: {
                tradingAccountId: tradingAccount.id,
                encryptedPassword
            }
        });

        console.log('✅ Credenciais salvas!');

        // 5. Resumo
        console.log('\n' + '=' .repeat(80));
        console.log('✅ CONTA REGISTRADA COM SUCESSO!');
        console.log('=' .repeat(80));
        console.log(`👤 Usuário: ${user.id}`);
        console.log(`🆔 Conta ID: ${tradingAccount.id}`);
        console.log(`📍 Login: ${CONTA.login}`);
        console.log(`🏢 Servidor: ${CONTA.server}`);
        console.log(`🏦 Corretora: ${CONTA.brokerName}`);
        console.log(`📝 Alias: ${CONTA.accountAlias}`);
        console.log('=' .repeat(80));
        console.log('\n🎯 Próximo passo: Iniciar o collector para começar a monitorar!');

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
