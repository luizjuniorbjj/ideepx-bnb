// ================================================================================
// CLEAN MT5 CONFIG - Limpar configuração de conta MT5
// ================================================================================
// Este script executa o PowerShell para remover configurações de uma conta
// específica do MetaTrader 5 quando cliente troca de conta.

const { execSync } = require('child_process');
const path = require('path');

/**
 * Remove configurações de uma conta específica do MT5
 * @param {string} serverName - Nome do servidor (ex: "DooTechnology-Live", "GMI3-Real")
 * @returns {boolean} - true se sucesso, false se erro
 */
function cleanMT5Config(serverName) {
  if (!serverName) {
    console.error('❌ [cleanMT5Config] Nome do servidor é obrigatório');
    return false;
  }

  console.log(`\n🔧 [cleanMT5Config] Limpando configuração MT5 para servidor: ${serverName}`);

  const scriptPath = path.join(__dirname, 'clean-mt5-account.ps1');

  try {
    // Executa o PowerShell script
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -ServerName "${serverName}"`;

    console.log(`   Executando: ${command}`);

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(output);
    console.log(`✅ [cleanMT5Config] Configuração do servidor ${serverName} removida com sucesso\n`);

    return true;

  } catch (error) {
    console.error(`❌ [cleanMT5Config] Erro ao limpar configuração MT5:`, error.message);

    // Mesmo com erro, continuamos (talvez MT5 não esteja instalado nesta máquina)
    console.log(`⚠️  [cleanMT5Config] Continuando mesmo com erro (MT5 pode não estar instalado)\n`);

    return false;
  }
}

// Se executado diretamente (não importado)
if (require.main === module) {
  const serverName = process.argv[2];

  if (!serverName) {
    console.error('❌ Uso: node clean-mt5-config.cjs <ServerName>');
    console.error('   Exemplo: node clean-mt5-config.cjs DooTechnology-Live');
    process.exit(1);
  }

  const success = cleanMT5Config(serverName);
  process.exit(success ? 0 : 1);
}

module.exports = { cleanMT5Config };
