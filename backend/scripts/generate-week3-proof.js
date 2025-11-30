// ================================================================================
// SCRIPT: GERAR PROVA SEMANAL 3 COM 75 USUÁRIOS
// ================================================================================
// Usa os dados reais do banco (performance records) para gerar snapshot e
// submeter na blockchain + IPFS

import { PrismaClient } from '@prisma/client';
import { generateWeeklySnapshot } from '../src/services/snapshotGenerator.js';
import { submitWeeklyProof, getProofInfo } from '../src/blockchain/proof.js';

const prisma = new PrismaClient();

// ================================================================================
// CONFIGURAÇÃO
// ================================================================================

const WEEK_NUMBER = 3; // Semana 3
const DRY_RUN = process.env.DRY_RUN === 'true'; // Se true, não submete na blockchain

// ================================================================================
// FUNÇÕES
// ================================================================================

/**
 * Buscar lucros dos performance records no banco
 */
async function fetchProfitsFromDatabase() {
  console.log('\n📊 Buscando performance records do banco...\n');

  // Buscar todos os performance records que têm lucro
  const perfRecords = await prisma.performanceRecord.findMany({
    where: {
      profitUsd: {
        not: '0'
      }
    },
    include: {
      user: {
        select: {
          id: true,
          walletAddress: true,
          active: true
        }
      }
    }
  });

  console.log(`   Encontrados: ${perfRecords.length} performance records`);

  // Converter para formato esperado { userId: profitAmount }
  const profits = {};
  let totalProfit = 0;

  perfRecords.forEach(record => {
    const profit = parseFloat(record.profitUsd || 0);
    if (profit > 0 && record.user) {
      profits[record.user.id] = profit;
      totalProfit += profit;
    }
  });

  console.log(`   Usuários com lucro: ${Object.keys(profits).length}`);
  console.log(`   Lucro total: $${totalProfit.toFixed(2)}`);

  return profits;
}

/**
 * Verificar se já existe prova para esta semana
 */
async function checkExistingProof() {
  try {
    const proofInfo = await getProofInfo();
    const totalProofs = proofInfo.totalProofs;

    console.log(`\n🔍 Verificando provas existentes...`);
    console.log(`   Total de provas: ${totalProofs}`);

    if (totalProofs >= WEEK_NUMBER) {
      console.log(`\n⚠️ ATENÇÃO: Prova da semana ${WEEK_NUMBER} já existe!`);
      console.log(`   Total de provas no contrato: ${totalProofs}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar provas:', error.message);
    return false;
  }
}

// ================================================================================
// MAIN
// ================================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        GERAR PROVA SEMANAL 3 - 75 USUÁRIOS COMPLETO           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📅 Semana: ${WEEK_NUMBER}`);
  console.log(`🕐 Horário: ${new Date().toISOString()}`);
  console.log(`🧪 Modo: ${DRY_RUN ? 'DRY RUN (sem blockchain)' : 'PRODUÇÃO (com blockchain)'}`);

  try {
    // ================================================================================
    // 1. VERIFICAR SE JÁ EXISTE
    // ================================================================================

    const exists = await checkExistingProof();
    if (exists && !DRY_RUN) {
      console.log('\n⚠️ Operação cancelada: prova já existe.');
      console.log('   Use DRY_RUN=true para testar sem submeter.\n');
      process.exit(0);
    }

    // ================================================================================
    // 2. BUSCAR LUCROS DO BANCO
    // ================================================================================

    const profits = await fetchProfitsFromDatabase();

    if (Object.keys(profits).length === 0) {
      console.log('\n⚠️ Nenhum lucro encontrado no banco!');
      console.log('   Certifique-se de que há performance records criados.\n');
      process.exit(1);
    }

    // ================================================================================
    // 3. GERAR SNAPSHOT
    // ================================================================================

    console.log('\n📝 PASSO 2: Gerando snapshot e upload IPFS...\n');

    const { snapshot, ipfsHash, ipfsUrl, summary } = await generateWeeklySnapshot({
      weekNumber: WEEK_NUMBER,
      profits,
      uploadToIPFS: !DRY_RUN
    });

    console.log('\n✅ Snapshot gerado!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total de Usuários: ${summary.totalUsers}`);
    console.log(`💰 Total de Lucros: $${summary.totalProfits.toFixed(2)}`);
    console.log(`💵 Total de Comissões MLM: $${summary.totalCommissions.toFixed(2)}`);
    console.log(`📈 Taxa de Comissão: ${((summary.totalCommissions / summary.totalProfits) * 100).toFixed(1)}%`);

    if (!DRY_RUN) {
      console.log(`\n📤 IPFS Hash: ${ipfsHash}`);
      console.log(`🔗 IPFS URL: ${ipfsUrl}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Salvar snapshot localmente para referência
    const fs = await import('fs');
    const path = await import('path');
    const snapshotPath = path.join(process.cwd(), 'data', `week${WEEK_NUMBER}-snapshot.json`);

    // Criar diretório data se não existir
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }

    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    console.log(`\n💾 Snapshot salvo em: ${snapshotPath}`);

    // ================================================================================
    // 4. SUBMETER NA BLOCKCHAIN
    // ================================================================================

    if (!DRY_RUN) {
      console.log('\n⛓️ PASSO 3: Submetendo proof na blockchain...\n');

      const proofData = {
        weekNumber: WEEK_NUMBER,
        ipfsHash,
        totalUsers: summary.totalUsers,
        totalCommissions: summary.totalCommissions.toString(),
        totalProfits: summary.totalProfits.toString()
      };

      const result = await submitWeeklyProof(proofData);

      console.log('\n✅ PROOF SUBMETIDO COM SUCESSO!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📤 TX Hash: ${result.txHash}`);
      console.log(`⛓️ Block Number: ${result.blockNumber}`);
      console.log(`⛽ Gas Used: ${result.gasUsed}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // TODO: Salvar no banco de dados
      // await prisma.weeklyProof.create({ ... });

      console.log('🎉 PROVA SEMANAL 3 CRIADA COM SUCESSO!');
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('   1. Acesse http://localhost:5000/transparency para ver a prova');
      console.log('   2. Verifique os dados no IPFS');
      console.log('   3. Confirme a transação no BSCScan');
      console.log('');
    } else {
      console.log('\n🧪 DRY RUN MODE - Nenhuma transação foi enviada');
      console.log('\n📋 PARA EXECUTAR DE VERDADE:');
      console.log('   node scripts/generate-week3-proof.js');
      console.log('   (sem DRY_RUN=true)');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ ERRO AO GERAR PROVA:', error);
    console.error('\nDetalhes:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
main()
  .then(() => {
    console.log('✅ Script finalizado!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
