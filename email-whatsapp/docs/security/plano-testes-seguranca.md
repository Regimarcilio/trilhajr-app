# Plano de testes de segurança — MailChat + Gmail OAuth2

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Autor:** KALIMASTER (squad)
- **Issues:** [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13) · [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12)
- **Referências:** [Requisitos de hardening](requisitos-hardening.md) (`SR-xx`) · [Threat model](threat-model-stride.md) (`T-xx`) · [Critérios de aceite](../gmail/criterios-aceite.md) (`AC-GM-xx`)

## 1. Estratégia

| Camada | Ferramenta | Escopo |
|---|---|---|
| Unitário | Vitest | crypto, validação, montagem de MIME, sanitização |
| Integração | Vitest + Supertest (ou `hurl`) | rotas, sessão, OAuth2 com mock do Google, cross-tenant |
| E2E | Playwright | fluxo de conexão, lista, conversa, envio, estados de erro |
| Carga/abuso | k6 | rate limit, paginação, latência |
| Estático | `gitleaks`, `semgrep`, `osv-scanner`, `npm audit` | segredos, padrões inseguros, dependências |
| Dinâmico | OWASP ZAP baseline, Nuclei | headers, exposição, configurações |
| Manual/processo | checklist + tabletop | LGPD, incidente, backup/restore |

**Ambientes:** `test` (banco efêmero, mock do Google) e `staging` (projeto Google de teste,
2 usuários de teste). Nunca executar DAST contra servidor de produção sem janela aprovada.

**Dados:** fixtures sintéticas (nunca e-mails reais de usuários).

## 2. Casos de teste

| ID | Objetivo | Requisito | Tipo | Esperado | Evidência |
|---|---|---|---|---|---|
| ST-01 | Callback sem `state` | SR-01 | Integração | `400 OAUTH_STATE_INVALID`; sem sessão | Log do teste |
| ST-02 | `state` divergente do cookie | SR-01 | Integração | `400`; auditoria `access.denied` | Log + `audit_log` |
| ST-03 | `state` expirado e reutilizado | SR-01 | Integração | `400` nas duas tentativas | Log |
| ST-04 | Callback sem `code_verifier` correto | SR-02 | Integração | `400`; `code` não trocado | Mock do Google não chamado |
| ST-05 | `redirect_uri` fora da allowlist | SR-03 | Integração | `400`; sem redirect | Log |
| ST-06 | `id_token` com `aud`/`iss`/`nonce` inválido ou `email_verified=false` | SR-04 | Unitário | Rejeição | Teste |
| ST-07 | Reuso de `code` e escopo não solicitado | SR-05 | Integração | `400` / rejeição de escopo | Log |
| ST-08 | Rotação de chave: token antigo ainda legível, novo grava `key_version+1` | SR-08 | Integração | Zero perda; versão correta | Métrica/consulta |
| ST-09 | Desconectar revoga no Google | SR-10 | Integração | Chamada a `/revoke`; linha apagada | Mock + banco |
| ST-10 | `invalid_grant` na sync | SR-11 | Integração | `status=revoked`; 1 tentativa | Log |
| ST-11 | Varredura de logs/respostas por token | SR-12, SR-13 | Automatizado | 0 ocorrências de padrão de token | Relatório de grep |
| ST-12 | Flags do cookie de sessão | SR-15 | E2E | `HttpOnly; Secure; SameSite=Lax` | Headers capturados |
| ST-13 | Logout e uso posterior do cookie | SR-17 | Integração | `401` após logout | Log |
| ST-14 | POST sem `X-CSRF-Token` e com `Origin` externo | SR-18, SR-19 | Integração | `403` | Log |
| ST-15 | Fixation: cookie pré-existente antes do login | SR-20 | Integração | ID de sessão rotacionado | Comparação |
| ST-16 | Múltiplas tentativas de auth | SR-20 | Carga | `429` com backoff | k6 |
| ST-17 | Cross-tenant em thread/message/attachment/account/postit | SR-21..SR-23 | Integração | `404` + `access.denied` | Log + banco |
| ST-18 | Comparação de respostas para IDs existentes/inexistentes | SR-23 | Integração | Corpo e timing equivalentes | Diff de respostas |
| ST-19 | Payload acima do limite / destinatários demais | SR-25 | Integração | `413`/`422` | Log |
| ST-20 | HTML com `script`, `onerror`, `javascript:`, `iframe`, CSS exfiltração | SR-26 | Unitário + E2E | Neutralizado; 0 execução | Playwright |
| ST-21 | CRLF em assunto/destinatário | SR-27 | Unitário | `422`; nenhum header extra | Teste |
| ST-22 | Reenvio com a mesma `Idempotency-Key` | SR-28 | Integração | 1 envio; resposta original | Mock Gmail |
| ST-23 | Resposta de anexo | SR-29, SR-31 | Integração | `attachment` + `nosniff`; sem inline HTML | Headers |
| ST-24 | URL de imagem apontando para `127.0.0.1`/metadata | SR-30 | Integração | Bloqueio; proxy não acessa | Log |
| ST-25 | Nome `../../etc/passwd`, unicode RTL, 26 MB | SR-31 | Unitário | Sanitizado; `413` | Teste |
| ST-26 | Amostra de logs com fluxo completo | SR-32, SR-14 | Manual automatizado | JSON válido, sem corpo/PII | Relatório |
| ST-27 | Eventos de auditoria do fluxo completo | SR-34 | Integração | Todos os eventos presentes | Consulta |
| ST-28 | Limite de envios/hora | SR-36 | Carga | `429` + `Retry-After` | k6 |
| ST-29 | Gmail devolve 429/503 | SR-37 | Integração | Backoff, máx. 5, `degraded` | Mock |
| ST-30 | Backup criptografado e restore | SR-38 | Manual | Restore íntegro em ambiente limpo | Registro datado |
| ST-31 | TLS/HSTS | SR-41 | DAST | TLS 1.2+, redirect 301, HSTS | ZAP/Nuclei |
| ST-32 | Headers de segurança e CSP | SR-42 | DAST/E2E | Presentes; CSP sem bypass | Relatório |
| ST-33 | CORS com origem não autorizada | SR-43 | Integração | Sem `Access-Control-Allow-Origin` | Headers |
| ST-34 | Consentimento e link da política | SR-45 | E2E | Tela exibe escopos e link válido | Screenshot |
| ST-35 | Expurgo após retenção | SR-46 | Integração | Dados removidos; auditoria mantida | Consulta |
| ST-36 | Exportação e exclusão LGPD | SR-47 | Integração | JSON completo / dados apagados | Arquivo + banco |
| ST-37 | Tabletop de incidente | SR-48 | Processo | Runbook seguido; notificação simulada | Ata |

## 3. Casos críticos em Gherkin

### ST-17 — cross-tenant

```gherkin
Cenário: usuário A acessa recurso do usuário B
  Dado que A e B têm contas conectadas e threads sincronizadas
  Quando A envia GET /api/threads/{thread_de_B}
  Então a resposta é 404
  E o corpo é idêntico ao de um ID inexistente
  E existe registro access.denied na auditoria com A como autor
```

### ST-11 — vazamento de token

```gherkin
Cenário: nenhum token em artefatos
  Dado que executei conexão, sync, leitura e envio em ambiente de teste
  Quando varro logs, respostas HTTP, HTML e storage do navegador
    procurando padrões ya29., 1//, "refresh_token" e "client_secret"
  Então não há nenhuma ocorrência em claro
```

### ST-14 — CSRF

```gherkin
Cenário: requisição de escrita sem token CSRF
  Dado que estou autenticado
  Quando envio POST /api/messages/send sem X-CSRF-Token
  Então a API responde 403
  E nenhum e-mail é enviado
```

### ST-20 — XSS

```gherkin
Cenário: e-mail com HTML malicioso
  Dado um e-mail com <script>alert(1)</script>, <img onerror> e link javascript:
  Quando abro a mensagem no navegador
  Então nenhum script executa
  E nenhum alerta aparece
  E o texto legítimo continua visível
```

### ST-22 — idempotência

```gherkin
Cenário: retry de envio
  Dado que enviei uma mensagem com Idempotency-Key "k-123"
  Quando repito a requisição com a mesma chave
  Então a API responde 200 com o mesmo messageId
  E o serviço de envio foi chamado uma única vez
```

## 4. Matriz de cobertura (requisito → teste)

| Requisito | Testes |
|---|---|
| SR-01..SR-06 | ST-01..ST-07 |
| SR-07..SR-12 | ST-08..ST-11 |
| SR-13..SR-14 | ST-11, ST-26 |
| SR-15..SR-20 | ST-12..ST-16 |
| SR-21..SR-24 | ST-17, ST-18 |
| SR-25..SR-28 | ST-19..ST-22 |
| SR-29..SR-31 | ST-23..ST-25 |
| SR-32..SR-35 | ST-26, ST-27 |
| SR-36..SR-37 | ST-28, ST-29 |
| SR-38..SR-40 | ST-30 + CI |
| SR-41..SR-44 | ST-31..ST-33 |
| SR-45..SR-48 | ST-34..ST-37 |

## 5. Comandos de referência

```bash
# Segredos e dependências (CI)
gitleaks detect --no-git --redact
npm audit --audit-level=high
npx osv-scanner -r .

# Estático
npx semgrep --config=p/owasp-top-ten email-whatsapp/backend

# Testes
cd email-whatsapp/backend && npm test
cd email-whatsapp/frontend && npm test && npx playwright test

# DAST em staging (somente com autorização)
docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t https://staging.<host>
nuclei -u https://staging.<host> -severity critical,high

# Carga
k6 run tests/load/rate-limit.js
```

## 6. O que roda no CI vs manual

| Fase | Automático no CI | Manual/staging |
|---|---|---|
| PR | unitários, integração com mock, `gitleaks`, `npm audit`, lint/typecheck | — |
| Pré-release | E2E Playwright, semgrep, osv-scanner | ZAP/Nuclei, k6, restore de backup |
| Pré-go-live | regressão completa | tabletop LGPD/incidente, revisão de headers, consent screen |
| Contínuo | scans agendados (semanal) | revisão trimestral do threat model |

## 7. Critérios de "verde"

- 100 % dos testes MUST verdes e sem `skip` injustificado.
- Nenhum Critical/High aberto no laudo.
- `gitleaks` e `npm audit` limpos.
- Evidência anexada no PR (log, relatório ou screenshot) para cada `ST-xx` crítico.
- Regressão de segurança executada a cada PR que toque `email-whatsapp/backend/**`.
