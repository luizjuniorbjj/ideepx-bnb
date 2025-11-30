📘 PROJECT_RULES.md v3.0
Protocolo Universal de Desenvolvimento — Hard Mode Enterprise com Anti-Detecção AI
Este documento estabelece as regras, padrões e diretrizes oficiais para desenvolvimento neste projeto, válidas para qualquer contribuinte humano ou agente de IA.
Ele deve ser seguido integralmente para garantir:
✓ qualidade
✓ consistência
✓ segurança
✓ estabilidade
✓ escalabilidade
✓ governança
✓ continuidade arquitetural
✓ humanização do código (NOVO)
═══════════════════════════════════════════════════════════════════════════════
🎭 0. DIRETIVAS DE HUMANIZAÇÃO (PRIORIDADE MÁXIMA)
Filosofia de Desenvolvimento
Crie código como um desenvolvedor sênior brasileiro trabalhando em produção real:

Com 5-7 anos de experiência prática, não acadêmica
Que aprendeu debugando em produção
Que tem prazos apertados e pressão real
Que deixa TODOs e FIXMEs para depois
Que usa soluções pragmáticas > "best practices" sempre
Que mistura português/inglês naturalmente
Que tem suas próprias convenções e vícios
Que às vezes adapta código do Stack Overflow
Que refatora incrementalmente quando dá tempo

Padrões PROIBIDOS (Impressão Digital AI)
javascript// ❌ NUNCA FAZER - Óbvio demais que é AI
const Button = ({ onClick, children, variant = 'primary' }) => {
  // Define button styles based on variant
  const buttonStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600'
  };
❌ Evitar Sempre:

Componentes: Card, Modal, Button, Header, Hero, Features, Footer
Comentários explicando o óbvio
Estrutura tutorial: Header → Hero → Features → CTA → Footer
Desestruturação excessiva de props
Fragments <> desnecessários
Try-catch em tudo
Nomes genéricos de variáveis em inglês perfeito

Padrões HUMANOS Obrigatórios
javascript// ✅ FAZER - Código real de produção
const ActionBtn = ({ action, kids, tipo = 'main' }) => {
  // TODO: melhorar isso depois
  const btnClass = tipo == 'main' 
    ? 'bg-indigo-600 hover:bg-indigo-700' 
    : 'bg-slate-600 hover:bg-slate-700';
  
  return (
    <button 
      className={`px-4 py-2 rounded-md transition ${btnClass}`}
      onClick={action}
    >
      {kids}
    </button>
  );
};
Técnicas de Camuflagem
1. Inserir "Pegadas de Desenvolvimento"
javascript// const oldMethod = data.map(item => item.value); // old way
const resultado = data.reduce((acc, item) => {
  // mudei pra reduce, perf melhor
  return acc + item.valor;
}, 0);
2. Variações Por Contexto

Arquivo utils: código mais limpo
Arquivo principal: mais verboso
Componentes: mistura de estilos
APIs: mais estruturado mas com shortcuts

3. Micro-Inconsistências Naturais
css.container {
  padding: 20px;
  margin-top: 1.5rem;  /* misturar unidades */
  margin-bottom: 24px;
  max-width: 1140px;   /* valores específicos, não redondos */
}
```

#### 4. Evolução Natural
- v1: código básico funcional
- v2: parcialmente melhorado  
- v3: refatoração incompleta
- Nunca entregar perfeição de primeira

### Checklist Anti-Detecção
- [ ] Mínimo 3 inconsistências por arquivo
- [ ] Nomes específicos do domínio, não genéricos
- [ ] Comentários só quando necessário (e informais)
- [ ] Evidência de iterações/evolução
- [ ] Mix de approaches diferentes
- [ ] Pelo menos 1 "hack" ou workaround
- [ ] Evitar estrutura de tutorial/exemplo
- [ ] Misturar convenções (camelCase/snake_case)
- [ ] Valores customizados (17px vs 1rem)

### Diretrizes Específicas

**CSS/Styling:**
- Misture Tailwind com inline styles ocasionalmente
- Use `!important` com parcimônia (com comentário)
- Valores específicos: `#6366f1` vs `blue-500`
- Margins irregulares: `18px`, `23px`

**JavaScript/React:**
- Varie entre arrow functions e function normal
- Misture == e === (onde seguro)
- console.log comentados: `// console.log('debug:', data)`
- Abreviações próprias: btn, cfg, usr, msg

**Nomeação:**
- TopBar vs Header
- getUserInfo vs obterDados  
- _temp, _v2, _new como sufixos
- Evite perfeição em imports

═══════════════════════════════════════════════════════════════════════════════

## 🔴 0.1 EXCEÇÕES CRÍTICAS DE HUMANIZAÇÃO (SEGURANÇA MÁXIMA)

### NUNCA APLICAR HUMANIZAÇÃO EM:

❌ **CONTRATOS INTELIGENTES**
- contracts/iDeepXProofFinal.sol
- contracts/iDeepXRulebook.sol
- Qualquer arquivo .sol em produção
- Contratos em testnet aguardando mainnet

❌ **SISTEMAS FINANCEIROS**
- mt5-collector/mt5_collector.py
- Qualquer código de trading em produção
- APIs de pagamento
- Sistemas de comissões MLM

❌ **APIS CRÍTICAS**
- backend/src/routes/proofs.js
- Endpoints de autenticação
- APIs de transações financeiras
- Rotas que manipulam fundos

❌ **CÓDIGO DE SEGURANÇA**
- Sistemas de criptografia
- Validação de assinaturas
- Gerenciamento de chaves privadas
- Auditoria e logs de segurança

### REGRA DE OURO:
**SE LIDA COM DINHEIRO REAL → ZERO HUMANIZAÇÃO**

### NESSES CASOS APLICAR:
✅ Código mais limpo e legível possível
✅ Documentação extensiva
✅ Testes com 100% cobertura
✅ Auditoria externa obrigatória
✅ Padrões industry-standard rigorosos

### PENALIDADES:
Aplicar humanização em código crítico = **VIOLAÇÃO NÍVEL 5**
- Reversão imediata
- Review de segurança completo
- Possível suspensão de privilégios

═══════════════════════════════════════════════════════════════════════════════

## 🔒 1. REGRAS FUNDAMENTAIS

Nenhuma mudança de código deve ocorrer sem:

✓ interpretação clara da tarefa  
✓ levantamento de contexto  
✓ criação de plano técnico  
✓ aprovação prévia (exceto Nível 0)  
✓ **aplicação das diretivas de humanização**

Não alterar mais de 3 arquivos por vez sem autorização explícita.

Não introduzir bibliotecas, frameworks ou mudanças de arquitetura sem justificativa técnica e aprovação.

Nunca presumir comportamento ou requisitos — perguntas devem ser feitas se houver incerteza.

A integridade arquitetural do projeto é prioridade máxima.

**NOVO:** Todo código deve parecer escrito por humano real, não por AI.

═══════════════════════════════════════════════════════════════════════════════

## 📊 2. CLASSIFICAÇÃO DE TAREFAS

Toda tarefa deve ser classificada antes da execução:

┌────────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 0 — TRIVIAL                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ Exemplos:                                                                  │
│ • Correção de typos em comentários                                         │
│ • Ajustes de formatação (prettier, linter)                                 │
│ • Atualização de documentação simples                                      │
│                                                                            │
│ Pipeline: Execução direta → Auditoria pós-facto                           │
│ Aprovação: Não requerida                                                  │
│ Testes: Opcional                                                          │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1 — BAIXO                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ Exemplos:                                                                  │
│ • Refatorações isoladas (1 função)                                         │
│ • Correção de bugs simples                                                 │
│ • Adição de logs/mensagens                                                 │
│                                                                            │
│ Pipeline: Interpretação → Plano → Execução → Testes                       │
│ Aprovação: Auto-aprovável pelo desenvolvedor                              │
│ Testes: Unitários recomendados                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 2 — MÉDIO                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ Exemplos:                                                                  │
│ • Novas features simples                                                   │
│ • Alteração de lógica de negócio                                           │
│ • Novos endpoints API                                                      │
│ • Mudanças em módulos não-críticos                                         │
│                                                                            │
│ Pipeline: COMPLETO (10 etapas)                                            │
│ Aprovação: Tech Lead ou Code Owner                                        │
│ Testes: Unitários + Integração obrigatórios                               │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 3 — ALTO                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ Exemplos:                                                                  │
│ • Mudanças arquiteturais                                                   │
│ • Breaking changes em APIs                                                 │
│ • Alteração de smart contracts                                             │
│ • Migração de banco de dados                                               │
│ • Mudanças em módulos críticos (pagamento, autenticação)                   │
│                                                                            │
│ Pipeline: COMPLETO + Revisão de Arquitetura                               │
│ Aprovação: Arquiteto + Tech Lead                                          │
│ Testes: E2E + Integração + Unitários + Stress Test                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 4 — CRÍTICO                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ Exemplos:                                                                  │
│ • Deploy de smart contracts em mainnet                                     │
│ • Mudanças em sistemas de trading ao vivo                                  │
│ • Alterações em sistemas financeiros                                       │
│ • Mudanças em segurança/criptografia                                       │
│                                                                            │
│ Pipeline: COMPLETO + Auditoria Externa + Formal Verification              │
│ Aprovação: Dupla (Arquiteto + Security) + Auditoria Externa               │
│ Testes: Todos + Auditoria de Segurança + Testnet por 30 dias              │
└────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

## 🧠 3. PIPELINE DE TRABALHO (Processo Oficial)

Aplicável para tarefas Nível 2+. Tarefas Nível 0-1 podem usar pipeline simplificado.

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 1 — INTERPRETAÇÃO                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Explicar em tópicos o entendimento da tarefa                          │
│ • Identificar nível de criticidade (0-4)                                │
│ • Confirmar escopo e requisitos                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 2 — CONTEXTO                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Identificar arquivos relevantes                                       │
│ • Mapear dependências                                                   │
│ • Identificar restrições técnicas                                       │
│ • Verificar padrões aplicáveis                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 3 — PLANO TÉCNICO                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Elaborar passos claros e ordenados                                    │
│ • Definir arquivos a criar/modificar                                    │
│ • Estimar impacto e complexidade                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 4 — ALTERNATIVAS                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Apresentar opções técnicas (A / B / C)                                │
│ • Listar prós e contras de cada                                         │
│ • Recomendar abordagem preferida                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 5 — ANÁLISE DE RISCOS                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Identificar impactos potenciais                                       │
│ • Avaliar riscos de segurança                                           │
│ • Listar breaking changes                                               │
│ • Identificar dependências afetadas                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 6 — APROVAÇÃO ⚠️                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Nenhuma execução ocorre sem esta etapa (Nível 2+)                    │
│ • Aprovador depende do nível de criticidade                             │
│ • Formato: "APROVADO" explícito do responsável                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 7 — EXECUÇÃO CONTROLADA                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ • Implementar apenas o escopo aprovado                                  │
│ • Seguir padrões de código                                              │
│ • Adicionar logs apropriados                                            │
│ • Manter commits atômicos                                               │
│ • **APLICAR DIRETIVAS DE HUMANIZAÇÃO**                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 8 — AUDITORIA TÉCNICA                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Verificar consistência com arquitetura                                │
│ • Validar segurança                                                     │
│ • Conferir padrões de código                                            │
│ • Avaliar performance                                                   │
│ • **VERIFICAR HUMANIZAÇÃO DO CÓDIGO**                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 9 — TESTES                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ • Criar/executar testes unitários                                       │
│ • Executar testes de integração                                         │
│ • Realizar testes E2E (se aplicável)                                    │
│ • Validar casos de borda                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 10 — ENTREGA FINAL                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ • Resumo executivo                                                      │
│ • Lista de mudanças                                                     │
│ • Arquivos afetados                                                     │
│ • Instruções de rollback                                                │
│ • Testes realizados                                                     │
│ • Documentação atualizada                                               │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

## 👥 4. GOVERNANÇA E RESPONSABILIDADES

┌──────────────────┬────────────────────────────────────────────────────────┐
│ PAPEL            │ RESPONSABILIDADES                                      │
├──────────────────┼────────────────────────────────────────────────────────┤
│ Tech Lead        │ • Aprovar mudanças Nível 2+                            │
│                  │ • Decisões arquiteturais                               │
│                  │ • Code review final                                    │
├──────────────────┼────────────────────────────────────────────────────────┤
│ Arquiteto        │ • Aprovar mudanças Nível 3+                            │
│                  │ • Definir padrões arquiteturais                        │
│                  │ • Avaliar impacto em escalabilidade                    │
├──────────────────┼────────────────────────────────────────────────────────┤
│ Code Owner       │ • Aprovar mudanças em seu módulo                       │
│                  │ • Manter qualidade do módulo                           │
│                  │ • Documentar decisões técnicas                         │
├──────────────────┼────────────────────────────────────────────────────────┤
│ Security Lead    │ • Revisar código sensível                              │
│                  │ • Aprovar mudanças em segurança/crypto                 │
│                  │ • Auditar smart contracts                              │
├──────────────────┼────────────────────────────────────────────────────────┤
│ DevOps           │ • Aprovar mudanças de infra                            │
│                  │ • Gerenciar CI/CD                                      │
│                  │ • Monitoramento e observabilidade                      │
├──────────────────┼────────────────────────────────────────────────────────┤
│ QA Engineer      │ • Validar testes                                       │
│                  │ • Criar cenários de teste                              │
│                  │ • Garantir cobertura adequada                          │
└──────────────────┴────────────────────────────────────────────────────────┘

**MATRIZ DE APROVAÇÃO POR NÍVEL:**

- Nível 0: Nenhuma aprovação necessária
- Nível 1: Auto-aprovação do desenvolvedor
- Nível 2: Tech Lead OU Code Owner
- Nível 3: Tech Lead E Arquiteto
- Nível 4: Tech Lead E Arquiteto E Security Lead E Auditoria Externa

═══════════════════════════════════════════════════════════════════════════════

## ⚡ 5. MATRIZ DE RISCO E CONTROLE

┌───────┬─────────────────────────┬──────────────┬────────────┬─────────────┐
│ NÍVEL │ EXEMPLOS                │ APROVAÇÃO    │ TESTES     │ ROLLBACK    │
├───────┼─────────────────────────┼──────────────┼────────────┼─────────────┤
│   0   │ Typo, formatação        │ Nenhuma      │ Opcional   │ Git revert  │
├───────┼─────────────────────────┼──────────────┼────────────┼─────────────┤
│   1   │ Bug simples, log        │ Auto         │ Unitários  │ Git revert  │
├───────┼─────────────────────────┼──────────────┼────────────┼─────────────┤
│   2   │ Feature, endpoint       │ Tech Lead    │ Unit + Int │ Migration   │
├───────┼─────────────────────────┼──────────────┼────────────┼─────────────┤
│   3   │ Breaking change, DB     │ Dupla        │ Todos      │ DR Plan     │
├───────┼─────────────────────────┼──────────────┼────────────┼─────────────┤
│   4   │ Smart contract, prod    │ Tripla + Ext │ + Audit    │ Multisig    │
└───────┴─────────────────────────┴──────────────┴────────────┴─────────────┘

**INDICADORES DE QUALIDADE MÍNIMOS:**

┌────────────────────────────┬──────────────────────────────────────────┐
│ MÉTRICA                    │ VALOR MÍNIMO                             │
├────────────────────────────┼──────────────────────────────────────────┤
│ Cobertura de Testes        │ 70% (Nível 2+), 90% (Nível 3+)           │
│ Complexidade Ciclomática   │ < 10 por função                          │
│ Duplicação de Código       │ < 3%                                     │
│ Tamanho de Função          │ < 50 linhas (recomendado)                │
│ Documentação de API        │ 100% endpoints públicos                  │
│ **Humanização do Código**  │ 100% (sem padrões AI detectáveis)        │
└────────────────────────────┴──────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

## 🏛️ 6. PRINCÍPIOS ARQUITETURAIS

O projeto deve manter:

✓ Modularidade  
✓ Baixo acoplamento  
✓ Alta coesão  
✓ Separação clara de responsabilidades (SRP)  
✓ Padrões consistentes de pastas  
✓ Convenções de nomes estáveis  
✓ Interfaces públicas estáveis  
✓ Design patterns adequados  
✓ Código testável  
✓ Escalabilidade horizontal  
✓ Observabilidade (logs, métricas, traces)  
✓ **Código com personalidade humana**

**PATTERNS RECOMENDADOS:**

- Repository Pattern (acesso a dados)  
- Factory Pattern (criação de objetos complexos)  
- Strategy Pattern (algoritmos intercambiáveis)  
- Observer Pattern (eventos)  
- Dependency Injection (desacoplamento)  
- CQRS (separação leitura/escrita)

Mudanças que comprometam arquitetura devem ser rejeitadas ou revisadas.

═══════════════════════════════════════════════════════════════════════════════

## 🔐 7. SEGURANÇA (Obrigatória)

Toda implementação deve considerar:

✓ Validação de entrada (whitelist, não blacklist)  
✓ Sanitização de dados (prevenir XSS, SQL injection)  
✓ Gerenciamento seguro de erros (não expor stack traces)  
✓ Controle de permissões (princípio do menor privilégio)  
✓ Proteção contra injeções (SQL, NoSQL, Command, LDAP)  
✓ Não exposição de informações sensíveis  
✓ Boas práticas criptográficas (AES-256, RSA-2048+)  
✓ Conformidade regulatória (LGPD / GDPR / PCI-DSS)  
✓ Rate limiting e proteção DDoS  
✓ Auditoria de acesso

**CHECKLIST DE SEGURANÇA OBRIGATÓRIO:**

□ Dados sensíveis são criptografados em repouso?  
□ Comunicações usam TLS 1.3+?  
□ Senhas usam bcrypt/argon2 com salt?  
□ Tokens JWT têm expiração adequada?  
□ APIs têm rate limiting?  
□ Logs não contêm dados sensíveis?  
□ Input validation está implementada?  
□ Dependências estão atualizadas (sem CVEs críticas)?

Riscos identificados devem ser relatados e resolvidos antes da entrega.

═══════════════════════════════════════════════════════════════════════════════

## 🧩 8. CONTROLE DE ARQUIVOS

Antes de modificar qualquer arquivo:

1. Identificar e solicitar autorização para leitura
2. Identificar e solicitar autorização para edição
3. Justificar a necessidade da alteração

**FORMATO DE SOLICITAÇÃO:**
```
SOLICITAÇÃO DE ACESSO
Arquivos: [lista]
Operação: [LEITURA / EDIÇÃO / CRIAÇÃO]
Justificativa: [razão técnica]
Nível: [0-4]
Aprovador: [papel responsável]
TEMPO MÁXIMO DE RESPOSTA:

Nível 0-1: Imediato
Nível 2: 2 horas
Nível 3: 24 horas
Nível 4: 72 horas

Toda entrega deve listar:
✓ Arquivos lidos
✓ Arquivos alterados
✓ Arquivos criados
✓ Motivo de cada um
═══════════════════════════════════════════════════════════════════════════════
🧪 9. PADRÕES DE QUALIDADE
Todo código deve:
✓ Ser limpo (Clean Code principles)
✓ Ser legível (código é lido 10x mais que escrito)
✓ Seguir padrões da linguagem (PEP8, ESLint, etc)
✓ Evitar duplicações (DRY principle)
✓ Ter funções pequenas (SRP)
✓ Prever erros (defensive programming)
✓ Possuir logs claros (estruturados, níveis adequados)
✓ Ser modular (baixo acoplamento)
✓ Ser testável (injeção de dependências)
✓ Ter nomes descritivos (evitar abreviações)
✓ Parecer escrito por humano (não por AI)
CODE REVIEW CHECKLIST:
□ Código segue padrões do projeto?
□ Lógica está clara e bem documentada?
□ Testes cobrem casos principais e de borda?
□ Performance é adequada?
□ Não há duplicação de código?
□ Logs são apropriados?
□ Tratamento de erros está correto?
□ Documentação foi atualizada?
□ Código tem características humanas?
═══════════════════════════════════════════════════════════════════════════════
🧩 10. MODOS OPERACIONAIS
Dependendo da natureza da tarefa, aplica-se um ou mais dos seguintes modos:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🐍 MODO PYTHON                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • PEP8 estrito (black, isort, flake8)                                       │
│ • Type hints obrigatórios (Python 3.10+)                                    │
│ • Docstrings (Google ou NumPy style)                                        │
│ • Testes PyTest com fixtures                                                │
│ • Virtual environments (venv, poetry)                                       │
│ • Logging estruturado (loguru ou structlog)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📦 MODO NODE/TYPESCRIPT                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • TypeScript strict mode                                                    │
│ • DTOs com class-validator                                                  │
│ • ESLint + Prettier                                                         │
│ • Tratamento robusto de erros (try-catch, Error classes)                   │
│ • Async/await (evitar callbacks)                                            │
│ • Jest para testes                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌐 MODO BACKEND/API                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Versionamento de API (v1, v2)                                             │
│ • Contratos estáveis (OpenAPI/Swagger)                                      │
│ • Middlewares (auth, logging, error handling)                               │
│ • Logs estruturados (formato JSON)                                          │
│ • Rate limiting                                                             │
│ • Health checks (/health, /ready)                                           │
│ • Graceful shutdown                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎨 MODO FRONT-END/FULL-STACK                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Componentização (React, Vue, Angular)                                     │
│ • Estado gerenciado (Redux, Zustand, Pinia)                                 │
│ • CSS modular (CSS Modules, Styled Components)                              │
│ • Acessibilidade (WCAG 2.1 AA)                                              │
│ • Performance (lazy loading, code splitting)                                │
│ • SEO (meta tags, SSR quando aplicável)                                     │
│ • APLICAR ANTI-PADRÕES AI                                               │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📱 MODO MOBILE                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Performance otimizada (60fps)                                             │
│ • Navegação intuitiva                                                       │
│ • Offline-first quando possível                                             │
│ • Tratamento de permissões                                                  │
│ • Testes em múltiplos devices                                               │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⛓️ MODO BLOCKCHAIN/WEB3                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Segurança máxima (auditoria obrigatória)                                  │
│ • Evitar reentrancy (Checks-Effects-Interactions)                           │
│ • Eficiência de gas (otimizar storage)                                      │
│ • Assinaturas corretas (EIP-712)                                            │
│ • Testes em testnet por 30+ dias                                            │
│ • Ferramentas: Slither, Mythril, Echidna                                    │
│ • Upgrade patterns (proxy, Diamond)                                         │
│ • Events para indexação                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💹 MODO TRADING/FINANCEIRO                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Consistência numérica (Decimal, não float)                                │
│ • Risco controlado (stop loss, position sizing)                             │
│ • Logs auditáveis (todas transações)                                        │
│ • Backtesting obrigatório (2+ anos)                                         │
│ • Paper trading (30 dias mínimo)                                            │
│ • Conformidade regulatória                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 MODO MT5/EAs/BOTS                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Integridade da lógica (validação rigorosa)                                │
│ • Validação criteriosa (inputs, sinais)                                     │
│ • Segurança operacional (magic numbers únicos)                              │
│ • Backtests com dados de qualidade                                          │
│ • Forward testing obrigatório                                               │
│ • Métricas: Sharpe > 1.5, Drawdown < 20%                                    │
│ • Tratamento de slippage e spread                                           │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔧 MODO AUTOMAÇÃO/SELENIUM                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Robustez (retry logic)                                                    │
│ • Espera inteligente (explicit waits)                                       │
│ • Fallback seguro (error recovery)                                          │
│ • Logs detalhados (screenshots em falhas)                                   │
│ • Headless quando possível                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🚀 MODO DEVOPS/INFRA                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Versionamento adequado (SemVer)                                           │
│ • Scripts confiáveis (idempotentes)                                         │
│ • CI/CD seguro (secrets management)                                         │
│ • Infrastructure as Code (Terraform, CloudFormation)                        │
│ • Monitoramento (Prometheus, Grafana)                                       │
│ • Disaster Recovery plan                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏗️ MODO ARQUITETO                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Visão macro do sistema                                                    │
│ • Design patterns apropriados                                               │
│ • Escalabilidade (horizontal/vertical)                                      │
│ • Decisões estruturais documentadas (ADRs)                                  │
│ • Trade-offs analisados                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 MODO AUDITOR                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Detecção de duplicações (>3%)                                             │
│ • Identificação de inconsistências                                          │
│ • Violações arquiteturais                                                   │
│ • Vulnerabilidades de segurança                                             │
│ • Code smells (complexidade, acoplamento)                                   │
│ • Detecção de padrões AI                                                │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 MODO CIRÚRGICO                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Mínima alteração possível                                                 │
│ • Zero impacto lateral                                                      │
│ • Testes de regressão obrigatórios                                          │
│ • Ideal para hotfixes                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚡ MODO VELOCIDADE                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Execução rápida para tarefas isoladas                                     │
│ • Apenas para Nível 0-1                                                     │
│ • Qualidade não é comprometida                                              │
└─────────────────────────────────────────────────────────────────────────────┘
TABELA DE DECISÃO:

Tarefa: Novo endpoint API → Modo: Backend/API
Tarefa: Otimizar Smart Contract → Modo: Blockchain/Web3 + Arquiteto
Tarefa: Corrigir bug visual → Modo: Cirúrgico
Tarefa: Refatorar EA do MT5 → Modo: MT5/EAs + Auditor
Tarefa: Criar pipeline CI/CD → Modo: DevOps/Infra
Tarefa: Sistema de comissões MLM → Modo: Blockchain + Trading + Arquiteto

═══════════════════════════════════════════════════════════════════════════════
📦 11. PADRÕES DE ENTREGA
Toda entrega deve conter:
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEMPLATE DE ENTREGA                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ## 📋 SUMÁRIO EXECUTIVO                                                     │
│ [Breve descrição do que foi feito]                                          │
│                                                                             │
│ ## 🎯 MOTIVAÇÃO                                                             │
│ [Por que esta mudança foi necessária]                                       │
│                                                                             │
│ ## 🔧 MUDANÇAS REALIZADAS                                                   │
│ • [Lista de alterações]                                                     │
│                                                                             │
│ ## 📁 ARQUIVOS AFETADOS                                                     │
│ • Criados: [lista]                                                          │
│ • Modificados: [lista]                                                      │
│ • Deletados: [lista]                                                        │
│                                                                             │
│ ## ⚙️ JUSTIFICATIVA TÉCNICA                                                 │
│ [Decisões técnicas e trade-offs]                                            │
│                                                                             │
│ ## 📊 IMPACTO NO SISTEMA                                                    │
│ • Performance: [impacto]                                                    │
│ • Segurança: [impacto]                                                      │
│ • Escalabilidade: [impacto]                                                 │
│ • Breaking changes: [sim/não + detalhes]                                    │
│                                                                             │
│ ## ⚠️ RISCOS IDENTIFICADOS                                                  │
│ • [Lista de riscos + mitigação]                                             │
│                                                                             │
│ ## ✅ TESTES REALIZADOS                                                     │
│ • Unitários: [X/Y passaram]                                                 │
│ • Integração: [X/Y passaram]                                                │
│ • E2E: [X/Y passaram]                                                       │
│ • Cobertura: [X%]                                                           │
│                                                                             │
│ ## 📚 DOCUMENTAÇÃO                                                          │
│ • README atualizado: [sim/não]                                              │
│ • API docs atualizadas: [sim/não]                                           │
│ • CHANGELOG atualizado: [sim/não]                                           │
│                                                                             │
│ ## 🔙 INSTRUÇÕES DE ROLLBACK                                                │
│ [Como reverter esta mudança]                                                │
│                                                                             │
│ ## 🚀 PRÓXIMOS PASSOS                                                       │
│ [O que deve ser feito em seguida, se aplicável]                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════════════════════
🚨 12. PROTOCOLO DE EMERGÊNCIA
Para situações críticas que exigem ação imediata:
┌─────────────────────────────────────────────────────────────────────────────┐
│ HOTFIX CRÍTICO — Modo Emergência                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ QUANDO APLICAR:                                                             │
│ • Sistema em produção inoperante                                            │
│ • Vulnerabilidade de segurança crítica (CVE 9.0+)                           │
│ • Perda de dados iminente                                                   │
│ • Violação de SLA crítica                                                   │
│                                                                             │
│ PROTOCOLO:                                                                  │
│ 1. Declarar estado de emergência (notificar Tech Lead)                     │
│ 2. Ativar Modo Cirúrgico                                                    │
│ 3. Implementar correção mínima                                              │
│ 4. Deploy imediato                                                          │
│ 5. Monitoramento contínuo                                                   │
│ 6. Rollback automático se falhar                                            │
│ 7. Documentação retroativa obrigatória (24h)                                │
│ 8. Post-mortem obrigatório (48h)                                            │
│                                                                             │
│ APROVAÇÃO:                                                                  │
│ • Pode ser feito primeiro, aprovado depois                                  │
│ • Tech Lead deve ser notificado imediatamente                               │
│ • Post-mortem deve incluir análise de causa raiz                            │
│                                                                             │
│ LIMITES:                                                                    │
│ • Apenas 1 arquivo crítico modificado                                       │
│ • Mudança < 50 linhas                                                       │
│ • Sem alterações arquiteturais                                              │
│ • Testes de regressão obrigatórios pós-deploy                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
ROLLBACK AUTOMÁTICO:

Se erro rate > 5% em 5 minutos → rollback automático
Se latência > 2x baseline → rollback automático
Se health check falhar → rollback automático

═══════════════════════════════════════════════════════════════════════════════
📊 13. MÉTRICAS E AUDITORIA
MÉTRICAS DE PROJETO:
┌────────────────────────────────┬─────────────────────────────────────────┐
│ MÉTRICA                        │ OBJETIVO                                │
├────────────────────────────────┼─────────────────────────────────────────┤
│ Cobertura de Testes            │ > 80%                                   │
│ Complexidade Ciclomática Média │ < 8                                     │
│ Duplicação de Código           │ < 3%                                    │
│ Dívida Técnica                 │ < 5% do tempo de desenvolvimento        │
│ Bugs em Produção/Mês           │ < 5 (P1/P2)                             │
│ MTTR (Mean Time To Recovery)   │ < 1 hora                                │
│ Lead Time for Changes          │ < 48 horas                              │
│ Deployment Frequency           │ > 1x por semana                         │
│ Change Failure Rate            │ < 15%                                   │
│ Detecção AI no Código      │ 0% (nenhum padrão AI detectável)        │
└────────────────────────────────┴─────────────────────────────────────────┘
AUDITORIA TRIMESTRAL OBRIGATÓRIA:
□ Revisão de arquitetura
□ Análise de dívida técnica
□ Verificação de segurança
□ Auditoria de dependências
□ Review de performance
□ Análise de cobertura de testes
□ Verificação de conformidade regulatória
□ Auditoria de humanização do código
FERRAMENTAS RECOMENDADAS:

SonarQube (qualidade de código)
Snyk (vulnerabilidades)
Lighthouse (performance web)
k6 (load testing)
OWASP ZAP (security testing)

═══════════════════════════════════════════════════════════════════════════════
📝 14. VERSIONAMENTO SEMÂNTICO
Toda release segue SemVer (Semantic Versioning):
MAJOR.MINOR.PATCH (ex: 2.4.1)
┌─────────────────────────────────────────────────────────────────────────────┐
│ MAJOR (X.0.0)                                                               │
│ • Mudanças incompatíveis com versão anterior                                │
│ • Breaking changes em APIs públicas                                         │
│ • Remoção de funcionalidades deprecated                                     │
│ • Reescrita arquitetural                                                    │
│                                                                             │
│ Exemplo: v1.x.x → v2.0.0                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ MINOR (x.Y.0)                                                               │
│ • Novas funcionalidades compatíveis                                         │
│ • Melhorias que não quebram compatibilidade                                 │
│ • Deprecation de funcionalidades (com aviso)                                │
│                                                                             │
│ Exemplo: v2.3.x → v2.4.0                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ PATCH (x.y.Z)                                                               │
│ • Correção de bugs                                                          │
│ • Patches de segurança                                                      │
│ • Melhorias de performance internas                                         │
│ • Refatorações que não afetam comportamento                                 │
│                                                                             │
│ Exemplo: v2.4.0 → v2.4.1                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
CHANGELOG OBRIGATÓRIO:
Todo MINOR ou MAJOR deve ter changelog descrevendo:

Added (novas features)
Changed (mudanças em features existentes)
Deprecated (features que serão removidas)
Removed (features removidas)
Fixed (bugs corrigidos)
Security (vulnerabilidades corrigidas)

═══════════════════════════════════════════════════════════════════════════════
📚 15. DOCUMENTAÇÃO
DOCUMENTAÇÃO OBRIGATÓRIA:
┌─────────────────────────────────────────────────────────────────────────────┐
│ README.md                                                                   │
│ • Descrição do projeto                                                      │
│ • Instruções de instalação                                                  │
│ • Guia de uso rápido                                                        │
│ • Requisitos de sistema                                                     │
│ • Links para documentação completa                                          │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ CHANGELOG.md                                                                │
│ • Histórico de versões                                                      │
│ • Mudanças de cada release                                                  │
│ • Breaking changes destacados                                               │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTRIBUTING.md                                                             │
│ • Guia para contribuidores                                                  │
│ • Processo de desenvolvimento                                               │
│ • Padrões de código                                                         │
│ • Como submeter PRs                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ API.md (para projetos com API)                                             │
│ • Endpoints documentados                                                    │
│ • Request/Response examples                                                 │
│ • Códigos de erro                                                           │
│ • Rate limits                                                               │
│ • Autenticação                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ADR (Architecture Decision Records)                                         │
│ • Decisões arquiteturais importantes                                        │
│ • Contexto e motivação                                                      │
│ • Alternativas consideradas                                                 │
│ • Consequências                                                             │
│                                                                             │
│ Formato: docs/adr/001-escolha-do-banco.md                                   │
└─────────────────────────────────────────────────────────────────────────────┘
DOCSTRINGS/JSDOC:

100% de cobertura para APIs públicas
80% para módulos internos
Exemplos de uso quando complexo
Parâmetros e retornos documentados

═══════════════════════════════════════════════════════════════════════════════
🎯 16. OBJETIVO GERAL
Garantir que o projeto mantenha:
✓ Qualidade técnica elevada
✓ Segurança robusta
✓ Eficiência operacional
✓ Clareza e manutenibilidade
✓ Escalabilidade
✓ Previsibilidade
✓ Maturidade de engenharia
✓ Integridade arquitetural
✓ Conformidade com padrões da indústria
✓ Satisfação do desenvolvedor
✓ Código indistinguível de desenvolvimento humano
═══════════════════════════════════════════════════════════════════════════════
⚖️ 17. AUTORIDADE E EXCEÇÕES
AUTORIDADE DESTE DOCUMENTO:

Este protocolo é vinculante para todos os contribuintes
Exceções devem ser justificadas e aprovadas pelo Arquiteto
Violações devem ser corrigidas ou revertidas
Em caso de conflito com outras diretrizes, este documento prevalece

PROCESSO DE EXCEÇÃO:

Documentar motivo da exceção
Propor alternativa
Obter aprovação do Arquiteto
Documentar decisão em ADR
Revisar exceção no próximo ciclo

═══════════════════════════════════════════════════════════════════════════════
📌 FIM DO DOCUMENTO v3.0
Este arquivo deve permanecer na raiz do projeto e servir como referência permanente para qualquer decisão técnica.
Última atualização: 2024
Versão: 3.0 (com Anti-Detecção AI)
Mantenedor: Arquiteto do Projeto
Status: ATIVO
Para sugestões de melhorias, abra uma issue ou ADR propondo mudanças.
═══════════════════════════════════════════════════════════════════════════════