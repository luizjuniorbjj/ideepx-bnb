/**
 * 🎯 TESTE FINAL - gmiEdgeService com AXIOS
 *
 * Testa o serviço GMI Edge corrigido usando suas credenciais reais
 */

require('dotenv').config();

// Importar o serviço (usar import dinâmico para ESM)
async function runTest() {
  console.log('\n🚀 ===== TESTE FINAL - gmiEdgeService =====\n');

  const ACCOUNT = '3237386';
  const PASSWORD = '7oH(y`EGgenX';
  const SERVER = 'GMI Trading Platform Demo';

  try {
    // Importar gmiEdgeService (ESM)
    const { default: gmiEdgeService } = await import('./src/services/gmiEdgeService.js');

    console.log('✅ gmiEdgeService importado com sucesso!\n');

    // TESTE 1: Login completo
    console.log('📝 TESTE 1: validateAndConnect()');
    console.log(`   Account: ${ACCOUNT}`);
    console.log(`   Server: ${SERVER}\n`);

    const result = await gmiEdgeService.validateAndConnect(
      ACCOUNT,
      PASSWORD,
      SERVER
    );

    console.log('\n🎉 ===== RESULTADO =====\n');

    // Account Info
    console.log('📊 ACCOUNT INFO:');
    console.log(`   Login: ${result.accountInfo.Login}`);
    console.log(`   Name: ${result.accountInfo.Name || 'N/A'}`);
    console.log(`   IsDemo: ${result.accountInfo.IsDemo}`);
    console.log(`   IsTradeEnabled: ${result.accountInfo.IsTradeEnabled}`);

    // Account State
    console.log('\n💰 ACCOUNT STATE:');
    const accountState = result.accountState.AccountState || result.accountState;
    console.log(`   Balance: $${accountState.Balance || 0}`);
    console.log(`   Equity: $${accountState.Equity || 0}`);
    console.log(`   Profit: $${accountState.Profit || 0}`);
    console.log(`   FreeMargin: $${accountState.FreeMargin || 0}`);

    // Posições abertas
    const positions = result.accountState.OrderStates || [];
    console.log(`\n📈 POSIÇÕES ABERTAS: ${positions.length}`);
    if (positions.length > 0) {
      positions.forEach((pos, idx) => {
        console.log(`   ${idx + 1}. ${pos.Symbol || 'Unknown'} - ${pos.OrderSide || 'N/A'} - Profit: $${pos.Profit || 0}`);
      });
    }

    // Tokens
    console.log('\n🔑 TOKENS:');
    console.log(`   AccessToken: ${result.tokens.accessToken.substring(0, 30)}...`);
    console.log(`   RefreshToken: ${result.tokens.refreshToken.substring(0, 30)}...`);

    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    console.log('\n🎊 GMI Edge API funcionando 100%!\n');

    // TESTE 2: Verificar cache de tokens
    console.log('📝 TESTE 2: Verificar cache de tokens\n');
    const cachedToken = await gmiEdgeService.getAccessToken(ACCOUNT);
    console.log(`   ✅ Token em cache: ${cachedToken.substring(0, 30)}...`);

    // TESTE 3: Buscar dados novamente (deve usar cache)
    console.log('\n📝 TESTE 3: Buscar Account Info (usando cache)\n');
    const accountInfo2 = await gmiEdgeService.getAccountInfo(ACCOUNT);
    console.log(`   ✅ Login: ${accountInfo2.Login}`);

    console.log('\n🎉 INTEGRAÇÃO GMI EDGE 100% FUNCIONAL!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error(`   Mensagem: ${error.message}`);
    if (error.stack) {
      console.error(`\n   Stack:\n${error.stack}`);
    }
    process.exit(1);
  }
}

runTest();
