# Critérios de aceite — Integração Gmail OAuth2

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Issues mãe:** [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12) · [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13)
- **Referências:** [SRS](SRS-gmail-oauth2.md) §6 · [Threat model](../security/threat-model-stride.md) · [Plano de testes de segurança](../security/plano-testes-seguranca.md)

> Todos os cenários são escritos em Gherkin pt-BR e devem virar testes automatizados
> (Vitest/Supertest/Playwright) ou evidência manual registrada no PR.

## 1. Conexão e sessão

### AC-GM-01 — conectar conta Gmail

```gherkin
Cenário: conectar conta Gmail
  Dado que estou autenticado no MailChat
  Quando inicio o fluxo OAuth2 e autorizo os escopos solicitados
  Então minha conta Gmail aparece como "conectada"
  E o refresh token fica armazenado criptografado no backend
  E nenhum token é devolvido ao navegador
```

### AC-GM-02 — sincronizar caixa de entrada

```gherkin
Cenário: sincronização inicial
  Dado que conectei minha conta Gmail
  Quando a sincronização inicial é executada
  Então minhas threads aparecem na lista em estilo conversa
  E cada thread mostra remetente, assunto, prévia e data da última mensagem
  E o status de sincronização indica "concluída" com o horário
```

### AC-GM-03 — sincronização incremental

```gherkin
Cenário: incremental traz apenas novidades
  Dado que a conta já foi sincronizada
  E existe uma mensagem nova no Gmail
  Quando a sincronização incremental roda
  Então apenas a thread afetada é atualizada
  E o histórico anterior permanece consistente
```

### AC-GM-08 — desconectar conta

```gherkin
Cenário: desconectar conta revoga o token
  Dado que tenho uma conta conectada
  Quando solicito desconectar
  Então o refresh token é revogado no Google
  E as credenciais locais são apagadas
  E a conta aparece como "desconectada"
  E o evento é registrado na auditoria
```

### AC-GM-09 — sessão ausente ou expirada

```gherkin
Cenário: acesso sem sessão válida
  Dado que não tenho sessão ativa ou minha sessão expirou
  Quando chamo qualquer rota protegida
  Então a API responde 401
  E o frontend redireciona para o início do fluxo de autenticação
```

### AC-GM-10 — token não vaza

```gherkin
Cenário: auditoria de vazamento de token
  Dado o fluxo completo de conexão, sincronização e envio
  Quando inspeciono logs, respostas de API, HTML e storage do navegador
  Então nenhum access token, refresh token, authorization code ou client secret aparece em claro
```

### AC-GM-11 — revogação externa

```gherkin
Cenário: revogação feita no Google
  Dado que revogo o acesso do app na minha conta Google
  Quando o backend tenta sincronizar
  Então a conta é marcada como "revoked"
  E não há retry infinito
  E o usuário é orientado a reconectar
```

### AC-GM-12 — proteção do OAuth2

```gherkin
Cenário: callback inválido
  Dado um callback com state ausente, divergente ou expirado
  Quando a API processa o retorno
  Então responde 400 com código OAUTH_STATE_INVALID
  E registra a tentativa na auditoria

Cenário: redirect_uri não permitida
  Dado uma tentativa de callback com redirect_uri fora da allowlist
  Quando a API processa o retorno
  Então a requisição é rejeitada
  E nenhuma sessão é criada
```

## 2. Leitura e anexos

### AC-GM-04 — isolamento entre usuários (listagem)

```gherkin
Cenário: listas isoladas por usuário
  Dado que existem dois usuários conectados, A e B
  Quando o usuário A consulta suas threads
  Então ele vê apenas threads da sua conta
  E nunca vê dados do usuário B
```

### AC-GM-22 — isolamento entre usuários (ID manipulado)

```gherkin
Cenário: acesso a recurso de outro usuário por ID
  Dado que o usuário A está autenticado
  E conhece o identificador de uma thread do usuário B
  Quando solicita GET /api/threads/{id}
  Então a API responde 404
  E registra o evento access.denied na auditoria
```

### AC-GM-05 — ler anexo

```gherkin
Cenário: download de anexo autenticado
  Dado que abro uma thread com anexo
  Quando clico no artefato
  Então o anexo é baixado pela API autenticada
  E o nome do arquivo vem sanitizado em Content-Disposition
  E o acesso é registrado na auditoria
```

### AC-GM-13 — historyId expirado

```gherkin
Cenário: full resync automático
  Dado que o historyId salvo expirou
  Quando a sincronização incremental retorna 404
  Então o backend executa full resync
  E registra sync.full_resync na auditoria
  E o usuário não precisa agir
```

### AC-GM-14 — status de sincronização na UI

```gherkin
Cenário: indicador de sincronização
  Dado que uma sincronização está em andamento
  Quando observo a interface
  Então vejo o estado "sincronizando" anunciado por aria-live
  E ao terminar vejo "sincronizada há X minutos"
```

### AC-GM-15 — HTML de e-mail sanitizado

```gherkin
Cenário: e-mail com conteúdo malicioso
  Dado um e-mail que contém script, onerror ou link javascript:
  Quando abro a mensagem no MailChat
  Então o HTML é sanitizado por allowlist
  E nenhum script é executado
  E imagens remotas são bloqueadas ou servidas por proxy
```

### AC-GM-16 — anexo acima do limite

```gherkin
Cenário: anexo grande
  Dado que seleciono um anexo que ultrapassa 25 MB no total
  Quando tento enviar
  Então a API responde 413 ATTACHMENT_TOO_LARGE
  E a interface explica o limite
```

## 3. Envio e resposta

### AC-GM-06 — responder e-mail

```gherkin
Cenário: responder na thread
  Dado que abro uma thread
  Quando envio uma resposta
  Então o e-mail é enviado via Gmail API com In-Reply-To e References corretos
  E aparece na thread local com direção "saída"
  E aparece na thread correspondente no Gmail
```

### AC-GM-17 — idempotência de envio

```gherkin
Cenário: retry não duplica envio
  Dado que enviei uma resposta com uma Idempotency-Key
  Quando repito a requisição com a mesma chave
  Então a API devolve a resposta original
  E nenhum e-mail adicional é enviado
```

### AC-GM-18 — rate limit

```gherkin
Cenário: abuso de envio
  Dado que ultrapasso o limite de envios por hora
  Quando tento enviar novamente
  Então a API responde 429 RATE_LIMITED
  E inclui o header Retry-After
```

## 4. Operação, privacidade e extras

### AC-GM-19 — auditoria

```gherkin
Cenário: eventos sensíveis auditados
  Dado que realizo login, conexão, leitura, download, envio e desconexão
  Quando consulto a auditoria como administrador
  Então cada evento está registrado com data, usuário e resultado
  E nenhum corpo de e-mail é armazenado na auditoria
```

### AC-GM-20 — agenda persistida

```gherkin
Cenário: post-it sobrevive ao recarregamento
  Dado que crio um post-it vinculado a um e-mail
  Quando recarrego a página
  Então o post-it continua na agenda do dia
```

### AC-GM-21 — LGPD

```gherkin
Cenário: exportar meus dados
  Dado que solicito a exportação dos meus dados
  Quando o processamento termina
  Então recebo um JSON com threads, mensagens e metadados
  E a operação é registrada na auditoria

Cenário: excluir meus dados
  Dado que solicito a exclusão dos meus dados
  Quando o processamento termina
  Então o token é revogado
  E os dados são apagados em até 30 dias
  E recebo confirmação
```

### AC-GM-23 — quota do Gmail

```gherkin
Cenário: Gmail responde 429
  Dado que o Gmail retorna 429 com Retry-After
  Quando o cliente executa a chamada
  Então aplica backoff exponencial com jitter
  E respeita o Retry-After
  E a conta fica em estado "degraded" até a próxima sincronização bem-sucedida
```

## 5. Rastreabilidade AC → RF

| AC | Requisitos cobertos |
|---|---|
| AC-GM-01 | RF-GM-01, RF-GM-02, RF-GM-03, RF-GM-04, RF-GM-05 |
| AC-GM-02 | RF-GM-07, RF-GM-11, RF-GM-12 |
| AC-GM-03 | RF-GM-08 |
| AC-GM-04 | RF-GM-11, RNF-GM-02 |
| AC-GM-05 | RF-GM-14, RF-GM-23 |
| AC-GM-06 | RF-GM-15, RF-GM-16, RF-GM-19 |
| AC-GM-08 | RF-GM-20 |
| AC-GM-09 | RNF-GM-03, RNF-GM-01 |
| AC-GM-10 | RF-GM-05, RNF-GM-01 |
| AC-GM-11 | RF-GM-21 |
| AC-GM-12 | RF-GM-01, RF-GM-02 |
| AC-GM-13 | RF-GM-09 |
| AC-GM-14 | RF-GM-10 |
| AC-GM-15 | RF-GM-13 |
| AC-GM-16 | RF-GM-17 |
| AC-GM-17 | RF-GM-18 |
| AC-GM-18 | RF-GM-22 |
| AC-GM-19 | RF-GM-23 |
| AC-GM-20 | RF-GM-24 |
| AC-GM-21 | RF-GM-25, RF-GM-26 |
| AC-GM-22 | RF-GM-11, RF-GM-14, RNF-GM-02 |
| AC-GM-23 | RF-GM-08, RNF-GM-06, RNF-GM-07 |

## 6. Mapa AC → issue filha

| AC | Issue |
|---|---|
| AC-GM-01, AC-GM-02, AC-GM-08, AC-GM-09, AC-GM-10, AC-GM-11, AC-GM-12 | #15, #16 |
| AC-GM-03, AC-GM-13, AC-GM-23 | #17 |
| AC-GM-04, AC-GM-05, AC-GM-15, AC-GM-22 | #18, #21 |
| AC-GM-06, AC-GM-16, AC-GM-17 | #19 |
| AC-GM-14, AC-GM-20 | #20 |
| AC-GM-18, AC-GM-19 | #21 |
| AC-GM-21 | #21, #24 |
| Todos | #23 (regressão automatizada) |
