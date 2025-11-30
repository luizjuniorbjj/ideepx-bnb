import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1  // MÁXIMA otimização de tamanho
      },
      viaIR: true,  // IR-based codegen (mais otimizado)
      evmVersion: "paris"  // Compatível com todas as chains
    }
  },

  networks: {
    // BNB Chain Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },

    // BNB Chain Mainnet
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },

    // Polygon Mainnet
    polygon: {
      url: "https://polygon-rpc.com/",
      chainId: 137,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 50000000000, // 50 gwei (dinâmico, ajusta automaticamente)
    },

    // Polygon Mumbai Testnet
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },

    // Localhost para testes
    localhost: {
      url: "http://127.0.0.1:8545"
    },

    // Hardhat Network (padrão)
    // 🚀 CONFIGURAÇÃO LOCAL COM BNB INFINITO!
    hardhat: {
      chainId: 31337,

      // 💰 100 CONTAS PRÉ-FINANCIADAS COM 10,000 BNB CADA!
      accounts: {
        count: 100,              // 100 contas disponíveis
        accountsBalance: "10000000000000000000000", // 10k BNB cada
        mnemonic: "test test test test test test test test test test test junk"
      },

      // ⚡ MINING INSTANTÂNEO (blocos sob demanda)
      mining: {
        auto: true,          // Auto-mine
        interval: 0          // Instantâneo (0ms entre blocos)
      },

      // 🔧 GAS CONFIGURATION
      gasPrice: "auto",
      gas: "auto",

      // 🐛 ALLOW CONSOLE.LOG IN SOLIDITY
      allowUnlimitedContractSize: true,

      // 🔄 FORK DA BSC MAINNET (DESATIVADO para testes locais)
      // Para ativar, mude enabled: false para true
      forking: {
        url: "https://bsc-dataseed1.binance.org/",
        enabled: false  // ❌ DESATIVADO - Usando ambiente local puro (mais rápido!)
        // Para ativar fork: enabled: true
      }
    }
  },

  // Etherscan API para verificação de contratos
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 40000
  }
};
