# Plano de Entrega e Handoff - bootable-studio

## 1. Estrutura de Pastas Proposta

```
/bootable-studio/
├── .gitignore
├── package.json
├── package-lock.json (gerado automaticamente)
├── vite.config.mjs (opcional, para dev server)
├── index.html (ponto de entrada HTML)
├── src/
│   ├── iso.js           # Núcleo: parser ISO 9660/El Torito
│   ├── builder.js       # Build de imagem .img (raw + chainload)
│   ├── chainload.js     # Gerador MBR chainloader
│   ├── asm.js           # Tiny assembler 16-bit x86
│   └── ... (módulos auxiliares)
├── tests/
│   ├── iso.test.mjs     # Testes de inspeção (5 testes)
│   ├── boot.test.mjs    # Testes de boot v86 (2 testes)
│   └── helpers/
│       └── synthetic-iso.mjs  # Gerador de ISOs sintéticas
├── vendor/
│   └── v86/             # Emulador v86 (WASM + BIOS)
│       ├── v86.wasm
│       ├── v86-fallback.wasm
│       ├── vgabios.bin
│       ├── seabios.bin
│       ├── libv86.mjs
│       └── libv86.js
├── debug-*.mjs          # Scripts de depuração (opcional)
├── docs/
│   ├── 01-visao-e-escopo.md       # Visão e escopo do projeto
│   ├── 02-benchmarks.md           # Benchmarks e concorrência
│   ├── SRS.md                     # Software Requirements Specification
│   ├── 03-arquitetura-e-uml.md    # Diagramas UML e ADRs
│   ├── 05-backlog.md              # Product backlog Scrum
│   ├── 06-plano-de-entrega.md     # Este arquivo (plano de entrega)
│   ├── dev-log.md                 # Diário de bordo (append-only)
│   └── templates/
│       ├── SRS_TEMPLATE.md        # Template SRS
│       └── SCRUM_TEMPLATE.md      # Template Scrum
├── .hermes/                 # Configuração do Hermes Agent (se aplicável)
├── trace.json               # Logs de uso de IA (custo, tokens, latência)
└── README.md                # Visão geral do projeto
```

## 2. Comandos de Setup por Stack

### Node.js / JavaScript (Stack Padrão)
```bash
# 1. Clonar repositório
git clone https://github.com/regimarcilio/bootable-studio.git
cd bootable-studio

# 2. Instalar dependências (apenas devDependencies, nenhuma externa)
npm install  # ou: npm ci para install limpo

# 3. Verificar branch develop
git branch --show-current  # Deve retornar "develop"

# 4. Criar branch para nova feature
git checkout -b feature/<nome-da-feature> develop

# 5. Rodar testes
npm test           # Executa: node --test tests/
# ou testes específicos:
node --test tests/iso.test.mjs
node --test tests/boot.test.mjs

# 6. Desenvolvimento
#   - Código em JavaScript puro (type: "module" no package.json)
#   - Usar ES modules (import/export)
#   - Blob API nativa (sem need de polyfills em navegadores modernos)

# 7. Commit com convenção
git add docs/ src/ tests/
git commit -m "docs(plan): adiciona SRS v0.1"  # ou feat/fix/chore conforme mudança

# 8. Push para develop
git push -u origin develop
```

### Workflow de Branches
```
main (produção) ← release/1.0 ← develop ← feature/* (feature branches)
       ↑
   pull requests
```

- ** develop**: Branch principal de desenvolvimento - sempre estável para novas features
- **feature/***: Branches temporárias para novas funcionalidades (ex: `feature/chainload-v2`)
- **release/***: Branches para releases (ex: `release/1.0`, `release/1.1`)
- **main**: Apenas tags de release; nunca fazer commit direto

### Convenções de Commit (Conventional Commits em pt-BR)
```
tipos permitidos:
- docs: mudanças de documentação
- plan: planejamento (SRS, backlog, arquitetura)
- feat: nova funcionalidade
- fix: correção de bug
- chore: tarefa de manutenção (config, scripts, deps)
- refactor: refatoração sem mudar comportamento
- test: adição ou correção de testes

exemplos:
  docs(plan): adiciona SRS v0.1
  plan(srs): gera SRS completo com RF/RN
  feat(build): adiciona modo raw no buildImage
  fix(iso): corrige detecção de GPT non-detect
  chore(deps): atualiza v86 WASM version
  refactor(asm): simplifica código do assembler
  test(iso): adiciona teste para ISOs isohybrid
```

## 3. Estratégia de Branches

```
                       +-----------------+
                       |    main         |
                       |   (tags v1.0,   |
                       |    v1.1, etc.)  |
                       +--------+--------+
                                  |
                                  |  git tag v1.0
                                  |
                                  |
                          +--------v--------+
                          |   release/1.0   |
                          | (pre-release)   |
                          +--------+--------+
                                  |
                                  |  git merge develop
                                  |
                          +--------v--------+
                          |    develop      |
                          | (desenvolvimento|
                          |   ativo)         |
                          +--------+--------+
                                 |
                        (feature branches)
                                 |
                                 |
                          +--------v--------+
                          | feature/xxx     |
                          | (temporário)    |
                          +--------+--------+
                                 |
                                 |  git merge feature/xxx
                                 |
                          +--------v--------+
                          |    develop      |
                          | (atualizado)    |
                          +-----------------+
```

### Fluxo de Merge
1. Desenvolvedor cria `git checkout -b feature/nova-feature develop`
2. Implementa a feature, testa localmente
3. `git add . && git commit -m "feat(area): descrição curta"`
4. `git push -u origin feature/nova-feature`
5. Abre Pull Request para `develop`
6. Após aprovação: `git checkout develop && git merge --no-ff feature/nova-feature`
7. `git push origin develop`
8. Delete branch feature: `git branch -d feature/nova-feature`

## 4. Checklist Anti-Retrabalho

### Verificação Antes de Commits
- [ ] `git status` executado - confirma quais arquivos mudarão
- [ ] `git diff --stat` - vê resumo das mudanças (evita commitar acidentalmente debugging code)
- [ ] Nenhum `console.error` não tratado no código novo
- [ ] Todos os testes relevantes passam (`node --test tests/iso.test.mjs` e/ou `boot.test.mjs`)
- [ ] Documentação atualizada (pelo menos o arquivo relevante em `docs/`)
- [ ] Commit message segue convenção Conventional Commits
- [ ] Branch develop está atualizada (`git pull origin develop` antes de merge)

### Checklist de Qualidade de Código
- [ ] Código segue estilo do projeto (ES module, imports no topo, variáveis const/let em vez de var)
- [ ] Nenhum hardcoding de valores mágicos sem constantes definidas no topo dos arquivos
- [ ] Funções têm no máximo 100 linhas (exceção para parsers que precisam ser densos)
- [ ] Variáveis globais minimizadas; use modules para encapsular
- [ ] Comentários explicam "por quê", não "o que" (código limpo deve ser autoexplicativo)

### Checklist de Testes
- [ ] `npm test` (ou `node --test tests/`) passa 100%
- [ ] Novos testes cobrem o código novo (não só testes existentes)
- [ ] Testes cobrem casos limite (ISO inválida, ISO muito grande, MBR corrompido, etc.)
- [ ] Testes de boot v86 (boot.test.mjs) passam para modo chainload e modo raw

## 5. Diário de Bordo (dev-log) - Skill devlog

### Estrutura
Criar `docs/dev-log.md` com formato append-only onde cada despacho (commit/change) é registrado:

```markdown
# Diário de Bordo - bootable-studio

## Sprint 1 - Fundação (DD/MM/AAAA)
- **task_id**: T001
- **despacho**: Criação da estrutura de pastas docs/ e arquivos iniciais de planejamento
- **decisões**: Definir stack JS puro, sem dependências externas
- **arquivos modificados**: docs/01-visao-e-escopo.md, docs/02-benchmarks.md
- **testes**: `npm test` passa (5/5 testes iso.test.mjs)
- **pending**: Definir SRS detalhado

- **task_id**: T002
- **despacho**: Benchmarks research e análise de concorrentes
- **decisões**: Manter auto-contido (sem deps externas), usar Blob.slice para leitura por setores
- **arquivos modificados**: docs/02-benchmarks.md
- **testes**: Nenhum (pesquisa de mercado)
- **pending**: Gerar SRS

## Sprint 2 - Build Mode (DD/MM/AAAA)
- **task_id**: T003
- **despacho**: Implementação e testes do modo chainload
- **decisões**: Chainload só funciona com mediaType 0 (no emulation) - documentado em ADR-004
- **arquivos modificados**: src/builder.js (escolha de modo), docs/03-arquitetura-e-uml.md
- **testes**: boot.test.mjs passa (chainload + v86 detecta "OK")
- **pending**: Testes de modo raw completos

- **task_id**: T004
- **despacho**: Integração com v86 para teste de boot
- **decisões**: Usar listener serial0-output-byte para detectar "OK"; timeout 20s
- **arquivos modificados**: tests/boot.test.mjs (já existente), nenhum novo arquivo src
- **testes**: 2/2 testes boot.test.mjs passando
- **pending**: Documentar limitações UEFI

## Sprint 3 - Polishing (DD/MM/AAAA)
- **task_id**: T005
- **despacho**: Interface de progresso e warnings UI
- **decisões**: Adicionar onProgress callbacks em inspectIso e buildImage
- **arquivos modificados**: src/iso.js (add onProgress), src/builder.js (passar onProgress)
- **testes**: Manual testing - ver se loader aparece durante operations
- **pending**: Testes em mobile browser
```

### Regras do dev-log
- [ ] Formato append-only: nunca editar entradas passadas, apenas adicionar novas no final
- [ ] Cada entrada tem `task_id` único (sequencial: T001, T002, ...)
- [ ] Cada entrada tem: task_id, despacho, decisões, arquivos modificados, testes, pending
- [ ] Registrar TODO novo arquivo criado ou módulo significantemente alterado
- [ ] Registrar quando testes passarem ou falharem
- [ ] Incluir em Definition of Done (DoD) a entrada no dev-log
- [ ] Referenciar `docs/dev-log.md` em `docs/06-plano-de-entrega.md`

## 6. Resumo Executivo para o Usuário

### O Que Foi Planejado
Este projeto `bootable-studio` já possui um código funcional com:
- **5 testes passando** para inspeção de ISO sintética
- **2 testes passando** para boot no v86 (chainload e CD-ROM)
- **Parser completo** de ISO 9660/El Torito (PVD, boot record, catalog, MBR, GPT)
- **Dois modos de build**: raw (cópia crua) e chainload (MBR custom)

### O Que Este Plano Entrega
Além do código funcional, este plano entrega:

1. **Documentação Completa** (6 arquivos markdown em `docs/`):
   - `01-visao-e-escopo.md` - Visão do problema, público, objetivos, escopo IN/OUT
   - `02-benchmarks.md` - Análise de concorrência, stacks candidatas, benchmarks de performance
   - `SRS.md` - Software Requirements Specification completo (RF, RN, RNF, matriz de rastreabilidade)
   - `03-arquitetura-e-uml.md` - Diagramas Mermaid (casos de uso, classes, sequência, ADRs)
   - `05-backlog.md` - Product backlog Scrum ( épicos, user stories, sprints, velocidades, milestones)
   - `06-plano-de-entrega.md` - Este arquivo (estrutura de pastas, commands, branches, checklist)

2. **Gestão de Código** padronizada:
   - Convenções de commit Conventional Commits (pt-BR)
   - Estratégia de branches develop-first
   - Checklist anti-retrabalho antes de commits
   - `git status` e `git diff --stat` obrigatórios

3. **Handoff** preparado:
   - `docs/dev-log.md` para registro de todas as decisões futuras
   - Milestones claros (M1: MVP, M2: Boot Test, M3: Polished, M4: Release v1.0)
   - User stories priorizadas com critérios de aceite definidos

### Próximos Comandos Imediatos
Após revisão deste plano, execute:

```bash
# 1. Verificar status atual
git status

# 2. Confirmar branch develop
git branch --show-current  # deve retornar "develop"

# 3. Executar testes atuais para garantir que tudo passa
npm test  # ou: node --test tests/iso.test.mjs && node --test tests/boot.test.mjs

# 4. Fazer primeiro commit de planejamento (exemplo)
git add docs/01-visao-e-escopo.md docs/02-benchmarks.md docs/SRS.md docs/03-arquitetura-e-uml.md docs/05-backlog.md docs/06-plano-de-entrega.md docs/dev-log.md
git commit -m "docs(plan): adiciona planejamento completo do bootable-studio (SRS, UML, backlog, benchmarks)"
git push -u origin develop
```

### Riscos Identificados e Mitigações
| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| ISOs reais terem estruturas diferentes das sintéticas | Alta | Warnings automáticos; modo fallback raw sempre disponível |
| Usuários esperam chainload para qualquer ISO | Média | Documentação clara (RN-002, ADR-004); warning no UI |
| Limite de tamanho Blob (~2GB) frustrar usuários com ISOs grandes | Média | Warning no upload; sugerir tools standalone (Rufus/Etcher) para ISOs > 2GB |
| v86 WASM não carregar em navegadores antigos | Baixa | Fallback para testes unitários sem emulação; documentar requisitos mínimos |

---
*Plano de Entrega gerado na Fase 6 - Pronto para execução*