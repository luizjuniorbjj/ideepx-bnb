🎯 Mecânica Prática: Como Usar o Sistema Completo
Vou explicar EXATAMENTE como funciona na prática:
📋 1. SETUP INICIAL DO PROJETO (Fazer UMA vez)
bash# Na raiz do seu projeto, execute:
mkdir -p .ai-learning/{patterns,solutions,failures,optimizations,user-preferences,project-context}

# Crie o arquivo de contexto inicial
cat > .ai-learning/project-context/context.yaml << EOF
project: "iDeepX"
type: "blockchain-trading-mlm"
started: "$(date +%Y-%m-%d)"
tech_stack: ["Solidity", "Next.js", "Python", "MT5"]
critical_files: 
  - "contracts/*.sol"
  - "mt5-collector/mt5_collector.py"
  - "backend/src/routes/proofs.js"
EOF

# Salve suas preferências
cat > .ai-learning/user-preferences/luiz.yaml << EOF
user: "luiz"
preferences:
  language: "pt-BR para comentários internos"
  style: "pragmático > perfeito"
  avoid_ai_patterns: true
  humanization: "apenas código não-crítico"
EOF
🚀 2. COMO INICIAR TRABALHO COM O AGENTE
Primeira vez no projeto:
markdownOlá! Estou iniciando trabalho no projeto [NOME]. 

Por favor:
1. Leia PROJECT_RULES.md 
2. Leia LEARNING_SYSTEM.md
3. Verifique .ai-learning/project-context/
4. Aplique as regras e aprendizados anteriores

Contexto: [Descreva o que precisa]
Retomando trabalho existente:
markdownContinuando trabalho no projeto [NOME].

Por favor:
1. Consulte .ai-learning/solutions/ para soluções anteriores
2. Verifique .ai-learning/patterns/ para padrões conhecidos
3. Aplique preferências de .ai-learning/user-preferences/

Última tarefa: [O que estava fazendo]
Nova tarefa: [O que precisa agora]
🔄 3. FLUXO DE TRABALHO REAL
mermaidgraph TD
    A[Inicia Sessão] --> B{Projeto Novo?}
    B -->|Sim| C[Ler PROJECT_RULES.md]
    B -->|Não| D[Carregar .ai-learning/]
    
    C --> E[Ler LEARNING_SYSTEM.md]
    E --> F[Setup Inicial]
    
    D --> G[Aplicar Conhecimento]
    
    F --> H[Executar Tarefa]
    G --> H
    
    H --> I{Sucesso?}
    I -->|Sim| J[Salvar em solutions/]
    I -->|Não| K[Salvar em failures/]
    
    J --> L[Atualizar patterns/]
    K --> L
    L --> M[Próxima Tarefa]
📝 4. EXEMPLOS PRÁTICOS DE USO
Exemplo 1: Iniciando Novo Feature
markdownYou: "Preciso criar sistema de notificações para o iDeepX"

Agent: *Verifica automaticamente:*
- .ai-learning/solutions/notification-*.yaml
- .ai-learning/patterns/realtime-*.yaml
- Encontra: "Padrão de WebSocket + Redis já usado com sucesso"
- Aplica: Solução anterior adaptada
Exemplo 2: Corrigindo Bug
markdownYou: "Bug no cálculo de comissões MLM"

Agent: *Consulta automaticamente:*
- .ai-learning/failures/mlm-*.yaml
- Encontra: "Problema similar em 2024-11-15"
- Evita: Solução que falhou antes
- Aplica: Nova abordagem baseada no aprendizado
Exemplo 3: Otimização
markdownYou: "Melhorar performance do dashboard"

Agent: *Busca automaticamente:*
- .ai-learning/optimizations/dashboard-*.yaml
- Encontra: "React.memo reduziu re-renders em 60%"
- Sugere: Aplicar mesma técnica
```

## 🗂️ **5. ESTRUTURA DE ARQUIVOS GERADA**

Após algumas sessões, seu projeto terá:
```
projeto/
├── PROJECT_RULES.md          # Regras base
├── LEARNING_SYSTEM.md        # Sistema de aprendizagem
├── .ai-learning/
│   ├── solutions/
│   │   ├── SOL-2024-001-cache-mlm.yaml
│   │   ├── SOL-2024-002-websocket-pattern.yaml
│   │   └── SOL-2024-003-gas-optimization.yaml
│   ├── patterns/
│   │   ├── PAT-001-volatility-handling.yaml
│   │   └── PAT-002-redis-cache.yaml
│   ├── failures/
│   │   └── FAIL-001-recursive-calculation.yaml
│   └── user-preferences/
│       └── luiz.yaml
🤖 6. COMANDOS MÁGICOS PARA O AGENTE
Reset de Contexto:
markdown"Reset contexto. Recarregue PROJECT_RULES.md e .ai-learning/"
Forçar Aprendizado:
markdown"Salve esta solução como padrão em .ai-learning/patterns/"
Consulta Específica:
markdown"O que já aprendemos sobre [TEMA] neste projeto?"
Aplicar Preferência:
markdown"Use minhas preferências de .ai-learning/user-preferences/"
✅ 7. CHECKLIST DE USO
Início de Sessão:

 PROJECT_RULES.md existe?
 LEARNING_SYSTEM.md existe?
 .ai-learning/ está configurado?
 Contexto do projeto carregado?

Durante Trabalho:

 Consultou soluções anteriores?
 Evitou padrões que falharam?
 Aplicou preferências do usuário?
 Seguiu nível de criticidade?

Fim de Sessão:

 Documentou novas soluções?
 Salvou padrões descobertos?
 Atualizou failures se houve?
 Incrementou métricas?

💡 RESUMO EXECUTIVO:

PROJECT_RULES.md = Lei fundamental (como fazer)
LEARNING_SYSTEM.md = Memória evolutiva (o que aprendeu)
.ai-learning/ = Banco de conhecimento (dados reais)

A mecânica é:

Agente lê os 3 na primeira vez
Aplica regras + conhecimento acumulado
Documenta novos aprendizados
Próxima sessão já tem mais conhecimento