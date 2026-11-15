# Documentação — Integração Gmail OAuth2

Planejamento da evolução do MailChat (mock → Gmail real, multiusuário).
Issues: [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12) (planejamento) ·
[#13](https://github.com/Regimarcilio/trilhajr-app/issues/13) (segurança).

## Ordem de leitura

| # | Documento | Conteúdo |
|---|---|---|
| 1 | [SRS-gmail-oauth2.md](SRS-gmail-oauth2.md) | Requisitos, contratos de API, fluxos, modelo de dados, riscos |
| 2 | [arquitetura.md](arquitetura.md) | Diagramas Mermaid (OAuth2, sync, envio, ER, estados) e decisões |
| 3 | [adr/ADR-001](adr/ADR-001-oauth2-vs-senha-de-app.md) | OAuth2 vs senha de app |
| 4 | [adr/ADR-002](adr/ADR-002-gmail-api-vs-imap-smtp-xoauth2.md) | Gmail API vs IMAP/SMTP XOAUTH2 |
| 5 | [adr/ADR-003](adr/ADR-003-multitenancy-token-storage.md) | Multi-tenancy e cofre de tokens |
| 6 | [criterios-aceite.md](criterios-aceite.md) | Gherkin consolidado e rastreabilidade |
| 7 | [backlog-fases.md](backlog-fases.md) | Épicos, fases, issues filhas, riscos |
| 8 | [plano-verificacao-google-lgpd.md](plano-verificacao-google-lgpd.md) | Verificação Google, CASA e LGPD |

## Documentação relacionada (segurança)

- [Threat model STRIDE](../security/threat-model-stride.md)
- [Requisitos de hardening](../security/requisitos-hardening.md)
- [Plano de testes de segurança](../security/plano-testes-seguranca.md)
- [Checklist de deploy](../security/checklist-deploy.md)
- [Laudo inicial](../security/laudo-inicial.md)
