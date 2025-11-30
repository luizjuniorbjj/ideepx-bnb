# 📌 Pinata - Guia Rápido Visual

**Upload do Frontend iDeepX em 5 Passos**

---

## 🎯 **USE: FOLDER UPLOAD** ✅

```
❌ File Upload      → Para arquivos únicos (PDF, imagem)
✅ FOLDER UPLOAD    → Para sites completos (ESCOLHA ESTA!)
❌ Import from IPFS → Para copiar de outro IPFS
```

---

## 🚀 **5 PASSOS SIMPLES**

### **1️⃣ BUILD**
```bash
cd C:\ideepx-bnb\frontend
npm run build:pinata
```

### **2️⃣ ACESSE PINATA**
```
https://app.pinata.cloud
```
(Crie conta grátis se não tiver)

### **3️⃣ UPLOAD**

**Interface do Pinata:**
```
┌─────────────────────────────┐
│  [Upload ▼]                 │  ← Clique aqui
│    ├─ File                  │
│    ├─ Folder    ←── ESTA!  │  ← Escolha "Folder"
│    └─ Import from IPFS      │
└─────────────────────────────┘
```

### **4️⃣ SELECIONE ARQUIVOS**

⚠️ **IMPORTANTE:** Selecione os **ARQUIVOS DENTRO** de `out/`, NÃO a pasta `out/` em si!

**Correto:**
```
1. Abra Explorer/Finder
2. Vá em: C:\ideepx-bnb\frontend\out
3. ENTRE na pasta out/
4. Selecione TUDO (Ctrl + A)
5. Arraste para Pinata
```

**OU:**

```
1. Clique "Folder" no Pinata
2. Navegue até: C:\ideepx-bnb\frontend\out
3. ENTRE na pasta
4. Selecione todos arquivos
5. Abrir/Select
```

### **5️⃣ CONFIGURAR**

```
Nome: ideepx-frontend-v1.0

Tags: frontend, ideepx, v1.0

[Upload] ← Clique
```

**Aguarde upload (2-5 min)**

---

## ✅ **RESULTADO**

```
✓ Successfully pinned!

📌 CID: QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
   ↑
   COPIE ESTE!
```

**Acesse:**
```
https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

---

## 📊 **ESTRUTURA ESPERADA NO PINATA**

Após upload, você deve ver:

```
ideepx-frontend-v1.0/
├── index.html          ✅
├── _next/              ✅
│   └── static/
├── favicon.ico         ✅
└── ...
```

**NÃO DEVE TER:** `out/index.html` ❌

---

## 🎨 **VISUAL DO PROCESSO**

```
┌─────────────────────────────────────────┐
│ 1. BUILD                                │
│    C:\ideepx-bnb\frontend\              │
│    npm run build:pinata                 │
│    → Gera pasta out/                    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. PINATA                               │
│    https://app.pinata.cloud             │
│    Click [Upload] → Folder              │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. SELECIONAR                           │
│    Arquivos DENTRO de out/              │
│    (Ctrl+A → Arrastar)                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. NOME                                 │
│    ideepx-frontend-v1.0                 │
│    [Upload]                             │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. CID                                  │
│    QmXxXxXxXxXxXxXxXxXxXxXxXxXxXx       │
│    COPIAR e SALVAR!                     │
└─────────────────────────────────────────┘
```

---

## 🔍 **COMO VERIFICAR SE ESTÁ CORRETO**

Após upload, acesse:
```
https://gateway.pinata.cloud/ipfs/SEU_CID
```

**Deve mostrar:**
- ✅ Seu site iDeepX carregando
- ✅ Logo e estilos aparecem
- ✅ WalletConnect funciona
- ✅ URL termina com `/` (não `/index.html`)

**NÃO deve mostrar:**
- ❌ Listagem de arquivos
- ❌ 404 Not Found
- ❌ Blank page

---

## 🎯 **PRÓXIMA VERSÃO**

Quando atualizar o site:

```bash
# 1. Rebuild
npm run build:pinata

# 2. Upload novamente no Pinata
# (repetir processo)

# 3. Novo CID
v1.0: QmABC123...
v1.1: QmDEF456...  ← Novo!

# 4. Atualizar DNS (se tiver custom domain)
```

---

## ⚡ **AUTOMAÇÃO (Opcional)**

Para uploads automáticos, veja:
👉 **PINATA_UPLOAD_GUIDE.md** (método CLI)

---

**🎉 Isso é tudo! Simples assim!**

**Dúvidas?** Consulte `PINATA_UPLOAD_GUIDE.md` para guia completo.

**Criado:** 2025-11-02
