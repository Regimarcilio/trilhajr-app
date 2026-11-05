# 🤖 PLANMASTER — Agente de Planejamento de Projetos

Agente especialista em planejamento de software para a plataforma **Opencode**. Elimina erros e retrabalho através de planejamento exaustivo.

## ✨ Novidade: Validação de Ideia Automática

**A partir de agora, todo novo projeto passa por um prompt de validação profissional antes do planejamento detalhado.**

### Como funciona:

1. **Você informa a ideia** (ex: "quero um site de e-commerce de doces")
2. **O agente gera um prompt de validação abrangente**
3. **Você aprova ou refinado a ideia**
4. **Só então inicia o planejamento com 7 fases detalhadas**

---

## 🚀 Comando de Uso

```bash
/planmaster "descrição da sua ideia"
```

**Exemplo:**
```
/planmaster "site de fábrica de bolos personalizado"
```

---

## 📋 Fluxo de Trabalho (7 Fases)

| Fase | Título | Arquivo Gerado |
|------|--------|----------------|
| 0 | Bootstrap Git | Branch develop criada |
| 1 | Descoberta da demanda | `docs/01-visao-e-escopo.md` |
| 2 | Benchmarks referenciais | `docs/02-benchmarks.md` |
| 3 | SRS completo | `docs/SRS.md` |
| 4 | UML + Arquitetura | `docs/03-arquitetura-e-uml.md` |
| 5 | Scrum / Execução | `docs/05-backlog.md` |
| 6 | Plano de entrega + handoff | `docs/06-plano-de-entrega.md` |

---

## 🧠 Fluxo de Validação (Nova Fase 0)

Antes de qualquer planejamento, o agente executa automaticamente:

### PASSO 1: Geração do Prompt de Validação
Para qualquer ideia recebida, gera um prompt profissional que:
- Contextualiza a ideia de forma abrangente
- Define escopo, público-alvo e objetivos
- Identifica riscos e KPIs de sucesso
- Pergunta pontos críticos de validação

### PASSO 2: Apresentação e Pergunta
Exibe o prompt ao usuário com opções:
```
✅ APROVADO - Pronto para planejamento detalhado
🔧 REQUER REFINAMENTO - Ajustar pontos
❌ REJEITADO - Encerrar ou reformular
```

### PASSO 3: Atualização Condicional
Só após aprovação, inicia o workflow de 7 fases.

---

## 📁 Estrutura de Arquivos

```
PROJETOS/
├── opencode-agents/
│   ├── agents/planmaster.md          # Agente principal
│   └── commands/
│       ├── planmaster.md             # Comando padrão
│       └── planmaster-validate.md    # Comando de validação
├── docs/
│   ├── 00-prompt-validacao.md        # Instruções de validação
│   ├── templates/
│   │   ├── SRS_TEMPLATE.md           # Template SRS
│   │   ├── SCRUM_TEMPLATE.md         # Template Scrum
│   │   └── prompt-de-validacao.md    # Template de prompt
│   └── README.md                     # Este arquivo
├── .planmaster-hooks/                # Scripts de automação
└── .git/                             # Repositório git (branch develop)
```

---

## 🎯 Princípios Inegociáveis

1. **Planejar antes de codar** - Nunca implemente código sem SRS + backlog aprovados
2. **Detalhe máximo** - Prefira excesso de especificação a ambiguidade
3. **Evidência antes de síntese** - Valide dependências e faça benchmarks reais
4. **Develop-first** - Todo trabalho acontece na branch `develop`
5. **Multi-linguagem** - Adapte-se ao stack detectado
6. **Proto-first** - Toda tela nasce protótipo

---

## 📚 Templates Disponíveis

| Template | Uso | Link |
|----------|-----|------|
| SRS_TEMPLATE.md | Especificação de requisitos | `docs/templates/SRS_TEMPLATE.md` |
| SCRUM_TEMPLATE.md | Backlog e sprint planning | `docs/templates/SCRUM_TEMPLATE.md` |
| prompt-de-validacao.md | Validação de ideia | `docs/templates/prompt-de-validacao.md` |

---

## 🔧 Git Workflow (Standard)

```bash
git checkout develop
git pull
# ... trabalho ...
git add docs/
git commit -m "docs(plan): [descrição]"
git push -u origin develop
```

**Tipos de commit:** `docs`, `plan`, `feat`, `fix`, `chore`, `refactor`, `test`

---

## 📖 Exemplo de Prompt Gerado

```markdown
# 📋 Prompt de Validação de Ideia

## 🎯 IDENTIFICAÇÃO
Ideia recebida: Site de fábrica de bolos personalizado
Prompt ID: VALID-042

## 📖 DESCRIÇÃO ABRANGENTE
**Problema Real:** Famílias e profissionais enfrentam dificuldade em encontrar bolos personalizados de qualidade para celebrações.
**Solução Proposta:** Um site que permite criar bolos personalizados online, com prévia visual, escolha de ingredientes e delivery.

## 👥 PÚBLICO-ALVO
| Persona | Perfil | Necessidades | Canal |
|---------|--------|--------------|-------|
| Mãe/pai | 25-45 anos, eventos familiares | Bolos temáticos, entrega rápida | Instagram, WhatsApp |
| Empresas | 30-55 anos, CEOs | Encomendas corporativas | E-mail profissional |

...continua automaticamente...
```

---

## 📞 Suporte

Para questões ou sugestões, consulte o material de referência:
https://integrador-cedup.glide.page/dl/a400f7

---

**Status:** Pronto para uso • Repositório configurado em `develop`