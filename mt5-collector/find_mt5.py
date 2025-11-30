"""
Localiza instalação do MT5 no sistema
"""
import os
import winreg

def find_mt5_installations():
    """Procura por instalações do MT5"""
    possible_paths = [
        r"C:\mt5_terminal1\terminal64.exe",
        r"C:\Program Files\MetaTrader 5\terminal64.exe",
        r"C:\Program Files (x86)\MetaTrader 5\terminal64.exe",
    ]

    # Procurar no AppData
    appdata = os.getenv('APPDATA')
    if appdata:
        roaming_path = os.path.join(os.path.dirname(appdata), 'Roaming', 'MetaQuotes')
        if os.path.exists(roaming_path):
            for root, dirs, files in os.walk(roaming_path):
                if 'terminal64.exe' in files:
                    possible_paths.append(os.path.join(root, 'terminal64.exe'))

    # Procurar processos em execução
    try:
        import psutil
        for proc in psutil.process_iter(['name', 'exe']):
            if proc.info['name'] == 'terminal64.exe':
                possible_paths.append(proc.info['exe'])
    except:
        pass

    # Remover duplicatas e verificar existência
    found = []
    seen = set()
    for path in possible_paths:
        if path and path not in seen and os.path.exists(path):
            found.append(path)
            seen.add(path)

    return found

print("=" * 80)
print("🔍 LOCALIZANDO INSTALAÇÕES DO MT5")
print("=" * 80)
print()

installations = find_mt5_installations()

if not installations:
    print("❌ Nenhuma instalação do MT5 encontrada!")
    print()
    print("Verifique se o MT5 está instalado.")
else:
    print(f"✅ Encontradas {len(installations)} instalação(ões):")
    print()
    for i, path in enumerate(installations, 1):
        print(f"{i}. {path}")

        # Verificar se está rodando
        try:
            import psutil
            running = any(proc.info['exe'] == path for proc in psutil.process_iter(['exe']))
            if running:
                print(f"   ✅ RODANDO")
            else:
                print(f"   ❌ NÃO ESTÁ RODANDO")
        except:
            pass

    print()
    print("=" * 80)
    print("💡 RECOMENDAÇÃO:")
    print("=" * 80)
    print()
    print("Use este caminho no arquivo collect_all_accounts.py e test_connection_doo_prime.py:")
    print()
    print(f'MT5_PATH = r"{installations[0]}"')
