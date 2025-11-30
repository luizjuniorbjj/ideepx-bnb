# Script PowerShell para iniciar túneis ngrok
Write-Host "🚀 Iniciando túneis ngrok..." -ForegroundColor Cyan
Write-Host ""

$ngrokPath = "C:\ngrok-v3-stable-windows-amd64"

# Matar processos ngrok existentes
Write-Host "Finalizando processos ngrok existentes..." -ForegroundColor Yellow
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Iniciar túnel Frontend (porta 3000)
Write-Host "Iniciando túnel FRONTEND (porta 3000)..." -ForegroundColor Green
Start-Process -FilePath "$ngrokPath\ngrok.exe" -ArgumentList "http", "3000", "--log=stdout" -WindowStyle Normal
Start-Sleep -Seconds 3

# Iniciar túnel Backend (porta 3001)
Write-Host "Iniciando túnel BACKEND (porta 3001)..." -ForegroundColor Green
Start-Process -FilePath "$ngrokPath\ngrok.exe" -ArgumentList "http", "3001", "--log=stdout" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Túneis ngrok iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Para ver as URLs públicas:" -ForegroundColor Cyan
Write-Host "  1. Frontend: http://localhost:4040" -ForegroundColor White
Write-Host "  2. Backend: http://localhost:4041" -ForegroundColor White
Write-Host ""
Write-Host "Ou execute este comando:" -ForegroundColor Yellow
Write-Host '  curl http://localhost:4040/api/tunnels | ConvertFrom-Json | Select-Object -ExpandProperty tunnels | Select-Object name,public_url,proto' -ForegroundColor Gray
Write-Host ""

# Aguardar e mostrar URLs
Start-Sleep -Seconds 5

Write-Host "🔍 Buscando URLs públicas..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop

    Write-Host ""
    Write-Host "🌐 TÚNEIS ATIVOS:" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green

    foreach ($tunnel in $response.tunnels) {
        Write-Host ""
        Write-Host "  Nome: $($tunnel.name)" -ForegroundColor Yellow
        Write-Host "  URL Pública: $($tunnel.public_url)" -ForegroundColor Cyan
        Write-Host "  Protocolo: $($tunnel.proto)" -ForegroundColor Gray
        Write-Host "  Local: $($tunnel.config.addr)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "==================" -ForegroundColor Green

    # Salvar URLs em arquivo
    $frontendUrl = ($response.tunnels | Where-Object { $_.config.addr -like "*3000*" }).public_url
    $backendUrl = ($response.tunnels | Where-Object { $_.config.addr -like "*3001*" }).public_url

    if ($frontendUrl) {
        Write-Host ""
        Write-Host "✅ URL Frontend: $frontendUrl" -ForegroundColor Green
        "FRONTEND_URL=$frontendUrl" | Out-File -FilePath "ngrok-urls.txt" -Encoding UTF8
    }

    if ($backendUrl) {
        Write-Host "✅ URL Backend: $backendUrl" -ForegroundColor Green
        "BACKEND_URL=$backendUrl" | Out-File -FilePath "ngrok-urls.txt" -Append -Encoding UTF8
    }

    Write-Host ""
    Write-Host "📝 URLs salvas em: ngrok-urls.txt" -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "⚠️ Aguarde alguns segundos e acesse manualmente:" -ForegroundColor Yellow
    Write-Host "   http://localhost:4040 (Interface Web do ngrok)" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
