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
