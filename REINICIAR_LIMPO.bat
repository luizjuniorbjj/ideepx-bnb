@echo off
echo ========================================
echo LIMPEZA E REINICIO COMPLETO - iDeepX
echo ========================================
echo.

echo [1/5] Matando todos os processos Node.exe...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Limpando cache do Next.js...
cd frontend
if exist .next rmdir /s /q .next
echo Cache do Next.js limpo!

cd ..
echo.

echo [3/5] Limpando cache do backend...
cd backend
if exist .next rmdir /s /q .next
echo Cache do backend limpo!

cd ..
echo.

echo ========================================
echo LIMPEZA CONCLUIDA!
echo ========================================
echo.
echo AGORA SIGA ESTES PASSOS:
echo.
echo 1. Abra um NOVO terminal (CMD ou PowerShell)
echo 2. Va para: cd C:\ideepx-bnb\backend
echo 3. Execute: npm run dev
echo.
echo 4. Abra OUTRO terminal
echo 5. Va para: cd C:\ideepx-bnb\frontend
echo 6. Execute: npm run dev
echo.
echo 7. Aguarde 10 segundos
echo 8. Acesse: http://localhost:5000/dashboard
echo.
echo ========================================
pause
