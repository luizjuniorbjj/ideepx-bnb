# 🎭 Setup de Humanização - Frontend

Este documento explica como ativar as configurações de ESLint/Prettier com suporte a humanização.

---

## 📋 O QUE FOI CRIADO

### Arquivos de Configuração:

1. **`.eslintrc.humanization.js`**
   - Regras ESLint diferenciadas por criticidade
   - 🔴 Código crítico: Rigoroso
   - 🟡 Código importante: Moderado
   - 🟢 Código normal: Flexível

2. **`.prettierrc.humanization.js`**
   - Formatação adaptativa
   - Código crítico: Formatação estrita
   - Código humanizado: Formatação flexível

3. **`.prettierignore.humanization`**
   - Lista de arquivos que podem ter estilo customizado
   - Prettier não reformata automaticamente

---

## 🚀 COMO ATIVAR

### Opção 1: Substituir Configurações Atuais (Recomendado)

```bash
cd frontend

# Fazer backup das configurações atuais
mv .eslintrc.json .eslintrc.json.backup 2>/dev/null || true
mv .prettierrc .prettierrc.backup 2>/dev/null || true
mv .prettierignore .prettierignore.backup 2>/dev/null || true

# Ativar configurações de humanização
cp .eslintrc.humanization.js .eslintrc.js
cp .prettierrc.humanization.js .prettierrc.js
cp .prettierignore.humanization .prettierignore

echo "✅ Configurações de humanização ativadas!"
```

### Opção 2: Teste Lado-a-Lado

```bash
cd frontend

# Testar em arquivo específico
npx eslint --config .eslintrc.humanization.js app/page.tsx
npx prettier --config .prettierrc.humanization.js --check app/page.tsx

# Se OK, ativar permanentemente (Opção 1)
```

---

## 🔍 VALIDAÇÃO

### Testar Regras de Código Crítico

```bash
# Deve FALHAR com erros (regras rigorosas)
npx eslint lib/contracts.ts

# Exemplos de erros esperados:
# - TODO comments não permitidos
# - console.log bloqueado
# - == ao invés de === é erro
```

### Testar Regras de Código Humanizado

```bash
# Deve PASSAR com warnings leves ou nenhum erro
npx eslint app/page.tsx

# Permitido:
# - TODOs informativos
# - console.log (removido em build)
# - == ocasional
```

---

## 📊 ARQUIVOS POR CATEGORIA

### 🔴 Crítico - Regras Rigorosas

```
lib/siwe.ts
lib/contracts.ts
hooks/useContract.ts
hooks/useProofs.ts
app/withdraw/**/*.tsx
components/WithdrawForm.tsx
```

**Regras:**
- ❌ TODOs proibidos
- ❌ console.log bloqueado
- ✅ Apenas `===` (nunca `==`)
- ✅ TypeScript estrito

### 🟡 Importante - Regras Moderadas

```
app/dashboard/**/*.tsx
app/mt5/dashboard/**/*.tsx
components/DashboardStats.tsx
components/MT5SummaryCard.tsx
```

**Regras:**
- ⚠️ TODOs permitidos (com warning)
- ⚠️ console.log avisa
- ⚠️ Prefere `===`, tolera `==`

### 🟢 Normal - Humanização Permitida

```
app/page.tsx
app/layout.tsx
components/Logo.tsx
components/ConnectButton.tsx
app/simulations/**/*.tsx
```

**Regras:**
- ✅ TODOs permitidos
- ✅ console.log permitido
- ✅ `==` ou `===` (escolha livre)
- ✅ Estilo customizado

---

## 🛠️ COMANDOS ÚTEIS

### Verificar Todo o Projeto

```bash
# Rodar ESLint em tudo
npm run lint

# Verificar formatação Prettier
npx prettier --check "**/*.{ts,tsx,js,jsx}"
```

### Corrigir Automaticamente (cuidado!)

```bash
# ESLint fix (apenas warnings)
npx eslint --fix "**/*.{ts,tsx}"

# Prettier format (pode quebrar humanização!)
# CUIDADO: Só rodar em código crítico
npx prettier --write "lib/**/*.ts"
npx prettier --write "hooks/useContract.ts"
```

### Verificar Arquivo Específico

```bash
# Qual configuração está sendo aplicada?
npx eslint --print-config app/page.tsx

# Ver apenas erros (não warnings)
npx eslint app/page.tsx --quiet
```

---

## ⚙️ INTEGRAÇÃO COM VSCode

### Configuração Recomendada

Criar `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": false, // não formatar automaticamente

  // Formatar apenas código crítico
  "[typescript]": {
    "editor.formatOnSave": false
  },

  // ESLint auto-fix em save (só warnings)
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // Prettier - manual apenas
  "prettier.requireConfig": true,

  // Associar arquivos .humanization com suas extensões
  "files.associations": {
    ".eslintrc.humanization.js": "javascript",
    ".prettierrc.humanization.js": "javascript"
  }
}
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Parsing error: Cannot find module '@typescript-eslint/parser'"

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Prettier está reformatando arquivos humanizados

```bash
# Verificar se .prettierignore está ativo
cat .prettierignore

# Deve conter app/page.tsx, etc
```

### ESLint não está usando configuração de humanização

```bash
# Verificar qual config está ativa
npx eslint --print-config app/page.tsx | grep "humanization"

# Se não aparecer, verificar se arquivo existe
ls -la .eslintrc.*
```

---

## 📚 REFERÊNCIAS

- **HUMANIZATION_GUIDE.md** - Lista completa de arquivos por categoria
- **PROJECT_RULES.md** - Seção 0 e 0.1 (Diretivas de Humanização)
- **ESLint Docs**: https://eslint.org/docs/latest/use/configure/
- **Prettier Docs**: https://prettier.io/docs/en/configuration.html

---

## ✅ CHECKLIST DE ATIVAÇÃO

Antes de considerar setup completo:

- [ ] `.eslintrc.humanization.js` copiado para `.eslintrc.js`
- [ ] `.prettierrc.humanization.js` copiado para `.prettierrc.js`
- [ ] `.prettierignore.humanization` copiado para `.prettierignore`
- [ ] `npm run lint` executado sem erros críticos
- [ ] Testado em arquivo crítico (lib/contracts.ts) - regras rigorosas
- [ ] Testado em arquivo humanizado (app/page.tsx) - regras flexíveis
- [ ] VSCode configurado (opcional)
- [ ] Time treinado em diferenças de regras

---

**Última atualização:** 2025-11-19
**Versão:** 1.0
**Status:** ✅ Pronto para uso
