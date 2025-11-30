# Script completo para iniciar ngrok e configurar automaticamente
Write-Host "🚀 Configurando acesso externo completo..." -ForegroundColor Cyan

$ngrokPath = "C:\ngrok-v3-stable-windows-amd64"
$frontendPath = "C:\ideepx-bnb\frontend"
$envPath = "$frontendPath\.env.local"
$urlsFile = "C:\ideepx-bnb\ngrok-urls.txt"

# Matar ngrok existentes
Write-Host "Finalizando processos ngrok anteriores..." -ForegroundColor Yellow
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Iniciar túnel Backend (porta 3001)
Write-Host "Iniciando túnel BACKEND (porta 3001)..." -ForegroundColor Green
Start-Process -FilePath "$ngrokPath\ngrok.exe" -ArgumentList "http", "3001" -WindowStyle Normal
Start-Sleep -Seconds 5

# Iniciar túnel Frontend (porta 3000)
Write-Host "Iniciando túnel FRONTEND (porta 3000)..." -ForegroundColor Green
Start-Process -FilePath "$ngrokPath\ngrok.exe" -ArgumentList "http", "3000" -WindowStyle Normal
Start-Sleep -Seconds 5

# Buscar URLs dos túneis
Write-Host ""
Write-Host "🔍 Buscando URLs públicas..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    # Túnel 1 (primeiro ngrok - porta 3001 backend)
    $backend = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $backendUrl = ($backend.tunnels | Where-Object { $_.proto -eq "https" }).public_url

    # Túnel 2 (segundo ngrok - porta 3000 frontend)
    $frontend = Invoke-RestMethod -Uri "http://localhost:4041/api/tunnels" -ErrorAction Stop
    $frontendUrl = ($frontend.tunnels | Where-Object { $_.proto -eq "https" }).public_url

    if (-not $backendUrl) {
        Write-Host "⚠️ Não consegui detectar URL do backend" -ForegroundColor Yellow
        Write-Host "Verificando portas inversas..." -ForegroundColor Yellow

        # Tentar inverso
        $temp = $backend
        $backend = $frontend
        $frontend = $temp

        $backendUrl = ($backend.tunnels | Where-Object { $_.proto -eq "https" }).public_url
        $frontendUrl = ($frontend.tunnels | Where-Object { $_.proto -eq "https" }).public_url
    }

    Write-Host ""
    Write-Host "✅ TÚNEIS ATIVOS:" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  BACKEND API:" -ForegroundColor Yellow
    Write-Host "  $backendUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  FRONTEND:" -ForegroundColor Yellow
    Write-Host "  $frontendUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "==================" -ForegroundColor Green

    # Configurar .env.local automaticamente
    Write-Host ""
    Write-Host "⚙️ Configurando frontend..." -ForegroundColor Cyan

    # Ler .env.local atual
    $envContent = Get-Content $envPath -Raw

    # Remover linha antiga de API_URL se existir
    $envContent = $envContent -replace 'NEXT_PUBLIC_API_URL=.*\n', ''

    # Adicionar nova URL
    $newLine = "NEXT_PUBLIC_API_URL=$backendUrl/api"

    if (-not $envContent.EndsWith("`n")) {
        $envContent += "`n"
    }
    $envContent += $newLine

    # Salvar
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

    Write-Host "✅ .env.local atualizado com:" -ForegroundColor Green
    Write-Host "   NEXT_PUBLIC_API_URL=$backendUrl/api" -ForegroundColor White
    Write-Host ""

    # Salvar URLs em arquivo
    $urlsContent = "BACKEND_URL=$backendUrl`nFRONTEND_URL=$frontendUrl`nBACKEND_API=$backendUrl/api`n`nConfigurado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $urlsContent | Out-File -FilePath $urlsFile -Encoding UTF8

    Write-Host "📝 URLs salvas em: ngrok-urls.txt" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 AGORA REINICIE O FRONTEND:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Vá no terminal do VS Code onde o frontend está rodando" -ForegroundColor White
    Write-Host "   2. Pressione Ctrl+C para parar" -ForegroundColor White
    Write-Host "   3. Execute: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "   Ou execute este comando em outro PowerShell:" -ForegroundColor Gray
    Write-Host "   cd $frontendPath ; npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Depois acesse: $frontendUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "==================" -ForegroundColor Green
    Write-Host "Interface Web ngrok:" -ForegroundColor Yellow
    Write-Host "  Backend: http://localhost:4040" -ForegroundColor Gray
    Write-Host "  Frontend: http://localhost:4041" -ForegroundColor Gray
    Write-Host "==================" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "⚠️ Erro ao buscar URLs automaticamente" -ForegroundColor Yellow
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Configure manualmente:" -ForegroundColor White
    Write-Host "1. Acesse: http://localhost:4040" -ForegroundColor Cyan
    Write-Host "2. Copie a URL do backend" -ForegroundColor White
    Write-Host "3. Edite: $envPath" -ForegroundColor Cyan
    Write-Host "4. Adicione: NEXT_PUBLIC_API_URL=URL_DO_BACKEND/api" -ForegroundColor White
    Write-Host "5. Reinicie frontend: cd frontend; npm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
