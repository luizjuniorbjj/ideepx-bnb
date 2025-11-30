# Corrigir portas do ngrok de 5000/5001 para 3000/3001

$possiblePaths = @(
    "$env:USERPROFILE\.ngrok2\ngrok.yml",
    "$env:LOCALAPPDATA\ngrok\ngrok.yml",
    "C:\ngrok-v3-stable-windows-amd64\ngrok.yml"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        Write-Host "Encontrado arquivo: $path"
        
        # Ler conteúdo
        $content = Get-Content $path -Raw
        
        # Substituir portas
        $content = $content -replace 'addr: 5000', 'addr: 3000'
        $content = $content -replace 'addr: 5001', 'addr: 3001'
        
        # Salvar
        Set-Content $path -Value $content -NoNewline
        
        Write-Host "✅ Portas corrigidas em: $path"
        Write-Host ""
        Write-Host "Agora execute no PowerShell:"
        Write-Host "cd C:\ngrok-v3-stable-windows-amd64"
        Write-Host ".\ngrok.exe start --all"
    }
}
