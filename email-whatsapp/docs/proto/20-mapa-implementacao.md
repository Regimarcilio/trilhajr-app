# Mapa de Implementação — MailChat (Tela 01)

- **Protótipo aprovado:** `prototipos/email-whatsapp.html` (status APROVADO, 2026-11-14)
- **Handoff:** `@frontdev` implementa espelhando este protótipo tela a tela.

## 1. Tela → Rota → Componente

| Tela | Rota sugerida | Componente(s) |
|---|---|---|
| Hub de protótipos | `/` | `PrototiposHub` |
| MailChat (lista + conversa + agenda) | `/mailchat` | `SidebarContatos`, `Conversa`, `BolhaMensagem`, `CartaoArtefato`, `Agenda`, `PostIt`, `ThemeSwitcher`, `ConfiguracoesEmail` |

## 2. Contratos mock (JSON de entrada/saída)

- `GET /api/contatos` → lista de remetentes (id, nome, email, assunto, nao_lidos, ultimaMensagem).
- `GET /api/contatos/:id/conversa` → array de mensagens (`de`, `remetente`, `texto`, `em`, `artefato?`).
- `POST /api/conversas/:id/respostas` → cria resposta do usuário (`de: "remetente"`, status `read`).
- `POST /api/postits` → cria compromisso (`titulo`, `data`, `horario`, `cor`, `emailId?`).
- `GET /api/agenda?data=YYYY-MM-DD` → post-its do dia.

## 3. Divergências

Nenhuma: a implementação deve espelhar o protótipo. Qualquer divergência volta como delta em `docs/proto/`, nunca silenciosa.

## 4. Próximos passos

1. `@frontdev` implementa a tela em `feature/front-mailchat-*` a partir de `develop`.
2. `@qamaster` converte o roteiro em casos Playwright.
3. `@planmaster` registra AC Gherkin na issue.
