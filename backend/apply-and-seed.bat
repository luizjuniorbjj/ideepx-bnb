@echo off
cd /d C:\ideepx-bnb\backend
echo Applying Prisma schema...
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo Failed to apply schema
    pause
    exit /b 1
)

echo.
echo Running seed...
call node prisma/seed.js
if %errorlevel% neq 0 (
    echo Failed to run seed
    pause
    exit /b 1
)

echo.
echo ✅ Schema applied and seed completed!
pause
