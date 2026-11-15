# ADR-002 — Gmail API (REST) em vez de IMAP/SMTP com XOAUTH2

- **Status:** Aceito (sujeito a aprovação final do usuário)
- **Data:** 2026-11-15
- **Decisores:** usuário (produto), MASTER, PLANMASTER
- **Issues:** [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12)
- **Relacionados:** [ADR-001](ADR-001-oauth2-vs-senha-de-app.md), [ADR-003](ADR-003-multitenancy-token-storage.md)

## Contexto

Com OAuth2 decidido (ADR-001), restam dois caminhos técnicos para acessar o conteúdo:

1. **Gmail API v1** — REST/JSON, autenticada por `Bearer access_token`.
2. **IMAP + SMTP com XOAUTH2** — protocolos de e-mail clássicos, autenticados com o mesmo
   `access_token` via SASL XOAUTH2.

O produto precisa de: sincronização incremental eficiente, threads nativas (a UI é uma conversa),
download de anexos, envio com threading correto e bom comportamento sob quota.

## Decisão

Adotar **Gmail API v1** como mecanismo primário de leitura, sincronização e envio.

Uso previsto dos métodos:
- `users.getProfile` → `historyId` base e endereço da conta.
- `users.messages.list` → listagem paginada com filtro de janela.
- `users.messages.get` → metadados (`format=metadata`) e corpo (`format=full`) sob demanda.
- `users.history.list` → sincronização incremental.
- `users.messages.attachments.get` → download de anexos.
- `users.messages.send` → envio de MIME bruto (`raw` base64url) com `threadId`.
- `users.messages.modify` → **não usado** nesta fase (exigiria `gmail.modify`).

IMAP/SMTP XOAUTH2 permanece como **fallback arquitetural documentado** para quando houver suporte
a outros provedores, não como implementação desta release.

## Comparação

| Critério | Gmail API v1 | IMAP/SMTP XOAUTH2 |
|---|---|---|
| Modelo | REST/JSON stateless | Protocolos stateful, conexões longas |
| Threads | Nativas (`threadId`) | Reconstrução manual por `Message-ID`/`References`/`Subject` |
| Incremental | `historyId` + `history.list` | `UIDVALIDITY`/`UID` + `IDLE` (complexo, específico por servidor) |
| Labels | Nativas e consultáveis | Pastas; mapeamento imperfeito |
| Anexos | `attachmentId` + download dedicado | Parsing de MIME manual |
| Envio | `messages.send` com `raw` | SMTP + MIME manual |
| Quota | Unidades por projeto e por usuário | Limites do servidor, menos previsíveis |
| Observabilidade | Erros JSON estruturados, `Retry-After` | Códigos IMAP textuais, semântica inconsistente |
| Push | `users.watch` + Pub/Sub (fase futura) | `IDLE` por conexão (custo alto) |
| Complexidade de cliente | Média (MIME + paginação) | Alta (parsing MIME, estados, reconexão) |
| Lock-in | Alto (específico do Google) | Baixo (padrão aberto) |
| Escopos | Granulares (`readonly`/`send`) | OAuth2 também, mas granularidade depende do provedor |

## Justificativa

- **Threads e labels nativos** reduzem drasticamente o código de agrupamento que a UI exige.
- **`historyId`** é uma primitiva de sincronização confiável, com semântica clara de expiração
  (404 → full resync). Implementar o equivalente em IMAP é caro e frágil.
- **Quota previsível** permite planejar custo por usuário e ajustar a janela de sync.
- **Erros estruturados** simplificam retry/backoff e observabilidade.
- **MIME é necessário nos dois caminhos**: a API exige MIME em `raw` para envio, então o esforço
  de montagem não é exclusivo do IMAP. A diferença é que a API não exige parsing de entrada.

## Consequências

### Positivas
- Menos código proprietário de sincronização; menos bugs de thread.
- Melhor rastreabilidade de quota e de erros.
- Caminho claro para push futuro (`users.watch` + Pub/Sub).

### Negativas
- **Lock-in** com o Google nesta fase. Mitigação: camada `modules/gmail` com interface
  (`MailProvider`) para permitir adaptador IMAP/SMTP depois (fase multi-provedor).
- **MIME manual** no envio: risco de headers malformados. Mitigação: biblioteca consolidada +
  testes com fixtures + validação de CRLF.
- **Unidades de quota** por chamada exigem cuidado: preferir `metadata` e evitar `threads.get`
  em laço.
- Requer **verificação Google** para escopos restritos (ver ADR-001 e plano de verificação).

## Interface de abstração proposta

```ts
export interface MailProvider {
  getProfile(accountId: string): Promise<{ email: string; historyId: string }>;
  listMessageIds(accountId: string, opts: { query: string; pageToken?: string }): Promise<{ ids: string[]; nextPageToken?: string }>;
  getMessageMetadata(accountId: string, messageId: string): Promise<MessageMetadata>;
  getMessageFull(accountId: string, messageId: string): Promise<MessageFull>;
  getAttachment(accountId: string, messageId: string, attachmentId: string): Promise<ReadableStream>;
  sendRaw(accountId: string, raw: Buffer, threadId?: string): Promise<{ id: string; threadId: string }>;
  listHistory(accountId: string, startHistoryId: string): Promise<HistoryPage>;
  revoke(accountId: string): Promise<void>;
}
```

O adaptador Gmail implementa essa interface agora; um adaptador IMAP/SMTP XOAUTH2 pode ser
adicionado sem alterar o domínio.

## Critérios de reversão / revisão

Reavaliar esta decisão se:
1. Houver requisito de suportar Outlook/IMAP genérico em até 6 meses.
2. A quota da Gmail API se tornar limitante mesmo após otimizações.
3. O Google alterar termos de forma incompatível com o produto.

Nesses casos, manter a interface `MailProvider` e criar `ADR-004` para o adaptador alternativo.

## Referências

- Gmail API v1 — Reference, quotas e `history`.
- RFC 3501 (IMAP4rev1), RFC 5321 (SMTP), RFC 7628 (SASL XOAUTH2), RFC 5322 (MIME).
- `docs/gmail/SRS-gmail-oauth2.md` §10–§12.
