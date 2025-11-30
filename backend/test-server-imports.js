// Teste imports do server.js
console.log('🧪 Testando todos os imports do server.js...\n');

const imports = [
  { name: 'express', path: 'express' },
  { name: 'helmet', path: 'helmet' },
  { name: 'cors', path: 'cors' },
  { name: 'morgan', path: 'morgan' },
  { name: 'express-rate-limit', path: 'express-rate-limit' },
  { name: 'config', path: './src/config/index.js' },
  { name: 'logger', path: './src/config/logger.js' },
  { name: 'siweAuth', path: './src/auth/siwe.js' },
  { name: 'contractV10', path: './src/contracts/v10.js' },
  { name: 'mlmCalculator', path: './src/mlm/calculator.js' },
  { name: 'mlmUnlock', path: './src/mlm/unlock.js' },
  { name: 'jobScheduler', path: './src/jobs/scheduler.js' },
  { name: 'weeklyProofJobs', path: './src/jobs/weeklyProof.js' },
  { name: 'gmiMockService', path: './src/services/gmiMockService.js' },
  { name: 'gmiEdgeService', path: './src/services/gmiEdgeService.js' },
  { name: 'blockchainRouter', path: './src/routes/blockchain.js' },
  { name: '@prisma/client', path: '@prisma/client' },
  { name: 'crypto', path: 'crypto' },
  { name: 'ethers', path: 'ethers' }
];

for (const mod of imports) {
  try {
    console.log(`📦 ${mod.name}...`);
    await import(mod.path);
    console.log(`   ✅ OK\n`);
  } catch (error) {
    console.error(`   ❌ ERRO: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('\n✅ TODOS OS IMPORTS DO SERVER.JS OK!');
