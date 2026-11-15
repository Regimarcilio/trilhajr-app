# Documentação — Segurança (Gmail OAuth2)

Threat model e requisitos de hardening da integração Gmail multiusuário.
Issues: [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13) (segurança) ·
[#12](https://github.com/Regimarcilio/trilhajr-app/issues/12) (planejamento).

## Ordem de leitura

| # | Documento | Conteúdo |
|---|---|---|
| 1 | [threat-model-stride.md](threat-model-stride.md) | Fronteiras de confiança, ativos, atacantes, STRIDE, top 10 riscos |
| 2 | [requisitos-hardening.md](requisitos-hardening.md) | Requisitos `SR-01..SR-48` com nível, verificação e fase |
| 3 | [plano-testes-seguranca.md](plano-testes-seguranca.md) | Casos `ST-01..ST-37`, comandos e matriz de cobertura |
| 4 | [checklist-deploy.md](checklist-deploy.md) | Checklist de deploy, gate de go-live e rollback |
| 5 | [laudo-inicial.md](laudo-inicial.md) | Achados observáveis e riscos de projeto (pré-implementação) |

## Documentação relacionada (planejamento)

- [SRS](../gmail/SRS-gmail-oauth2.md) · [Arquitetura](../gmail/arquitetura.md) · [ADRs](../gmail/adr/)

> **Nota:** os links para `../gmail/...` resolvem após o merge do PR #25 (branch `ISSUE`).
> Enquanto os dois PRs não estiverem em `develop`, consulte a branch `ISSUE` para o
> planejamento (SRS, arquitetura e ADRs).
