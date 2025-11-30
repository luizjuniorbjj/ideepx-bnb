# Clean MT5 Account Configuration
# Removes specific server configuration from MetaTrader 5

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerName
)

Write-Host ""
Write-Host "Cleaning MT5 config for: $ServerName"
Write-Host "========================================"

# Close MT5
Write-Host ""
Write-Host "Step 1: Closing MetaTrader 5..."
$mt5Processes = Get-Process -Name "terminal64" -ErrorAction SilentlyContinue

if ($mt5Processes) {
    foreach ($process in $mt5Processes) {
        Write-Host "   Stopping PID: $($process.Id)"
        Stop-Process -Id $process.Id -Force
    }
    Write-Host "   MT5 closed successfully"
    Start-Sleep -Seconds 2
} else {
    Write-Host "   MT5 is not running"
}

# Locate MT5 config path
Write-Host ""
Write-Host "Step 2: Locating MT5 configuration..."
$mt5ConfigPath = Join-Path $env:APPDATA "MetaQuotes\Terminal"

if (-not (Test-Path $mt5ConfigPath)) {
    Write-Host "   ERROR: MT5 folder not found at: $mt5ConfigPath"
    exit 1
}

Write-Host "   Found: $mt5ConfigPath"

# Find MT5 installation folders
$mt5Folders = Get-ChildItem -Path $mt5ConfigPath -Directory | Where-Object { $_.Name -match '^[A-F0-9]{32}$' }

if ($mt5Folders.Count -eq 0) {
    Write-Host "   ERROR: No MT5 installation found"
    exit 1
}

Write-Host "   Found $($mt5Folders.Count) MT5 installation(s)"

# Remove server configuration
Write-Host ""
Write-Host "Step 3: Removing $ServerName configuration..."

$removedCount = 0

foreach ($mt5Folder in $mt5Folders) {
    $basePath = $mt5Folder.FullName

    # Remove bases\[ServerName] folder
    $serverBasesPath = Join-Path $basePath "bases\$ServerName"

    if (Test-Path $serverBasesPath) {
        Write-Host "   Removing: bases\$ServerName"
        try {
            Remove-Item -Path $serverBasesPath -Recurse -Force -ErrorAction Stop
            Write-Host "      Success!"
            $removedCount++
        } catch {
            Write-Host "      Error: $($_.Exception.Message)"
        }
    }

    # Remove config\[ServerName].ini file
    $configIniPath = Join-Path $basePath "config\$ServerName.ini"

    if (Test-Path $configIniPath) {
        Write-Host "   Removing: config\$ServerName.ini"
        try {
            Remove-Item -Path $configIniPath -Force -ErrorAction Stop
            Write-Host "      Success!"
            $removedCount++
        } catch {
            Write-Host "      Error: $($_.Exception.Message)"
        }
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "SUMMARY"
Write-Host "========================================"

if ($removedCount -gt 0) {
    Write-Host ""
    Write-Host "Success! Removed $removedCount file(s)/folder(s)"
    Write-Host "$ServerName has been completely removed from MT5"
} else {
    Write-Host ""
    Write-Host "No files related to $ServerName were found"
}

Write-Host ""
Write-Host "Script completed!"
Write-Host ""

exit 0
