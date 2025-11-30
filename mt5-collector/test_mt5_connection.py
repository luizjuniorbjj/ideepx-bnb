#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================================
TESTE DE CONEXÃO MT5 TERMINAL
============================================================================
Script para verificar se o MetaTrader 5 Terminal está instalado e acessível.

Execute antes de rodar o collector pela primeira vez.
============================================================================
"""

import MetaTrader5 as mt5
import sys
import os

# MT5 Terminal Path
MT5_PATH = os.getenv('MT5_PATH', r'C:\mt5_terminal1\terminal64.exe')

print("=" * 80)
print("TESTE DE CONEXÃO MT5 TERMINAL")
print("=" * 80)
print()

# 1. Verificar se biblioteca foi importada
print(f"✅ MetaTrader5 library importada com sucesso")
print(f"   Versão: {mt5.__version__}")
print()

# 1.5. Verificar se arquivo terminal64.exe existe
print(f"📂 Verificando caminho do MT5...")
print(f"   Caminho configurado: {MT5_PATH}")
if os.path.exists(MT5_PATH):
    print(f"   ✅ Arquivo encontrado!")
else:
    print(f"   ❌ ERRO: Arquivo NÃO encontrado!")
    print(f"   Verifique se o MT5 está instalado em: {MT5_PATH}")
    print()
    print("=" * 80)
    sys.exit(1)
print()

# 2. Tentar inicializar terminal
print("🔄 Tentando inicializar MT5 Terminal...")

if not mt5.initialize(path=MT5_PATH):
    error_code, error_msg = mt5.last_error()
    print(f"❌ ERRO: MT5 initialize() failed")
    print(f"   Error code: {error_code}")
    print(f"   Error message: {error_msg}")
    print()
    print(f"⚠️  POSSÍVEIS CAUSAS:")
    print(f"   1. MT5 Terminal NÃO está instalado no Windows")
    print(f"      → Baixe em: https://www.metatrader5.com/en/download")
    print(f"      → Instale em: C:\\Program Files\\MetaTrader 5\\")
    print()
    print(f"   2. MT5 está sendo usado por outro processo")
    print(f"      → Feche todas as janelas do MT5")
    print(f"      → Abra Task Manager e finalize 'terminal64.exe'")
    print()
    print(f"   3. Caminho do terminal não foi encontrado")
    print(f"      → Verifique se existe: C:\\Program Files\\MetaTrader 5\\terminal64.exe")
    print()
    print("=" * 80)
    sys.exit(1)

print(f"✅ MT5 Terminal inicializado com sucesso!")
print()

# 3. Informações do terminal
print("📊 INFORMAÇÕES DO TERMINAL:")
print("-" * 80)

terminal_info = mt5.terminal_info()
if terminal_info:
    print(f"   Caminho.......: {terminal_info.path}")
    print(f"   Build.........: {terminal_info.build}")
    print(f"   Empresa.......: {terminal_info.company}")
    print(f"   Nome..........: {terminal_info.name}")
    print(f"   Conectado.....: {terminal_info.connected}")
    print(f"   Trade Allowed.: {terminal_info.trade_allowed}")
    print(f"   Email.........: {terminal_info.email}")
    print(f"   Language......: {terminal_info.language}")
else:
    print(f"   ⚠️  Não foi possível obter informações do terminal")

print()

# 4. Verificar versão Python
print("🐍 INFORMAÇÕES DO PYTHON:")
print("-" * 80)
print(f"   Python Version: {sys.version}")
print(f"   Platform......: {sys.platform}")
print()

# 5. Instruções para próximo passo
print("✅ TESTE CONCLUÍDO COM SUCESSO!")
print("=" * 80)
print()
print("📝 PRÓXIMOS PASSOS:")
print()
print("1. Gerar ENCRYPTION_KEY:")
print("   python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")
print()
print("2. Configurar .env:")
print("   - Copiar .env.example para .env")
print("   - Adicionar ENCRYPTION_KEY gerada")
print()
print("3. Executar collector:")
print("   python collector_pool.py")
print()
print("4. Conectar conta via frontend:")
print("   http://localhost:3000/mt5/connect")
print()
print("=" * 80)

# 6. Desconectar
mt5.shutdown()
