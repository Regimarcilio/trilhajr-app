# Checklist de hardening e deploy — MailChat multiusuário

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Issues:** [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13) · [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12)
- **Referências:** [Requisitos](requisitos-hardening.md) · [Testes](plano-testes-seguranca.md) · [Threat model](threat-model-stride.md)

> ⚠️ **Esta fase é de documentação.** Nenhum item abaixo deve ser executado agora. Em especial,
> **não reiniciar, parar ou alterar o serviço `mailchat.service` (porta 3100)** sem janela
> aprovada, backup e rollback pronto.

## 1. Antes do deploy

### 1.1 Domínio, TLS e rede
- [ ] Domínio/subdomínio definido e apontando para o servidor (evidência: `dig`)
- [ ] TLS 1.2+ com certificado válido e renovação automática (evidência: `openssl s_client`)
- [ ] Redirecionamento 301 HTTP→HTTPS (SR-41)
- [ ] HSTS habilitado após validar HTTPS em todos os subdomínios (SR-41)
- [ ] Firewall: apenas 443 exposto; Postgres/Redis em rede privada (SR-44)
- [ ] Proxy reverso com limite de corpo compatível com anexos (≥ 26 MB) (SR-25)

### 1.2 Google e OAuth2
- [ ] Projeto Google Cloud criado e Gmail API habilitada
- [ ] Consent screen com nome, logo, domínio, política de privacidade e termos
- [ ] Scopes exatos: `openid`, `email`, `profile`, `gmail.readonly`, `gmail.send`
- [ ] `redirect_uri` de produção cadastrada **exatamente** (`https://<host>/api/auth/google/callback`)
- [ ] `client_id` e `client_secret` obtidos e **não** versionados
- [ ] Test users cadastrados (modo Testing) ou verificação/CASA aprovada (produção)
- [ ] Domínio verificado no Search Console

### 1.3 Segredos e configuração
- [ ] `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `SESSION_SECRET` em secret manager ou `EnvironmentFile` com `0600`
- [ ] `.env` fora do repositório e do build da imagem (SR-39)
- [ ] `gitleaks` no CI e execução local limpa
- [ ] Chaves com backup seguro e acesso auditado (perda = reconexão de todos os usuários)
- [ ] Variáveis validadas na inicialização (falha rápida se ausentes)

### 1.4 Banco e dados
- [ ] Usuário do banco com privilégio mínimo (sem superuser)
- [ ] Migrations revisadas, com `down` documentado e testadas em banco limpo
- [ ] RLS habilitada nas tabelas de domínio (SR-24)
- [ ] Índices criados (`user_id`, `last_message_at`, `gmail_message_id`)
- [ ] Backup automático **criptografado** com chave separada e expiração (SR-38)
- [ ] Restore testado em ambiente limpo, com data e responsável registrados (ST-30)

### 1.5 Aplicação
- [ ] Headers de segurança: CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'` (SR-42)
- [ ] CORS com allowlist de origem (SR-43)
- [ ] Cookies `HttpOnly; Secure; SameSite=Lax` (SR-15)
- [ ] CSRF ativo em rotas mutáveis (SR-18, SR-19)
- [ ] Rate limit ativo e testado (SR-36)
- [ ] Redaction de logs verificada (SR-13, SR-14)
- [ ] Auditoria gravando eventos (SR-34)
- [ ] Sanitização de HTML de e-mail ativa (SR-26)
- [ ] `npm audit`/`osv-scanner` sem High/Critical (SR-40)
- [ ] `gitleaks` limpo (SR-39)

### 1.6 Observabilidade
- [ ] Logs centralizados com retenção definida e acesso restrito (SR-33)
- [ ] Alertas para 5xx, 429, falha de token, falha de sync e pico de envios
- [ ] Painel de quota da Gmail API e do Google Cloud
- [ ] Endpoint `/health` e `/metrics` protegidos

## 2. Deploy

- [ ] Janela de manutenção comunicada (se afetar `mailchat.service`)
- [ ] Backup manual imediatamente antes da mudança
- [ ] Build reproduzível com lockfile
- [ ] Migrations aplicadas com verificação de sucesso
- [ ] Smoke test: `/health`, login, conectar conta de teste, listar thread, baixar anexo, enviar reply
- [ ] Verificação de que o serviço antigo (porta 3100) segue íntegro ou foi trocado conforme plano
- [ ] Rollback ensaiado (versão anterior + restore, se necessário)

## 3. Pós-deploy

- [ ] Revisar logs por 30 min (erros, tokens acidentais, 429)
- [ ] Confirmar auditoria de conexão e sync
- [ ] Confirmar cookies e headers via `curl -I`/DevTools
- [ ] Rodar ZAP baseline e Nuclei em staging/produção conforme autorização
- [ ] Verificar quota e latência p95
- [ ] Registrar evidências no PR/issue

## 4. Contínuo

- [ ] Scan semanal de dependências e segredos
- [ ] Revisão mensal de acessos (admin, banco, secret manager)
- [ ] Revisão trimestral do threat model
- [ ] Teste de restore trimestral
- [ ] Rotação de chaves semestral ou sob suspeita (SR-08)
- [ ] Revisão de retenção/expurgo (SR-46)
- [ ] Recertificação CASA anual (se caminho público)

## 5. Gate de go-live (binário)

Não há go-live se **qualquer** item abaixo falhar:

| # | Critério | Evidência |
|---|---|---|
| 1 | Threat model aprovado e revisado na fase | este repositório + aprovação |
| 2 | Todos os MUST de SR-01..SR-48 implementados | checklist 1.5 + revisão |
| 3 | ST-11, ST-17, ST-20, ST-22, ST-28 verdes | relatórios anexados |
| 4 | Laudo KALIMASTER sem Critical/High aberto | `laudo-inicial.md` atualizado |
| 5 | Backup criptografado + restore comprovado | registro datado |
| 6 | Verificação Google/CASA aprovada ou modo Testing formalizado | e-mail/print do Google |
| 7 | Política de privacidade e termos publicados | URLs |
| 8 | Plano de incidente e contato do DPO definidos | documento |

## 6. Rollback

1. Reverter aplicação para a versão anterior (tag/imagem) — não reverter migrations destrutivas.
2. Se migration incompatível: restaurar backup validado e reaplicar versão anterior.
3. Revogar tokens emitidos durante a janela, se houver suspeita.
4. Comunicar usuários afetados conforme plano de incidente.
5. Registrar post-mortem no `docs/dev-log.md`.

## 7. Restrições desta fase

- [x] Nenhum deploy executado
- [x] Nenhuma alteração em `mailchat.service`
- [x] Nenhum segredo criado ou versionado
- [x] Nenhum merge sem aprovação do usuário
