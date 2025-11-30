// ================================================================================
// TESTE DE CONEXÃO BLOCKCHAIN
// ================================================================================
// Valida integração com contratos Proof + Rulebook no testnet

import { testConnection } from './src/blockchain/proof.js';

async function main() {
  console.log('==========================================');
  console.log('  TESTE DE CONEXÃO BLOCKCHAIN');
  console.log('  iDeepX Proof + Rulebook System');
  console.log('==========================================\n');

  try {
    await testConnection();

    console.log('==========================================');
    console.log('  ✅ TESTE COMPLETO - TUDO OK!');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n==========================================');
    console.error('  ❌ TESTE FALHOU');
    console.error('==========================================\n');
    console.error('Erro:', error.message);

    process.exit(1);
  }
}

main();
