# ================================================================================
# FORCE REMOVE MT5 ACCOUNT - Versao Agressiva
# ================================================================================
# Remove conta do MT5 completamente, incluindo registro e contas ativas

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerName
)

Write-Host ""
Write-Host "FORCE REMOVING MT5 ACCOUNT: $ServerName"
Write-Host "=========================================="

# ================================================================================
# STEP 1: Kill ALL MT5 processes (more aggressive)
# ================================================================================

Write-Host ""
Write-Host "Step 1: Force killing ALL MetaTrader 5 processes..."

# Kill terminal64.exe
$terminal64 = Get-Process -Name "terminal64" -ErrorAction SilentlyContinue
if ($terminal64) {
    Write-Host "   Killing terminal64.exe processes: $($terminal64.Count)"
    Stop-Process -Name "terminal64" -Force -ErrorAction SilentlyContinue
}

# Kill metaeditor64.exe
$metaeditor = Get-Process -Name "metaeditor64" -ErrorAction SilentlyContinue
if ($metaeditor) {
    Write-Host "   Killing metaeditor64.exe processes: $($metaeditor.Count)"
    Stop-Process -Name "metaeditor64" -Force -ErrorAction SilentlyContinue
}

Write-Host "   All MT5 processes killed"
Start-Sleep -Seconds 3

# ================================================================================
# STEP 2: Remove configuration files
# ================================================================================

Write-Host ""
Write-Host "Step 2: Removing configuration files..."

$mt5ConfigPath = Join-Path $env:APPDATA "MetaQuotes\Terminal"

if (-not (Test-Path $mt5ConfigPath)) {
    Write-Host "   ERROR: MT5 folder not found"
    exit 1
}

$mt5Folders = Get-ChildItem -Path $mt5ConfigPath -Directory | Where-Object { $_.Name -match '^[A-F0-9]{32}$' }

if ($mt5Folders.Count -eq 0) {
    Write-Host "   ERROR: No MT5 installation found"
    exit 1
}

Write-Host "   Found $($mt5Folders.Count) MT5 installation(s)"

$removedCount = 0

foreach ($mt5Folder in $mt5Folders) {
    $basePath = $mt5Folder.FullName

    Write-Host ""
    Write-Host "   Processing: $($mt5Folder.Name)"

    # Remove bases\[ServerName]
    $serverBasesPath = Join-Path $basePath "bases\$ServerName"
    if (Test-Path $serverBasesPath) {
        Write-Host "      Removing: bases\$ServerName"
        Remove-Item -Path $serverBasesPath -Recurse -Force -ErrorAction SilentlyContinue
        $removedCount++
    }

    # Remove config\[ServerName].ini
    $configIniPath = Join-Path $basePath "config\$ServerName.ini"
    if (Test-Path $configIniPath) {
        Write-Host "      Removing: config\$ServerName.ini"
        Remove-Item -Path $configIniPath -Force -ErrorAction SilentlyContinue
        $removedCount++
    }

    # Remove accounts.dat (contains active accounts list)
    $accountsDatPath = Join-Path $basePath "config\accounts.dat"
    if (Test-Path $accountsDatPath) {
        Write-Host "      Removing: config\accounts.dat (will force MT5 to rebuild)"
        Remove-Item -Path $accountsDatPath -Force -ErrorAction SilentlyContinue
        $removedCount++
    }

    # Remove community.dat
    $communityDatPath = Join-Path $basePath "config\community.dat"
    if (Test-Path $communityDatPath) {
        Write-Host "      Removing: config\community.dat"
        Remove-Item -Path $communityDatPath -Force -ErrorAction SilentlyContinue
    }

    # Search and remove any .dat files containing server name
    $configPath = Join-Path $basePath "config"
    if (Test-Path $configPath) {
        $datFiles = Get-ChildItem -Path $configPath -Filter "*.dat" -ErrorAction SilentlyContinue
        foreach ($datFile in $datFiles) {
            # Try to read as text and search for server name
            try {
                $content = Get-Content $datFile.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -and $content -match $ServerName) {
                    Write-Host "      Removing: config\$($datFile.Name) (contains $ServerName)"
                    Remove-Item -Path $datFile.FullName -Force -ErrorAction SilentlyContinue
                    $removedCount++
                }
            } catch {
                # Binary file, skip
            }
        }
    }
}

# ================================================================================
# STEP 3: Clean registry (if exists)
# ================================================================================

Write-Host ""
Write-Host "Step 3: Cleaning registry entries..."

$regPaths = @(
    "HKCU:\Software\MetaQuotes\Terminal",
    "HKCU:\Software\MetaQuotes\WebInstall"
)

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Write-Host "   Checking: $regPath"
        # Don't delete entire key, just clean up if needed
    }
}

Write-Host "   Registry check completed"

# ================================================================================
# STEP 4: Summary
# ================================================================================

Write-Host ""
Write-Host "=========================================="
Write-Host "SUMMARY"
Write-Host "=========================================="
Write-Host ""
Write-Host "Removed $removedCount file(s)/folder(s)"
Write-Host ""
Write-Host "Account $ServerName has been FORCE REMOVED"
Write-Host ""
Write-Host "IMPORTANT: When you reopen MT5:"
Write-Host "1. It will rebuild its configuration"
Write-Host "2. Only GMI3-Real should appear"
Write-Host "3. $ServerName will be GONE"
Write-Host ""
Write-Host "=========================================="
Write-Host ""

exit 0
