# Laudo inicial de segurança — MailChat (pré-implementação Gmail)

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Auditor:** KALIMASTER (squad)
- **Escopo auditado:** documentação existente, código do protótipo em `email-whatsapp/frontend/`, configuração de CI em `.github/workflows/mailchat-ci.yml`, `.env.example`
- **Método:** revisão de arquitetura + análise de configuração + inspeção estática manual + leitura do threat model
- **Referências:** [Threat model](threat-model-stride.md) · [Requisitos](requisitos-hardening.md) · [Testes](plano-testes-seguranca.md)

## 1. Contexto

O MailChat é hoje um **protótipo com dados mock**, sem autenticação, sem backend e sem
persistência. Portanto, a maior parte dos riscos é de **projeto** (o que será construído) e não
de vulnerabilidade explorável no código atual. Este laudo separa explicitamente:

- **Achado confirmado:** observável no código/configuração de hoje.
- **Risco de projeto:** inerente ao que será implementado, já endereçado por `SR-xx`.

## 2. Achados

| ID | Severidade | Tipo | Achado | Evidência | Recomendação | Ref. |
|---|---|---|---|---|---|---|
| K-01 | Info | Confirmado | Não existe camada de autenticação; todo o app opera sobre dados mock em memória | `frontend/lib/api/mockApi.ts`, `frontend/lib/mock/data.ts` | Implementar sessão e OAuth2 antes de qualquer dado real (F1) | SR-15..SR-21 |
| K-02 | Médio | Confirmado | Identificadores são numéricos e sequenciais no mock | `frontend/lib/mock/data.ts`, `proximoPostItId()` em `mockApi.ts` | Usar UUIDv7 em todas as entidades expostas por API | SR-23 |
| K-03 | Médio | Confirmado | `next.config.ts` não define headers de segurança (CSP, HSTS, nosniff, frame-ancestors) | `frontend/next.config.ts` | Centralizar headers no proxy/Next antes do go-live | SR-42 |
| K-04 | Médio | Confirmado | Pipeline de CI não executa scan de segredos nem de dependências | `.github/workflows/mailchat-ci.yml` | Adicionar `gitleaks` e `npm audit`/`osv-scanner` | SR-39, SR-40 |
| K-05 | Baixo | Confirmado | Dependências usam ranges `^` (sem pin exato), dependendo do lockfile para reprodutibilidade | `frontend/package.json` | Manter lockfile obrigatório no CI e habilitar Dependabot | SR-40 |
| K-06 | Baixo | Confirmado | `NEXT_PUBLIC_API_BASE_URL` é inlined no bundle do cliente | `frontend/next.config.ts` | Aceitável (não é segredo); documentar que nenhum segredo pode usar prefixo `NEXT_PUBLIC_` | SR-39 |
| K-07 | Informativo | Confirmado | Não há `.env` real versionado; apenas `.env.example` com placeholder | `email-whatsapp/.env.example` | Manter assim; ampliar placeholders para OAuth2 | SR-39 |
| K-08 | Crítico (projeto) | Risco de projeto | Ausência de isolamento multi-tenant no desenho atual (dados globais no mock) | Arquitetura atual | Aplicar `SR-21..SR-24` e testes cross-tenant | T-13 |
| K-09 | Crítico (projeto) | Risco de projeto | Não há cofre de tokens; tokens ainda não existem, mas o desenho precisa prever criptografia e rotação | — | Implementar `SR-07..SR-12` antes de conectar conta real | T-12, T-26 |
| K-10 | Alto (projeto) | Risco de projeto | Renderização futura de HTML de e-mail sem sanitização seria XSS armazenado | — | Sanitização allowlist + CSP + proxy de imagens | T-15 |
| K-11 | Alto (projeto) | Risco de projeto | Envio de e-mail sem idempotência pode duplicar mensagens | — | `Idempotency-Key` + reconciliação | T-06, SR-28 |
| K-12 | Alto (projeto) | Risco de projeto | Sync sem lock/backoff pode esgotar quota e degradar o serviço | — | Lock por conta, backoff, circuit breaker | T-20 |
| K-13 | Médio (projeto) | Risco de projeto | Ausência de auditoria impede responsabilização | — | `audit_log` append-only | T-10 |
| K-14 | Médio (projeto) | Risco de projeto | Sem política de retenção/expurgo formalizada | — | Implementar LGPD (SR-45..SR-48) | T-14 |

## 3. Verificações executadas

| Verificação | Resultado |
|---|---|
| Revisão manual de `frontend/lib/api/mockApi.ts` e `mock/data.ts` | Sem chamadas de rede; dados em memória (K-01, K-02) |
| Leitura de `frontend/next.config.ts` | Sem `headers()`/CSP (K-03) |
| Leitura de `.github/workflows/mailchat-ci.yml` | `typecheck → lint → test → build → e2e`; sem `gitleaks`/audit (K-04) |
| Leitura de `frontend/package.json` | Ranges `^`; lockfile presente (K-05) |
| Busca por padrões de segredo no escopo `email-whatsapp/` | Nenhum segredo real encontrado (K-07) |
| `gitleaks` / `osv-scanner` executados | **Não executados** — ferramentas indisponíveis neste ambiente; executar no CI (SR-39, SR-40) |
| DAST | Não aplicável (app mock, sem API real) |

## 4. Veredito

**APTO COM RESSALVAS PARA PLANEJAMENTO.**

A documentação de planejamento e segurança está apta a orientar a implementação. A implementação
com dados reais **está bloqueada** até que:

1. `SR-21..SR-24` (isolamento multi-tenant) estejam implementados e testados (`ST-17`).
2. `SR-07..SR-13` (tokens e redaction) estejam implementados e verificados (`ST-11`).
3. `SR-26` (sanitização de HTML) esteja implementado (`ST-20`).
4. `SR-39`/`SR-40` (segredos e dependências) estejam no CI e limpos.
5. O gate de go-live do [checklist](checklist-deploy.md) §5 esteja completo.

## 5. Próximos passos de segurança

1. Aprovar este laudo e o threat model (usuário).
2. Criar as issues filhas `#15`, `#16`, `#21`, `#23` (já abertas pelo MASTER).
3. Implementar controles por fase, com evidência anexada em cada PR.
4. Reauditar ao final de F1, F3 e F4.
5. Iniciar verificação Google/CASA em paralelo (#24).
