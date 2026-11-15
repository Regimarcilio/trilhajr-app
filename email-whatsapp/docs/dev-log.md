# Dev Log — MailChat

## 2026-11-14 — Protótipo MailChat (e-mail em estilo WhatsApp) — @planmaster
- **Objetivo:** transformar a ideia "cliente de e-mail em estilo WhatsApp com agenda/post-its" em protótipo navegável.
- **Branch:** a definir (`DEV-proto-email-whatsapp`, a partir de `develop`).
- **Decisões:**
  - Single-file HTML + CSS/JS inline, offline-first (sem CDN na tela principal).
  - 5 paletas via variáveis CSS (`data-theme`), incluindo tema escuro.
  - Agenda com mini-calendário e post-its; anexo de e-mail via botão no topo da conversa.
  - Alinhado à estrutura padrão: `prototipos/` (hub + tela), `docs/proto/`, `docs/dev-log.md`, `docs/conhecimento/`.
- **Arquivos:**
  - `email-whatsapp/prototipos/index.html` (hub)
  - `email-whatsapp/prototipos/email-whatsapp.html` (tela)
  - `email-whatsapp/docs/proto/00-brief.md`, `email-whatsapp/docs/proto/10-roteiro-teste.md`
  - `email-whatsapp/docs/conhecimento/INDICE.md`, `LICAO-001-single-file-offline.md`
- **Testes:** validação em navegador (Playwright) do hub, das 3 tarefas do roteiro, das paletas e dos modais; auto-teste 3/3 e 0 erros de console.
- **Resultado:** protótipo **APROVADO** pelo usuário em 2026-11-14 (prints em `docs/proto/prints/`).
- **Pendências:** commit em `DEV-proto-email-whatsapp`; handoff para `@frontdev` (implementação espelha o protótipo).

## 2026-11-14 — Handoff MailChat → @frontdev — @planmaster
- **Objetivo:** formalizar o handoff do protótipo aprovado para implementação.
- **Mapa:** `docs/proto/20-mapa-implementacao.md` (tela → rota → componente).
- **Contratos mock:** `prototipos/_data/mock-contacts.json`.
- **Próximo despacho:** `@frontdev` implementa em `feature/front-mailchat-*` a partir de `develop`.

## 2026-11-14 — MailChat (implementação frontend) — @frontdev

- **Objetivo:** transformar o protótipo APROVADO em aplicação real (Next.js), espelhando a tela a tela.
- **Branch:** `feature/front-mailchat-email-whatsapp` (a partir de `develop`).
- **Decisões:**
  - App Next.js 16 (App Router, RSC) em `email-whatsapp/frontend/`; protótipo mantido como fonte da verdade.
  - Contratos mock consumidos via `lib/api/mockApi.ts` (GET /api/contatos, GET /api/contatos/:id/conversa, POST /api/conversas/:id/respostas, POST /api/postits, GET /api/agenda?data=YYYY-MM-DD).
  - Estado global (tema/configurações/seleção/agenda/toasts) em Zustand; dados em TanStack Query; formulários RHF+Zod.
  - Tema via CSS variables (`data-theme`) com 5 paletas; responsivo (≤900px lista→chat overlay; ≤1100px agenda overlay).
- **Arquivos:** `email-whatsapp/frontend/**` (app, components, lib, hooks, store, tests, e2e).
- **Testes:** 13/13 Vitest verdes; typecheck limpo; `next build` OK; validação Playwright (DOM) — envio, tema, post-it, modais, 0 erros de console; `npm audit` 0 vulnerabilidades (zod 4.6.7, vitest 5.1.0).
- **Pendências:** integração com API real (BACKDEV); persistência backend; notificações.

## 2026-11-15 — Conclusão do escopo do protótipo — @issuemaster

- **Objetivo:** encerrar as pendências do escopo formalizado no brief, sem ampliar para backend.
- **Merge:** PR #9 (`DEV` → `develop`) — frontend MailChat integrado.
- **Gates corrigidos:**
  - #5 lint: ESLint 9 + `eslint-config-next` 16 (flat config); script `eslint .`; correções reais em `input.tsx` e `PostItModal.tsx`.
  - #6 E2E: locators escopados ao painel central; `webServer` na porta 3100; `test-results/` e `playwright-report/` ignorados.
- **Qualidade:** 13/13 Vitest, 3/3 Playwright, lint/typecheck/build verdes, `npm audit` 0.
- **CI (#7):** `.github/workflows/mailchat-ci.yml` escopado a `email-whatsapp/**` (quality + e2e).
- **Documentação (#8):** `README.md`, `docs/SRS.md`, `.env.example`.
- **Escopo:** #4 (backend/persistência) encerrado como **fora do escopo** do protótipo (brief §4).
- **Lições registradas:** Next 16 removeu `next lint`; Playwright exige locators escopados quando o texto aparece em dois painéis; porta 3000 pode estar ocupada por outro app, então o E2E usa 3100.
- **Resultado:** escopo do protótipo **CONCLUÍDO**. Sem pendências abertas neste projeto.

## 2026-11-15 — Planejamento da integração Gmail OAuth2 — @planmaster (issue #12)

- **Objetivo:** especificar a evolução do MailChat de mock para Gmail real (OAuth2, leitura + envio, multiusuário) sem implementar código.
- **Branch:** `ISSUE` (a partir de `develop`); PR aberto, **sem merge** (aguarda aprovação do usuário).
- **Task:** execução direta pelo MASTER — despacho via subagente indisponível no ambiente (`subagent depth limit reached`); papéis de PLANMASTER exercidos na mesma sessão.
- **Decisões:**
  - OAuth2 Authorization Code + PKCE S256, `state` de uso único, escopos `openid email profile gmail.readonly gmail.send` (ADR-001).
  - Gmail API v1 como provedor primário, com interface `MailProvider` para permitir IMAP/SMTP XOAUTH2 no futuro (ADR-002).
  - Multi-tenancy por coluna `user_id` + repositórios escopados + RLS opcional; refresh token com AES-256-GCM e `key_version` (ADR-003).
  - Sync: janela de 90 dias, `format=metadata` na listagem, corpo sob demanda, `historyId` incremental com full resync em 404.
  - Envio: MIME RFC 2822, `In-Reply-To`/`References`/`threadId`, `Idempotency-Key`, limite de 25 MB.
- **Arquivos:**
  - `email-whatsapp/docs/gmail/SRS-gmail-oauth2.md`
  - `email-whatsapp/docs/gmail/arquitetura.md`
  - `email-whatsapp/docs/gmail/adr/ADR-001-oauth2-vs-senha-de-app.md`
  - `email-whatsapp/docs/gmail/adr/ADR-002-gmail-api-vs-imap-smtp-xoauth2.md`
  - `email-whatsapp/docs/gmail/adr/ADR-003-multitenancy-token-storage.md`
  - `email-whatsapp/docs/gmail/backlog-fases.md`
  - `email-whatsapp/docs/gmail/criterios-aceite.md`
  - `email-whatsapp/docs/gmail/plano-verificacao-google-lgpd.md`
  - `email-whatsapp/docs/gmail/README.md`
  - `email-whatsapp/.env.example` (placeholders OAuth2/segredos; nenhum segredo real)
- **Issues filhas:** #14–#24 (backend, frontend, infra, QA, sec, docs), relacionadas a #12/#13.
- **Testes:** não aplicável (documentação). Estrutura de markdown e blocos Mermaid revisados; suíte E2E não executada por não ser necessária.
- **Pendências:** aprovação do usuário; criação do projeto Google Cloud; verificação/CASA; implementação conforme fases F0–F5.

## 2026-11-15 — Threat model e hardening OAuth2 multiusuário — @kalimaster (issue #13)

- **Objetivo:** produzir threat model STRIDE e requisitos de segurança antes da implementação, evitando retrabalho e vazamento de credenciais/dados.
- **Branch:** `SEG` (a partir de `develop`); PR aberto, **sem merge** (aguarda aprovação do usuário).
- **Task:** execução direta pelo MASTER — despacho via subagente indisponível no ambiente (`subagent depth limit reached`); papel de KALIMASTER exercido na mesma sessão.
- **Decisões:**
  - 28 ameaças mapeadas (T-01..T-28) em OAuth2, sessão, sync, leitura, envio, anexos e operação; top 10 com IDOR, vazamento de token e supply chain no topo.
  - 48 requisitos verificáveis (SR-01..SR-48) com nível MUST/SHOULD, evidência e fase.
  - 37 casos de teste de segurança (ST-01..ST-37), com matriz de cobertura.
  - Gate de go-live binário e checklist de deploy; proibição de reiniciar `mailchat.service` nesta fase.
  - Laudo inicial: 7 achados confirmados (nenhum crítico explorável no mock) e 7 riscos de projeto.
- **Arquivos:**
  - `email-whatsapp/docs/security/threat-model-stride.md`
  - `email-whatsapp/docs/security/requisitos-hardening.md`
  - `email-whatsapp/docs/security/plano-testes-seguranca.md`
  - `email-whatsapp/docs/security/checklist-deploy.md`
  - `email-whatsapp/docs/security/laudo-inicial.md`
  - `email-whatsapp/docs/security/README.md`
- **Testes:** `gitleaks` e `osv-scanner` não executados (indisponíveis no ambiente) — registrado no laudo; DAST não aplicável ao mock.
- **Resultado:** veredito **APTO COM RESSALVAS PARA PLANEJAMENTO**; implementação com dados reais bloqueada até SR-21..SR-24, SR-07..SR-13, SR-26, SR-39/SR-40.
