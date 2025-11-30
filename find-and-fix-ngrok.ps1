Write-Host "🔍 Procurando arquivo de configuração do ngrok..." -ForegroundColor Cyan

# Tentar encontrar via comando ngrok
$ngrokPath = "C:\ngrok-v3-stable-windows-amd64\ngrok.exe"
$configOutput = & $ngrokPath config check 2>&1 | Out-String

# Extrair caminho do arquivo
if ($configOutput -match "Valid configuration file at (.+\.yml)") {
    $configFile = $matches[1].Trim()
    Write-Host "✅ Arquivo encontrado: $configFile" -ForegroundColor Green
    
    if (Test-Path $configFile) {
        # Fazer backup
        $backup = "$configFile.backup"
        Copy-Item $configFile $backup -Force
        Write-Host "📦 Backup criado: $backup" -ForegroundColor Yellow
        
        # Ler e corrigir
        $content = Get-Content $configFile -Raw
        $originalContent = $content
        
        $content = $content -replace 'addr:\s*5000', 'addr: 3000'
        $content = $content -replace 'addr:\s*5001', 'addr: 3001'
        
        if ($content -ne $originalContent) {
            Set-Content $configFile -Value $content -NoNewline
            Write-Host "✅ Portas corrigidas: 5000->3000, 5001->3001" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Conteúdo do arquivo:" -ForegroundColor Cyan
            Get-Content $configFile
            Write-Host ""
            Write-Host "🚀 Agora reinicie o ngrok:" -ForegroundColor Yellow
            Write-Host "   1. Pare o ngrok atual (Ctrl+C)" -ForegroundColor White
            Write-Host "   2. Execute: cd C:\ngrok-v3-stable-windows-amd64" -ForegroundColor White
            Write-Host "   3. Execute: .\ngrok.exe start --all" -ForegroundColor White
        } else {
            Write-Host "⚠️  Nenhuma mudança necessária (portas já estão corretas ou não encontradas)" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "📋 Conteúdo atual:" -ForegroundColor Cyan
            Get-Content $configFile
        }
    }
} else {
    Write-Host "❌ Não foi possível detectar o arquivo automaticamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "Caminhos comuns:" -ForegroundColor Yellow
    Write-Host "  - $env:USERPROFILE\.ngrok2\ngrok.yml"
    Write-Host "  - $env:LOCALAPPDATA\ngrok\ngrok.yml"
    Write-Host "  - C:\ngrok-v3-stable-windows-amd64\ngrok.yml"
    Write-Host ""
    Write-Host "Verifique manualmente qual arquivo existe e edite-o." -ForegroundColor Yellow
}
