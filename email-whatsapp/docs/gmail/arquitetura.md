# Arquitetura — Integração Gmail OAuth2

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Referências:** [SRS](SRS-gmail-oauth2.md) · [ADR-001](adr/ADR-001-oauth2-vs-senha-de-app.md) · [ADR-002](adr/ADR-002-gmail-api-vs-imap-smtp-xoauth2.md) · [ADR-003](adr/ADR-003-multitenancy-token-storage.md) · [threat model](../security/threat-model-stride.md)

## 1. Arquitetura de componentes

```mermaid
flowchart LR
    U["Navegador<br/>Next.js 16 App Router"] -->|"HTTPS + cookie mc_session"| API["API HTTP<br/>Node 22 + Hono"]
    API --> MW["Middlewares<br/>authn, CSRF, rate limit, Zod"]
    MW --> SVC["Servicos de dominio<br/>accounts, threads, messages, send"]
    SVC --> REPO["Repositorios Drizzle<br/>sempre escopados por user_id"]
    SVC --> GCLI["Cliente Gmail<br/>OAuth2, retry, backoff"]
    SVC --> CRYPTO["Token vault<br/>AES-256-GCM + key_version"]
    REPO --> PG[("Postgres<br/>dados + audit_log")]
    CRYPTO --> PG
    API --> RD[("Redis opcional<br/>rate limit, locks, cache")]
    WK["Worker de sincronizacao<br/>fila por conta"] --> GCLI
    WK --> REPO
    WK --> RD
    GCLI -->|"REST JSON"| GAPI["Gmail API v1"]
    API -->|"OAuth2 authorization code"| GAUTH["Google Identity<br/>accounts.google.com"]
    OPS["Operacao<br/>logs e metricas"] --> PG
    OPS --> RD
```

**Decisões de arquitetura**

1. **API separada do frontend**: o Next.js deixa de conter regra de negócio; passa a consumir `NEXT_PUBLIC_API_BASE_URL`. Permite evoluir o backend sem reescrever a UI.
2. **Worker de sincronização com fila por conta**: sync é assíncrono, com lock por `account_id`, evitando execuções concorrentes e mantendo a API responsiva.
3. **Metadados na listagem, corpo sob demanda**: reduz quota e storage; `format=metadata` na sync, `format=full` ao abrir a thread.
4. **Token vault isolado**: criptografia e rotação de chave ficam em um módulo único, auditável, com AAD por conta (ADR-003).
5. **Repositórios com `userId` obrigatório**: o isolamento multi-tenant é estrutural, não uma checagem opcional no handler.
6. **Postgres como fonte de verdade local**: o Gmail é a origem, mas a UI lê do banco; `gmail_message_id` garante idempotência.
7. **Redis opcional**: em instância única, rate limit em memória é aceitável; Redis entra quando houver múltiplas instâncias ou fila persistente.
8. **Sem JWT no cliente**: sessão opaca server-side com cookie `HttpOnly`; reduz superfície de vazamento.

## 2. Fluxo OAuth2

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant FE as Frontend Next.js
    participant API as API Backend
    participant DB as Postgres
    participant G as Google Identity

    U->>FE: Clica em conectar Gmail
    FE->>API: GET /api/auth/google/start
    API->>API: Gera state e code_verifier, calcula S256
    API->>DB: Registra state pendente com TTL
    API-->>FE: 302 com Set-Cookie mc_oauth e URL de consentimento
    FE->>G: Redireciona para accounts.google.com
    U->>G: Autoriza escopos openid email profile gmail.readonly gmail.send
    G-->>API: 302 /api/auth/google/callback com code e state
    API->>DB: Valida state e expiracao, marca como usado
    API->>G: POST /token com code, verifier, client_id, client_secret
    G-->>API: access_token, refresh_token, id_token
    API->>API: Valida id_token e email_verified
    API->>API: Criptografa refresh_token com AES-256-GCM
    API->>DB: Upsert users, connected_accounts, oauth_tokens
    API->>DB: Cria sessao e registra audit_log account.connected
    API-->>FE: 302 / com Set-Cookie mc_session
    FE->>API: GET /api/me
    API-->>FE: Usuario e contas conectadas
    API->>API: Agenda primeira sincronizacao
```

**Pontos de falha e resposta**

| Ponto | Falha | Resposta |
|---|---|---|
| `/start` | Sem sessão | `401 UNAUTHENTICATED` |
| Callback | `state` inválido/expirado | `400 OAUTH_STATE_INVALID`, auditoria `access.denied` |
| Callback | `error=access_denied` | `409 OAUTH_CONSENT_DENIED`, UI explica |
| `/token` | HTTP 400 `invalid_grant` | `400 OAUTH_CODE_EXCHANGE_FAILED`, sem retry |
| `/token` | Sem `refresh_token` | `409 RECONSENT_REQUIRED` |
| `id_token` | `email_verified=false` | `401 EMAIL_NOT_VERIFIED` |

## 3. Sincronização inicial

```mermaid
sequenceDiagram
    autonumber
    participant WK as Worker
    participant DB as Postgres
    participant G as Gmail API

    WK->>DB: Adquire lock da conta (status running)
    WK->>G: users.getProfile
    G-->>WK: historyId base e emailAddress
    WK->>DB: Salva historyId base em sync_state
    loop Paginas de messages.list
        WK->>G: users.messages.list q=newer_than:90d maxResults=100
        G-->>WK: messages e nextPageToken
        WK->>G: users.messages.get em lote com format=metadata
        G-->>WK: headers, snippet, labelIds, threadId
        WK->>DB: Upsert threads e messages
        WK->>DB: Checkpoint cursor_page_token
    end
    WK->>DB: last_history_id, last_full_sync_at, status idle
    WK->>DB: Audit sync.completed
```

## 4. Sincronização incremental

```mermaid
sequenceDiagram
    autonumber
    participant WK as Worker
    participant DB as Postgres
    participant G as Gmail API

    WK->>DB: Le last_history_id da conta
    WK->>G: users.history.list startHistoryId
    alt Alteracoes disponiveis
        G-->>WK: history com messageAdded e labelRemoved
        WK->>DB: Aplica upserts nas threads afetadas
        WK->>DB: Atualiza last_history_id
        WK->>DB: Audit sync.completed
    else historyId expirado
        G-->>WK: HTTP 404
        WK->>DB: Marca full_resync_required
        WK->>G: Reinicia sincronizacao inicial
        WK->>DB: Audit sync.full_resync
    else Rate limit
        G-->>WK: HTTP 429 com Retry-After
        WK->>WK: Backoff exponencial com jitter
        WK->>DB: status degraded
    end
```

## 5. Envio e resposta

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant API as API Backend
    participant DB as Postgres
    participant G as Gmail API

    U->>API: POST /api/threads/:id/reply com Idempotency-Key
    API->>DB: Valida idempotencia e propriedade da thread
    API->>DB: Carrega Message-ID, References e anexos do usuario
    API->>API: Monta MIME RFC 2822 com In-Reply-To e References
    API->>G: users.messages.send com raw base64url e threadId
    alt Envio aceito
        G-->>API: id, threadId, labelIds
        API->>DB: Insere message outbound e audit message.sent
        API-->>U: 201 com messageId e sentAt
    else Falha definitiva
        G-->>API: HTTP 400 ou 403
        API->>DB: Registra falha com motivo sanitizado
        API-->>U: 502 ou 422 com codigo de erro
    else Timeout ambiguo
        API->>G: Consulta por rfc822msgid antes de decidir
        API-->>U: 202 reconcile_pending ou 200 se confirmado
    end
```

## 6. Ciclo de vida da conexão

```mermaid
stateDiagram-v2
    [*] --> pending: start OAuth2
    pending --> connected: callback valido e refresh token salvo
    pending --> [*]: consentimento negado ou state invalido
    connected --> degraded: 429 ou 5xx do Gmail
    degraded --> connected: proxima sync com sucesso
    connected --> revoked: invalid_grant
    degraded --> revoked: invalid_grant
    connected --> disconnected: usuario desconecta
    revoked --> pending: usuario reconecta
    disconnected --> pending: usuario reconecta
    revoked --> [*]: expurgo apos retencao
    disconnected --> [*]: expurgo apos retencao
```

## 7. Modelo de dados

```mermaid
erDiagram
    users ||--o{ sessions : "possui"
    users ||--o{ connected_accounts : "conecta"
    users ||--o{ threads : "possui"
    users ||--o{ postits : "cria"
    connected_accounts ||--|| oauth_tokens : "guarda"
    connected_accounts ||--|| sync_state : "controla"
    connected_accounts ||--o{ threads : "origina"
    threads ||--o{ messages : "contem"
    messages ||--o{ attachments : "possui"
    users ||--o{ audit_log : "gera"
    users ||--o{ idempotency_keys : "usa"

    users {
        uuid id PK
        text email UK
        text name
        text status
        timestamptz created_at
    }
    sessions {
        uuid id PK
        uuid user_id FK
        text token_hash
        timestamptz expires_at
        timestamptz last_seen_at
        timestamptz revoked_at
    }
    connected_accounts {
        uuid id PK
        uuid user_id FK
        text provider
        text provider_account_id
        text email
        text status
        text_array scopes
        timestamptz connected_at
        timestamptz last_sync_at
    }
    oauth_tokens {
        uuid id PK
        uuid account_id FK
        bytea refresh_ciphertext
        bytea refresh_iv
        bytea refresh_tag
        int key_version
        timestamptz access_expires_at
    }
    sync_state {
        uuid id PK
        uuid account_id FK
        text last_history_id
        text cursor_page_token
        text status
        int attempts
        text last_error_code
    }
    threads {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        text gmail_thread_id
        text subject
        text snippet
        timestamptz last_message_at
        int message_count
        boolean unread
    }
    messages {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        uuid thread_id FK
        text gmail_message_id
        text rfc_message_id
        text in_reply_to
        text direction
        text subject
        timestamptz sent_at
    }
    attachments {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        uuid message_id FK
        text gmail_attachment_id
        text filename_sanitized
        text mime_type
        int size_bytes
    }
    postits {
        uuid id PK
        uuid user_id FK
        uuid thread_id FK
        text title
        date date
        time time
        text color
    }
    audit_log {
        bigint id PK
        uuid user_id FK
        uuid account_id
        text action
        text resource_type
        text resource_id
        text outcome
        jsonb metadata
    }
    idempotency_keys {
        text key PK
        uuid user_id FK
        text request_hash
        jsonb response_json
        timestamptz created_at
    }
```

## 8. Fronteiras de confiança

```mermaid
flowchart TB
    subgraph Z1["Zona 1 - Navegador do usuario"]
        BR["SPA Next.js<br/>cookie HttpOnly"]
    end
    subgraph Z2["Zona 2 - Servidor da aplicacao"]
        EDGE["Reverse proxy TLS"]
        API2["API Node"]
        WK2["Worker"]
        PG2[("Postgres")]
        RD2[("Redis")]
        SEC["Secret manager<br/>chaves e client secret"]
    end
    subgraph Z3["Zona 3 - Terceiros"]
        GOOG["Google OAuth e Gmail API"]
    end
    subgraph Z4["Zona 4 - Operacao"]
        LOG["Logs e metricas"]
        BKP["Backups criptografados"]
    end
    BR -->|"HTTPS"| EDGE
    EDGE --> API2
    API2 --> PG2
    API2 --> RD2
    API2 --> SEC
    WK2 --> PG2
    WK2 --> GOOG
    API2 -->|"token de acesso"| GOOG
    API2 --> LOG
    PG2 --> BKP
```

## 9. Estrutura de pastas proposta

```
email-whatsapp/
├── backend/                      # novo (F0)
│   ├── src/
│   │   ├── app.ts                # Hono app + middlewares
│   │   ├── config/               # env validado com Zod
│   │   ├── db/                   # schema Drizzle + migrations
│   │   ├── modules/
│   │   │   ├── auth/             # OAuth2 + sessao
│   │   │   ├── accounts/
│   │   │   ├── gmail/            # cliente, retry, MIME
│   │   │   ├── threads/
│   │   │   ├── messages/
│   │   │   ├── attachments/
│   │   │   ├── sync/
│   │   │   ├── privacy/
│   │   │   └── audit/
│   │   ├── lib/                  # crypto, logger, errors
│   │   └── workers/sync.ts
│   └── tests/                    # unit + integration
├── frontend/                     # existente; troca do adapter mock
├── docs/                         # SRS, gmail/, security/, proto/
└── prototipos/                   # inalterado
```

## 10. Sequência de implementação

1. F0 — backend sobe com `/health`, env validado, schema base e CI.
2. F1 — OAuth2 + sessão + contas; teste manual de conectar/desconectar.
3. F2 — sync read-only + rotas de leitura + troca do adapter no frontend.
4. F3 — envio/reply + anexos + idempotência.
5. F4 — hardening (ver `docs/security/`), auditoria, LGPD, verificação Google.
