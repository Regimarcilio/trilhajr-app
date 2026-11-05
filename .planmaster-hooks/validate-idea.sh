#!/bin/bash

# 🧠 Script de Validação de Ideia - PlanMaster
# Gera prompt profissional de validação antes do planejamento

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== PLANMASTER - Validador de Ideia ===${NC}"
echo ""

# Função para gerar timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Função principal
generate_validation_prompt() {
    local IDEIA="$1"
    local PROMPT_FILE="docs/00-prompt-validacao-${TIMESTAMP}.md"
    
    cat > "$PROMPT_FILE" << EOF
# 📋 Prompt de Validação de Ideia

## 🎯 IDENTIFICAÇÃO
**Ideia recebida:** $IDEIA
**Prompt ID:** VALID-${TIMESTAMP}
**Data:** $(date +%Y-%m-%d)

---

## 📖 DESCRIÇÃO ABRANGENTE
**Problema Real:** 
{Contextualize como um problema real que a solução resolve - ex: "Usuários enfrentam dificuldade em..."}

**Solução Proposta:** 
{Explique a solução de forma abrangente em 2-3 parágrafos}

---

## 👥 PÚBLICO-ALVO

| Persona | Perfil | Necessidades | Canal Principal |
|---------|--------|--------------|-----------------|
| Principal | - | - | - |
| Secundário | - | - | - |

---

## 📊 OBJETIVOS DE NEGÓCIO

1. **[Objetivo 1]** - Métrica: {}
2. **[Objetivo 2]** - Métrica: {}
3. **[Objetivo 3]** - Métrica: {}

---

## ✨ FUNCIONALIDADES PRINCIPAIS (MVP)

- [ ] Feature 1: {}
- [ ] Feature 2: {}
- [ ] Feature 3: {}

---

## 🔍 ESCOPIO INICIAL

**INclusão:**
- {}
- {}

**OUTclusão (futuro):**
- {}
- {}

---

## ⚠️ RISKS IDENTIFICADOS

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| {} | {} | {} | {} |

---

## ❓ PEDIDOS DE VALIDAÇÃO

1. **O escopo está claro e coeso?**
2. **Falta alguma funcionalidade essencial?**
3. **Quais são as prioridades absolutas?**
4. **Há restrições técnicas ou orçamentárias?**

---

## ✅ DECISÃO DO USUÁRIO

**Status:**
- [ ] ✅ APROVADO → Iniciar planejamento detalhado
- [ ] 🔧 REQUER REFINAMENTO → Ajustar pontos
- [ ] ❌ REJEITADO → Encerrar

**Observações:**
{}

---

*Este prompt foi generado automaticamente pelo PlanMaster em ${TIMESTAMP}*
EOF

    echo -e "${GREEN}✓ Prompt de validação gerado:${NC}"
    echo "  Arquivo: $PROMPT_FILE"
    echo ""
    cat "$PROMPT_FILE"
}

# Verificar se tem argumento
if [ -z "$1" ]; then
    echo "Uso: $0 \"descrição da ideia\""
    echo ""
    echo "Exemplo:"
    echo "  $0 \"site de fábrica de bolos personalizado\""
    exit 1
fi

# Gerar prompt
generate_validation_prompt "$*"

echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. Revise o prompt gerado"
echo "2. Marque a opção APROVADO/REQUER REFINAMENTO/REJEITADO"
echo "3. Use /planmaster para iniciar o planejamento detalhado"