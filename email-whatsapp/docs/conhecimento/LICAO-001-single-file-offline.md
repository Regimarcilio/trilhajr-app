# LICAO-001 — Single-file offline supera CDN em protótipo de validação

- **Tags:** frontend, prototipo, padrao
- **Tipo:** padrao
- **Data:** 2026-11-14
- **Evidência:** `email-whatsapp/prototipos/email-whatsapp.html` (abre com duplo clique, sem rede);
  justificativa registrada em `email-whatsapp/docs/proto/00-brief.md`.

## Contexto

O padrão PROTOMASTER manda usar Tailwind CDN + CSS/JS inline. Em ambientes sem internet (ou com CDN
instável), o protótipo quebra para quem mais precisa validar (stakeholder abrindo o arquivo).

## Lição

Para protótipos de validação que precisam "abrir em qualquer máquina", CSS customizado inline em
single-file é mais robusto que CDN. Use CDN quando o time já tem a convenção e há rede garantida
(ex.: hub de protótipos do repo).

## Anti-padrão relacionado

Dependência silenciosa de CDN em entregável que deve rodar offline; protótipo que só funciona
na máquina do autor.

## Aplicação

Protótipos navegáveis de fluxo/validação → single-file com CSS inline. Hubs e páginas de
apresentação com identidade do repo → CDN é aceitável.
