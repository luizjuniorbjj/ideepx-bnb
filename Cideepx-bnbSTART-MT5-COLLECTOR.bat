@echo off
title MT5 Multi-Account Collector
color 0A
cls

echo ================================================================================
echo                   MT5 MULTI-ACCOUNT COLLECTOR
echo ================================================================================
echo.
echo Iniciando coletor de dados MT5...
echo.

cd mt5-collector
python collect_all_accounts.py

pause
