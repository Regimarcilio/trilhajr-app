# Diário de Bordo - bootable-studio

## Sprint 1 - Fundação (2026-11-26 a 2026-12-03)
- **task_id**: T001
- **despacho**: Criação da estrutura de pastas docs/ e arquivos iniciais de planejamento
- **decisões**: Definir stack JS puro, sem dependências externas; criar branch develop; commit inicial de planejamento
- **arquivos modificados**: docs/01-visao-e-escopo.md, docs/02-benchmarks.md, docs/SRS.md, docs/03-arquitetura-e-uml.md, docs/05-backlog.md, docs/06-plano-de-entrega.md, docs/dev-log.md
- **testes**: `npm test` passa (5/5 testes iso.test.mjs; 1/1 boot.test.mjs chainload OK)
- **pending**: Implementar US-001 a US-004 (concluído)

- **task_id**: T002
- **despacho**: Benchmarks research e análise de concorrentes
- **decisões**: Manter auto-contido (sem deps externas), usar Blob.slice para leitura por setores; documentar limitação chainload mediaType 0
- **arquivos modificados**: docs/02-benchmarks.md (já criado); ADR-004 documentado em 03-arquitetura-e-uml.md
- **testes**: Pesquisa de mercado completada
- **pending**: Implementar US-001 a US-004 (concluído)

## Sprint 2 - Build Mode (2026-12-04 a 2026-12-10)
- **task_id**: T003
- **despacho**: Implementação de padding MiB e verificação de modos build
- **decisões**: O `options.padToMiB` já existe em builder.js (linhas 136-144); testar com ISOs pequenos para confirmar padding adicionado corretamente e size final alinhado
- **arquivos modificados**: nenhum src/ (já existente); testes manuais
- **testes**: Manual: buildImage com padToMiB=true em ISO pequena; verificar size final é múltiplo de MiB e notes indica padding
- **pending**: T004 - Integração v86

- **task_id**: T004
- **despacho**: Integração com v86 e teste de boot consolidado
- **decisões**: Confirmar que modo chainload gera boot funcional em v86 (já testado); testar modo raw com CD-ROM em v86
- **arquivos modificados**: nenhum src/ (já existente)
- **testes**: boot.test.mjs - ambos os modos (chainload e raw/CD-ROM) devem passar ou ter warnings claros
- **pending**: T005 - UI warnings e download

- **task_id**: T005
- **despacho**: Componentes UI para warnings e funcionalidade de download
- **decisões**: Adicionar HTML/JS para display de warnings list e botão download do blob .img via URL.createObjectURL; registrar quais warnings são mais críticos (non-hybrid, emulated entry, UEFI limitation)
- **arquivos modificados**: index.html (criar estrutura básica) + script.js (lógica de display)
- **testes**: Manual: após build, warnings aparecem listados; download inicia corretamente com nome de arquivo esperado
- **pending**: ...

## Sprint 3 - Boot Testing Integration (próxima)
- **task_id**: T006
- **despacho**: ...
- **pending**: ...