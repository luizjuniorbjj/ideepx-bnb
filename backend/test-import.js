// Teste rápido de imports
console.log('🧪 Testando imports...');

try {
  console.log('1. Importing blockchain/proof.js...');
  const proof = await import('./src/blockchain/proof.js');
  console.log('✅ proof.js importado com sucesso');

  console.log('2. Importing services/ipfsService.js...');
  const ipfs = await import('./src/services/ipfsService.js');
  console.log('✅ ipfsService.js importado com sucesso');

  console.log('3. Importing routes/blockchain.js...');
  const routes = await import('./src/routes/blockchain.js');
  console.log('✅ blockchain.js importado com sucesso');

  console.log('\n✅ TODOS OS IMPORTS OK!');
} catch (error) {
  console.error('\n❌ ERRO NO IMPORT:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
