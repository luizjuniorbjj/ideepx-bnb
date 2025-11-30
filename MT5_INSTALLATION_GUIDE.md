# 🛠️ Guia de Instalação - MetaTrader 5 Terminal

## ⚠️ IMPORTANTE: MT5 vs Python Library

### O que é o quê?

1. **MetaTrader 5 Terminal** (Aplicação Windows)
   - Software desktop que você baixa e instala no Windows
   - Interface gráfica para fazer trading
   - Instalado em: `C:\Program Files\MetaTrader 5\`
   - **Necessário para o collector funcionar**

2. **Python MetaTrader5 Library** (Biblioteca Python)
   - Biblioteca Python que SE CONECTA ao terminal instalado
   - Instalada via `pip install MetaTrader5`
   - Fica no `venv` do projeto
   - **Precisa do terminal instalado para funcionar**

---

## 📥 Passo 1: Instalar MT5 Terminal no Windows

### Opção A: Download Oficial MetaQuotes

**Baixar de:**
https://www.metatrader5.com/en/download

**Ou usar link direto:**
https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe

**Instalação:**
1. Execute `mt5setup.exe`
2. Siga o wizard (Next, Next, Install)
3. Instalação padrão: `C:\Program Files\MetaTrader 5\`
4. Ao finalizar, pode fechar o MT5 (não precisa configurar conta agora)

### Opção B: Instalar de uma Corretora Específica

Se você vai usar uma corretora específica (GMI, Doo Prime, etc), pode baixar o terminal deles:

**GMI Markets:**
https://www.gmimarkets.com/platforms/metatrader-5/

**Doo Prime:**
https://www.dooprime.com/en/mt5-download

**XM:**
https://www.xm.com/metatrader-5

**IC Markets:**
https://www.icmarkets.com/en/trading-platforms/metatrader-5

**Vantagem**: Já vem com servidores da corretora pré-configurados.

---

## 🔍 Verificar se MT5 está instalado

**Windows PowerShell:**
```powershell
Test-Path "C:\Program Files\MetaTrader 5\terminal64.exe"
# Se retornar True, está instalado
```

**Ou procurar no Menu Iniciar:**
- Buscar: "MetaTrader 5"
- Se aparecer, está instalado

---

## 📦 Passo 2: Instalar Python MetaTrader5 Library

**Já incluído no `requirements.txt`!**

```bash
cd C:\ideepx-bnb\mt5-collector

# Criar ambiente virtual
python -m venv venv

# Ativar venv
venv\Scripts\activate

# Instalar todas as dependências (inclui MetaTrader5)
pip install -r requirements.txt
```

**Verificar instalação:**
```python
python -c "import MetaTrader5 as mt5; print(mt5.__version__)"
# Deve retornar: 5.0.45 (ou superior)
```

---

## 🧪 Teste de Conexão MT5

**Script de teste:**

Criar arquivo `test_mt5_connection.py` em `mt5-collector/`:

```python
import MetaTrader5 as mt5
import sys

print("=" * 80)
print("TESTE DE CONEXÃO MT5")
print("=" * 80)

# 1. Verificar se biblioteca foi importada
print(f"✅ MetaTrader5 library version: {mt5.__version__}")

# 2. Tentar inicializar terminal
if not mt5.initialize():
    print(f"❌ ERRO: MT5 initialize() failed")
    print(f"   Error code: {mt5.last_error()}")
    print(f"\n⚠️  POSSÍVEIS CAUSAS:")
    print(f"   1. MT5 Terminal não está instalado")
    print(f"   2. Caminho do terminal não foi encontrado")
    print(f"   3. MT5 está sendo usado por outro processo")
    sys.exit(1)

print(f"✅ MT5 Terminal inicializado com sucesso!")

# 3. Informações do terminal
terminal_info = mt5.terminal_info()
if terminal_info:
    print(f"\n📊 INFORMAÇÕES DO TERMINAL:")
    print(f"   - Path: {terminal_info.path}")
    print(f"   - Build: {terminal_info.build}")
    print(f"   - Company: {terminal_info.company}")
    print(f"   - Connected: {terminal_info.connected}")
else:
    print(f"⚠️  Não foi possível obter informações do terminal")

# 4. Desconectar
mt5.shutdown()
print(f"\n✅ Teste concluído com sucesso!")
print("=" * 80)
```

**Executar teste:**
```bash
cd mt5-collector
python test_mt5_connection.py
```

**Output esperado:**
```
================================================================================
TESTE DE CONEXÃO MT5
================================================================================
✅ MetaTrader5 library version: 5.0.45
✅ MT5 Terminal inicializado com sucesso!

📊 INFORMAÇÕES DO TERMINAL:
   - Path: C:\Program Files\MetaTrader 5
   - Build: 4340
   - Company: MetaQuotes Software Corp.
   - Connected: False

✅ Teste concluído com sucesso!
================================================================================
```

---

## 🐛 Problemas Comuns

### ❌ Erro: "MT5 initialize() failed"

**Causa**: MT5 Terminal não está instalado ou não foi encontrado.

**Solução**:
1. Verificar se MT5 está instalado: `C:\Program Files\MetaTrader 5\terminal64.exe`
2. Se não estiver, instalar (Passo 1)
3. Se estiver, verificar se está em execução (fechar todas as instâncias)

**Especificar caminho manualmente:**
```python
# Em collector_pool.py, alterar initialize():
mt5.initialize(path="C:\\Program Files\\MetaTrader 5\\terminal64.exe")
```

### ❌ Erro: "Access denied" ou "Permission denied"

**Causa**: MT5 já está sendo usado por outro processo.

**Solução**:
1. Fechar todas as janelas do MT5
2. Verificar Task Manager (Ctrl+Shift+Esc) → Processos → Terminar "terminal64.exe"
3. Tentar novamente

### ❌ Erro: "Login failed"

**Causa**: Credenciais incorretas, servidor errado, ou conta não existe.

**Solução**:
1. Testar login MANUALMENTE no MT5 Terminal primeiro
2. Abrir MT5 → Arquivo → Conectar a Conta
3. Inserir Login, Senha, Servidor
4. Se funcionar manualmente, funciona no collector
5. Verificar nome EXATO do servidor (case-sensitive)

### ⚠️ MT5 Terminal abre janela ao usar collector

**Normal!** O MT5 abre uma janela em background quando o collector conecta.

**Para ocultar (opcional):**
```python
# Em collector_pool.py, alterar initialize():
mt5.initialize(
    path="C:\\Program Files\\MetaTrader 5\\terminal64.exe",
    login=0,  # Sem login inicial
    password="",
    server="",
    timeout=10000,
    portable=False
)
```

---

## 📂 Estrutura Final no Windows

```
C:\
├── Program Files\
│   └── MetaTrader 5\              ← MT5 Terminal instalado
│       ├── terminal64.exe         ← Executável principal
│       ├── bases\                 ← Dados de servidores
│       └── ...
│
└── ideepx-bnb\
    ├── mt5-collector\             ← Projeto Python
    │   ├── collector_pool.py      ← Seu script
    │   ├── requirements.txt
    │   ├── venv\                  ← Python virtual env
    │   │   └── Lib\site-packages\
    │   │       └── MetaTrader5\   ← Biblioteca Python
    │   └── .env
    └── ...
```

---

## 🔐 Configurar Conta de Teste (Opcional)

Se quiser testar o collector sem conta real:

### GMI Demo Account

1. Abrir MT5 Terminal
2. Arquivo → Conectar a Conta → Abrir conta demo
3. Preencher formulário (nome, email, telefone)
4. Selecionar: **GMI Trading Platform Demo**
5. Depósito virtual: $10,000
6. Criar conta
7. Anotar: **Login**, **Senha**, **Servidor**
8. Usar esses dados em `/mt5/connect`

### Doo Prime Demo

1. Acessar: https://www.dooprime.com/en/demo-account
2. Preencher formulário
3. Receber credenciais por email
4. Servidor: `DooPrime-Demo`

---

## ✅ Checklist de Instalação

- [ ] MT5 Terminal instalado (`C:\Program Files\MetaTrader 5\`)
- [ ] Python venv criado (`mt5-collector\venv\`)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] MetaTrader5 library instalada (`import MetaTrader5` funciona)
- [ ] Teste de conexão executado com sucesso (`test_mt5_connection.py`)
- [ ] Conta de teste criada (ou credenciais reais anotadas)
- [ ] ENCRYPTION_KEY gerada e configurada
- [ ] `.env` configurado em `mt5-collector/`

---

## 🚀 Próximo Passo

Depois de tudo instalado:

1. **Testar collector com 1 conta**:
   ```bash
   cd mt5-collector
   python collector_pool.py
   ```

2. **Conectar conta via frontend**:
   - Acessar: `http://localhost:3000/mt5/connect`
   - Preencher dados da conta
   - Verificar logs do collector

3. **Monitorar no dashboard**:
   - Acessar: `http://localhost:3000/mt5/dashboard`
   - Aguardar 30s (primeiro ciclo)
   - Status deve mudar para "Conectado"

---

## 📚 Links Úteis

- **MT5 Documentation**: https://www.mql5.com/en/docs
- **Python MetaTrader5 Docs**: https://www.mql5.com/en/docs/python_metatrader5
- **Forum MetaQuotes**: https://www.mql5.com/en/forum
- **Troubleshooting MT5**: https://www.mql5.com/en/articles

---

**🎉 Após seguir este guia, seu sistema MT5 estará pronto para coletar dados de múltiplas contas!**
