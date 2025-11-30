@echo off
REM ========================================
REM 🤖 Start Bot - LOCAL MODE
REM ========================================
REM Runs bot with Hardhat Local
REM (infinite BNB, instant txs)
REM ========================================

echo.
echo ============================================================
echo 🤖 STARTING BOT - LOCAL MODE
echo ============================================================
echo.
echo 🚀 Using Hardhat Local Network
echo    - BNB: INFINITE
echo    - Speed: INSTANT
echo    - Cost: $0
echo.
echo ⏳ Starting bot...
echo.

python intelligent_test_bot_fixed.py --local

echo.
echo ❌ Bot stopped
echo.
pause
