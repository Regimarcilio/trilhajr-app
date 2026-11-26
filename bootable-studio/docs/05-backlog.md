# Product Backlog - bootable-studio

## 1. Épicos (High-Level Features)

| Epic ID | Título | Descrição | Prioridade | Histórias Relacionadas |
|---------|--------|-----------|------------|-----------------------|
| EP-001 | Inspeção ISO | Parsing completo de ISO 9660/El Torito (PVD, boot record, catalog, MBR, GPT) | Must | US-001 a US-010 |
| EP-002 | Geração de Imagem | Build de imagem .img nos modos raw e chainload | Must | US-011 a US-015 |
| EP-003 | Testes de Boot | Integração com v86 WASM para validar boot real | Could | US-016 a US-020 |
| EP-004 | Relatórios e Warnings | Sistema de avisos sobre estrutura da ISO e limitações | Should | US-021 a US-025 |
| EP-005 | Interface do Uploader | Input file, preview, seleção de modo | Must | US-026 a US-030 |

## 2. User Stories (Sprints)

### Sprint 1: Base Foundation (Weeks 1-2)

| US-ID | Formato "Como... Quero... Para..." | Critérios de Aceite (Gherkin) | Dependências | DoR | DoD |
|-------|-----------------------------------|--------------------------------|--------------|-----|-----|
| US-001 | Como desenvolvedor, quero que o projeto tenha estrutura de pastas `docs/` organizada, para que possa documentar o planejamento. | Dado que inicio o projeto, quando criar a pasta `docs/`, então ela deve conter os arquivos planejados (01-visão, 02-benchmarks, SRS, arquitetura, backlog, plano-entrega). | Nenhum | SRS aprovado | Arquivo markdown criado e commitado em `develop` |
| US-002 | Como usuário, quero fazer upload de um arquivo ISO, para que ele seja inspeccionado. | Dado que seleciono um arquivo ISO via input type="file", quando o sistema chama inspectIso(blob), então retorno contém iso.volumeId e warnings array. | RF-001 | AC: RF-001 passam | Testes iso.test.mjs aprovados |
| US-003 | Como usuário, quero ver um relatório estruturado da ISO carregada, para entender suas características de boot. | Dado que a inspeção termina, quando o sistema mostra o resultado, então exibir: volume ID, block size, modo recomendado, warnings list e boot entries resumo. | US-002 | AC: Todos os campos do IsoReport apresentados | Comentário visual em cada field do report |
| US-004 | Como desenvolvedor, quero que o chooseMode determine automaticamente o melhor modo de build, para que o usuário não precise escolher manualmente sempre. | Dado o resultado de inspectIso, quando chooseMode(info) é chamado, então retornar o modo correto baseado nas regras: isohybrid→raw, chainloadEntry existe→chainload, outro→raw com warning. | RF-006 | AC: Modo retornado corresponde às regras de ADR-004 | Função chooseMode testada manualmente com 3 escenários (isohybrid, non-hybrid com chainloadEntry, non-hybrid sem) |

### Sprint 2: Build Mode Implementation (Weeks 3-4)

| US-ID | Formato "Como... Quero... Para..." | Critérios de Aceite (Gherkin) | Dependências | DoR | DoD |
|-------|-----------------------------------|--------------------------------|--------------|-----|-----|
| US-011 | Como usuário, quero gerar uma imagem .img no modo chainload, para que possa bootar a ISO em pendrive via BIOS legado. | Dado que escolho o modo chainload (ou o sistema auto-detecta), quando buildImage(isoBlob, info, {mode: "chainload"}) é chamado, então retorno contém blob com modo "chainload" e filename termina em "-chainload.img". | RF-006, RF-007 | AC: MBR gerado tem assinatura 0x55AA e código de boot < 446 bytes | Testes boot.test.mjs passa (chainload + v86) |
| US-012 | Como usuário, quero gerar uma imagem .img no modo raw (DD), para que possa usar a ISO como se fosse um CD/DVD gravado. | Dado que escolho o modo raw (ou ISO é isohybrid), quando buildImage(isoBlob, info, {mode: "raw"}) é chamado, então retorno contém blob com modo "raw" e filename termina em "-dd.img". | RF-006 | AC: Tamanho do blob equals ISO size + MBR (512 bytes) | Testes de tamanho de blob verificados |
| US-013 | Como usuário, quero que o sistema adicione padding para alinhar a MiB, quando o arquivo ISO for pequeno. | Dado que options.padToMiB é true e ISO tamanho não é múltiplo de MiB, quando buildImage adiciona padding, então nota informa o quantidade de bytes adicionados e size está alinhado. | RF-007 | AC: Size do blob é múltiplo de MiB informado | Padding adicionado corretamente (testado com ISO pequena) |
| US-014 | Como usuário, quero ver warnings sobre limitações da ISO gerada, para saber se há problemas de boot. | Dado que buildImage termina, quando há warnings no info, então exibir cada warning com ícone de warning e cor amarelo. | RF-008 | AC: Warning sobre "não é híbrida" aparece para non-hybrid ISOs | Warning list renderizada UI |
| US-015 | Como usuário, quero fazer download da imagem .img gerada, para gravá-la em um pendrive. | Dado que buildImage retorna blob, quando clico em "Download", então o navegador inicia download do arquivo com nome correto (-chainload.img ou -dd.img). | US-011, US-012 | AC: Arquivo downloadável com tamanho esperado | Funcionalidade de download testada |

### Sprint 3: Boot Testing Integration (Weeks 5-6)

| US-ID | Formato "Como... Quero... Para..." | Critérios de Aceite (Gherkin) | Dependências | DoR | DoD |
|-------|-----------------------------------|--------------------------------|--------------|-----|-----|
| US-016 | Como usuário, quero testar o boot da imagem gerada no navegador via v86, para validar se realmente inicializa. | Dado que tenho o blob .img gerado, quando executo o teste v86, então o emulator inicia e busca na serial a string "OK" dentro do timeout. | RF-009, v86 WASM | AC: Teste bem-sucedido detecta "OK" na serial; teste falha mostra timeout error | boot.test.mjs scenario "OK" passa |
| US-017 | Como usuário, quero ver resultados claros do teste de boot (sucesso/falha), para saber se a imagem é utilizável. | Dado que o teste v86 termina, quando mostro o resultado, então exibir: "Boot SUCCESS - OK received" ou "Boot FAILED - timeout after 20s". | US-016 | AC: Mensagem de resultado visível na interface | Componente de resultado de teste renderizado |
| US-018 | Como desenvolvedor, quero que testes de boot funcionem tanto para modo chainload quanto modo raw (CD-ROM). | Dado que testo ambos os modos, quando o v86 inicia, então chainload mode testa hda boot e raw mode testa cdrom. | US-011, US-012 | AC: Ambos os modos têm testes passing nos tests/ | Dois cenários de teste (chainload e CD-ROM) passando |
| US-019 | Como usuário, quero que warnings de compatibilidade UEFI sejam mostrados, quando applicable. | Dado que a ISO tem entradas UEFI mas não GPT/ESP, quando mostro relatório, então avisar "Boot UEFI por pendrive pode não funcionar". | RN-004 | AC: Warning aparecendo isoladamente quando conditions met | Componente de warning UEFI renderizado |

### Sprint 4: Polishing and Documentation (Weeks 7-8)

| US-ID | Formato "Como... Quero... Para..." | Critérios de Aceite (Gherkin) | Dependências | DoR | DoD |
|-------|-----------------------------------|--------------------------------|--------------|-----|-----|
| US-021 | Como usuário, quero ver a lista de warnings organizada e compreensível, para entender limitações da minha ISO. | Dado que há warnings na ISO inspeccionada, quando mostro the report, então cada warning tem descrição clara e ícone consistente. | RF-008 | AC: Lista ranking por relevância (alto/medio/baixo) e sugestão de ação | UI de warnings com ação sugerida |
| US-022 | Como desenvolvedor, quero que o projeto tenha convenções de commit padronizadas, para manutenção futura. | Dado que vou commitar mudanças, quando uso git, então mensagem segue padrão: `type(scope): descrição` (ex: `docs(plan): adiciona SRS v0.1`). | Nenhum | AC: Commits de exemplo existentes seguem padrão | Git log mostra commits padronizados |
| US-023 | Como usuário, quero que a interface tenha indicador de progresso durante inspeção e build, para saber que processo está acontecendo. | Dado que inspeção/build está em andamento, quando occurs, então mostrar loader + label atual (ex: "Lendo catalog El Torito", "Gerando MBR de chainload"). | RF-008 (onProgress) | AC: Progresso vai de 0.0 a 1.0 em passos visíveis | Componente de progresso visível durante operations |
| US-024 | Como usuário, quero que o sistema funcione em dispositivos mobile, para testar ISOs do celular. | Dado que acesso pelo navegador mobile, quando faço upload e inspeção, então interface se adapta (touch-friendly, labels adequados). | NFR-006 (accessibility) | AC: Botões têm tamanho mínimo touch, labels são grandes o suficiente | Teste em device mobile (simulado ou real) |
| US-025 | Como usuário, quero ler a documentação completa antes de usar, para entender limites e cuidados. | Dado que acesso pela primeira vez, quando leio docs/, então encontro SRS, arquitetura, backlog e plano de entrega compreensíveis. | Todos os docs anteriores | AC: Todos os arquivos docs/ existentes linkados e navegáveis | Documentação navegável sem dead links |

## 3. Sprint Planning - Velocidade e Estimativas

### Velocidade Inicial
- Baseado na complexidade dos módulos existentes (ISO parser, builder, chainload) e testes já aprovados
- Estimativa inicial: **5 story points por sprint** (conservador, considerando 1 developer)
- Fatores de velocidade:
  - Código já escrito e testado (5 testes passando)
  - Foco em documentação e integração, não do do zero
  - Sem dependências externas complexas

### Histórias por Sprint (Planejado)
- **Sprint 1**: US-001 a US-004 (4 histórias, ~2pts cada = 8pts → ajustar para capacidade 5)
- **Sprint 2**: US-011 a US-015 (5 histórias, ~1pt cada = 5pts ✅)
- **Sprint 3**: US-016 a US-019 (4 histórias, ~1pt cada = 4pts)
- **Sprint 4**: US-021 a US-025 (5 histórias, ~1pt cada = 5pts ✅)

### Riscos de Sprint
1. **v86 WASM loading time**: Pode tornar testes de boot lentos (>10s), afetando feedback loop
   - *Mitigação*: Cache do WASM, mostrar mensagem de "carregando emulator..."
2. **ISOs reais vs sintéticas**: ISOs de usuários podem ter estruturas diferentes das sintéticas
   - *Mitigação*: Warnings automáticos, validações de entrada, modo fallback raw
3. **Limite de tamanho Blob**: ISOs > 2GB causam falhas silenciosas
   - *Mitigação*: Warning no upload, sugestão de tool standalone

## 4. Definição de Pronto (DoD) por Sprint

### DoR (Definition of Ready) - Histórico
- [ ] História tem descrição clara no formato "Como... Quero... Para..."
- [ ] Critérios de aceite definidos em Gherkin (Given/When/Then)
- [ ] Dependências identificadas e resolvidas ou documentadas
- [ ] Estimativa de story point feita
- [ ] Acceptance criteria não conflitar com RF/RN existentes

### DoD (Definition of Done) - Checklist por História
- [ ] Código implementado seguindo convenções do projeto (ES module, JS puro)
- [ ] Testes unitários/integração passam (`node --test tests/` ou específicos)
- [ ] Documentação atualizada (arquivos markdown relevantes)
- [ ] Commite em branch `develop` com mensagem Conventional Commit
- [ ] Code review (próprio agente ou peer) aprovado
- [ ] `kalimaster-sast` limpo (sem vulnerabilidades de segurança detectadas)
- [ ] Nenhum `console.error` não tratado no código novo
- [ ] Funcionalidade testada nos browsers suportados (mínimo 2)

## 5. Milestones (Marcos)

| Milestone | Data Estimada | Critérios de Conquista |
|-----------|---------------|------------------------|
| M1: MVP Inspecion + Build | Sprint 2 fim | US-001 a US-015 todas completas e testadas; Inspeção e build (chainload + raw) funcionais |
| M2: Boot Test Integration | Sprint 3 fim | US-016 a US-019 todas completas; Testes v86 passing para ambos modos |
| M3: Polished UI + Docs | Sprint 4 fim | US-021 a US-025 completas; Interface polida, docs navegáveis, convenções de commit |
| M4: Release v1.0 | Após Sprint 4 | Todos os epics completos; Documentação SRS + arquitetura + backlog + plano-entrega atualizados; `npm test` 100% passing |

---
*Backlog Scrum gerado na Fase 5 - Planejamento de Execução*