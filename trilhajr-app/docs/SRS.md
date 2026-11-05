# Software Requirements Specification (SRS)
## App Mobile Rezi Brasil - PDF Sem Login

---

## 1. Introdução

### 1.1 Propósito
Desenvolver um aplicativo mobile para **otimização de currículos em PDF** para o mercado brasileiro, com **fluxo sem login/senha**, pagamento via Pix e compartilhamento direto, focando em **compatibilidade ATS**.

### 1.2 Escopo
- **INclusão (IN):**
  - Upload de arquivos PDF (currículos)
  - Processamento IA para otimização ATS
  - Pagamento via Pix sem cadastro
  - Compartilhamento direto do PDF processado
  - Versão freemium (limitada) + versão paga (ilimitada)
- **Exclusão (OUT):**
  - Sistema de login/cadastro
  - Armazenamento em nuvem persistente
  - Editores de texto avançados
  - Suporte multi-idioma (apenas PT-BR)

### 1.3 Definições, Abreviações e Acrônimos
| Termo | Definição |
|-------|-----------|
| RF | Requisito Funcional |
| RN | Regra de Negócio |
| NFR | Requisito Não-Funcional |
| ATS | Applicant Tracking System (sistema de filtragem de currículos) |
| Pix | Pagamento instantâneo do Banco Central |
| ABRATS | Associação Brasileira de Recrutamento e Seleção |

### 1.4 Referências
- Material de referência: https://integrador-cedup.glide.page/dl/a400f7
- ABRATS Padrão de Currículo: https://abrats.org.br
- Documentação Asaas API: https://devsaas.docs.apiary.io

---

## 2. Descrição Geral

### 2.1 Perspectiva do Sistema
```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   APP MOBILE    │──────▶│   API PROCESSOR  │──────▶│  AI OPTIMIZER   │
│  (React Native) │       │   (Node.js/Go)   │       │    (ML Model)   │
└─────────────────┘       └──────────────────┘       └─────────────────┘
         │                         │                         │
         │ Pix Payment             │ PDF Processing          │
         ▼                         ▼                         ▼
  ┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
  │  ASAAS STRIPE   │       │  LOCAL STORAGE   │       │   CLOUD MODEL   │
  │    (Pix)        │       │   (Cache temporário)      │   (Rezi Engine) │
  └─────────────────┘       └──────────────────┘       └─────────────────┘
```

### 2.2 Público-Alvo
| Segmento | Características |
|----------|-------------------|
| Usuário Final | Profissionais buscando emprego, 18-45 anos, uso smartphone |
| Administrador | Time técnico (2 pessoas): desenvolvimento + suporte |

### 2.3 Restrições
- **Prazo:** 12 semanas para MVP
- **Orçamento:** R$ 60.000 - 85.000
- **LGPD:** Mínimo - apenas dados de transação Pix
- **Acessibilidade:** WCAG 2.1 AA (conformidade básica)

### 2.4 Premissas
- 95% dos brasileiros possuem smartphone Android
- Pix é método de pagamento dominante (82% das transações)
- PDF é formato mais usado para currículos no Brasil
- API de pagamento Asaas permite webhook sem conta fixa

---

## 3. Requisitos Funcionais

| ID | Título | Descrição | Ator | Prioridade | Dependências |
|----|--------|-----------|------|------------|----------------|
| RF-001 | Upload de PDF | Ler e validar arquivo PDF do currículo | Usuário | Must | - |
| RF-002 | Análise ATS | Identificar palavras-chave e estrutura ATS | Sistema | Must | RF-001 |
| RF-003 | Otimização IA | Sugerir melhorias baseado em melhores práticas | Sistema | Must | RF-002 |
| RF-004 | Fluxo de pagamento | Gerar QR Code Pix e validar pagamento | Usuário | Must | RF-001 |
| RF-005 | Download PDF otimizado | Gerar PDF final processado | Usuário | Must | RF-003 |
| RF-006 | Compartilhamento | Opções WhatsApp, Email, Copy link | Usuário | Should | RF-005 |
| RF-007 | Versão Free limitada | 1 otimização/24h, marca d'água | Usuário | Won't | - |

### Critérios de Aceitação (Gherkin)

```gherkin
Feature: Upload de Currículo PDF
  Scenario: Usuário envia arquivo PDF válido
    Given que o usuário abre o app
    When ele toca em "Carregar Currículo" e seleciona um PDF
    Then o app mostra prévia do currículo com 2 clicks
    And o app valida o formato (PDF/A, menos 2MB)

Feature: Pagamento via Pix Sem Login
  Scenario: Usuário paga e obtém versão completa
    Given que o usuário carregou um PDF válido
    When ele clica em "Otimizar Completo" e paga via Pix
    Then o app gera QR Code Pix com valor R$ 4,90
    And ao confirmar pagamento, entrega PDF sem marca d'água

Feature: Compartilhamento Direto
  Scenario: Usuário compartilha currículo otimizado
    Given que o PDF foi gerado com sucesso
    When o usuário clica em "Compartilhar"
    Then abre opções: WhatsApp, Email, Copiar Link, Salvar
```

---

## 4. Requisitos Não-Funcionais

| ID | Categoria | Descrição | Métrica/Tolerância |
|----|-----------|-----------|-------------------|
| NFR-001 | Performance | Tempo de processamento do PDF | < 10 segundos (offline), < 30 segundos (online) |
| NFR-002 | Segurança | Proteção de dados de pagamento | PCI DSS Level 1 (via Asaas/Stripe) |
| NFR-003 | Usabilidade | Navegação sem login | < 3 cliques para resultado final |
| NFR-004 | Escalabilidade | Usuários simultâneos | 10.000 req/min na API |
| NFR-005 | Disponibilidade | App funcionando | 99.5% uptime |

---

## 5. Requisitos de Interface / Integrações

### 5.1 Interfaces
- **Tela 1 - Boas-vindas**: Mensagem + botão "Carregar PDF"
- **Tela 2 - Prévia**: Visualização PDF + botão "Pagar Otimização"
- **Tela 3 - Pix**: QR Code + status pagamento
- **Tela 4 - Resultado**: PDF otimizado + botões compartilhar

### 5.2 Integrações

| Sistema | Tipo | Protocolo | Uso |
|---------|------|-----------|-----|
| Asaas | Pagamento | REST API + Webhooks | Pix e boleto |
| Stripe | Pagamento | REST API | Backup internacional |
| Rezi Engine | IA | API REST | Processamento ATS |
| Expo FileSystem | Arquivo | SDK Mobile | Leitura PDF mobile |

---

## 6. Regras de Negócio

| ID | Descrição | Fonte | RF Associado |
|----|-----------|-------|--------------|
| RN-001 | PDF deve ser menor que 2MB | Norma técnica | RF-001 |
| RN-002 | Pix válido por 15 minutos | Regra Asaas | RF-004 |
| RN-003 | PDF de saída preserva formatação | Padrão ABRATS | RF-005 |
| RN-004 | Versão free tem limite diário por IP | Controle anti-abuso | RF-007 |
| RN-005 | Dados de pagamento não são armazenados | LGPD | Todos |

---

## 7. Matriz de Rastreabilidade

| RF | RN | Testes |
|----|----|--------|
| RF-001 | RN-001 | TC-001: Teste upload PDF válido |
| RF-002 | RN-003 | TC-002: Teste otimização ATS |
| RF-003 | RN-003 | TC-003: Teste formatação saída |
| RF-004 | RN-002 | TC-004: Teste fluxo Pix |
| RF-005 | RN-001,003 | TC-005: Teste download PDF |
| RF-006 | RN-005 | TC-006: Teste compartilhamento |
| RF-007 | RN-004 | TC-007: Teste limite free |

---

## 8. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| PDF corrompido na leitura | Alto | Médio | Validação multiparte + fallback OCR |
| Webhook Pix não chega | Alto | Médio | Polling 30s + retry automático |
| Modelo IA não funciona offline | Médio | Alto | Cache de resultados + modo básico |
| Concorrência de pagamentos duplicados | Alto | Baixo | ID único transação + deduplicação |

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| Pix | Sistema de pagamento instantâneo do Banco Central do Brasil |
| ATS | Sistema de triagem de currículos usado por empresas |
| ABRATS | Associação Brasileira de Recrutamento e Seleção |
| QR Code | Código de barras bidimensional para pagamentos |
| Asaas | Plataforma brasileira de pagamentos (Pix, boleto, cartão) |