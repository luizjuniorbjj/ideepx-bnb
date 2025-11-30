#!/bin/bash

# ============================================
# 📌 iDeepX Frontend - Build para Pinata
# ============================================
# Script para preparar o frontend para IPFS
# Uso: ./build-for-pinata.sh
# ============================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 iDeepX Frontend - Build para Pinata"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Step 1: Check .env.local
echo -e "${YELLOW}[1/6]${NC} Verificando .env.local..."

if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ Arquivo .env.local não encontrado!${NC}"
  echo ""
  echo "Crie o arquivo .env.local com:"
  echo ""
  echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..."
  echo "NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955"
  echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=..."
  echo ""
  exit 1
fi

# Check if CONTRACT_ADDRESS is set
if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS=0x\.\.\." .env.local; then
  echo -e "${RED}⚠️  WARNING: CONTRACT_ADDRESS ainda está como 0x...${NC}"
  echo "Atualize com o endereço real do contrato Core após deploy!"
fi

echo -e "${GREEN}✅ .env.local encontrado${NC}"

# Step 2: Clean previous build
echo ""
echo -e "${YELLOW}[2/6]${NC} Limpando build anterior..."

if [ -d "out" ]; then
  rm -rf out
  echo -e "${GREEN}✅ Pasta out/ removida${NC}"
fi

if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✅ Pasta .next/ removida${NC}"
fi

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}[3/6]${NC} Instalando dependências..."

if [ ! -d "node_modules" ]; then
  echo "Primeira instalação... pode levar alguns minutos"
  npm install
else
  echo "node_modules já existe, pulando instalação"
  echo "(Execute 'npm install' manualmente se necessário)"
fi

echo -e "${GREEN}✅ Dependências OK${NC}"

# Step 4: Build
echo ""
echo -e "${YELLOW}[4/6]${NC} Building para produção..."
echo "Isso pode levar 1-2 minutos..."

npm run build

echo -e "${GREEN}✅ Build completo!${NC}"

# Step 5: Verify output
echo ""
echo -e "${YELLOW}[5/6]${NC} Verificando output..."

if [ ! -d "out" ]; then
  echo -e "${RED}❌ Pasta out/ não foi gerada!${NC}"
  exit 1
fi

if [ ! -f "out/index.html" ]; then
  echo -e "${RED}❌ index.html não encontrado em out/!${NC}"
  exit 1
fi

# Calculate size
OUT_SIZE=$(du -sh out/ | cut -f1)
echo -e "${GREEN}✅ Pasta out/ gerada (${OUT_SIZE})${NC}"

# Step 6: Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 BUILD COMPLETO PARA PINATA!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📦 Pasta para upload:${NC} out/"
echo -e "${YELLOW}📏 Tamanho:${NC} ${OUT_SIZE}"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo ""
echo "1. Acesse: https://app.pinata.cloud"
echo "2. Clique em 'Upload' → 'Folder'"
echo "3. Selecione a pasta 'out/'"
echo "4. Nome sugerido: ideepx-frontend-v1.0"
echo "5. Aguarde upload e copie o CID"
echo "6. Acesse: https://gateway.pinata.cloud/ipfs/SEU_CID"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
