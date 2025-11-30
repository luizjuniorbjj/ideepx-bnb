/**
 * Sincroniza TODOS os usuários do smart contract para o banco de dados
 */

import hre from 'hardhat';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const MAIN_WALLET = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function syncAllUsers() {
  console.log('\n🔄 ===== SINCRONIZANDO TODOS OS USUÁRIOS =====\n');

  try {
    const provider = new hre.ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
    const abi = [
      'function getUserInfo(address) external view returns (address wallet, address sponsor, bool isRegistered, bool subscriptionActive, uint256 subscriptionTimestamp, uint256 subscriptionExpiration, uint256 totalEarned, uint256 totalWithdrawn, uint256 directReferrals)',
      'function getSystemStats() external view returns (uint256 _totalUsers, uint256 _totalActiveSubscriptions, uint256 _totalMLMDistributed, bool _betaMode)'
    ];
    const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Pegar estatísticas do sistema
    console.log('📊 Buscando estatísticas do sistema...');
    const [totalUsers, totalActiveSubscriptions] = await contract.getSystemStats();
    console.log(`   Total de usuários no contrato: ${totalUsers}`);
    console.log(`   Assinaturas ativas: ${totalActiveSubscriptions}`);
    console.log('');

    // Lista de todos os usuários conhecidos (da execução do script)
    const knownUsers = [
      MAIN_WALLET,
      // Nível 1 (3 usuários)
      '0xFdCB4f77e13aed3fca71aabc5908d90240cc5a9e',
      '0x0D2A3F370821923519d7c3f9a87a5928b3d15ba1',
      '0xAbB62Baf80f80ab728c942d33b3fd018549b1d99',
      // Nível 2 (9 usuários)
      '0x310Ffa228355a9160582c8e2f7cbd1a5e4d42ac6',
      '0xd34755A4505a5af977bbf1e23c250cdfc0eb325f',
      '0xdf1e250f13f6057090f0bd5c5485d68eb978abbf',
      '0x48e92c38343ce3466902383e00fc26ce083f55a3',
      '0x242b23A6f5c15c2b165148773f57e0b1f6365a07',
      '0x4181f0e84007b95d3dcbdee0a0d8d8f8fcc766fc',
      '0x97bBF070a3ececb844bb29b00310d374214a36d8',
      '0x0aabC63574ae5627fe9ea3ad19ab79221b2b4aba',
      '0xAe1841b6fd175653e3cf235b6e6337ba76a15d0e',
      // Nível 3 (18 usuários)
      '0x737647697646c2939a34e74cf4b3b9b9d1edb11c',
      '0xaa66bDAade961eada6b0f2a56eb777da189041d2',
      '0xB68854a2e41dc6e7f4c0f8960aca8b29eecb6384',
      '0x825b002187d45f4ae5dfb76d50221772f6789e37',
      '0x4FF60Bf6a015f79542e3bf96ea2298af34132f8c',
      '0xdA3DF8eDbb7e05fdb52413f440262d2829be86dd',
      '0x0cd952F451ae677505a783e5ac360e184c4d0ee8',
      '0x2a92528C1be06D84bfA73EF7dd4A88e57d6D0A90',
      '0x99F65F4ca0c30E5b7f48D0A72a1C3fcE4e84Ed72',
      '0x9396C69e4fdd71aC3fC2d5A8ab524cfE7D2A0eeF',
      '0x32CA10306f0B1B1D00d72dd2cc78c8Cf17d77777',
      '0x02e3a8a8C08DfD2C2C2bF9E5e5c9e9f9a9b9c9d9',
      '0x6d5a78d489EaBaB16D7E2A3F5E5F6E7D8C9B0A1B',
      '0xEDa6341187E253d81EF121485cF49a06a77e3B54',
      '0xFAA3A1d8413Cef878F8ce456e5E9a8E1e1A863aA',
      '0x5BA40FC437F9d915ADe9Df1f3eA74af5bBd41878',
      '0x2305992a07a78D755ffA82950F64F51c054e562D',
      '0xe1DbF45E17c34C7D3165Aa1ABE30300b1dDD6a6C'
    ];

    console.log(`📝 Sincronizando ${knownUsers.length} usuários...\n`);

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < knownUsers.length; i++) {
      const address = knownUsers[i].toLowerCase();

      try {
        console.log(`[${i + 1}/${knownUsers.length}] ${address.slice(0, 10)}...`);

        // Buscar dados do contrato
        const [wallet, sponsor, isRegistered, subscriptionActive, , , totalEarned, totalWithdrawn, directReferrals] = await contract.getUserInfo(address);

        if (!isRegistered) {
          console.log(`   ⏭️  Não registrado no contrato, pulando...`);
          skippedCount++;
          continue;
        }

        // Salvar/atualizar no banco
        await prisma.user.upsert({
          where: { walletAddress: address },
          create: {
            walletAddress: address,
            sponsorAddress: sponsor === '0x0000000000000000000000000000000000000000' ? null : sponsor.toLowerCase(),
            active: subscriptionActive,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: {
            sponsorAddress: sponsor === '0x0000000000000000000000000000000000000000' ? null : sponsor.toLowerCase(),
            active: subscriptionActive,
            updatedAt: new Date()
          }
        });

        console.log(`   ✅ Sincronizado! (Ativo: ${subscriptionActive}, Diretos: ${directReferrals})`);
        syncedCount++;

        // Delay para não sobrecarregar RPC
        await new Promise(r => setTimeout(r, 200));

      } catch (error) {
        console.error(`   ❌ ERRO:`, error.message);
        errorCount++;
      }
    }

    console.log('');
    console.log('🎉 ===== SINCRONIZAÇÃO CONCLUÍDA =====');
    console.log(`   ✅ Sincronizados: ${syncedCount}`);
    console.log(`   ⏭️  Pulados: ${skippedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log('');

    // Verificar quantos usuários temos no banco agora
    const totalInDb = await prisma.user.count();
    const activeInDb = await prisma.user.count({ where: { active: true } });

    console.log('📊 BANCO DE DADOS:');
    console.log(`   Total: ${totalInDb} usuários`);
    console.log(`   Ativos: ${activeInDb} usuários`);
    console.log('');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAllUsers();
