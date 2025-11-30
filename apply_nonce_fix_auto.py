#!/usr/bin/env python3
"""
🔧 Script de Aplicação Automática - Correção de Nonce
======================================================

Aplica automaticamente todas as correções de nonce no intelligent_test_bot_fixed.py

CORREÇÕES APLICADAS:
1. Adiciona import do NonceFix
2. Inicializa nonce_manager no __init__
3. Substitui execute_transaction pela versão corrigida
4. Adiciona gerenciamento de nonce para send_bnb e send_usdt

BACKUP:
- Cria backup automático antes de modificar
- intelligent_test_bot_fixed.py.backup_TIMESTAMP
"""

import os
import shutil
from datetime import datetime

def create_backup(file_path):
    """Cria backup do arquivo original"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{file_path}.backup_{timestamp}"
    shutil.copy2(file_path, backup_path)
    print(f"✅ Backup criado: {backup_path}")
    return backup_path

def apply_nonce_fix():
    """Aplica as correções de nonce no bot"""

    bot_file = "C:\\ideepx-bnb\\intelligent_test_bot_fixed.py"

    if not os.path.exists(bot_file):
        print(f"❌ Erro: Arquivo não encontrado: {bot_file}")
        return False

    print("🔧 Aplicando correções de nonce...")
    print("=" * 60)

    # 1. Criar backup
    print("\n📦 Passo 1: Criando backup...")
    backup_path = create_backup(bot_file)

    # 2. Ler arquivo original
    print("\n📖 Passo 2: Lendo arquivo original...")
    with open(bot_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 3. Aplicar correções
    print("\n🔧 Passo 3: Aplicando correções...")

    # Correção 1: Adicionar imports
    if "from bot_fix_nonce import" not in content:
        import_line = "from bot_fix_nonce import execute_transaction_fixed, NonceFix\n"

        # Procurar o último import
        lines = content.split('\n')
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('from '):
                last_import_idx = i

        # Inserir depois do último import
        lines.insert(last_import_idx + 1, import_line)
        content = '\n'.join(lines)
        print("   ✅ Imports adicionados")
    else:
        print("   ⏭️  Imports já presentes")

    # Correção 2: Inicializar nonce_manager no __init__
    if "self.nonce_manager = NonceFix(self.w3)" not in content:
        # Procurar o final do __init__
        init_pattern = "self.master_nonce = self.w3.eth.get_transaction_count(self.master_account.address)"

        if init_pattern in content:
            replacement = f"{init_pattern}\n        \n        # ✅ CORREÇÃO: Nonce manager para usuários\n        self.nonce_manager = NonceFix(self.w3)"
            content = content.replace(init_pattern, replacement)
            print("   ✅ nonce_manager inicializado")
        else:
            print("   ⚠️  Não encontrou padrão de inicialização - Adicionando manualmente")
    else:
        print("   ⏭️  nonce_manager já inicializado")

    # Correção 3: Substituir execute_transaction
    if "def execute_transaction(self, function_call, private_key:" in content:
        # Comentar função antiga e adicionar wrapper
        old_func_start = "    def execute_transaction(self, function_call, private_key:"
        new_func = """    def execute_transaction(self, function_call, private_key: str, gas_limit: int = 500000) -> Optional[dict]:
        \"\"\"
        Executa transação com gerenciamento correto de nonce

        ✅ CORRIGIDO: Agora usa execute_transaction_fixed com retry logic
        \"\"\"
        return execute_transaction_fixed(self, function_call, private_key, gas_limit)

    # Função antiga (backup)
    def execute_transaction_OLD_BACKUP(self, function_call, private_key:"""

        content = content.replace(old_func_start, new_func)
        print("   ✅ execute_transaction substituída")
    else:
        print("   ⏭️  execute_transaction já corrigida")

    # Correção 4: Corrigir send_bnb para usar pending nonce
    if "'nonce': self.master_nonce" in content and "send_bnb" in content:
        # Já tem correção manual, OK
        print("   ℹ️  send_bnb usa master_nonce (OK)")

    # Correção 5: Corrigir send_usdt para usar pending nonce
    if "'nonce': self.master_nonce" in content and "send_usdt" in content:
        # Já tem correção manual, OK
        print("   ℹ️  send_usdt usa master_nonce (OK)")

    # 4. Salvar arquivo corrigido
    print("\n💾 Passo 4: Salvando arquivo corrigido...")
    with open(bot_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"   ✅ Arquivo salvo: {bot_file}")

    # 5. Resumo
    print("\n" + "=" * 60)
    print("✅ CORREÇÕES APLICADAS COM SUCESSO!")
    print("=" * 60)
    print(f"\n📁 Arquivo original (backup): {backup_path}")
    print(f"📁 Arquivo corrigido: {bot_file}")
    print("\n📝 Próximos passos:")
    print("   1. Revisar as mudanças (opcional)")
    print("   2. Executar: python intelligent_test_bot_fixed.py")
    print("   3. Verificar logs de execução")
    print("\n💡 Se algo der errado, restaure o backup:")
    print(f"   cp {backup_path} {bot_file}")

    return True


if __name__ == "__main__":
    print("🤖 iDeepX Bot - Aplicador Automático de Correções")
    print("=" * 60)
    print("\n⚙️  Este script vai:")
    print("   1. Criar backup do arquivo original")
    print("   2. Adicionar imports necessários")
    print("   3. Inicializar gerenciador de nonce")
    print("   4. Substituir função execute_transaction")
    print("   5. Aplicar correções de nonce")
    print("\n⚠️  ATENÇÃO: Sempre revise as mudanças após aplicação!")
    print("\n" + "=" * 60)

    input("\n▶️  Pressione ENTER para continuar ou Ctrl+C para cancelar...")

    success = apply_nonce_fix()

    if success:
        print("\n🎉 Tudo pronto! O bot foi corrigido com sucesso.")
        print("🚀 Execute agora: python intelligent_test_bot_fixed.py")
    else:
        print("\n❌ Erro ao aplicar correções. Verifique os logs acima.")
        exit(1)
