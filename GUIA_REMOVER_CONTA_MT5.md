# 🗑️ GUIA: Remover Conta do MetaTrader 5

## ⚠️ PROBLEMA

Quando você deleta uma conta do sistema iDeepX, ela é removida do **banco de dados**, mas o **MetaTrader 5 desktop** continua com ela configurada. Isso causa o comportamento de "alternância" entre contas que você está vendo.

---

## 📋 SINTOMAS

- MT5 fica alternando entre GMI Edge e Doo Prime
- Navigator mostra 2 contas configuradas
- Mesmo após deletar do banco, MT5 ainda tenta conectar

---

## ✅ SOLUÇÃO: Remover Manualmente do MT5

### MÉTODO 1: Via Interface do MT5 (RECOMENDADO)

**1. Abra o MetaTrader 5**

**2. Vá para o Navigator (painel esquerdo)**
   - Se não estiver visível: Menu `View` → `Navigator` (ou Ctrl+N)

**3. Expanda "Accounts"**
   - Você verá as contas configuradas:
     - ✅ GMI3-Real → 32650016
     - ❌ DooTechnology-Live → 9941739 (esta que você quer remover)

**4. Remover a conta indesejada:**
   ```
   Clique com botão DIREITO na conta → Delete
   ```

   ![Exemplo]
   ```
   Accounts
   ├─ GMI3-Real
   │  └─ 32650016: PAOLA... (mantém esta)
   └─ DooTechnology-Live
      └─ 9941739: Luiz... (DELETE esta)
          └─ [Botão direito] → Delete
   ```

**5. Confirme a remoção**
   - MT5 pedirá confirmação
   - Clique "Yes" ou "OK"

**6. Verifique:**
   - Navigator agora deve mostrar APENAS a conta GMI Edge
   - MT5 não vai mais alternar entre contas

---

### MÉTODO 2: Via Menu File (Alternativo)

**1. No MT5, vá em:**
   ```
   Menu File → Open an Account
   ```

**2. Na janela que abre:**
   - Você verá lista de servidores/contas
   - Localize "DooTechnology-Live"
   - Clique com botão direito → Delete

**3. Feche a janela**

---

### MÉTODO 3: Deletar Arquivos de Configuração (Avançado)

⚠️ **CUIDADO:** Este método apaga TODAS as configurações do MT5!

**1. Feche completamente o MT5**

**2. Localize a pasta de dados:**
   ```
   Windows:
   C:\Users\[SeuUsuário]\AppData\Roaming\MetaQuotes\Terminal\[código-instalação]\
   ```

**3. Dentro da pasta, localize:**
   ```
   config/
   └─ accounts/
      ├─ GMI3-Real/
      │  └─ 32650016.dat  (mantém)
      └─ DooTechnology-Live/
         └─ 9941739.dat  (DELETE esta pasta inteira)
   ```

**4. Delete a pasta `DooTechnology-Live` completa**

**5. Reinicie o MT5**
   - Conta será removida permanentemente

---

## 🎯 RESULTADO ESPERADO

Após seguir qualquer um dos métodos acima:

**ANTES:**
```
Navigator - Accounts
├─ GMI3-Real
│  └─ 32650016: PAOLA FRASSINETTI...
└─ DooTechnology-Live
   └─ 9941739: Luiz Carlos... ← ALTERNANDO
```

**DEPOIS:**
```
Navigator - Accounts
└─ GMI3-Real
   └─ 32650016: PAOLA FRASSINETTI... ← ÚNICA CONTA
```

---

## 💡 COMPORTAMENTO NORMAL DO MT5

### Por que o MT5 alterna entre contas?

O MetaTrader 5 **não pode** conectar múltiplas contas do mesmo tipo simultaneamente. Quando você tem 2 contas configuradas:

1. MT5 tenta conectar Conta A
2. Conta A conecta com sucesso
3. Após X segundos, MT5 tenta conectar Conta B
4. Para conectar B, desconecta A
5. Ciclo se repete: A → B → A → B...

**Isso é comportamento padrão do MT5 quando há múltiplas contas configuradas!**

---

## 🔄 FLUXO COMPLETO: Trocar de Conta

Quando você quiser trocar de conta no sistema iDeepX:

### ✅ JEITO CORRETO (com esta implementação):

**1. Remover conta antiga do MT5 PRIMEIRO:**
   ```
   MT5 Navigator → Accounts → DooTechnology-Live
   → Botão direito → Delete
   ```

**2. Conectar nova conta via Dashboard:**
   ```
   http://localhost:3000/mt5/connect
   → Selecionar nova broker/servidor
   → Conectar
   ```

**3. Sistema automaticamente:**
   - Deleta conta antiga do banco de dados ✅
   - Deleta 37 snapshots antigos ✅
   - Deleta credenciais antigas ✅
   - Cria nova conta no banco ✅

**4. Conectar nova conta no MT5:**
   ```
   MT5 → File → Login to Trade Account
   → Inserir dados da nova conta
   ```

**5. Resultado:**
   - 1 conta no banco de dados ✅
   - 1 conta no MT5 ✅
   - Sem alternância ✅

---

## ❌ PROBLEMA ATUAL (sem remover do MT5)

Se você **NÃO** remover do MT5:

```
Banco de Dados:     MT5 Desktop:
└─ GMI Edge ✅      ├─ GMI Edge ✅
                    └─ Doo Prime ❌ (órfã - sem dados no banco)
                        └─ CAUSA ALTERNÂNCIA
```

**Resultado:**
- MT5 fica alternando entre as duas
- Doo Prime não tem dados no banco
- Sistema só coleta dados da GMI Edge
- Confusão e instabilidade

---

## ✅ SOLUÇÃO DEFINITIVA

**SEMPRE que trocar de conta:**

1. **PRIMEIRO:** Remover conta antiga do MT5 manualmente
2. **DEPOIS:** Conectar nova conta via dashboard
3. **RESULTADO:** 1 conta em ambos os lugares (sincronizado)

---

## 🔧 AUTOMATIZAÇÃO (FUTURO)

**Atualmente:** Não é possível deletar conta do MT5 automaticamente via API/código

**No futuro, podemos:**
- Criar script Python que manipula arquivos de config do MT5
- Fechar MT5, deletar arquivos .dat, reabrir MT5
- Mas isso é arriscado e pode corromper configurações

**Recomendação:** Por enquanto, manter processo manual (é mais seguro)

---

## 📞 SUPORTE

Se após seguir este guia o problema persistir:

**Verifique:**
1. MT5 foi completamente fechado e reaberto?
2. Apenas 1 conta aparece no Navigator?
3. Banco de dados tem apenas 1 conta? (execute `node list-mt5-accounts.cjs`)

**Se ainda alternar:**
- Pode ter múltiplas instâncias do MT5 rodando
- Verifique Task Manager (Ctrl+Shift+Esc)
- Finalize todos os processos "terminal64.exe"
- Reabra MT5

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────────────────┐
│           ANTES (Problema)                          │
├─────────────────────────────────────────────────────┤
│ DATABASE          MT5 DESKTOP                       │
│ ✅ GMI Edge       ✅ GMI Edge                        │
│                   ❌ Doo Prime (órfã)                │
│                      └─ CAUSA ALTERNÂNCIA           │
└─────────────────────────────────────────────────────┘

              ↓ DELETE do MT5 (manual)

┌─────────────────────────────────────────────────────┐
│           DEPOIS (Resolvido)                        │
├─────────────────────────────────────────────────────┤
│ DATABASE          MT5 DESKTOP                       │
│ ✅ GMI Edge       ✅ GMI Edge                        │
│                                                      │
│                   SEM ALTERNÂNCIA ✅                 │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ AÇÃO IMEDIATA

**Para resolver AGORA:**

1. Abra o MetaTrader 5
2. No Navigator, encontre "DooTechnology-Live"
3. Clique com botão direito na conta 9941739
4. Selecione "Delete"
5. Confirme a remoção
6. Pronto! Alternância vai parar

**Tempo necessário:** < 1 minuto ⏱️

---

## 📝 NOTA FINAL

Este comportamento é **normal do MetaTrader 5** e não é um bug do sistema iDeepX. O MT5 foi projetado para gerenciar múltiplas contas, mas não para conectá-las simultaneamente.

Nossa implementação de "1 conta por usuário" no banco de dados está **correta** ✅. Apenas precisamos manter o MT5 sincronizado removendo contas antigas manualmente.

---

**Última atualização:** 2025-11-19
**Autor:** Claude Code (documentando solução)
