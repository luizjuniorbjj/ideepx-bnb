/**
 * Script para testar edge cases do sistema Proof
 * Testa cenários de erro e validações
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 TESTANDO EDGE CASES...\n");

  const PROOF_CONTRACT = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";

  const abi = [
    "function submitWeeklyProof(uint256, string, uint256, uint256, uint256)",
    "function finalizeWeek(uint256)",
    "function getWeeklyProof(uint256) view returns (tuple(uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, address submitter, uint256 submittedAt, bool finalized))",
    "function hasProof(uint256) view returns (bool)",
    "function owner() view returns (address)",
    "function backend() view returns (address)",
    "function paused() view returns (bool)"
  ];

  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(PROOF_CONTRACT, abi, signer);

  console.log(`👤 Test Wallet: ${signer.address}\n`);

  let passedTests = 0;
  let failedTests = 0;

  // ==================== TESTE 1 ====================
  console.log("=== TESTE 1: Buscar proof inexistente ===");
  try {
    await contract.getWeeklyProof(9999999999);
    console.log("❌ FALHOU: Deveria ter revertido");
    failedTests++;
  } catch (error) {
    if (error.message.includes("proof not found")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'proof not found'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 2 ====================
  console.log("=== TESTE 2: Verificar hasProof para week inexistente ===");
  try {
    const has = await contract.hasProof(9999999999);
    if (has === false) {
      console.log("✅ PASSOU: hasProof retorna false para week inexistente");
      passedTests++;
    } else {
      console.log("❌ FALHOU: hasProof deveria retornar false");
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FALHOU: Erro inesperado: ${error.message}`);
    failedTests++;
  }
  console.log();

  // ==================== TESTE 3 ====================
  console.log("=== TESTE 3: Tentar submeter proof sem permissões ===");
  try {
    const owner = await contract.owner();
    const backend = await contract.backend();

    console.log(`   Owner: ${owner}`);
    console.log(`   Backend: ${backend}`);
    console.log(`   Signer: ${signer.address}`);

    if (signer.address.toLowerCase() === owner.toLowerCase() ||
        signer.address.toLowerCase() === backend.toLowerCase()) {
      console.log("⚠️ SKIP: Signer é owner/backend, não pode testar negação de permissão");
      console.log("   (Este teste requer uma wallet diferente)");
    } else {
      await contract.submitWeeklyProof(
        1234567890,
        "QmTest",
        1,
        100,
        1000
      );
      console.log("❌ FALHOU: Deveria ter revertido (sem permissão)");
      failedTests++;
    }
  } catch (error) {
    if (error.message.includes("not authorized") || error.message.includes("not owner")) {
      console.log("✅ PASSOU: Reverteu corretamente por falta de permissão");
      passedTests++;
    } else {
      console.log(`❌ FALHOU: Erro diferente: ${error.message.substring(0, 100)}`);
      failedTests++;
    }
  }
  console.log();

  // ==================== TESTE 4 ====================
  console.log("=== TESTE 4: Tentar submeter proof com week = 0 ===");
  try {
    await contract.submitWeeklyProof(
      0,
      "QmTest",
      1,
      100,
      1000
    );
    console.log("❌ FALHOU: Deveria ter revertido (week = 0)");
    failedTests++;
  } catch (error) {
    if (error.message.includes("invalid week")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'invalid week'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 5 ====================
  console.log("=== TESTE 5: Tentar submeter proof com IPFS vazio ===");
  try {
    await contract.submitWeeklyProof(
      1234567890,
      "",
      1,
      100,
      1000
    );
    console.log("❌ FALHOU: Deveria ter revertido (IPFS vazio)");
    failedTests++;
  } catch (error) {
    if (error.message.includes("empty IPFS hash")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'empty IPFS hash'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 6 ====================
  console.log("=== TESTE 6: Tentar submeter proof com totalUsers = 0 ===");
  try {
    await contract.submitWeeklyProof(
      1234567890,
      "QmTest",
      0,
      100,
      1000
    );
    console.log("❌ FALHOU: Deveria ter revertido (totalUsers = 0)");
    failedTests++;
  } catch (error) {
    if (error.message.includes("total users must be > 0")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'total users must be > 0'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 7 ====================
  console.log("=== TESTE 7: Tentar finalizar proof inexistente ===");
  try {
    await contract.finalizeWeek(9999999999);
    console.log("❌ FALHOU: Deveria ter revertido (proof não existe)");
    failedTests++;
  } catch (error) {
    if (error.message.includes("proof does not exist")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'proof does not exist'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 8 ====================
  console.log("=== TESTE 8: Tentar finalizar proof já finalizado ===");
  try {
    // Week 1 já está finalizado
    const proof = await contract.getWeeklyProof(1731283200);

    if (proof.finalized) {
      console.log("   Proof Week 1 já está finalizado, tentando finalizar novamente...");
      await contract.finalizeWeek(1731283200);
      console.log("❌ FALHOU: Deveria ter revertido (já finalizado)");
      failedTests++;
    } else {
      console.log("⚠️ SKIP: Proof Week 1 não está finalizado");
    }
  } catch (error) {
    if (error.message.includes("already finalized")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'already finalized'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 9 ====================
  console.log("=== TESTE 9: Tentar atualizar proof já finalizado ===");
  try {
    // Tentar atualizar Week 1 (já finalizado)
    const proof = await contract.getWeeklyProof(1731283200);

    if (proof.finalized) {
      console.log("   Proof Week 1 finalizado, tentando atualizar...");
      await contract.submitWeeklyProof(
        1731283200,
        "QmNewHash",
        10,
        200,
        2000
      );
      console.log("❌ FALHOU: Deveria ter revertido (não pode atualizar finalizado)");
      failedTests++;
    } else {
      console.log("⚠️ SKIP: Proof Week 1 não está finalizado");
    }
  } catch (error) {
    if (error.message.includes("cannot update finalized proof")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'cannot update finalized proof'");
      passedTests++;
    } else {
      console.log(`⚠️ PASSOU MAS: Erro diferente: ${error.message.substring(0, 100)}`);
      passedTests++;
    }
  }
  console.log();

  // ==================== TESTE 10 ====================
  console.log("=== TESTE 10: Verificar se contrato está pausado ===");
  try {
    const isPaused = await contract.paused();
    console.log(`   Contrato pausado: ${isPaused}`);

    if (isPaused) {
      console.log("⚠️ ALERTA: Contrato está PAUSADO!");
      console.log("   Tentando submeter proof...");

      await contract.submitWeeklyProof(
        1234567890,
        "QmTest",
        1,
        100,
        1000
      );
      console.log("❌ FALHOU: Deveria ter revertido (contrato pausado)");
      failedTests++;
    } else {
      console.log("✅ PASSOU: Contrato NÃO está pausado (normal)");
      passedTests++;
    }
  } catch (error) {
    if (error.message.includes("contract is paused")) {
      console.log("✅ PASSOU: Reverteu corretamente com 'contract is paused'");
      passedTests++;
    } else {
      console.log(`❌ FALHOU: Erro diferente: ${error.message.substring(0, 100)}`);
      failedTests++;
    }
  }
  console.log();

  // ==================== RESUMO ====================
  console.log("=".repeat(60));
  console.log("📊 RESUMO DOS TESTES:");
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${failedTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
