# Brief do Protótipo — MailChat (e-mail em estilo WhatsApp)

## 1. Objetivo

Validar, antes de qualquer backend, a ideia de um cliente de e-mail com experiência de conversa:
remetentes listados como contatos, e-mail e respostas renderizados como bolhas de chat,
artefatos (anexos) dentro da conversa, paletas de cor variáveis e uma agenda com post-its
que permitem anexar um e-mail a um compromisso.

**Métrica de sucesso:** o usuário consegue (1) identificar o remetente, (2) ler a conversa e localizar
um artefato e (3) anexar o e-mail a um compromisso em menos de 60 segundos; taxa de conclusão
das 3 tarefas do roteiro ≥ 80%.

## 2. Persona e JTBD

- **Persona:** profissional ocupado que recebe dezenas de e-mails por dia com anexos e precisa
  decidir rápido entre responder, encaminhar ou agendar uma ação.
- **JTBD:** "Quando recebo um e-mail com anexos, quero vê-lo como uma conversa e decidir
  rapidamente se respondo agora ou marco uma ação na agenda."

## 3. Telas (escopo cortado: 1 tela)

**Tela 01 — MailChat** (arquivo `prototipos/email-whatsapp.html`):
- Painel esquerdo: contatos (remetentes) com avatar, nome, e-mail, assunto, não lidos e busca.
- Painel central: conversa em bolhas estilo WhatsApp (entrada/saída, ticks de leitura, horários),
  artefatos renderizados como cartões de arquivo e campo para escrever resposta.
- Painel direito: agenda com mini-calendário do mês, lista do dia selecionado e post-its
  (título, horário, cor, chip do e-mail anexado).
- Topo: seletor de paletas (5 temas) e configurações de e-mail (IMAP/SMTP simulados).

## 4. Fora de escopo

- Autenticação real (IMAP/SMTP), envio/recebimento real de e-mails.
- Persistência em backend/banco; múltiplas contas; notificações; push.
- Arrastar e soltar arquivos reais; integração com Google/Outlook Calendar.
- Testes automatizados e CI.

## 5. Stack e desvios registrados

| Padrão PROTOMASTER | Adotado | Motivo |
|---|---|---|
| Pasta `prototipos/` + hub `index.html` | Sim | Convenção do repo (`docs/prototipos/index.html` como precedente) |
| Single-file por tela (CSS/JS inline) | Sim | Abre com duplo clique, sem build |
| Tailwind CDN + CSS/JS inline | **Desvio:** CSS customizado inline na tela | Protótipo precisa abrir 100% offline, sem depender de CDN; o hub usa Tailwind CDN |
| Mobile-first | **Desvio:** desktop-first com fallback responsivo | Cliente de e-mail de 3 painéis; em ≤900px a lista vira tela cheia e o chat/agenda viram overlay |

## 6. Paletas

Cinco temas via variáveis CSS (`data-theme`): `whatsapp` (verde, padrão), `oceano` (azul),
`violeta`, `rosa` e `noturno` (dark). Bolhas de saída, cabeçalho, ticks e badges mudam por tema.

## 7. Ciclo e status

Ciclo proto-first: `PROPOSTA → NAVEGÁVEL → VALIDADA → APROVADA → IMPLEMENTADA`.

- Status atual: **APROVADA** em 2026-11-14 (validada em navegador e aprovada pelo usuário — ver `docs/proto/10-roteiro-teste.md`).
- DoD: brief + tela navegável via hub + roteiro de teste + sem link quebrado + docs atualizados.

## 8. Registro de alterações

| Data | Alteração | Responsável |
|---|---|---|
| 2026-11-14 | Criação do protótipo NAVEGÁVEL | @planmaster |
| 2026-11-14 | Alinhamento à estrutura padrão (prototipos/ + docs/proto) e a11y | @planmaster |
| 2026-11-14 | Validação em navegador (3/3 tarefas) e aprovação do protótipo | usuário / @planmaster |
