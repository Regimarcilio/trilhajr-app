# MailChat

Cliente de e-mail com **experiência de conversa estilo WhatsApp**: remetentes como contatos,
e-mails e respostas em bolhas, anexos como cartões, 5 paletas de cor e uma agenda com post-its
que vinculam um e-mail a um compromisso.

> **Status:** frontend concluído, espelhando o protótipo **APROVADO** em 2026-11-14.
> O escopo é o do protótipo (`docs/proto/00-brief.md`): a aplicação roda com dados mock.
> Backend real, IMAP/SMTP, autenticação e notificações estão **fora de escopo**.

## Telas

Tela única com três painéis:

| Painel | Conteúdo |
|---|---|
| Esquerda | Contatos/remetentes com avatar, assunto, não lidos e busca |
| Centro | Conversa em bolhas (ticks, horários, separador de data) e artefatos |
| Direita | Agenda com mini-calendário e post-its do dia |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** com CSS variables (`data-theme`)
- **Zustand** (estado de UI) + **TanStack Query** (dados)
- **React Hook Form + Zod 4** (formulários)
- **Radix UI** (dialog) + **lucide-react** (ícones)
- **Vitest + Testing Library** (unit) e **Playwright** (E2E)

## Estrutura

```
email-whatsapp/
├── frontend/                  # aplicação Next.js
│   ├── app/                   # layout, página e providers
│   ├── components/            # SidebarContatos, Conversa, Agenda, PostIt, modais...
│   ├── hooks/                 # queries e mutations (TanStack Query)
│   ├── lib/                   # tipos, utilitários e adapter mock
│   ├── store/                 # Zustand (tema, seleção, agenda, toasts)
│   ├── tests/                 # Vitest
│   └── e2e/                   # Playwright
├── prototipos/                # protótipo HTML aprovado (fonte da verdade visual)
└── docs/                      # brief, roteiro, SRS, dev-log e conhecimento
```

## Pré-requisitos

- Node.js **22+**
- npm **10+**

## Como rodar

```bash
cd email-whatsapp/frontend
npm ci
cp .env.example .env.local   # opcional — o mock não consome a URL
npm run dev                  # http://localhost:3000
```

Se a porta 3000 estiver ocupada: `npm run dev -- -p 3100`.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento na porta 3000 |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build na porta 3000 |
| `npm run lint` | ESLint (flat config, Next 16) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Vitest em watch |

## Testes

**Unitários (13):**

```bash
npm test
```

**E2E (3 cenários do roteiro):**

```bash
npx playwright install chromium   # primeira vez
npx playwright test
```

O `playwright.config.ts` sobe o app automaticamente na **porta 3100** (build + start) e a
derruba ao final. Para apontar para um ambiente já em execução:

```bash
E2E_BASE_URL=http://localhost:3000 npx playwright test
```

## CI

`.github/workflows/mailchat-ci.yml` roda em `push`/`pull_request` para `develop`, apenas quando
`email-whatsapp/**` muda:

- **quality:** typecheck → lint → test → build
- **e2e:** Playwright/Chromium (publica o report como artefato)

## Documentação

- [Brief do protótipo](docs/proto/00-brief.md)
- [Roteiro de teste](docs/proto/10-roteiro-teste.md)
- [Mapa de implementação](docs/proto/20-mapa-implementacao.md)
- [SRS](docs/SRS.md)
- [Dev log](docs/dev-log.md)
- [Base de conhecimento](docs/conhecimento/INDICE.md)

## Limitações conhecidas (escopo do protótipo)

- Dados em memória (`lib/mock/data.ts`): recarregar a página perde respostas e post-its criados.
- Configurações IMAP/SMTP são simuladas; nenhum e-mail é enviado ou recebido.
- O botão de anexo é um placeholder.
- Tema e configurações não persistem entre sessões.

Esses itens estão fora do escopo formalizado no brief (§4) e não bloqueiam a conclusão do protótipo.
