const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0xd1Ee3Dec38b2Adeaa3F724c9DCAc4E84B6e327C2';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

async function main() {
  console.log('🔍 DEBUG COM CALL STATIC\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  const w = ethers.Wallet.createRandom();
  const u = new ethers.Wallet(w.privateKey, provider);

  console.log('User:', w.address);
  console.log();

  const usdt = new ethers.Contract(USDT_ADDRESS, [
    "function decimals() view returns(uint8)",
    "function transfer(address,uint256) returns(bool)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)"
  ], admin);

  const decimals = await usdt.decimals();
  const amount = ethers.parseUnits('29', decimals);

  // Setup
  console.log('Setup...');
  await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
  await (await usdt.transfer(w.address, amount)).wait();
  console.log('✅ BNB e USDT enviados\n');

  // Registrar
  console.log('Registrando...');
  const c = new ethers.Contract(CONTRACT_ADDRESS, [
    "function selfRegister(address)",
    "function selfSubscribe()"
  ], u);

  await (await c.selfRegister(admin.address)).wait();
  console.log('✅ Registrado\n');

  // Aprovar
  console.log('Aprovando USDT...');
  const u2 = new ethers.Contract(USDT_ADDRESS, ["function approve(address,uint256) returns(bool)"], u);
  await (await u2.approve(CONTRACT_ADDRESS, amount)).wait();
  console.log('✅ Aprovado\n');

  // Tentar com callStatic primeiro
  console.log('Tentando callStatic...');
  try {
    await c.selfSubscribe.staticCall();
    console.log('✅ callStatic passou! A transação deveria funcionar.');
  } catch (error) {
    console.log('❌ callStatic falhou:', error.message);

    // Tentar pegar mais detalhes
    if (error.data) {
      console.log('Error data:', error.data);
    }

    if (error.reason) {
      console.log('Error reason:', error.reason);
    }

    // Tentar decodificar o erro
    console.log('\nTentando transação real para ver o erro...');
    try {
      const tx = await c.selfSubscribe({gasLimit: 500000});
      console.log('TX enviada:', tx.hash);
      await tx.wait();
    } catch (txError) {
      console.log('❌ TX erro:', txError.message);

      if (txError.receipt) {
        console.log('Receipt:', txError.receipt);
      }
    }
  }
}

main().catch(console.error);
