# Google Cloud & LGPD Compliance

Este diretório contém os artefatos de preparação para a publicação do MailChat no Google Cloud (verificação OAuth2, CASA) e conformidade LGPD.

## Estrutura

- `google-cloud-setup.md` — passo a passo para criar projeto, habilitar Gmail API, configurar OAuth consent
- `lgpd-privacy-policy.md` — rascunho de política de privacidade
- `lgpd-ropa.md` — Registro de Atividades de Tratamento de Dados
- `lgpd-incident-runbook.md` — plano de resposta a incidentes
- `checklist-user-inputs.md` — pendências que precisam da atenção do usuário

## Decisões importantes (aguardando definição do usuário)

1. **Ambiente do Google OAuth:**
   - `Testing` — até 100 usuários, refresh token válido 7 dias; ideal para validação inicial.
   - `Internal` (Google Workspace) — mais barato, sem CASA; exige domínio corporativo.
   - `Production` — verificação explícita do Google (CASA), uso público ilimitado; pode levar 2-4 meses.

2. **Domínio/DNS:**
   - Qual domínio apontará a aplicação?
   - Política de cookies/TOS já existentes?

3. **Backup/Conformidade:**
   - Destino de backup of-site (ex.: S3, Google Cloud Storage)?
   - Chave GPG para encriptação de backup?

4. **Canais de comunicação:**
   - E-mail DPO?
   - Canal para notificações de incidente?

## Próximos passos

1. O usuário preenche `checklist-user-inputs.md`.
2. Criação do projeto no Google Cloud (link: console.cloud.google.com).
3. Submissão da política de privacidade para revisão jurídica.
4. Submissão da solicitação de verificação OAuth (quando pronto).

## Referências

- [Gmail API OAuth2](https://developers.google.com/identity/protocols/oauth2)
- [Google API Console](https://console.cloud.google.com/apis/credentials)
- [LGPD - Lei Geral de Proteção de Dados (Lei 13.709/2018)](https://www.gov.br/anpd/pt-br)