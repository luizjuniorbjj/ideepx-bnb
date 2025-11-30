#!/usr/bin/env python3
"""
Gera ENCRYPTION_KEY e configura automaticamente nos .env
"""
from cryptography.fernet import Fernet
import os

print("=" * 80)
print("GERANDO ENCRYPTION_KEY")
print("=" * 80)
print()

# Gerar key
key = Fernet.generate_key().decode()
print(f"✅ ENCRYPTION_KEY gerada: {key}")
print()

# Configurar backend/.env
backend_env_path = "backend/.env"
collector_env_path = "mt5-collector/.env"

# Backend .env
print(f"📝 Atualizando {backend_env_path}...")
if os.path.exists(backend_env_path):
    with open(backend_env_path, 'r') as f:
        lines = f.readlines()

    # Verificar se ENCRYPTION_KEY já existe
    has_encryption_key = any('ENCRYPTION_KEY' in line for line in lines)

    if not has_encryption_key:
        with open(backend_env_path, 'a') as f:
            f.write(f"\n# MT5 Encryption Key\nENCRYPTION_KEY={key}\n")
        print(f"   ✅ ENCRYPTION_KEY adicionada ao backend/.env")
    else:
        # Substituir
        new_lines = []
        for line in lines:
            if 'ENCRYPTION_KEY' in line and not line.strip().startswith('#'):
                new_lines.append(f"ENCRYPTION_KEY={key}\n")
            else:
                new_lines.append(line)

        with open(backend_env_path, 'w') as f:
            f.writelines(new_lines)
        print(f"   ✅ ENCRYPTION_KEY atualizada no backend/.env")
else:
    print(f"   ⚠️  backend/.env não encontrado, criando...")
    with open(backend_env_path, 'w') as f:
        f.write(f"ENCRYPTION_KEY={key}\n")
    print(f"   ✅ backend/.env criado")

print()

# Collector .env
print(f"📝 Atualizando {collector_env_path}...")
if os.path.exists(collector_env_path):
    with open(collector_env_path, 'r') as f:
        lines = f.readlines()

    # Substituir ENCRYPTION_KEY
    new_lines = []
    for line in lines:
        if 'ENCRYPTION_KEY' in line and not line.strip().startswith('#'):
            new_lines.append(f"ENCRYPTION_KEY={key}\n")
        else:
            new_lines.append(line)

    with open(collector_env_path, 'w') as f:
        f.writelines(new_lines)
    print(f"   ✅ ENCRYPTION_KEY atualizada no mt5-collector/.env")
else:
    print(f"   ⚠️  mt5-collector/.env não encontrado, criando...")
    with open(collector_env_path, 'w') as f:
        f.write(f"NUM_WORKERS=5\n")
        f.write(f"COLLECT_INTERVAL=30\n")
        f.write(f"MT5_PATH=C:\\mt5_terminal1\\terminal64.exe\n")
        f.write(f"DATABASE_URL=file:../backend/prisma/dev.db\n")
        f.write(f"ENCRYPTION_KEY={key}\n")
    print(f"   ✅ mt5-collector/.env criado")

print()
print("=" * 80)
print("✅ CONFIGURAÇÃO CONCLUÍDA!")
print("=" * 80)
print()
print("Próximos passos:")
print("1. Execute: test-mt5-quick.bat")
print("2. Execute: cd mt5-collector && venv\\Scripts\\activate && python test_mt5_connection.py")
print("3. Execute: START-MT5-SYSTEM.bat")
print()
