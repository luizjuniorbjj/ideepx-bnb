@echo off
REM ========================================
REM 📦 Deploy to Hardhat Local
REM ========================================
REM Deploy Mock USDT + iDeepX Contract
REM to Hardhat local network
REM ========================================

echo.
echo ============================================================
echo 📦 DEPLOYING TO HARDHAT LOCAL
echo ============================================================
echo.
echo ⏳ Deploying contracts...
echo.

npx hardhat run scripts/deploy_local.js --network hardhat

echo.
echo ============================================================
echo ✅ DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo 📝 Contract addresses saved to:
echo    - .env.local
echo    - deployment-local.json
echo.
echo 🎉 Ready to test!
echo    Run: start_bot_local.bat
echo.
pause
