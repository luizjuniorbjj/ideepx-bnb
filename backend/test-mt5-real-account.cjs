/**
 * Script de teste para conta MT5 real
 * Conta: 32650015 @ GMI3-Real
 */

const { ethers } = require('ethers');

// Dados da conta real
const accountNumber = '32650015';
const server = 'GMI3-Real';
const platform = 'MT5';

// Calcular accountHash (mesmo método do backend)
const accountHash = ethers.keccak256(
  ethers.toUtf8Bytes(accountNumber + server)
);

console.log('\n=== DADOS DA CONTA MT5 REAL ===');
console.log('Número da conta:', accountNumber);
console.log('Servidor:', server);
console.log('Plataforma:', platform);
console.log('Account Hash:', accountHash);

// Dados de trading simulados (valores realistas para teste)
const mockTradingData = {
  accountNumber,
  accountHash,
  balance: '15750.50',
  equity: '15832.75',
  monthlyVolume: '287500.00',
  monthlyProfit: '3250.75',
  monthlyLoss: '1180.25',
  totalTrades: 47,
  timestamp: new Date().toISOString()
};

console.log('\n=== DADOS DE TRADING MOCK ===');
console.log('Saldo:', mockTradingData.balance);
console.log('Equity:', mockTradingData.equity);
console.log('Volume Mensal:', mockTradingData.monthlyVolume);
console.log('Lucro Mensal:', mockTradingData.monthlyProfit);
console.log('Prejuízo Mensal:', mockTradingData.monthlyLoss);
console.log('Total Trades:', mockTradingData.totalTrades);

// Fazer requisição para o webhook
const testWebhook = async () => {
  try {
    console.log('\n=== TESTANDO WEBHOOK ===');
    console.log('URL: http://localhost:3001/api/mt5/sync');

    const response = await fetch('http://localhost:3001/api/mt5/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockTradingData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Sync bem-sucedido!');
      console.log('Resposta:', result);
    } else {
      console.log('❌ Erro no sync:');
      console.log('Status:', response.status);
      console.log('Erro:', result);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

// Executar teste
console.log('\n=== INICIANDO TESTE ===\n');
testWebhook();
