@echo off
REM ========================================
REM 🚀 Start Hardhat Local Network
REM ========================================
REM Este script inicia o Hardhat node local
REM com 100 contas pré-financiadas (10k BNB cada)
REM ========================================

echo.
echo ============================================================
echo 🚀 STARTING HARDHAT LOCAL NETWORK
echo ============================================================
echo.
echo ✅ 100 accounts with 10,000 BNB each
echo ✅ Instant transactions (^<1s)
echo ✅ Zero costs
echo ✅ Full debugging
echo.
echo ⏳ Starting node...
echo.

npx hardhat node

echo.
echo ❌ Hardhat node stopped
echo.
pause
