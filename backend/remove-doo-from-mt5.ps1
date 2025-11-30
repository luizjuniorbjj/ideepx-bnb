# ================================================================================
# SCRIPT: Remover Conta Doo Prime do MT5 Permanentemente
# ================================================================================
# Este script fecha o MT5 e remove todos os arquivos de configuração da conta
# Doo Prime para evitar reconexão automática

Write-Host "🔧 REMOVENDO DOO PRIME DO MT5" -ForegroundColor Cyan
Write-Host "=" * 80

# ================================================================================
# ETAPA 1: Fechar MT5
# ================================================================================

Write-Host "`n📌 ETAPA 1: Fechando MetaTrader 5...`n" -ForegroundColor Yellow

$mt5Processes = Get-Process -Name "terminal64" -ErrorAction SilentlyContinue

if ($mt5Processes) {
    Write-Host "   Encontrados $($mt5Processes.Count) processo(s) do MT5 rodando"

    foreach ($process in $mt5Processes) {
        Write-Host "   Finalizando PID: $($process.Id)..." -ForegroundColor Gray
        Stop-Process -Id $process.Id -Force
    }

    Write-Host "   ✅ MT5 fechado com sucesso`n" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ℹ️  MT5 não está rodando`n" -ForegroundColor Gray
}

# ================================================================================
# ETAPA 2: Localizar pasta de configuração
# ================================================================================

Write-Host "📌 ETAPA 2: Localizando configurações do MT5...`n" -ForegroundColor Yellow

$mt5ConfigPath = "$env:APPDATA\MetaQuotes\Terminal"

if (-not (Test-Path $mt5ConfigPath)) {
    Write-Host "   ❌ Pasta do MT5 não encontrada em: $mt5ConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Pasta encontrada: $mt5ConfigPath`n" -ForegroundColor Green

# Encontrar subpasta(s) do MT5
$mt5Folders = Get-ChildItem -Path $mt5ConfigPath -Directory | Where-Object { $_.Name -match '^[A-F0-9]{32}$' }

if ($mt5Folders.Count -eq 0) {
    Write-Host "   ❌ Nenhuma instalação do MT5 encontrada" -ForegroundColor Red
    exit 1
}

Write-Host "   Encontradas $($mt5Folders.Count) instalação(ões) do MT5:" -ForegroundColor Gray

foreach ($folder in $mt5Folders) {
    Write-Host "   - $($folder.Name)" -ForegroundColor Gray
}

Write-Host ""

# ================================================================================
# ETAPA 3: Remover arquivos da conta Doo Prime
# ================================================================================

Write-Host "📌 ETAPA 3: Removendo configurações da Doo Prime...`n" -ForegroundColor Yellow

$removedCount = 0

foreach ($mt5Folder in $mt5Folders) {
    $basePath = $mt5Folder.FullName

    Write-Host "   Verificando: $($mt5Folder.Name)" -ForegroundColor Gray

    # Lista de locais onde a conta pode estar configurada
    $pathsToCheck = @(
        "$basePath\bases\DooTechnology-Live",
        "$basePath\config\DooTechnology-Live.ini",
        "$basePath\config\accounts.dat"
    )

    foreach ($path in $pathsToCheck) {
        if (Test-Path $path) {
            Write-Host "      🗑️  Removendo: $(Split-Path $path -Leaf)" -ForegroundColor Yellow

            try {
                if (Test-Path $path -PathType Container) {
                    Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
                } else {
                    Remove-Item -Path $path -Force -ErrorAction Stop
                }

                Write-Host "         ✅ Removido com sucesso" -ForegroundColor Green
                $removedCount++
            } catch {
                Write-Host "         ⚠️  Erro ao remover: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }

    # Procurar por arquivos que contenham "9941739" (login da Doo Prime)
    Write-Host "      🔍 Procurando arquivos da conta 9941739..." -ForegroundColor Gray

    $configFiles = Get-ChildItem -Path "$basePath\config" -Filter "*.ini" -ErrorAction SilentlyContinue

    foreach ($file in $configFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue

        if ($content -match "9941739|DooTechnology") {
            Write-Host "      🗑️  Removendo: $($file.Name)" -ForegroundColor Yellow

            try {
                Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                Write-Host "         ✅ Removido com sucesso" -ForegroundColor Green
                $removedCount++
            } catch {
                Write-Host "         ⚠️  Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""

# ================================================================================
# ETAPA 4: Resumo
# ================================================================================

Write-Host "=" * 80
Write-Host "📊 RESUMO" -ForegroundColor Cyan
Write-Host "=" * 80

if ($removedCount -gt 0) {
    Write-Host "`n✅ Sucesso! Removidos $removedCount arquivo(s)/pasta(s)`n" -ForegroundColor Green
    Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Abra o MetaTrader 5 novamente"
    Write-Host "   2. Verifique o Navigator → Accounts"
    Write-Host "   3. Deve aparecer APENAS a conta GMI Edge"
    Write-Host "   4. Não haverá mais alternância entre contas`n"
} else {
    Write-Host "`nℹ️  Nenhum arquivo relacionado à Doo Prime foi encontrado`n" -ForegroundColor Gray
    Write-Host "Possíveis motivos:" -ForegroundColor Yellow
    Write-Host "   - Conta já foi removida anteriormente"
    Write-Host "   - MT5 armazena configurações em local diferente"
    Write-Host "   - Conta foi configurada com nome diferente`n"
}

Write-Host "=" * 80
Write-Host "`n✅ Script concluído!" -ForegroundColor Green
Write-Host ""

# Aguardar entrada do usuário
Read-Host "Pressione ENTER para fechar"
