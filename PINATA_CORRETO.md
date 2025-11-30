# 📌 UPLOAD CORRETO NO PINATA

## ⚠️ PROBLEMA

Você enviou a pasta ERRADA:
```
❌ C:\ideepx-bnb  (raiz do projeto - código-fonte)
```

## ✅ SOLUÇÃO

Envie a pasta CORRETA:
```
✅ C:\ideepx-bnb\frontend\out  (build estático pronto)
```

---

## 🚀 PASSO A PASSO CORRETO

### 1️⃣ Acesse Pinata
```
URL: https://pinata.cloud
```

### 2️⃣ Novo Upload
- Clique em **"Upload"** (botão roxo)
- Selecione **"Folder"** (não File, não ZIP)

### 3️⃣ IMPORTANTE: Selecionar a pasta CORRETA

**No Windows Explorer que abrir:**

1. Navegue até:
   ```
   C:\ideepx-bnb\frontend\out
   ```

2. Abra a pasta `out`

3. **Selecione TODOS os arquivos DENTRO dela**:
   - index.html
   - Pasta _next
   - Pasta dashboard
   - Pasta register
   - Pasta network
   - Pasta transfer
   - Pasta withdraw
   - Pasta admin
   - Pasta 404
   - 404.html
   - index.txt

4. Clique em **"Selecionar Pasta"** ou **"Upload"**

**OU (mais fácil):**

Selecione a própria pasta `out` e faça upload dela inteira.

### 4️⃣ Configurações (Opcional)

- **Name:** ideepx-frontend
- **Gateway:** Deixe o padrão

Clique em **"Upload"**

### 5️⃣ Aguardar

- Upload: ~2-5 minutos (6.6 MB)
- Barra de progresso vai mostrar status

### 6️⃣ Copiar CID

Quando terminar, você verá:

```
✅ Upload Successful!

CID: QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx

Gateway URL: https://gateway.pinata.cloud/ipfs/QmXxXxXx...
```

**Copie o CID!**

---

## 🌐 ACESSAR SEU dAPP

Depois do upload, seu site estará em:

### Gateway Pinata (Mais rápido):
```
https://gateway.pinata.cloud/ipfs/SEU_CID
```

### IPFS Público:
```
https://SEU_CID.ipfs.dweb.link
```

### IPFS.io:
```
https://ipfs.io/ipfs/SEU_CID
```

---

## ✅ COMO VERIFICAR SE DEU CERTO

Quando acessar o link, você deve ver:

1. ✅ **Landing page** do iDeepX (logo, "Conectar Carteira", etc)
2. ✅ Sem erros 404
3. ✅ Consegue navegar para /dashboard, /register, etc
4. ✅ Botão "Conectar Carteira" funciona (MetaMask abre)

---

## 🆘 SE DER ERRO

### "404 Not Found"
❌ Problema: Upload da pasta errada
✅ Solução: Fazer upload da pasta `out/` conforme acima

### "Index of /"
❌ Problema: Faltou o index.html na raiz
✅ Solução: Certifique-se de que `index.html` está na raiz do upload

### Assets não carregam (imagens quebradas)
❌ Problema: Caminhos relativos
✅ Solução: (já foi configurado no build anterior, deve funcionar)

---

## 📦 ALTERNATIVA: ZIP (Não recomendado)

Se preferir ZIP:

```
Arquivo: C:\ideepx-bnb\frontend\ideepx-frontend.zip
```

Mas lembre-se: **ZIP não funciona como site!**
- O browser não descompacta automaticamente
- Você terá que baixar e extrair manualmente
- Não serve para distribuir como dApp

**Use upload de PASTA!**

---

## 🎯 PRÓXIMOS PASSOS

Depois do upload correto:

1. ✅ Acesse o link do gateway
2. ✅ Teste conectar MetaMask (BSC Mainnet)
3. ✅ Teste registrar um usuário
4. ✅ Teste ativar assinatura
5. ✅ Compartilhe o link com usuários

---

**Boa sorte! 🚀**
