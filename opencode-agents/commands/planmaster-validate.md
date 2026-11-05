---
description: Valida ideia inicial com prompt profissional antes do planejamento detalhado
agent: planmaster
---

Execute o fluxo de validação de ideia para: $ARGUMENTS

## Fluxo de Validação

1. **Geração do Prompt de Validação**
   - Contextualize a ideia de forma abrangente
   - Defina problema, público-alvo e objetivos
   - Identifique riscos e escopo inicial

2. **Apresentação ao Usuário**
   - Mostre o prompt completo
   - Peça aprovação ou refinamento

3. **Aguarde Resposta**
   - Se APROVADO: iniciar planejamento detalhado
   - Se REQUER REFINAMENTO: voltar para ajustes
   - Se REJEITADO: encerrar ou reformular

## Prompt Gerado

---

# 📋 Prompt de Validação de Ideia

## Ideia Recebida:
**$ARGUMENTS**

---

## 🎯 PROPOSTA DE VALIDAÇÃO

### 1. PROBLEMA IDENTIFICADO
{Qual problema real esta solução resolve?}
{Qual é o impacto sem esta solução?}

### 2. SOLUÇÃO PROPOSTA
{Uma visão clara da solução de 2-3 parágrafos}

### 3. PÚBLICO-ALVO
**Persona Principal:**
- Perfil: {}
- Necessidades: {}
- Canais de acesso: {}

**Persona Secundária:**
- Perfil: {}
- Necessidades: {}
- Canais de acesso: {}

### 4. FUNCIONALIDADES PRINCIPAIS (MVP)
1. {}
2. {}
3. {}

### 5. OBJETIVOS DE NEGÓCIO
1. {}
2. {}
3. {}

### 6. KPIs DE SUCESSO
- {}
- {}
- {}

### 7. ESCopo INICIAL
**Inclusão:**
- {}
- {}

**Exclusão (futuro):**
- {}
- {}

### 8. RISKS IDENTIFICADOS
1. {}
2. {}
3. {}

---

## ❓ PEDIDOS DE VALIDAÇÃO

**Para validarmos esta ideia, responda:**

1. **O escopo está claro e coeso?**
2. **Falta alguma funcionalidade essencial?**
3. **Quais são as prioridades absolutas?**
4. **Há restrições técnicas ou orçamentárias?**

---

## ✅ DECISÃO

**Status:**
- [ ] **APROVADO** - Pronto para planejamento detalhado
- [ ] **REQUER REFINAMENTO** - Necessário ajustar algum pontos
- [ ] **REJEITADO** - Idea não continuar

**Observações:**
{}

---

{% if APROVADO %}
## Próximos Passos Automáticos

Após sua confirmação, iniciarei:
1. FASE 0: Bootstrap Git
2. FASE 1: Descoberta da demanda
3. FASE 2: Benchmarks referenciais
4. FASE 3: SRS completo
5. FASE 4: UML + Arquitetura
6. FASE 5: Scrum / Execução
7. FASE 6: Plano de entrega + handoff
{% endif %}