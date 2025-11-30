# 📋 CHECKLIST DE TESTES - PÁGINA DE TRANSPARÊNCIA

**Data:** 2025-11-07
**URL:** https://casuistically-wittiest-elizabeth.ngrok-free.dev/transparency
**Testador:** _____________

---

## 🎯 OBJETIVO

Testar todas as funcionalidades da página de transparência e validar integração com backend + blockchain.

---

## ✅ TESTE 1: CARREGAMENTO INICIAL

### 1.1 Acesso à Página
- [ ] Página carrega sem erros no console
- [ ] Loading inicial aparece ("🔄 Carregando dados da blockchain...")
- [ ] Loading desaparece após buscar dados
- [ ] Não aparecem mensagens de erro

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 2: HEADER E NAVEGAÇÃO

### 2.1 Header
- [ ] Logo iDeepX aparece corretamente
- [ ] Logo é clicável e leva para home (/)
- [ ] Botão "Conectar Carteira" está visível
- [ ] Background gradient aparece corretamente

**Resultado:** ____________________

---

## ✅ TESTE 3: SEÇÃO HERO (TOPO)

### 3.1 Elementos Visuais
- [ ] Ícone de Shield (escudo) azul aparece
- [ ] Título "Transparência Total" está legível
- [ ] Texto descritivo está completo
- [ ] 3 badges aparecem:
  - [ ] "Provas On-Chain" (verde)
  - [ ] "Dados no IPFS" (roxo)
  - [ ] "Imutável" (azul)

**Resultado:** ____________________

---

## ✅ TESTE 4: CARDS DE ESTATÍSTICAS (OVERVIEW)

### 4.1 Card "Total de Provas"
- [ ] Número correto aparece (esperado: 2)
- [ ] Ícone TrendingUp (gráfico) roxo aparece
- [ ] Texto "Provas submetidas desde o início" legível

### 4.2 Card "Status do Sistema"
- [ ] Status aparece como "✅ Ativo"
- [ ] Ícone FileCheck (check) verde aparece
- [ ] Texto "Sistema operacional" legível

### 4.3 Card "Última Semana"
- [ ] Número de usuários aparece (esperado: 5)
- [ ] Ícone Users (pessoas) azul aparece
- [ ] Texto "Usuários ativos na última semana" legível

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 5: INFORMAÇÕES DO RULEBOOK

### 5.1 Seção Rulebook Info
- [ ] Card do Rulebook aparece
- [ ] Nome do plano: "iDeepX MLM Commission Plan"
- [ ] Versão: "1.0.0"
- [ ] IPFS CID completo e correto
- [ ] Endereço do contrato Rulebook
- [ ] Botão "Ver Plano no IPFS" funciona
- [ ] Botão "BSCScan" abre contrato correto

### 5.2 Teste do Link IPFS do Rulebook
**URL esperada:** https://gateway.pinata.cloud/ipfs/bafkreicfkbecmhcrsxq4fvond5xvpiwosj3e7a7emocxhr2clidvgfgbii

- [ ] Link abre em nova aba
- [ ] Arquivo JSON carrega
- [ ] Estrutura do plano de comissões está correta
- [ ] Percentuais MLM estão corretos (L1=8%, L2=3%, etc)

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 6: CARDS DE PROOFS SEMANAIS

### 6.1 Proof #1 (Week 2024-11-11)
- [ ] Card aparece com design correto
- [ ] Ícone de calendário azul visível
- [ ] Título "Semana 1" correto
- [ ] Data formatada corretamente (ex: 11/11/2024)
- [ ] Badge "Finalizado" (verde) aparece
- [ ] Estatísticas exibidas:
  - [ ] **Usuários Ativos:** 5
  - [ ] **Comissões MLM:** $812.50
  - [ ] **Lucro Total Distribuído:** $5,000.00
- [ ] IPFS Hash completo visível
- [ ] Endereço do submitter aparece truncado (ex: 0xEB2451A8...75ef2)

### 6.2 Proof #2 (Proof de teste - pode estar com dados incorretos)
- [ ] Card aparece
- [ ] Dados exibidos (mesmo que incorretos)

**Resultado Proof #1:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 7: BOTÃO "VER DETALHES"

### 7.1 Abrir Modal do Snapshot
**Teste com Proof #1:**

- [ ] Clicar no botão "Ver Detalhes"
- [ ] Modal abre suavemente (overlay escuro)
- [ ] Título do modal correto
- [ ] Botão "X" de fechar visível

### 7.2 Conteúdo do Modal
- [ ] Seção "Resumo da Semana" aparece
- [ ] Seção "Tabela de Usuários" aparece
- [ ] Dados do IPFS carregam corretamente

### 7.3 Tabela de Usuários no Modal
- [ ] Colunas aparecem:
  - [ ] ID
  - [ ] Wallet (truncado)
  - [ ] Lucro
  - [ ] Share Cliente
  - [ ] Comissões MLM
  - [ ] LAI
  - [ ] Recebido Líquido
- [ ] 5 usuários listados
- [ ] Valores formatados como dinheiro ($XXX.XX)
- [ ] Status LAI aparece (✅ ou ❌)

### 7.4 Fechar Modal
- [ ] Clicar no X fecha o modal
- [ ] Clicar fora do modal fecha o modal
- [ ] ESC fecha o modal (testar)

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 8: BOTÃO "IPFS"

### 8.1 Abrir Snapshot no IPFS
**Teste com Proof #1:**

**URL esperada:** https://gateway.pinata.cloud/ipfs/QmcqWceCcqSpAWgvT3FWvzCs9d2noBxMenyGu7SfmYdgtk

- [ ] Clicar no botão "IPFS" (roxo)
- [ ] Abre em nova aba
- [ ] Arquivo JSON carrega
- [ ] Estrutura completa do snapshot visível

### 8.2 Validar Estrutura do Snapshot IPFS
No arquivo JSON carregado, verificar:

- [ ] `version`: "1.0.0"
- [ ] `week`: objeto com número, datas
- [ ] `summary`: totais corretos
  - [ ] totalUsers: 5
  - [ ] totalCommissions: 812.50
  - [ ] totalProfits: 5000.00
- [ ] `rulebook`: referência ao plano
- [ ] `users`: array com 5 usuários
  - [ ] Cada usuário tem wallet, profit, comissões
- [ ] `validation`: checksums presentes

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 9: SEÇÃO "INFORMAÇÕES DOS CONTRATOS"

### 9.1 Card de Informações
- [ ] Card aparece no final da página
- [ ] Título "Informações dos Contratos" legível

### 9.2 Contrato Proof
- [ ] Endereço: 0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa
- [ ] Botão "BSCScan ↗" aparece
- [ ] Link abre testnet.bscscan.com
- [ ] Contrato está verificado no BSCScan

### 9.3 Backend Autorizado
- [ ] Endereço do backend exibido
- [ ] Endereço: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 10: RESPONSIVIDADE

### 10.1 Desktop (1920x1080)
- [ ] Layout de 3 colunas nos cards de stats
- [ ] Proofs em grid 3 colunas
- [ ] Textos legíveis
- [ ] Sem overflow horizontal

### 10.2 Tablet (768px)
- [ ] Layout ajusta para 2 colunas
- [ ] Proofs em grid 2 colunas
- [ ] Botões acessíveis

### 10.3 Mobile (375px)
- [ ] Layout de 1 coluna
- [ ] Proofs em 1 coluna
- [ ] Modal ocupa 100% da tela
- [ ] Tabela de usuários scrollável

**Resultado:** ____________________

---

## ✅ TESTE 11: CONSOLE DO NAVEGADOR

### 11.1 Verificar Erros
**Abrir DevTools (F12) → Console**

- [ ] Nenhum erro JavaScript (vermelho)
- [ ] Warnings aceitáveis (amarelo)
- [ ] Requests de API com status 200
- [ ] Logs de API aparecem:
  - [ ] `🌐 [API] GET http://localhost:5001/api/blockchain/...`
  - [ ] `📥 [API] Resposta: ...`

### 11.2 Network Tab
- [ ] Request para `/api/blockchain/rulebook` → 200
- [ ] Request para `/api/blockchain/proof` → 200
- [ ] Request para `/api/blockchain/proofs?limit=20` → 200
- [ ] Tempo de resposta < 2 segundos

**Resultado:** ____________________

**Print/Observações:**
```


```

---

## ✅ TESTE 12: INTEGRAÇÃO BLOCKCHAIN

### 12.1 Dados Reais da Blockchain
Confirmar que os dados vêm do smart contract:

- [ ] Total de proofs = 2 (confere com contrato)
- [ ] IPFS hash da Proof #1 correto
- [ ] Endereços dos contratos corretos
- [ ] Status "finalized" = true para Proof #1

### 12.2 Links Externos Funcionais
- [ ] Link IPFS Pinata carrega
- [ ] Link BSCScan abre contrato
- [ ] Link IPFS.io também funciona (alternativo)

**Resultado:** ____________________

---

## 📝 RESUMO DOS TESTES

### ✅ Funcionalidades OK:
```
[Liste aqui o que funcionou perfeitamente]




```

### ⚠️ Problemas Encontrados:
```
[Liste bugs, erros ou comportamentos inesperados]




```

### 💡 Melhorias Sugeridas:
```
[Liste sugestões de UX, performance ou features]




```

---

## 🎯 CONCLUSÃO FINAL

**Status Geral:** [ ] ✅ Aprovado  [ ] ⚠️ Com ressalvas  [ ] ❌ Reprovado

**Resumo:**
```





```

**Próximas Ações:**
```
1.
2.
3.
```

---

**Testador:** _____________
**Data:** _____________
**Duração do teste:** _____ minutos
