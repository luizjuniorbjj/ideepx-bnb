# 📚 Patterns Library - iDeepX

Esta pasta contém padrões de código reutilizáveis e soluções documentadas do projeto iDeepX.

---

## 📋 Índice de Padrões

### 🎯 [MT5 Integration Pattern](./mt5-integration-pattern.md)
**Status:** ✅ Produção (testado e aprovado)
**Última atualização:** 2025-11-19

**Resumo:**
- Integração completa MetaTrader 5 em aplicação Next.js + Express + Prisma
- Auto-collector com atualização a cada 30 segundos
- Ferramentas profissionais de gerenciamento
- Sistema de criptografia AES-256-CBC para credenciais
- Suporte a múltiplos brokers (Doo Prime, GMI Edge)

**Quando usar:**
- ✅ Integrar plataformas de trading (MT4, MT5, cTrader)
- ✅ Criar sistema de copy trading
- ✅ Dashboard de performance de contas
- ✅ Conectar múltiplos brokers

**Quando NÃO usar:**
- ❌ Trading algorítmico de alta frequência
- ❌ Execução direta de ordens (use API broker oficial)
- ❌ Dados tick-by-tick

**Resultado comprovado:**
- Dashboard funcional com dados reais (US$ 9.947,89, 12 trades)
- Background collector rodando 24/7
- Sincronização automática sem intervenção manual

---

## 🎯 Como Usar Esta Biblioteca

### Para Implementar um Padrão:

1. **Leia o arquivo completo** do padrão
2. **Siga o checklist** de implementação
3. **Adapte** conforme necessário para seu contexto
4. **Teste** cada fase antes de prosseguir

### Para Criar um Novo Padrão:

1. **Crie um arquivo** `.md` nesta pasta
2. **Use o template** do mt5-integration-pattern.md como referência
3. **Documente:**
   - Problema que resolve
   - Arquitetura da solução
   - Código completo (copy-paste ready)
   - Problemas comuns e soluções
   - Checklist de implementação
   - Lições aprendidas
4. **Atualize** este README com link e resumo

---

## 📊 Template de Padrão (Estrutura Sugerida)

```markdown
# 🎯 PADRÃO: [Nome do Padrão]

**Autor:** [Seu nome]
**Data:** [Data]
**Status:** [✅ Testado / 🔄 Em desenvolvimento / ❌ Deprecated]
**Contexto:** [Projeto onde foi usado]

---

## 📋 RESUMO EXECUTIVO
[O que este padrão resolve em 2-3 parágrafos]

## 🏗️ ARQUITETURA DA SOLUÇÃO
[Diagrama ASCII art da arquitetura]

## 🗄️ SCHEMA / ESTRUTURA DE DADOS
[Schema Prisma, TypeScript interfaces, etc]

## 🔧 CÓDIGO COMPLETO
[Código copy-paste ready, bem comentado]

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES
[Lista de erros encontrados e como resolver]

## ✅ CHECKLIST DE IMPLEMENTAÇÃO
[Passo a passo para implementar]

## 🎓 LIÇÕES APRENDIDAS
[O que funcionou, o que não funcionou, insights]

## 🔗 REFERÊNCIAS ÚTEIS
[Links relevantes]

---

**Última atualização:** [Data]
**Status:** [Status atual]
**Próximo passo:** [O que vem depois]
```

---

## 🚀 Roadmap de Novos Padrões

### Planejados:
- [ ] **Smart Contract MLM Pattern** - Sistema de distribuição multi-nível on-chain
- [ ] **Copy Trading Automation Pattern** - Replicação automática de ordens entre contas
- [ ] **Blockchain Analytics Dashboard Pattern** - Visualização de dados blockchain
- [ ] **Web3 Authentication Pattern** - Login com wallet (MetaMask, WalletConnect)
- [ ] **Performance Fee Distribution Pattern** - Distribuição automatizada de fees

### Em Desenvolvimento:
- 🔄 MT5 Integration Pattern (adicionando coleta real de dados Python)

---

## 📞 Manutenção

**Responsável:** Claude Code + Usuário
**Frequência de atualização:** Sempre que um novo padrão for criado ou testado
**Critério de qualidade:** Apenas padrões TESTADOS em produção são aceitos

---

## 🎯 Princípios desta Biblioteca

1. **Copy-Paste Ready** - Código deve funcionar imediatamente
2. **Bem Documentado** - Comentários em português, explicações claras
3. **Testado em Produção** - Apenas soluções comprovadas
4. **Adaptável** - Fácil de customizar para outros contextos
5. **Completo** - Inclui problemas comuns e soluções

---

_Esta biblioteca é um recurso vivo do projeto iDeepX e evolui conforme novos padrões são descobertos e validados._
