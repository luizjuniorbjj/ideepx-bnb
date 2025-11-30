const fs = require('fs');
const path = require('path');

const contracts = ['iDeepXCore', 'iDeepXMLM', 'iDeepXGovernance'];
const limit = 24576; // EVM contract size limit

console.log("📏 Contract Size Analysis\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

let totalSize = 0;

contracts.forEach(name => {
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${name}.sol`, `${name}.json`);

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const bytecode = artifact.deployedBytecode || artifact.bytecode;
    const size = (bytecode.length - 2) / 2; // -2 for '0x', /2 for hex
    const percent = ((size / limit) * 100).toFixed(1);
    const status = size <= limit ? '✅' : '❌';

    console.log(`${status} ${name}`);
    console.log(`   Size: ${size} bytes (${percent}%)`);
    console.log(`   Limit: ${limit} bytes`);
    console.log("");

    totalSize += size;
  } else {
    console.log(`❓ ${name}: Artifact not found`);
  }
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`📊 Total Size: ${totalSize} bytes`);

const originalSize = 26262;
if (totalSize < originalSize) {
  const savings = originalSize - totalSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
  console.log(`✅ Savings: ${savings} bytes (${savingsPercent}% reduction)`);
} else {
  console.log(`⚠️  Total size increased by ${totalSize - originalSize} bytes`);
}
