// ================================================================================
// TESTE RÁPIDO - BLOCKCHAIN ROUTES
// ================================================================================

import {
  getRulebookInfo,
  getProofInfo,
  getLatestProofs
} from './src/blockchain/proof.js';

import { getSnapshot } from './src/services/ipfsService.js';

async function testBlockchainRoutes() {
  console.log('\n🧪 TESTANDO ROUTES BLOCKCHAIN\n');

  try {
    // Test 1: Rulebook Info
    console.log('1️⃣ Testando getRulebookInfo()...');
    const rulebook = await getRulebookInfo();
    console.log('✅ Rulebook:', {
      planName: rulebook.planName,
      version: rulebook.version,
      address: rulebook.address
    });

    // Test 2: Proof Info
    console.log('\n2️⃣ Testando getProofInfo()...');
    const proof = await getProofInfo();
    console.log('✅ Proof Info:', {
      totalProofs: proof.totalProofs,
      paused: proof.paused,
      address: proof.address
    });

    // Test 3: Latest Proofs
    console.log('\n3️⃣ Testando getLatestProofs(5)...');
    const proofs = await getLatestProofs(5);
    console.log(`✅ Encontradas ${proofs.length} provas`);
    if (proofs.length > 0) {
      console.log('   Última prova:', {
        week: proofs[0].weekNumber,
        users: proofs[0].totalUsers,
        ipfsHash: proofs[0].ipfsHash
      });

      // Test 4: IPFS Snapshot
      console.log('\n4️⃣ Testando getSnapshot(ipfsHash)...');
      const snapshot = await getSnapshot(proofs[0].ipfsHash);
      console.log('✅ Snapshot:', {
        week: snapshot.weekNumber,
        totalUsers: snapshot.summary.totalUsers,
        totalProfits: snapshot.summary.totalProfits,
        totalCommissions: snapshot.summary.totalCommissions
      });
    }

    console.log('\n✅ TODOS OS TESTES PASSARAM!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testBlockchainRoutes();
