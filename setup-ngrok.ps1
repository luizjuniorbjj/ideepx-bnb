Write-Host "Configurando ngrok..." -ForegroundColor Cyan

$ngrokPath = "C:\ngrok-v3-stable-windows-amd64"
$frontendPath = "C:\ideepx-bnb\frontend"
$envPath = Join-Path $frontendPath ".env.local"

Write-Host "Finalizando processos ngrok anteriores..." -ForegroundColor Yellow
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Iniciando tunel BACKEND (porta 3001)..." -ForegroundColor Green
Start-Process -FilePath (Join-Path $ngrokPath "ngrok.exe") -ArgumentList "http", "3001" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Iniciando tunel FRONTEND (porta 3000)..." -ForegroundColor Green
Start-Process -FilePath (Join-Path $ngrokPath "ngrok.exe") -ArgumentList "http", "3000" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Buscando URLs publicas..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $backend = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
    $backendUrl = ($backend.tunnels | Where-Object { $_.proto -eq "https" }).public_url

    $frontend = Invoke-RestMethod -Uri "http://localhost:4041/api/tunnels"
    $frontendUrl = ($frontend.tunnels | Where-Object { $_.proto -eq "https" }).public_url

    Write-Host ""
    Write-Host "TUNEIS ATIVOS:" -ForegroundColor Green
    Write-Host "BACKEND: $backendUrl" -ForegroundColor Cyan
    Write-Host "FRONTEND: $frontendUrl" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Configurando .env.local..." -ForegroundColor Cyan
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'NEXT_PUBLIC_API_URL=.*', ''
    $envContent = $envContent.TrimEnd()
    $envContent += "`nNEXT_PUBLIC_API_URL=$backendUrl/api`n"
    Set-Content -Path $envPath -Value $envContent -NoNewline

    Write-Host "CONFIGURADO! .env.local atualizado" -ForegroundColor Green
    Write-Host "API URL: $backendUrl/api" -ForegroundColor White
    Write-Host ""
    Write-Host "AGORA REINICIE O FRONTEND:" -ForegroundColor Yellow
    Write-Host "1. Pressione Ctrl+C no terminal do frontend" -ForegroundColor White
    Write-Host "2. Execute: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Depois acesse: $frontendUrl" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Configure manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse http://localhost:4040" -ForegroundColor White
    Write-Host "2. Copie URL do backend" -ForegroundColor White
    Write-Host "3. Edite frontend\.env.local" -ForegroundColor White
    Write-Host "4. Adicione: NEXT_PUBLIC_API_URL=URL_BACKEND/api" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione Enter para sair"
