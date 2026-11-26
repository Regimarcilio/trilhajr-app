# Software Requirements Specification (SRS) - bootable-studio

## 1. Introdução

### 1.1 Propósito
O bootable-studio é uma aplicação web que inspecciona imagens ISO 9660/El Torito e gera arquivos de imagem de disco (.img) bootáveis, incluindo a capacidade de criar MBRs de chainload para boot BIOS legado em pendrives. O sistema roda completamente no navegador, garantindo que os arquivos ISO nunca deixem o computador do usuário, atendendo assim requisitos de privacidade e LGPD.

### 1.2 Escopo

**Inclusão (IN):**
- Parsing de ISO 9660 com leitura de Primary Volume Descriptor (PVD)
- Detecção e extração do boot record El Torito
- Parsing do catálogo El Torito (entradas de boot, mídia types, LBA, segmento)
- Análise de MBR (Master Boot Record) e detecção de estilo isohybrid
- Detecção de tabela de partição GPT e partições ESP para boot UEFI
- Geração de imagem .img com modo "raw" (cópia byte-a-byte) ou "chainload" (MBR custom)
- Relatório de warnings sobre inconsistências ou limitações
- Testes de integração via emulador v86 (WASM) para verificação de boot

**Exclusão (OUT):**
- Gravação direta em hardware físico (pendrive)
- Conversão entre formatos de imagem diferentes (.iso ↔ .img além do gerado)
- Suporte a boot UEFI nativo via chainload (requer ferramenta externa como Rufus/Etcher)
- Criptografia ou assinatura digital de imagens geradas
- Funcionamento em navegadores sem suporte a Blob API ou WASM

### 1.3 Definições, Abreviações e Acrônimos

| Termo | Definição |
|-------|-----------|
| ISO | International Organization for Standardization (padrão 9660) |
| El Torito | Esquema de boot para CDs/DVDs/ISOs |
| PVD | Primary Volume Descriptor (primeiro descritor de volume) |
| MBR | Master Boot Record (primeiro setor de 512 bytes de disco) |
| GPT | GUID Partition Table (tabela de partições GUID) |
| ESP | EFI System Partition (partição do sistema EFI) |
| chainload | Técnica de boot onde MBR carrega imagem El Torito |
| isohybrid | ISO que pode ser gravada tanto em CD/DVD quanto em USB |
| v86 | Emulador x86 em WASM para testes de boot no navegador |
| NFR | Requisito Não-Funcional |

### 1.4 Referências
- Material de referência: https://integrador-cedup.glide.page/dl/a400f7
- Especificação El Torito 1.08
- Documentação v86 project

---

## 2. Descrição Geral

### 2.1 Perspectiva do Sistema
O bootable-studio funciona como uma ferramenta de inspeção e build em uma única página. O usuário carrega um arquivo ISO, o sistema lê os setores críticos via Blob.slice (sem carregar o arquivo inteiro na memória), fornece um relatório detalhado sobre a estrutura da ISO e oferece a geração de uma imagem .img pronta para ser gravada em pendrive. Todo o processamento acontece no cliente (browser), usando JavaScript puro com o API Blob nativo e o emulador v86 compilado para WASM para testes de boot reais.

### 2.2 Público-Alvo

| Segmento | Características |
|----------|-------------------|
| Usuário Final | Desenvolvedores, testadores QA, entusiastas que precisam testar imagens ISO em ambientes virtuais sem gravar mídia física |
| Administrador | Profissionais de TI que precisam validar compatibilidade boot em diferentes configurações de hardware |

### 2.3 Restrições
- **Prazo:** Projeto existente com código funcional, foco em documentação e testes
- **Orçamento:** Recursos limitados (single developer / open source)
- **LGPD:** Todos os arquivos processados permanecem no navegador do usuário; nenhum dado é enviado a servidores
- **Acessibilidade:** Interface deve ser usable com leitores de tela (HTML semântico, labels adequados)
- **Compatibilidade:** Navegadores modernos (Chrome 80+, Firefox 78+, Edge 85+, Safari 14+)

### 2.4 Premissas
- O usuário tem um arquivo ISO válido (ou pelo menos estruturalmente próximo de ISO 9660)
- O ambiente de teste (v86 WASM) carrega corretamente no navegador do usuário
- As ISOs seguem a especificação El Torito (pelo menos parcialmente)
- O navegador suporta WebAssembly e Blob.slice

---

## 3. Requisitos Funcionais

| ID | Título | Descrição | Ator | Prioridade | Dependências |
|----|--------|-----------|------|------------|--------------|
| RF-001 | Parsing de ISO 9660 | Ler e interpretar o Primary Volume Descriptor (PVD) da ISO, incluindo volume ID, system ID, volume size e root directory LBA | Sistema | Must | Tipo arquivo Blob |
| RF-002 | Detecção de boot record | Identificar e extrair o boot record El Torito da ISO, verificando assinatura EL TORITO e catalog LBA | Sistema | Must | RF-001 |
| RF-003 | Parsing do catálogo El Torito | Ler o catálogo de boot e extrair todas as entradas (tipo, mídia, LBA, sector count, segmento de carga) | Sistema | Must | RF-002 |
| RF-004 | Análise de MBR | Parsing da área de sistema dos primeiros 512 bytes, detectando assinatura 0x55AA, tabelas de partição e estilo isohybrid | Sistema | Must | RF-002 |
| RF-005 | Detecção GPT/ESP | Identificar tabela GPT presente e presença de partição EFI System Partition para compatibilidade UEFI | Sistema | Should | RF-004 |
| RF-006 | Escolha de modo de build | Determinar automaticamente ou permitir escolher entre modo "raw" (cópia crua) e "chainload" (MBR custom) baseado na estrutura da ISO | Sistema | Must | RF-003, RF-004 |
| RF-007 | Geração de imagem .img | Montar o arquivo .img final com MBR adequado, preservando o conteúdo da ISO e adicionando código de boot quando solicitado | Sistema | Must | RF-006 |
| RF-008 | Relatório de warnings | Gerar lista de warnings sobre inconsistências detectadas (non-hybrid, emulated entries, limite de tamanho, etc.) | Sistema | Should | RF-001 a RF-007 |
| RF-009 | Teste de boot via v86 | Integrar com emulador v86 (WASM) para inicializar a imagem gerada e verificar saída de serial esperada ("OK") | Sistema | Could | RF-007, build.test.mjs |
| RF-010 | Interface de upload | Permitir ao usuário carregar arquivos ISO via input type="file" | Usuário | Must | Tipo HTML5 |

### Critérios de Aceitação (Gherkin)

**Feature: Inspeção de ISO**
```gherkin
Feature: Inspeciona uma imagem ISO 9660/El Torito

  Scenario: Analisa ISO 9660 válida com boot El Torito
    Given o usuário carregou um arquivo ISO sintético válido
    When o sistema chama inspectIso(blob)
    Then o retorno contém iso.volumeId, iso.blockSize = 2048
    And elTorito.entries tem pelo menos 1 entrada bootable
    And mbr.signature é true (para ISOs isohybrid)
    And há warnings apropriados para o tipo da ISO

  Scenario: Detecta ISO não-híbrida e recomenda chainload
    Given o usuário carregou ISO sem MBR isohybrid
    When inspectIso é executado
    Then boot.recommendedMode = "chainload"
    And há warning sobre "não é híbrida"
    And boot.chainloadEntry está definido

  Scenario: Rejeita arquivo que não é ISO 9660
    Given o usuário carregou um blob aleatório (64KB)
    When inspectIso é executado
    Then lança IsoError com mensagem contendo "CD001" ou "ISO 9660"
```

**Feature: Geração de Imagem Bootável**
```gherkin
Feature: Gera imagem .img a partir de ISO inspeccionada

  Scenario: Gera imagem no modo chainload
    Given info do modo chainload foi escolhido (ou auto)
    And entrada chainloadEntry existe e é válida
    When buildImage(isoBlob, info, {mode: "chainload"}) é chamado
    Then retorno contém blob com modo "chainload"
    And filename termina com "-chainload.img"
    And warnings pode incluir avisos sobre UEFI não suportado

  Scenario: Gera imagem no modo raw (DD)
    Given info do modo raw foi escolhido (ou auto para isohybrid)
    When buildImage(isoBlob, info, {mode: "raw"}) é chamado
    Then retorno contém blob com modo "raw"
    And filename termina com "-dd.img"
    And notas inclui "Cópia byte a byte"
```

---

## 4. Requisitos Não-Funcionais

| ID | Categoria | Descrição | Métrica/Tolerância |
|----|-----------|-----------|-------------------|
| NFR-001 | Performance | Tempo de inspeção de ISO deve ser sublinear ao tamanho do arquivo (apenas setores críticos lidos) | < 2s para ISO de 500MB (testado via Blob.slice) |
| NFR-002 | Performance | Tempo de buildImage deve ser rápido (~100ms para montar blob final) | Teste de não-bloqueio do main thread |
| NFR-003 | Usabilidade | Interface deve carregar e mostrar resultados em < 5s do upload | Medida pelo tempo de feedback visual |
| NFR-004 | Segurança | Nenhum dado do usuário (arquivos ISO) sai do navegador | Política de zero upload; verificado via inspeção de tráfego de rede |
| NFR-005 | Compatibilidade | Funcionar em Chrome, Firefox, Edge, Safari versões atuais | Teste em 4 navegadores principais |
| NFR-006 | Acessibilidade | Elementos da interface têm labels adequados e contraste adequado | WCAG 2.1 Level AA mínimo |
| NFR-007 | Reliability | Taxa de sucesso dos testes de boot v86 deve ser > 95% em ISOs sintéticas válidas | Baseado em 20+ testes rodados |

---

## 5. Requisitos de Interface / Integrações

### 5.1 Interfaces

| Interface | Descrição | Tipo |
|-----------|-----------|------|
| Input file `<type="file">` | Upload de arquivo ISO pelo usuário | HTML5 API |
| `inspectIso(blob, options)` | Função principal de inspeção de ISO | API JavaScript (ES module) |
| `buildImage(isoBlob, info, options)` | Função principal de geração de imagem .img | API JavaScript (ES module) |
| Eventos de progresso | `onProgress(fraction, label)` para relatar andamento | Callback opcional |
| Console log | Mensagens de debug e warnings | Browser console |

### 5.2 Integrações

| Sistema | Tipo | Protocolo | Observações |
|---------|------|-----------|-------------|
| v86 WASM | Dependência externa | WebAssembly | Carregado dinamicamente via script tag |
| Blob API | Nativa do Browser | - | Sem dependências externas |
| FileReader API | Nativa do Browser | - | Para leitura de arquivo do disco |

---

## 6. Regras de Negócio

| ID | Descrição | Fonte | RF Associado |
|----|-----------|-------|--------------|
| RN-001 | ISO não-híbrida sem entrada "no emulation" só pode bootar por CD/DVD, não por pendrive via chainload | Estrutura El Torito | RF-006, RF-007 |
| RN-002 | Modo chainload só suporta entradas El Torito com mediaType 0 (no emulation / disquete 1.44MB emulado → convertido para HD type) | Spec El Torito | RF-006 |
| RN-003 | ISOs isohybrid podem ser copiadas cruas (modo raw) e iniciam por BIOS (com GPT/ESP também por UEFI) | Spec El Torito + isohybrid pattern | RF-006, RF-007 |
| RN-004 | Se ISO tem entrada UEFI (isotipo 0x91 no catálogo) mas não tem GPT/ESP, boot UEFI por pendrive não funcionará | Spec El Torito + GPT | RF-005 |
| RN-005 | Warnings devem ser exibidos ao usuário sobre limitações conhecidas (tamanho > 2GB, emulação, etc.) | UX/Usabilidade | RF-008 |

---

## 7. Matriz de Rastreabilidade

| RF | RN | Testes |
|----|----|--------|
| RF-001 | RN-001 | iso.test.mjs (testes 1-5) |
| RF-002 | RN-001 | iso.test.mjs (todos) |
| RF-003 | RN-001 | iso.test.mjs (todos) |
| RF-004 | RN-001 | iso.test.mjs (todos) |
| RF-005 | RN-004 | (teste visual de GPT detection) |
| RF-006 | RN-001, RN-002 | builder.js chooseMode lógica |
| RF-007 | RN-003 | boot.test.mjs (testes de boot v86) |
| RF-008 | RN-005 | iso.test.mjs (warnings checks) |
| RF-009 | - | boot.test.mjs (cenário "OK" serial) |
| RF-010 | - | iso.test.mjs (upload functionality) |

---

## 8. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| R01: ISO maior que 2GB falha em navegadores antigos | Alto | Média | Exibir warning claro no upload; sugerir tool standalone para ISOs grandes |
| R02: ISO com entrada emulada (mediaType > 0) não suporta chainload | Alto | Alta | Warning automático ao usuário; documentar limitação RN-002 |
| R03: ISO isohybrid com GPT mas sem ESP pode falhar em boot UEFI | Médio | Baixa | Verificar gpt.hasEsp antes de afirmar UEFI support; warning RN-004 |
| R04: v86 WASM falha carregar em alguns navegadores | Médio | Média | Fallback para testes unitários sem emulação; documentar requisitos de browser |
| R05: Usuário tenta bootar ISO errada/ corrompida | Baixo | Alta | Validações iniciais (PVD signature, minimum size); errors claros via IsoError |
| R06: Mudanças em especificação El Torito quebrar parser | Médio | Baixa | Testes sintéticos automatizados; documentação da estrutura esperada |

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| ISO 9660 | Padrão de sistema de arquivos para mídia óptica (CD/DVD) |
| El Torito | Mecanismo de boot que permite inicializar a partir de CDs/DVDs/ISOs |
| PVD | Descritor de volume primário - primeira estrutura da ISO contendo metadados |
| MBR | Registro mestre de inicialização - primeiros 512 bytes de um dispositivo de armazenamento |
| Chainload | Técnica onde o bootloader carrega outro programa de boot (neste caso, a imagem El Torito) |
| Isohybrid | ISO que contém tanto estruturas de boot CD/DVD quanto estruturas compatíveis com USB (MBR + GPT) |
| v86 | Emulador x86 escrito em JavaScript/WASM que roda no navegador |
| Blob | Object do JavaScript para manipulação de dados binários (imagens, arquivos) |
| LBA | Logical Block Address - endereço lógico de setor em dispositivos de armazenamento |
| Sector | Unidade de armazenamento; para ISO 9660 são 2048 bytes; para MBR são 512 bytes |
| NFR | Requisito Não-Funcional que define como o sistema deve se comportar (performance, segurança, etc.) |
| MoSCoW | Priorização: Must (obrigatório), Should (importante), Could (desejável), Won't (não agora) |

---
*Documento SRS gerado na Fase 3 - Requisitos Funcionais e Não-Funcionais*