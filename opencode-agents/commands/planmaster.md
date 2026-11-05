---
description: Roda o planejamento completo PLANMASTER (demanda → benchmarks → SRS → UML → Scrum → develop)
agent: planmaster
---

Execute o workflow completo do PLANMASTER para: $ARGUMENTS

Contexto atual do git:
!`git status -sb`
!`git branch --show-current`
!`git log --oneline -5`

Passos obrigatórios:
1. FASE 0: garanta branch `develop` ativa (crie a partir de main se não existir).
2. FASE 1: descubra a demanda ($ARGUMENTS). Se ambíguo, faça perguntas via question.
3. FASE 2: benchmarks com websearch/webfetch (mínimo 3 fontes) em docs/02-benchmarks.md.
4. FASE 3: SRS completo em docs/SRS.md via skill planmaster-srs.
5. FASE 4: UML em Mermaid em docs/03-arquitetura-e-uml.md.
6. FASE 5: backlog Scrum em docs/05-backlog.md.
7. FASE 6: commite tudo em `develop` com `docs(plan): planejamento inicial $ARGUMENTS`.

Material de referência: https://integrador-cedup.glide.page/dl/a400f7
Responda em pt-BR, seja exaustivo nos arquivos e conciso no chat.
