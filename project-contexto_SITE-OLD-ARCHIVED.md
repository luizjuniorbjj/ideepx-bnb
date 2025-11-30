# Projeto iDeepX — Contexto Completo para Geração do dApp Web3

## 🗂️ Origem e Referência
- Pasta principal: `C:\ideepx-bnb`
- PDF de referência: `C:\ideepx-bnb\pdf\iDeepX.pdf`
- O agente deve **ler o conteúdo do PDF** e extrair todas as informações sobre:
  - Identidade visual (cores, logos, slogans)
  - Produtos (Bot Trading, Copy Trading, Programa de Parceiros)
  - Estrutura de comissões e níveis
  - Divisão de performance e conceitos de automação

---

## 🧭 1. Visão Geral do Projeto
A **iDeepX** é uma fintech de automação financeira voltada ao **mercado Forex**, oferecendo:
- **Bot Trading** com Inteligência Artificial, operando em pares como **XAU/USD**
- **Copy Trading** integrado à corretora **GMI**, permitindo copiar operações profissionais em tempo real
- **Programa de Parceiros Unilevel**, com comissões em até **10 níveis**
- **Sala de Sinais e Curso iDeepX** para capacitação de traders iniciantes

### 🎯 Propósito do dApp
Criar uma **plataforma Web3 descentralizada** conectada a um **contrato inteligente na Binance Smart Chain**, que permita:
- Registro e login via carteira (WalletConnect ou MetaMask)
- Painel do cliente (visualização de saldo, sponsor, pontos e comissões)
- Transferências e saques automáticos
- Painel administrativo completo (parâmetros, controle e rede)
- Deploy final compatível com IPFS (Pinata)

---

## 🎨 2. Identidade Visual e Branding
Extraído do PDF iDeepX:

| Elemento | Valor |
|-----------|--------|
| Nome | **iDeepX** |
| Tema | Tecnologia, inovação, transparência |
| Cores principais | Azul escuro `#0F172A`, Ciano `#22D3EE`, Acento amarelo `#F59E0B` |
| Tipografia | Inter (700 títulos, 400 textos) |
| Logo | `/assets/logo.svg` |
| Estilo | Limpo, moderno, com sombras suaves e cantos arredondados |

---

## 🧩 3. Estrutura de Páginas
| Caminho | Função |
|----------|--------|
| `/` | Landing page (explicação do produto e botão "Conectar carteira") |
| `/register` | Registro de usuário (`register(address sponsor)`) |
| `/dashboard` | Painel principal do usuário (saldo, sponsor, pontos, histórico) |
| `/transfer` | Envio interno de valores (`transfer(address,uint256)`) |
| `/withdraw` | Saque (`withdraw(uint256)`) |
| `/network` | Exibição da rede de afiliados (modelo Unilevel) |
| `/admin` | Painel administrativo (somente para owner/admin) |
| `/404` | Página de erro customizada |

---

## 🔗 4. Contrato Inteligente
**Rede:** Binance Smart Chain Testnet (ChainID 97)  
**Endereço:** `0xSEU_CONTRATO_AQUI`  
**RPC:** `https://bsc-testnet.publicnode.com`

### Funções principais
```solidity
function register(address sponsor) external;
function transfer(address to, uint256 amount) external;
function withdraw(uint256 amount) external;
function userInfo(address user) view returns (uint256 balance, address sponsor, uint256 points);
function getReferrals(address user) view returns (address[] memory);
function getParam(uint256 key) view returns (uint256);
function setParam(uint256 key, uint256 val) external;
function owner() view returns (address);
