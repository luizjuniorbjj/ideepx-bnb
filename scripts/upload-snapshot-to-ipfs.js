// ✅ Script para Upload de Snapshot Semanal para IPFS (Pinata)
// Faz upload do snapshot JSON para Pinata e retorna o CID

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log("📤 Upload de Snapshot para IPFS (Pinata)...\n");

  // Verificar credenciais Pinata
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.log("❌ ERRO: Credenciais Pinata não encontradas no .env");
    console.log("\n📝 Para obter as credenciais:");
    console.log("   1. Acesse: https://app.pinata.cloud/developers/api-keys");
    console.log("   2. Crie uma nova API Key (ou use existente)");
    console.log("   3. Copie API Key e API Secret");
    console.log("   4. Adicione no arquivo .env:");
    console.log("      PINATA_API_KEY=sua_api_key_aqui");
    console.log("      PINATA_SECRET_KEY=seu_secret_aqui");
    console.log("\n⚠️ Após configurar, execute o script novamente.\n");
    process.exit(1);
  }

  // Arquivo de snapshot (pode ser passado como argumento ou usar default)
  const snapshotFile = process.argv[2] || "test-snapshot-week-1.json";
  const snapshotPath = `C:\\ideepx-bnb\\${snapshotFile}`;

  if (!fs.existsSync(snapshotPath)) {
    console.log(`❌ ERRO: Arquivo não encontrado: ${snapshotPath}`);
    process.exit(1);
  }

  console.log(`📄 Arquivo: ${snapshotFile}`);
  console.log(`📍 Path: ${snapshotPath}\n`);

  // Ler arquivo
  const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  console.log("📊 Snapshot Info:");
  console.log(`   Week: ${snapshotData.week}`);
  console.log(`   Week Number: ${snapshotData.weekNumber}`);
  console.log(`   Total Users: ${snapshotData.summary.totalUsers}`);
  console.log(`   Total Profits: $${snapshotData.summary.totalProfits.toFixed(2)}`);
  console.log(`   Total Commissions: $${snapshotData.summary.totalCommissions.toFixed(2)}\n`);

  // Preparar upload para Pinata
  console.log("🚀 Fazendo upload para Pinata...");

  const formData = new FormData();
  formData.append('file', fs.createReadStream(snapshotPath));

  // Metadata do pin
  const pinataMetadata = JSON.stringify({
    name: `iDeepX-Week-${snapshotData.weekNumber}-${snapshotData.week}`,
    keyvalues: {
      week: snapshotData.week.toString(),
      weekNumber: snapshotData.weekNumber.toString(),
      totalUsers: snapshotData.summary.totalUsers.toString(),
      totalCommissions: snapshotData.summary.totalCommissions.toString(),
      type: 'weekly-snapshot'
    }
  });
  formData.append('pinataMetadata', pinataMetadata);

  // Opções de pinning
  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("❌ ERRO no upload:");
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    console.log("✅ Upload bem-sucedido!\n");

    console.log("📊 RESULTADO:");
    console.log(`   IPFS Hash (CID): ${result.IpfsHash}`);
    console.log(`   Timestamp: ${result.Timestamp}`);
    console.log(`   Size: ${result.PinSize} bytes\n`);

    console.log("🔗 LINKS:");
    console.log(`   Pinata: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`   IPFS.io: https://ipfs.io/ipfs/${result.IpfsHash}\n`);

    console.log("📝 PRÓXIMO PASSO:");
    console.log(`   Use este CID no script submit-proof.js:`);
    console.log(`   const ipfsHash = "${result.IpfsHash}";\n`);

    // Salvar informações em arquivo
    const uploadInfo = {
      snapshotFile,
      ipfsHash: result.IpfsHash,
      timestamp: result.Timestamp,
      pinSize: result.PinSize,
      week: snapshotData.week,
      weekNumber: snapshotData.weekNumber,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      uploadedAt: new Date().toISOString()
    };

    const infoFile = `upload-info-week-${snapshotData.weekNumber}.json`;
    fs.writeFileSync(infoFile, JSON.stringify(uploadInfo, null, 2));
    console.log(`💾 Info salva em: ${infoFile}\n`);

  } catch (error) {
    console.log("❌ ERRO durante upload:");
    console.log(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
