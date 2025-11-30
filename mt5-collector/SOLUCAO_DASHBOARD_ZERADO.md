# 🎯 SOLUÇÃO: DASHBOARD MOSTRANDO ZEROS

**Data:** 2025-11-19
**Status:** 🔍 PROBLEMA IDENTIFICADO

---

## ❌ PROBLEMA ENCONTRADO

O dashboard mostra US$ 0,00 apesar do banco de dados ter sido atualizado com US$ 0,91.

---

## 🔍 CAUSA RAIZ

**O sistema tem 2 BANCOS DE DADOS DIFERENTES!**

### 📁 Banco CORRETO (atualizado pelo coletor):
```
C:\ideepx-bnb\backend\prisma\dev.db
```
- ✅ Balance: 0.91
- ✅ Equity: 0.91
- ✅ Status: CONNECTED
- ✅ Conta ID: b332e19b-1345-4193-893c-017fa8fcc6e8

### 📁 Banco ERRADO (usado pelo backend):
```
C:\ideepx-bnb\backend\prisma\prisma\dev.db
```
- ❌ Balance: 0
- ❌ Status: PENDING
- ❌ Conta ID: 3713f410-94e0-4f5a-99de-0a053aac1890

---

## 🤔 POR QUE ISSO ACONTECEU?

O Prisma criou uma pasta duplicada `prisma/prisma/` devido a um problema de configuração.

Quando o `.env` tem:
```
DATABASE_URL=file:./prisma/dev.db
```

E o Prisma é executado de dentro da pasta `backend/`, ele pode interpretar como:
```
backend/prisma/prisma/dev.db  ← ERRADO!
```

Em vez de:
```
backend/prisma/dev.db  ← CORRETO!
```

---

## ✅ SOLUÇÃO DEFINITIVA

### 1. Remover pasta duplicada:
```bash
powershell -Command "Remove-Item -Recurse -Force 'C:\ideepx-bnb\backend\prisma\prisma'"
```

### 2. Corrigir DATABASE_URL no `.env`:
```
# De:
DATABASE_URL=file:./prisma/dev.db

# Para:
DATABASE_URL=file:./prisma/dev.db
```

(Parece igual, mas precisa garantir que não há espaços ou caracteres invisíveis)

### 3. Ou usar caminho absoluto (mais seguro):
```
DATABASE_URL=file:C:/ideepx-bnb/backend/prisma/dev.db
```

### 4. Regenerar Prisma Client:
```bash
cd C:\ideepx-bnb\backend
npx prisma generate
```

### 5. Reiniciar backend:
```bash
npm start
```

### 6. Atualizar collector para usar o mesmo banco:
```python
DATABASE_PATH = r"C:\ideepx-bnb\backend\prisma\dev.db"
```

---

## 📊 VERIFICAÇÃO

Após aplicar a solução, testar:

```bash
curl "http://localhost:5001/api/mt5/accounts?walletAddress=0x75d1A8ac59003088c60A20bde8953cBECfe41669"
```

**Resultado esperado:**
```json
{
  "accounts": [{
    "id": "b332e19b-1345-4193-893c-017fa8fcc6e8",
    "balance": "0.91",
    "equity": "0.91",
    "status": "CONNECTED"
  }]
}
```

---

## 🎯 PRÓXIMOS PASSOS

Após corrigir:

1. ✅ Dashboard mostrará US$ 0,91
2. ✅ Atualizar `collect_all_accounts.py` com decriptação AES-256-CBC
3. ✅ Iniciar coletor em background
4. ✅ Dados atualizarão em tempo real a cada 30 segundos

---

## 📝 LIÇÕES APRENDIDAS

- **SEMPRE use caminhos absolutos** em DATABASE_URL para evitar ambiguidade
- **Verificar se existem bancos duplicados** quando API retorna dados diferentes do esperado
- **Prisma pode criar pastas duplicadas** se executado de diretórios incorretos
- **Python e Node.js precisam apontar para o MESMO arquivo** de banco de dados

---

## 🚨 ATENÇÃO

**NÃO** executar `npx prisma migrate` ou `npx prisma db push` antes de corrigir o DATABASE_URL, pois isso pode criar MAIS bancos duplicados!

---

**Arquivo de referência:** `C:\ideepx-bnb\mt5-collector\SOLUCAO_DASHBOARD_ZERADO.md`
