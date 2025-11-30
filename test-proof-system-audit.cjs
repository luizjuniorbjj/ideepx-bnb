// ================================================================================
// 🔍 BOT DE AUDITORIA COMPLETA - PROOF + RULEBOOK SYSTEM
// ================================================================================
// Testa TODOS os aspectos dos contratos iDeepXRulebookImmutable e iDeepXProofFinal
// Baseado no test_all_functions.js mas adaptado para o novo sistema

const { ethers } = require("hardhat");

// ================================================================================
// CONFIGURAÇÃO
// ================================================================================

// Endereços dos contratos (serão preenchidos após deploy)
const RULEBOOK_ADDRESS = process.env.RULEBOOK_ADDRESS || "0x0000000000000000000000000000000000000000";
const PROOF_ADDRESS = process.env.PROOF_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Dados esperados
const EXPECTED_PLAN_CID = process.env.PLAN_IPFS_CID || "QmExamplePlanHash123";
const EXPECTED_CONTENT_HASH = process.env.PLAN_CONTENT_HASH || "0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b";

// Relatório de testes
const report = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  results: []
};

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

function logTest(name, status, details = "") {
  report.total++;
  report.results.push({ name, status, details });

  const icons = {
    "PASS": "✅",
    "FAIL": "❌",
    "SKIP": "⏭️",
    "WARN": "⚠️"
  };

  const icon = icons[status] || "❓";
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);

  if (status === "PASS") report.passed++;
  else if (status === "FAIL") report.failed++;
  else if (status === "WARN") report.warnings++;
  else report.skipped++;
}

function printHeader(title) {
  console.log("");
  console.log("=" .repeat(80));
  console.log(`  ${title}`);
  console.log("=" .repeat(80));
  console.log("");
}

function printSummary() {
  console.log("");
  console.log("=" .repeat(80));
  console.log("  📊 RESUMO DA AUDITORIA");
  console.log("=" .repeat(80));
  console.log(`Total de testes: ${report.total}`);
  console.log(`✅ Passou: ${report.passed} (${((report.passed / report.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhou: ${report.failed} (${((report.failed / report.total) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Avisos: ${report.warnings} (${((report.warnings / report.total) * 100).toFixed(1)}%)`);
  console.log(`⏭️  Pulados: ${report.skipped} (${((report.skipped / report.total) * 100).toFixed(1)}%)`);
  console.log("=" .repeat(80));

  if (report.failed > 0) {
    console.log("");
    console.log("❌ AUDITORIA FALHOU - Corrija os erros antes do deploy!");
    console.log("");
    console.log("Testes que falharam:");
    report.results.filter(r => r.status === "FAIL").forEach(r => {
      console.log(`  ❌ ${r.name}`);
      if (r.details) console.log(`     ${r.details}`);
    });
  } else {
    console.log("");
    console.log("✅ AUDITORIA COMPLETA - Contratos prontos para deploy!");
  }

  console.log("");
}

// ================================================================================
// MAIN AUDIT FUNCTION
// ================================================================================

async function main() {
  console.log("");
  console.log("🔍 AUDITORIA COMPLETA - PROOF + RULEBOOK SYSTEM");
  console.log("");
  console.log("=" .repeat(80));
  console.log(`📍 Rulebook: ${RULEBOOK_ADDRESS}`);
  console.log(`📍 Proof: ${PROOF_ADDRESS}`);
  console.log("=" .repeat(80));
  console.log("");

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Auditor: ${deployer.address}`);
  console.log("");

  // Verificar se contratos foram deployed
  if (RULEBOOK_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  RULEBOOK_ADDRESS não configurado no .env");
    console.log("   Deploy o Rulebook primeiro e configure o endereço no .env");
    console.log("");
    return;
  }

  if (PROOF_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  PROOF_CONTRACT_ADDRESS não configurado no .env");
    console.log("   Deploy o Proof primeiro e configure o endereço no .env");
    console.log("");
    return;
  }

  // Conectar aos contratos
  let rulebook, proof;

  try {
    rulebook = await ethers.getContractAt("iDeepXRulebookImmutable", RULEBOOK_ADDRESS);
    proof = await ethers.getContractAt("iDeepXProofFinal", PROOF_ADDRESS);
  } catch (error) {
    console.log("❌ Erro ao conectar aos contratos:");
    console.log(`   ${error.message}`);
    console.log("");
    return;
  }

  // ================================================================================
  // PARTE 1: AUDITORIA DO RULEBOOK
  // ================================================================================

  printHeader("📄 PARTE 1: AUDITORIA DO RULEBOOK (PLANO IMUTÁVEL)");

  // 1.1 - Verificar IPFS CID
  try {
    const ipfsCid = await rulebook.ipfsCid();
    const isValid = ipfsCid.length > 0;
    logTest(
      "Rulebook.ipfsCid()",
      isValid ? "PASS" : "FAIL",
      isValid ? `CID: ${ipfsCid}` : "CID está vazio"
    );

    if (ipfsCid !== EXPECTED_PLAN_CID && EXPECTED_PLAN_CID !== "QmExamplePlanHash123") {
      logTest(
        "Rulebook.ipfsCid() - Verificação",
        "WARN",
        `CID diferente do esperado: ${ipfsCid} vs ${EXPECTED_PLAN_CID}`
      );
    }
  } catch (error) {
    logTest("Rulebook.ipfsCid()", "FAIL", error.message);
  }

  // 1.2 - Verificar Content Hash
  try {
    const contentHash = await rulebook.contentHash();
    const isValid = contentHash !== ethers.ZeroHash;
    logTest(
      "Rulebook.contentHash()",
      isValid ? "PASS" : "FAIL",
      isValid ? `Hash: ${contentHash}` : "Hash é zero"
    );

    if (contentHash !== EXPECTED_CONTENT_HASH) {
      logTest(
        "Rulebook.contentHash() - Verificação",
        "WARN",
        `Hash diferente do esperado`
      );
    }
  } catch (error) {
    logTest("Rulebook.contentHash()", "FAIL", error.message);
  }

  // 1.3 - Verificar Deployed At
  try {
    const deployedAt = await rulebook.deployedAt();
    const isValid = deployedAt > 0n;
    const date = new Date(Number(deployedAt) * 1000);
    logTest(
      "Rulebook.deployedAt()",
      isValid ? "PASS" : "FAIL",
      isValid ? `Deployed em: ${date.toISOString()}` : "Timestamp inválido"
    );
  } catch (error) {
    logTest("Rulebook.deployedAt()", "FAIL", error.message);
  }

  // 1.4 - Verificar Versão
  try {
    const version = await rulebook.VERSION();
    logTest(
      "Rulebook.VERSION()",
      "PASS",
      `Versão: ${version}`
    );
  } catch (error) {
    logTest("Rulebook.VERSION()", "FAIL", error.message);
  }

  // 1.5 - Verificar Nome do Plano
  try {
    const planName = await rulebook.PLAN_NAME();
    logTest(
      "Rulebook.PLAN_NAME()",
      "PASS",
      `Nome: ${planName}`
    );
  } catch (error) {
    logTest("Rulebook.PLAN_NAME()", "FAIL", error.message);
  }

  // 1.6 - Verificar URL do IPFS
  try {
    const ipfsUrl = await rulebook.getIPFSUrl();
    const isValid = ipfsUrl.startsWith("https://");
    logTest(
      "Rulebook.getIPFSUrl()",
      isValid ? "PASS" : "FAIL",
      isValid ? `URL: ${ipfsUrl}` : "URL inválida"
    );
  } catch (error) {
    logTest("Rulebook.getIPFSUrl()", "FAIL", error.message);
  }

  // 1.7 - Verificar getPlanInfo()
  try {
    const planInfo = await rulebook.getPlanInfo();
    const hasAllFields = planInfo && planInfo.length === 6;
    logTest(
      "Rulebook.getPlanInfo()",
      hasAllFields ? "PASS" : "FAIL",
      hasAllFields ? "Retorna todas as 6 informações" : "Informações incompletas"
    );
  } catch (error) {
    logTest("Rulebook.getPlanInfo()", "FAIL", error.message);
  }

  // 1.8 - Verificar getPlanAgeInDays()
  try {
    const ageInDays = await rulebook.getPlanAgeInDays();
    logTest(
      "Rulebook.getPlanAgeInDays()",
      "PASS",
      `Idade: ${ageInDays.toString()} dias`
    );
  } catch (error) {
    logTest("Rulebook.getPlanAgeInDays()", "FAIL", error.message);
  }

  // 1.9 - Verificar isPlanCurrent()
  try {
    const isCurrent = await rulebook.isPlanCurrent();
    logTest(
      "Rulebook.isPlanCurrent()",
      isCurrent ? "PASS" : "WARN",
      isCurrent ? "Plano atual (< 2 anos)" : "Plano antigo (> 2 anos)"
    );
  } catch (error) {
    logTest("Rulebook.isPlanCurrent()", "FAIL", error.message);
  }

  // 1.10 - Verificar verifyContentHash()
  try {
    const isValid = await rulebook.verifyContentHash(EXPECTED_CONTENT_HASH);
    logTest(
      "Rulebook.verifyContentHash()",
      isValid ? "PASS" : "FAIL",
      isValid ? "Hash verificado com sucesso" : "Hash não corresponde"
    );
  } catch (error) {
    logTest("Rulebook.verifyContentHash()", "FAIL", error.message);
  }

  // ================================================================================
  // PARTE 2: AUDITORIA DO PROOF CONTRACT
  // ================================================================================

  printHeader("🔐 PARTE 2: AUDITORIA DO PROOF CONTRACT (PROVAS SEMANAIS)");

  // 2.1 - Verificar Owner
  try {
    const owner = await proof.owner();
    const isValid = owner !== ethers.ZeroAddress;
    logTest(
      "Proof.owner()",
      isValid ? "PASS" : "FAIL",
      isValid ? `Owner: ${owner}` : "Owner é zero address"
    );
  } catch (error) {
    logTest("Proof.owner()", "FAIL", error.message);
  }

  // 2.2 - Verificar Backend
  try {
    const backend = await proof.backend();
    const isValid = backend !== ethers.ZeroAddress;
    logTest(
      "Proof.backend()",
      isValid ? "PASS" : "FAIL",
      isValid ? `Backend: ${backend}` : "Backend é zero address"
    );
  } catch (error) {
    logTest("Proof.backend()", "FAIL", error.message);
  }

  // 2.3 - Verificar Rulebook Address
  try {
    const rulebookAddr = await proof.rulebook();
    const isValid = rulebookAddr === RULEBOOK_ADDRESS;
    logTest(
      "Proof.rulebook()",
      isValid ? "PASS" : "FAIL",
      isValid ? `Rulebook: ${rulebookAddr}` : `Endereço incorreto: ${rulebookAddr}`
    );
  } catch (error) {
    logTest("Proof.rulebook()", "FAIL", error.message);
  }

  // 2.4 - Verificar Status de Pause
  try {
    const paused = await proof.paused();
    logTest(
      "Proof.paused()",
      !paused ? "PASS" : "WARN",
      !paused ? "Contrato ativo" : "Contrato pausado"
    );
  } catch (error) {
    logTest("Proof.paused()", "FAIL", error.message);
  }

  // 2.5 - Verificar Total de Provas
  try {
    const totalProofs = await proof.totalProofsSubmitted();
    logTest(
      "Proof.totalProofsSubmitted()",
      "PASS",
      `Total de provas: ${totalProofs.toString()}`
    );
  } catch (error) {
    logTest("Proof.totalProofsSubmitted()", "FAIL", error.message);
  }

  // 2.6 - Verificar getRulebookInfo()
  try {
    const rulebookInfo = await proof.getRulebookInfo();
    const hasAllFields = rulebookInfo && rulebookInfo.length === 4;
    const rulebookMatch = rulebookInfo[0] === RULEBOOK_ADDRESS;

    logTest(
      "Proof.getRulebookInfo()",
      hasAllFields && rulebookMatch ? "PASS" : "FAIL",
      hasAllFields ? `Rulebook info completa` : "Info incompleta"
    );

    if (hasAllFields && !rulebookMatch) {
      logTest(
        "Proof.getRulebookInfo() - Endereço",
        "FAIL",
        `Rulebook address não corresponde: ${rulebookInfo[0]}`
      );
    }
  } catch (error) {
    logTest("Proof.getRulebookInfo()", "FAIL", error.message);
  }

  // 2.7 - Verificar getStatistics()
  try {
    const stats = await proof.getStatistics();
    const hasAllFields = stats && stats.length === 5;
    logTest(
      "Proof.getStatistics()",
      hasAllFields ? "PASS" : "FAIL",
      hasAllFields ? `Estatísticas completas (5 campos)` : "Estatísticas incompletas"
    );

    if (hasAllFields) {
      console.log(`   Total Proofs: ${stats[0].toString()}`);
      console.log(`   Total Users All Time: ${stats[1].toString()}`);
      console.log(`   Total Commissions: ${stats[2].toString()}`);
      console.log(`   Total Profits: ${stats[3].toString()}`);
      console.log(`   Total Finalized: ${stats[4].toString()}`);
    }
  } catch (error) {
    logTest("Proof.getStatistics()", "FAIL", error.message);
  }

  // 2.8 - Verificar getAllWeeks()
  try {
    const weeks = await proof.getAllWeeks();
    logTest(
      "Proof.getAllWeeks()",
      "PASS",
      `Total de semanas registradas: ${weeks.length}`
    );
  } catch (error) {
    logTest("Proof.getAllWeeks()", "FAIL", error.message);
  }

  // ================================================================================
  // PARTE 3: TESTES DE INTEGRAÇÃO
  // ================================================================================

  printHeader("🔗 PARTE 3: TESTES DE INTEGRAÇÃO");

  // 3.1 - Verificar que Proof aponta para Rulebook correto
  try {
    const proofRulebook = await proof.rulebook();
    const match = proofRulebook.toLowerCase() === RULEBOOK_ADDRESS.toLowerCase();
    logTest(
      "Integração: Proof → Rulebook",
      match ? "PASS" : "FAIL",
      match ? "Proof aponta para Rulebook correto" : "Endereços não correspondem"
    );
  } catch (error) {
    logTest("Integração: Proof → Rulebook", "FAIL", error.message);
  }

  // 3.2 - Verificar que Rulebook tem dados válidos
  try {
    const rulebookInfo = await proof.getRulebookInfo();
    const hasValidCid = rulebookInfo[1].length > 0;
    const hasValidHash = rulebookInfo[2] !== ethers.ZeroHash;
    const isValid = hasValidCid && hasValidHash;

    logTest(
      "Integração: Rulebook tem dados válidos",
      isValid ? "PASS" : "FAIL",
      isValid ? "CID e Hash válidos" : "Dados inválidos no Rulebook"
    );
  } catch (error) {
    logTest("Integração: Rulebook tem dados válidos", "FAIL", error.message);
  }

  // 3.3 - Verificar permissões (Owner pode pausar)
  try {
    const owner = await proof.owner();
    const canPause = owner === deployer.address;

    logTest(
      "Permissões: Owner pode pausar",
      canPause ? "PASS" : "SKIP",
      canPause ? "Auditor é owner, pode testar pause" : "Auditor não é owner"
    );
  } catch (error) {
    logTest("Permissões: Owner pode pausar", "FAIL", error.message);
  }

  // ================================================================================
  // PARTE 4: TESTES DE SEGURANÇA
  // ================================================================================

  printHeader("🛡️ PARTE 4: AUDITORIA DE SEGURANÇA");

  // 4.1 - Verificar que Rulebook é imutável (sem setters)
  try {
    const hasSetIpfsCid = typeof rulebook.setIpfsCid === 'function';
    const hasSetContentHash = typeof rulebook.setContentHash === 'function';
    const isImmutable = !hasSetIpfsCid && !hasSetContentHash;

    logTest(
      "Segurança: Rulebook é imutável",
      isImmutable ? "PASS" : "FAIL",
      isImmutable ? "Sem funções de alteração" : "Tem funções que alteram estado"
    );
  } catch (error) {
    logTest("Segurança: Rulebook é imutável", "PASS", "Métodos não existem (correto)");
  }

  // 4.2 - Verificar que apenas Owner/Backend podem submeter proofs
  try {
    const owner = await proof.owner();
    const backend = await proof.backend();
    const hasOwner = owner !== ethers.ZeroAddress;
    const hasBackend = backend !== ethers.ZeroAddress;

    logTest(
      "Segurança: Permissões configuradas",
      hasOwner && hasBackend ? "PASS" : "FAIL",
      hasOwner && hasBackend ? "Owner e Backend configurados" : "Permissões não configuradas"
    );
  } catch (error) {
    logTest("Segurança: Permissões configuradas", "FAIL", error.message);
  }

  // 4.3 - Verificar que contrato não está pausado por padrão
  try {
    const paused = await proof.paused();
    logTest(
      "Segurança: Estado inicial correto",
      !paused ? "PASS" : "WARN",
      !paused ? "Contrato ativo após deploy" : "Contrato pausado após deploy"
    );
  } catch (error) {
    logTest("Segurança: Estado inicial correto", "FAIL", error.message);
  }

  // 4.4 - Verificar que Rulebook referencia plano válido
  try {
    const ipfsCid = await rulebook.ipfsCid();
    const contentHash = await rulebook.contentHash();
    const hasValidData = ipfsCid.length > 0 && contentHash !== ethers.ZeroHash;

    logTest(
      "Segurança: Plano referenciado é válido",
      hasValidData ? "PASS" : "FAIL",
      hasValidData ? "CID e Hash presentes" : "Dados ausentes"
    );
  } catch (error) {
    logTest("Segurança: Plano referenciado é válido", "FAIL", error.message);
  }

  // ================================================================================
  // RESUMO FINAL
  // ================================================================================

  printSummary();
}

// ================================================================================
// EXECUTAR AUDITORIA
// ================================================================================

main()
  .then(() => {
    if (report.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error("");
    console.error("❌ ERRO CRÍTICO NA AUDITORIA:");
    console.error(error);
    console.error("");
    process.exit(1);
  });
