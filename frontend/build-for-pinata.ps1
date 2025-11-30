# ============================================
# 📌 iDeepX Frontend - Build para Pinata
# ============================================
# Script PowerShell para Windows
# Uso: .\build-for-pinata.ps1
# ============================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📌 iDeepX Frontend - Build para Pinata" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Step 1: Check .env.local
Write-Host "[1/6] Verificando .env.local..." -ForegroundColor Yellow

if (!(Test-Path ".env.local")) {
    Write-Host "❌ Arquivo .env.local não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Crie o arquivo .env.local com:"
    Write-Host ""
    Write-Host "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..."
    Write-Host "NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955"
    Write-Host "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=..."
    Write-Host ""
    exit 1
}

# Check if CONTRACT_ADDRESS is set
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_CONTRACT_ADDRESS=0x\.\.\.") {
    Write-Host "⚠️  WARNING: CONTRACT_ADDRESS ainda está como 0x..." -ForegroundColor Red
    Write-Host "Atualize com o endereço real do contrato Core após deploy!"
}

Write-Host "✅ .env.local encontrado" -ForegroundColor Green

# Step 2: Clean previous build
Write-Host ""
Write-Host "[2/6] Limpando build anterior..." -ForegroundColor Yellow

if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
    Write-Host "✅ Pasta out/ removida" -ForegroundColor Green
}

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Pasta .next/ removida" -ForegroundColor Green
}

# Step 3: Install dependencies
Write-Host ""
Write-Host "[3/6] Instalando dependências..." -ForegroundColor Yellow

if (!(Test-Path "node_modules")) {
    Write-Host "Primeira instalação... pode levar alguns minutos"
    npm install
} else {
    Write-Host "node_modules já existe, pulando instalação"
    Write-Host "(Execute 'npm install' manualmente se necessário)"
}

Write-Host "✅ Dependências OK" -ForegroundColor Green

# Step 4: Build
Write-Host ""
Write-Host "[4/6] Building para produção..." -ForegroundColor Yellow
Write-Host "Isso pode levar 1-2 minutos..."

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completo!" -ForegroundColor Green

# Step 5: Verify output
Write-Host ""
Write-Host "[5/6] Verificando output..." -ForegroundColor Yellow

if (!(Test-Path "out")) {
    Write-Host "❌ Pasta out/ não foi gerada!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "out/index.html")) {
    Write-Host "❌ index.html não encontrado em out/!" -ForegroundColor Red
    exit 1
}

# Calculate size
$outSize = (Get-ChildItem -Path "out" -Recurse | Measure-Object -Property Length -Sum).Sum
$outSizeMB = [math]::Round($outSize / 1MB, 2)
Write-Host "✅ Pasta out/ gerada ($outSizeMB MB)" -ForegroundColor Green

# Step 6: Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🎉 BUILD COMPLETO PARA PINATA!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "📦 Pasta para upload: " -NoNewline -ForegroundColor Yellow
Write-Host "out/"
Write-Host "📏 Tamanho: " -NoNewline -ForegroundColor Yellow
Write-Host "$outSizeMB MB"
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Acesse: https://app.pinata.cloud"
Write-Host "2. Clique em 'Upload' → 'Folder'"
Write-Host "3. Selecione a pasta 'out/'"
Write-Host "4. Nome sugerido: ideepx-frontend-v1.0"
Write-Host "5. Aguarde upload e copie o CID"
Write-Host "6. Acesse: https://gateway.pinata.cloud/ipfs/SEU_CID"
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Open out folder in explorer
Write-Host "Abrindo pasta out/ no Explorer..." -ForegroundColor Cyan
Start-Process "explorer.exe" -ArgumentList (Resolve-Path "out")
