// scripts/calculate-plan-hash.js
// Calcula o content hash (keccak256) do plano de comissões JSON

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔐 Calculando content hash do plano de comissões...\n");

    // Caminho do arquivo JSON
    const planPath = path.join(__dirname, "../commission-plan-v1.json");

    // Verificar se arquivo existe
    if (!fs.existsSync(planPath)) {
        console.error(`❌ Arquivo não encontrado: ${planPath}`);
        process.exit(1);
    }

    // Ler o JSON
    const planJson = fs.readFileSync(planPath, "utf8");

    // Parse para validar JSON
    let planObject;
    try {
        planObject = JSON.parse(planJson);
        console.log("✅ JSON válido\n");
    } catch (error) {
        console.error("❌ Erro ao fazer parse do JSON:", error.message);
        process.exit(1);
    }

    // Calcular hash do JSON string (não do objeto)
    // IMPORTANTE: Usar o JSON string exato para garantir hash consistente
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(planJson));

    // Mostrar informações
    console.log("📊 INFORMAÇÕES DO PLANO:");
    console.log(`   Nome: ${planObject.name}`);
    console.log(`   Versão: ${planObject.version}`);
    console.log(`   Criado em: ${planObject.created}`);
    console.log(`   Blockchain: ${planObject.blockchain}`);
    console.log(`   Token: ${planObject.token}`);
    console.log("");

    console.log("📝 ESTRUTURA MLM:");
    console.log(`   Níveis: ${planObject.niveis_mlm.total_levels}`);
    console.log(`   Total MLM: ${planObject.niveis_mlm.total_percentage}%`);
    console.log(`   Base de cálculo: ${planObject.business_model.mlm_commission_base.percentage}% dos ${planObject.business_model.client_profit_share.percentage}% do cliente`);
    console.log("");

    console.log("🔐 CONTENT HASH:");
    console.log(`   ${contentHash}`);
    console.log("");

    console.log("📋 TAMANHO DO ARQUIVO:");
    console.log(`   ${planJson.length} bytes (${(planJson.length / 1024).toFixed(2)} KB)`);
    console.log("");

    // Salvar hash em arquivo .env.example
    const envExample = `
# ============================================
# RULEBOOK CONFIGURATION
# ============================================

# IPFS CID do plano de comissões
# Você precisa fazer upload do commission-plan-v1.json para IPFS primeiro
# Use: https://app.pinata.cloud/pinmanager
PLAN_IPFS_CID=QmExamplePlanHash123

# Content hash calculado (keccak256 do JSON)
# Calculado automaticamente pelo script calculate-plan-hash.js
PLAN_CONTENT_HASH=${contentHash}

# Endereço do contrato Rulebook (após deploy)
RULEBOOK_ADDRESS=0x0000000000000000000000000000000000000000
`;

    const envPath = path.join(__dirname, "../.env.rulebook.example");
    fs.writeFileSync(envPath, envExample.trim());

    console.log("💾 Arquivo salvo: .env.rulebook.example");
    console.log("");

    console.log("=" .repeat(80));
    console.log("✅ PRÓXIMOS PASSOS:");
    console.log("=" .repeat(80));
    console.log("");
    console.log("1️⃣  UPLOAD PARA IPFS:");
    console.log("   - Acesse: https://app.pinata.cloud/pinmanager");
    console.log("   - Faça upload do arquivo: commission-plan-v1.json");
    console.log("   - Copie o CID (ex: QmXxxx...)");
    console.log("");
    console.log("2️⃣  CONFIGURAR .env:");
    console.log(`   PLAN_IPFS_CID=<seu_cid_aqui>`);
    console.log(`   PLAN_CONTENT_HASH=${contentHash}`);
    console.log("");
    console.log("3️⃣  DEPLOY RULEBOOK:");
    console.log("   npm run deploy:rulebook:bscTestnet");
    console.log("   (ou npm run deploy:rulebook:bsc para mainnet)");
    console.log("");
    console.log("4️⃣  ANOTAR ENDEREÇO:");
    console.log("   Adicione RULEBOOK_ADDRESS no .env");
    console.log("");
    console.log("5️⃣  DEPLOY PROOF:");
    console.log("   npm run deploy:proof:bscTestnet");
    console.log("");
    console.log("=" .repeat(80));

    return {
        contentHash,
        planName: planObject.name,
        planVersion: planObject.version,
        totalLevels: planObject.niveis_mlm.total_levels,
        totalPercentage: planObject.niveis_mlm.total_percentage
    };
}

// Execute
main()
    .then((result) => {
        console.log("\n✅ Script concluído com sucesso!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Erro:", error);
        process.exit(1);
    });
