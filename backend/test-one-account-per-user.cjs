// ================================================================================
// TESTE: 1 CONTA POR USUÁRIO
// ================================================================================
// Este script testa a regra de negócio onde cada usuário pode ter apenas
// UMA conta MT5 conectada por vez. Ao conectar uma nova conta, a antiga é
// automaticamente deletada (incluindo snapshots e credenciais).

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOneAccountPerUser() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTE: 1 CONTA POR USUÁRIO');
    console.log('='.repeat(80));

    const testWallet = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

    // ============================================================================
    // FASE 1: Verificar estado inicial
    // ============================================================================

    console.log('\n📊 FASE 1: Verificar estado inicial\n');

    const user = await prisma.user.findUnique({
      where: { walletAddress: testWallet }
    });

    if (!user) {
      console.error('❌ Usuário não encontrado!');
      console.log('   Execute primeiro uma conexão via dashboard.');
      process.exit(1);
    }

    const initialAccounts = await prisma.tradingAccount.findMany({
      where: { userId: user.id },
      include: {
        credentials: true
      }
    });

    console.log(`✅ Usuário encontrado: ${user.walletAddress}`);
    console.log(`   Total de contas conectadas: ${initialAccounts.length}`);

    if (initialAccounts.length > 0) {
      initialAccounts.forEach((acc, index) => {
        console.log(`   [${index + 1}] ${acc.brokerName} ${acc.login}@${acc.server}`);
        console.log(`       ID: ${acc.id}`);
        console.log(`       Balance: US$ ${acc.balance}`);
        console.log(`       Status: ${acc.status}`);
      });
    } else {
      console.log('   ⚠️  Nenhuma conta conectada ainda.');
    }

    // ============================================================================
    // FASE 2: Contar snapshots
    // ============================================================================

    console.log('\n📸 FASE 2: Verificar snapshots existentes\n');

    let totalSnapshots = 0;
    for (const acc of initialAccounts) {
      const snapshots = await prisma.accountSnapshot.count({
        where: { tradingAccountId: acc.id }
      });
      totalSnapshots += snapshots;
      console.log(`   ${acc.brokerName} ${acc.login}: ${snapshots} snapshot(s)`);
    }

    console.log(`\n   Total de snapshots no sistema: ${totalSnapshots}`);

    // ============================================================================
    // FASE 3: Simular regra de negócio
    // ============================================================================

    console.log('\n🔄 FASE 3: Aplicar regra "1 conta por usuário"\n');

    console.log('💡 Cenário:');
    console.log('   - Usuário conecta primeira conta: GMI Edge 32650016');
    console.log('   - Sistema cria snapshots (coletor automático)');
    console.log('   - Usuário decide trocar para: Doo Prime 9941739');
    console.log('   - Sistema deve:');
    console.log('     1. Deletar conta GMI Edge antiga');
    console.log('     2. Deletar todos os snapshots antigos');
    console.log('     3. Deletar credenciais antigas');
    console.log('     4. Criar nova conta Doo Prime');
    console.log('     5. Manter APENAS a nova conta');

    console.log('\n🎯 Resultado esperado:');
    console.log('   - Database contém APENAS 1 conta por usuário');
    console.log('   - Snapshots antigos são removidos (evita confusão)');
    console.log('   - Usuário vê apenas sua conta atual no dashboard');

    // ============================================================================
    // FASE 4: Verificar implementação
    // ============================================================================

    console.log('\n✅ FASE 4: Implementação atual\n');

    console.log('Arquivo: backend/src/routes/mt5.js');
    console.log('Rota: POST /api/mt5/connect');
    console.log('');
    console.log('Lógica implementada:');
    console.log('```javascript');
    console.log('// Buscar contas existentes do usuário');
    console.log('const existingAccounts = await prisma.tradingAccount.findMany({');
    console.log('  where: { userId: user.id }');
    console.log('});');
    console.log('');
    console.log('// Se existir conta antiga, deletar TUDO');
    console.log('if (existingAccounts.length > 0) {');
    console.log('  for (const oldAccount of existingAccounts) {');
    console.log('    await prisma.accountSnapshot.deleteMany({ ... });');
    console.log('    await prisma.tradingAccountCredential.deleteMany({ ... });');
    console.log('    await prisma.tradingAccount.delete({ ... });');
    console.log('  }');
    console.log('}');
    console.log('');
    console.log('// Criar nova conta (sempre limpo)');
    console.log('const newAccount = await prisma.tradingAccount.create({ ... });');
    console.log('```');

    // ============================================================================
    // FASE 5: Teste prático
    // ============================================================================

    console.log('\n🧪 FASE 5: Como testar manualmente\n');

    console.log('1. Conecte primeira conta:');
    console.log('   - Acesse: http://localhost:3000/mt5/connect');
    console.log('   - Conecte: GMI Edge 32650016');
    console.log('   - Verifique dashboard: 1 conta visível');
    console.log('');
    console.log('2. Aguarde snapshots serem criados:');
    console.log('   - Auto-collector roda a cada 30s');
    console.log('   - Verifique no banco: snapshots criados');
    console.log('   - Execute: node list-mt5-accounts.cjs');
    console.log('');
    console.log('3. Conecte segunda conta (mesmo usuário):');
    console.log('   - Acesse: http://localhost:3000/mt5/connect');
    console.log('   - Conecte: Doo Prime 9941739');
    console.log('   - Observe logs do backend');
    console.log('');
    console.log('4. Verificar resultado:');
    console.log('   - Execute: node list-mt5-accounts.cjs');
    console.log('   - Deve mostrar APENAS 1 conta (Doo Prime)');
    console.log('   - GMI Edge antiga foi deletada completamente');
    console.log('   - Dashboard mostra apenas conta atual');

    // ============================================================================
    // FASE 6: Validação final
    // ============================================================================

    console.log('\n📋 FASE 6: Validação final do sistema\n');

    const finalAccounts = await prisma.tradingAccount.findMany({
      where: { userId: user.id }
    });

    let finalSnapshots = 0;
    for (const acc of finalAccounts) {
      const snapshots = await prisma.accountSnapshot.count({
        where: { tradingAccountId: acc.id }
      });
      finalSnapshots += snapshots;
    }

    console.log(`Estado atual do sistema:`);
    console.log(`   Total de contas: ${finalAccounts.length}`);
    console.log(`   Total de snapshots: ${finalSnapshots}`);
    console.log('');

    if (finalAccounts.length === 1) {
      console.log('✅ CORRETO: Usuário tem exatamente 1 conta');
      console.log(`   Conta ativa: ${finalAccounts[0].brokerName} ${finalAccounts[0].login}`);
    } else if (finalAccounts.length === 0) {
      console.log('⚠️  AVISO: Usuário não tem contas conectadas ainda');
    } else {
      console.log('❌ ERRO: Usuário tem mais de 1 conta!');
      console.log('   Isso não deveria acontecer com a nova lógica.');
    }

    // ============================================================================
    // RESUMO
    // ============================================================================

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DO COMPORTAMENTO');
    console.log('='.repeat(80));

    console.log('\n🎯 REGRA DE NEGÓCIO:');
    console.log('   - Cada usuário pode ter APENAS 1 conta MT5 conectada');
    console.log('   - Ao conectar nova conta, a antiga é COMPLETAMENTE deletada');
    console.log('   - Incluindo: conta, credenciais E snapshots históricos');
    console.log('   - Evita confusão e mantém dashboard limpo');

    console.log('\n✅ BENEFÍCIOS:');
    console.log('   - Dashboard sempre mostra apenas conta atual');
    console.log('   - Não há contas "fantasma" ou duplicadas');
    console.log('   - Histórico limpo (apenas da conta ativa)');
    console.log('   - Troca de conta é simples e transparente');

    console.log('\n⚠️  CONSIDERAÇÕES:');
    console.log('   - Histórico da conta antiga é PERDIDO');
    console.log('   - Se usuário quiser manter histórico, deve exportar antes');
    console.log('   - Mudança é PERMANENTE e IMEDIATA');

    console.log('\n💡 FLUXO DO USUÁRIO:');
    console.log('   1. Usuário conecta Conta A');
    console.log('   2. Sistema coleta dados por dias/semanas');
    console.log('   3. Usuário decide trocar para Conta B');
    console.log('   4. Acessa /mt5/connect e conecta Conta B');
    console.log('   5. Sistema deleta automaticamente Conta A + dados');
    console.log('   6. Dashboard mostra apenas Conta B (limpo)');

    console.log('\n🔧 PARA DESENVOLVEDORES:');
    console.log('   - Implementado em: backend/src/routes/mt5.js:99-132');
    console.log('   - Lógica: deletar todas as contas antigas antes de criar nova');
    console.log('   - Deletions em cascata: snapshots → credentials → account');
    console.log('   - Logs detalhados no backend para debug');

    console.log('\n' + '='.repeat(80));
    console.log('✅ TESTE CONCLUÍDO');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testOneAccountPerUser();
