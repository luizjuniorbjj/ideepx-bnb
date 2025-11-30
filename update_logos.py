#!/usr/bin/env python3
"""Script para adicionar o componente Logo em todas as páginas"""

import os
import re

pages_to_update = [
    'frontend/app/admin/page.tsx',
    'frontend/app/network/page.tsx',
    'frontend/app/register/page.tsx',
    'frontend/app/transfer/page.tsx',
    'frontend/app/withdraw/page.tsx',
]

def add_logo_import(content):
    """Adiciona import do Logo se não existir"""
    if "import Logo from '@/components/Logo'" in content:
        return content

    # Encontra o último import
    import_pattern = r"(import .+ from .+\n)"
    imports = list(re.finditer(import_pattern, content))

    if imports:
        last_import = imports[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + "import Logo from '@/components/Logo'\n" + content[insert_pos:]

    return content

def update_page(filepath):
    """Atualiza uma página específica"""
    if not os.path.exists(filepath):
        print(f"❌ Arquivo não encontrado: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Adiciona import
    content = add_logo_import(content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Atualizado: {filepath}")
        return True
    else:
        print(f"⏭️  Já atualizado: {filepath}")
        return False

if __name__ == '__main__':
    print("🎨 Atualizando páginas com componente Logo...\n")

    updated = 0
    for page in pages_to_update:
        if update_page(page):
            updated += 1

    print(f"\n✅ {updated} página(s) atualizada(s)!")
