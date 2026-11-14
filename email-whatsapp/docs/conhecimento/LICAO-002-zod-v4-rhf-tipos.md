# LICAO-002 — Zod v4 + RHF: campos numéricos não usam mais `z.coerce` no resolver tipado

- **Tags:** frontend, zod, react-hook-form, tipagem
- **Tipo:** padrao
- **Data:** 2026-11-14
- **Evidência:** `email-whatsapp/frontend/components/ConfiguracoesEmail.tsx` (zod 4.6.7 + @hookform/resolvers 5.9.2, 2026-11-14); erro `TS2322` no `zodResolver` no build do Next.js 16.

## Contexto

Ao atualizar `zod` de v3 para v4 (correção de vulnerabilidade GHSA-mrhx-c7xc-m3w5, severidade high)
e `@hookform/resolvers` para v5, o `zodResolver` passou a tipar o tipo de entrada do schema como
`unknown` para campos criados com `z.coerce.number()`, incompatibilizando com o `useForm<FormValues>`
que declara `imapPorta: number`.

## Lição

Com Zod v4 + React Hook Form, campos numéricos devem ser declarados como `z.number()` e o valor
convertido no handler (`onChange` → `Number(e.target.value)`) ou via `valueAsNumber` no Controller.
Evitar `z.coerce` em formulários tipados com RHF.

## Anti-padrão relacionado

Usar `z.coerce.number()` com `useForm<T>` tipado em Zod v4/@hookform/resolvers v5 — erro de
tipagem no build que só aparece no typecheck do Next.js.

## Aplicação

Formulários RHF/Zod do MailChat (`ConfiguracoesEmail`, `PostItModal`) passaram a usar `z.number()`
para portas e handlers de conversão explícitos.
