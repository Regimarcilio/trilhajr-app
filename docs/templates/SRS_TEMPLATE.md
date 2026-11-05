# Software Requirements Specification (SRS)

## 1. Introdução

### 1.1 Propósito
[Descreva o propósito do sistema - o que ele resolve]

### 1.2 Escopo
- **INclusão (IN):** [O que está incluído no escopo]
- **Exclusão (OUT):** [O que está excluído do escopo]

### 1.3 Definições, Abreviações e Acrônimos
| Termo | Definição |
|-------|-----------|
| RF | Requisito Funcional |
| RN | Regra de Negócio |
| NFR | Requisito Não-Funcional |

### 1.4 Referências
- Material de referência: https://integrador-cedup.glide.page/dl/a400f7
- [Outras referências relevantes]

---

## 2. Descrição Geral

### 2.1 Perspectiva do Sistema
[Visão geral da arquitetura e integrações]

### 2.2 Público-Alvo
| Segmento | Características |
|----------|-------------------|
| Usuário Final | [Perfil do usuário] |
| Administrador | [Perfil do admin] |

### 2.3 Restrições
- **Prazo:** [Timeline projetual]
- **Orçamento:** [Limites orçamentários]
- **LGPD:** [Requisitos de privacidade]
- **Acessibilidade:** [Padrões W3C]

### 2.4 Premissas
- [Assunções para o desenvolvimento]

---

## 3. Requisitos Funcionais

| ID | Título | Descrição | Ator | Prioridade | Dependências |
|----|--------|-----------|------|------------|----------------|
| RF-001 | [Título] | [Descrição] | [Ator] | [MoSCoW: Must/Shoud/Could/Won't] | [RF-RN correlatas] |

### Critérios de Aceitação (Gherkin)
```gherkin
Feature: [Nome da Feature]
  Scenario: [Nome do Cenário]
    Given [condição inicial]
    When [ação]
    Then [resultado esperado]
```

---

## 4. Requisitos Não-Funcionais

| ID | Categoria | Descrição | Métrica/Tolerância |
|----|-----------|-----------|-------------------|
| NFR-001 | Performance | [Descrição] | [ex: < 2s para carregar] |
| NFR-002 | Segurança | [Descrição] | [ex: OWASP Top 10] |
| NFR-003 | Usabilidade | [Descrição] | [ex: WCAG 2.1 AA] |

---

## 5. Requisitos de Interface / Integrações

### 5.1 Interfaces
- [Descrever interfaces de usuário]
- [APIs externas]

### 5.2 Integrações
| Sistema | Tipo | Protocolo |
|---------|------|-----------|
| [Nome] | [tipo] | [protocolo] |

---

## 6. Regras de Negócio

| ID | Descrição | Fonte | RF Associado |
|----|-----------|-------|--------------|
| RN-001 | [Regra de negócio] | [Fonte] | [RF] |

---

## 7. Matriz de Rastreabilidade

| RF | RN | Testes |
|----|----|--------|
| RF-001 | RN-001 | TC-001 |

---

## 8. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| [Risco] | [Alto/Medio/Baixo] | [Alto/Medio/Baixo] | [Ação] |

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| [Termo] | [Definição] |