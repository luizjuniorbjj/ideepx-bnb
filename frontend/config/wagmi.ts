import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { Chain } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// 🔥 CHAIN CUSTOMIZADA PARA HARDHAT LOCAL
const hardhatLocal: Chain = {
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

// Configuração do Wagmi com PERSISTÊNCIA de conexão
export const config = createConfig({
  chains: [hardhatLocal, bsc, bscTestnet],
  connectors: [
    injected({
      shimDisconnect: false, // Mantém conexão após reload
    }),
  ],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
  // 🔥 STORAGE PARA PERSISTIR CONEXÃO
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
  }),
});
