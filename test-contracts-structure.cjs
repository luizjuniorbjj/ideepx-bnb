// ================================================================================
// 🔍 TESTE DE ESTRUTURA DOS CONTRATOS - SEM DEPLOY
// ================================================================================
// Valida que os contratos foram compilados corretamente e têm todas as funções

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const report = {
  total: 0,
  passed: 0,
  failed: 0
};

function logTest(name, status, details = "") {
  report.total++;
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
  if (status === "PASS") report.passed++;
  else report.failed++;
}

async function main() {
  console.log("");
  console.log("🔍 TESTE DE ESTRUTURA DOS CONTRATOS");
  console.log("=" .repeat(80));
  console.log("");

  // ====================================================================
  // PARTE 1: VERIFICAR COMPILAÇÃO
  // ====================================================================

  console.log("📦 PARTE 1: VERIFICAÇÃO DE COMPILAÇÃO");
  console.log("");

  const artifactsDir = path.join(__dirname, "artifacts/contracts");

  // Verificar Rulebook
  const rulebookPath = path.join(artifactsDir, "iDeepXRulebookImmutable.sol/iDeepXRulebookImmutable.json");
  const rulebookExists = fs.existsSync(rulebookPath);
  logTest(
    "iDeepXRulebookImmutable compilado",
    rulebookExists ? "PASS" : "FAIL",
    rulebookExists ? rulebookPath : "Artifact não encontrado"
  );

  // Verificar Proof
  const proofPath = path.join(artifactsDir, "iDeepXProofFinal.sol/iDeepXProofFinal.json");
  const proofExists = fs.existsSync(proofPath);
  logTest(
    "iDeepXProofFinal compilado",
    proofExists ? "PASS" : "FAIL",
    proofExists ? proofPath : "Artifact não encontrado"
  );

  if (!rulebookExists || !proofExists) {
    console.log("");
    console.log("❌ Contratos não compilados. Execute: npm run compile");
    console.log("");
    return;
  }

  // ====================================================================
  // PARTE 2: VERIFICAR ABI DO RULEBOOK
  // ====================================================================

  console.log("");
  console.log("📄 PARTE 2: VERIFICAÇÃO DO ABI - RULEBOOK");
  console.log("");

  const rulebookArtifact = JSON.parse(fs.readFileSync(rulebookPath, "utf8"));
  const rulebookAbi = rulebookArtifact.abi;

  const rulebookFunctions = rulebookAbi
    .filter(item => item.type === "function")
    .map(item => item.name);

  const expectedRulebookFunctions = [
    "ipfsCid",
    "contentHash",
    "deployedAt",
    "VERSION",
    "PLAN_NAME",
    "IPFS_GATEWAY",
    "getIPFSUrl",
    "verifyContentHash",
    "getPlanInfo",
    "getPlanAgeInDays",
    "isPlanCurrent"
  ];

  expectedRulebookFunctions.forEach(funcName => {
    const exists = rulebookFunctions.includes(funcName);
    logTest(
      `Rulebook.${funcName}()`,
      exists ? "PASS" : "FAIL",
      exists ? "Função presente" : "Função ausente"
    );
  });

  // ====================================================================
  // PARTE 3: VERIFICAR ABI DO PROOF
  // ====================================================================

  console.log("");
  console.log("🔐 PARTE 3: VERIFICAÇÃO DO ABI - PROOF");
  console.log("");

  const proofArtifact = JSON.parse(fs.readFileSync(proofPath, "utf8"));
  const proofAbi = proofArtifact.abi;

  const proofFunctions = proofAbi
    .filter(item => item.type === "function")
    .map(item => item.name);

  const expectedProofFunctions = [
    "owner",
    "backend",
    "rulebook",
    "paused",
    "totalProofsSubmitted",
    "submitWeeklyProof",
    "finalizeWeek",
    "getWeeklyProof",
    "getAllProofs",
    "getLatestProofs",
    "hasProof",
    "getRulebookInfo",
    "getStatistics",
    "getAllWeeks",
    "transferOwnership",
    "setBackend",
    "pause",
    "unpause",
    "getIPFSUrl"
  ];

  expectedProofFunctions.forEach(funcName => {
    const exists = proofFunctions.includes(funcName);
    logTest(
      `Proof.${funcName}()`,
      exists ? "PASS" : "FAIL",
      exists ? "Função presente" : "Função ausente"
    );
  });

  // ====================================================================
  // PARTE 4: VERIFICAR EVENTS
  // ====================================================================

  console.log("");
  console.log("📢 PARTE 4: VERIFICAÇÃO DE EVENTS");
  console.log("");

  const rulebookEvents = rulebookAbi
    .filter(item => item.type === "event")
    .map(item => item.name);

  const expectedRulebookEvents = [
    "RulebookDeployed",
    "PlanVerified"
  ];

  expectedRulebookEvents.forEach(eventName => {
    const exists = rulebookEvents.includes(eventName);
    logTest(
      `Event: ${eventName}`,
      exists ? "PASS" : "FAIL",
      exists ? "Evento presente no Rulebook" : "Evento ausente"
    );
  });

  const proofEvents = proofAbi
    .filter(item => item.type === "event")
    .map(item => item.name);

  const expectedProofEvents = [
    "ProofSubmitted",
    "ProofFinalized",
    "OwnershipTransferred",
    "BackendUpdated",
    "PauseStatusChanged"
  ];

  expectedProofEvents.forEach(eventName => {
    const exists = proofEvents.includes(eventName);
    logTest(
      `Event: ${eventName}`,
      exists ? "PASS" : "FAIL",
      exists ? "Evento presente no Proof" : "Evento ausente"
    );
  });

  // ====================================================================
  // PARTE 5: VERIFICAR BYTECODE
  // ====================================================================

  console.log("");
  console.log("💾 PARTE 5: VERIFICAÇÃO DE BYTECODE");
  console.log("");

  const rulebookBytecode = rulebookArtifact.bytecode;
  const rulebookHasBytecode = rulebookBytecode && rulebookBytecode.length > 10;
  logTest(
    "Rulebook bytecode gerado",
    rulebookHasBytecode ? "PASS" : "FAIL",
    rulebookHasBytecode ? `${rulebookBytecode.length} bytes` : "Bytecode vazio"
  );

  const proofBytecode = proofArtifact.bytecode;
  const proofHasBytecode = proofBytecode && proofBytecode.length > 10;
  logTest(
    "Proof bytecode gerado",
    proofHasBytecode ? "PASS" : "FAIL",
    proofHasBytecode ? `${proofBytecode.length} bytes` : "Bytecode vazio"
  );

  // ====================================================================
  // PARTE 6: VERIFICAR TAMANHO DOS CONTRATOS
  // ====================================================================

  console.log("");
  console.log("📏 PARTE 6: VERIFICAÇÃO DE TAMANHO");
  console.log("");

  const rulebookSize = (rulebookBytecode.length - 2) / 2; // Remove 0x e divide por 2
  const proofSize = (proofBytecode.length - 2) / 2;
  const maxSize = 24576; // 24KB max contract size

  logTest(
    "Rulebook tamanho",
    rulebookSize < maxSize ? "PASS" : "FAIL",
    `${rulebookSize} bytes (max: ${maxSize})`
  );

  logTest(
    "Proof tamanho",
    proofSize < maxSize ? "PASS" : "FAIL",
    `${proofSize} bytes (max: ${maxSize})`
  );

  // ====================================================================
  // PARTE 7: VERIFICAR JSON DO PLANO
  // ====================================================================

  console.log("");
  console.log("📄 PARTE 7: VERIFICAÇÃO DO PLANO JSON");
  console.log("");

  const planPath = path.join(__dirname, "commission-plan-v1.json");
  const planExists = fs.existsSync(planPath);
  logTest(
    "commission-plan-v1.json existe",
    planExists ? "PASS" : "FAIL",
    planExists ? planPath : "Arquivo não encontrado"
  );

  if (planExists) {
    try {
      const planContent = fs.readFileSync(planPath, "utf8");
      const planJson = JSON.parse(planContent);

      logTest(
        "JSON válido",
        "PASS",
        `${planContent.length} bytes`
      );

      const hasVersion = planJson.version !== undefined;
      logTest(
        "Plano tem versão",
        hasVersion ? "PASS" : "FAIL",
        hasVersion ? `v${planJson.version}` : "Versão ausente"
      );

      const hasLevels = planJson.niveis_mlm && planJson.niveis_mlm.levels;
      logTest(
        "Plano tem níveis MLM",
        hasLevels ? "PASS" : "FAIL",
        hasLevels ? `${Object.keys(planJson.niveis_mlm.levels).length} níveis` : "Níveis ausentes"
      );

      const hasBusinessModel = planJson.business_model !== undefined;
      logTest(
        "Plano tem modelo de negócios",
        hasBusinessModel ? "PASS" : "FAIL",
        hasBusinessModel ? "Modelo presente" : "Modelo ausente"
      );

    } catch (error) {
      logTest(
        "JSON válido",
        "FAIL",
        error.message
      );
    }
  }

  // ====================================================================
  // RESUMO
  // ====================================================================

  console.log("");
  console.log("=" .repeat(80));
  console.log("📊 RESUMO DOS TESTES");
  console.log("=" .repeat(80));
  console.log(`Total: ${report.total}`);
  console.log(`✅ Passou: ${report.passed} (${((report.passed / report.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhou: ${report.failed} (${((report.failed / report.total) * 100).toFixed(1)}%)`);
  console.log("=" .repeat(80));

  if (report.failed > 0) {
    console.log("");
    console.log("❌ ALGUNS TESTES FALHARAM");
    console.log("   Corrija os erros antes de prosseguir");
  } else {
    console.log("");
    console.log("✅ TODOS OS TESTES PASSARAM!");
    console.log("   Contratos prontos para deploy");
  }

  console.log("");
}

main()
  .then(() => {
    process.exit(report.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("");
    console.error("❌ ERRO:", error);
    console.error("");
    process.exit(1);
  });
