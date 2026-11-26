# Benchmarks Referenciais - bootable-studio

## 1. Concorrentes e Ferramentas Similares

### Ferramentas Standalone (Desktop)
| Ferramenta | Licença | Plataformas | Bootstrap | UEFI Support | Observações |
|------------|---------|-------------|-----------|--------------|-------------|
| **Rufus** | Freeware | Windows | ISO → USB | Completo | Padrão de fato para Windows USB boot |
| **Etcher** | MIT | Windows, macOS, Linux | ISO → USB | Parcial | Foca em validade de imagem, não chainload |
| **Ventoy** | GPL | Windows, Linux | ISO → USB dir | Completo | Boots múltiplas ISOs sem formatação |
| **Unetbootin** | GPL | Windows, macOS, Linux | ISO → USB | Limitado | Suporte antigo, pouca manutenção |

### Ferramentas Browser-Based (Web)
| Ferramenta | Tech Stack | Bootstrap | Observações |
|------------|------------|-----------|-------------|
| **bootable-studio** (este projeto) | JS puro, Blob, v86 WASM | Custom (chainload) | Primeira solução browser-first para chainload El Torito |
| Nenhum direto conhecido | - | - | Espaço vazio para inovação |

## 2. Análise de Stacks e Libraries Candidatas

### Bibliotecas Consideradas (não usadas atualmente)
| Library | Propósito | Por que não usar |
|---------|-----------|------------------|
| `iso-parser` | Parse ISO 9660 | Já temos implementação própria otimizada para browser |
| `partytown` | Web worker | Não relevante para boot parsing |
| `fabricjs` | Canvas | Não relevante |
| `pidterms/iso9660` | Node.js ISO parser | Server-side, não browser-friendly |

### Decisões Técnicas Justificadas
1. **JS puro sem dependências**: Mantém o projeto auto-contido, evita problemas de versão e size do bundle. O custo é ter que implementar os parsers do zero, mas o benefício de simplicidade compensa.
2. **v86 WASM para testes**: Usar emulação real de BIOS é mais confiável que testes unitários isolados. O custo é o download inicial do WASM (~200KB) e a complexidade de configuração.
3. **Blob.slice para leitura por setores**: Evita carregar ISO de 5GB toda na memória. O ganho é performance e baixo uso de memória; o custo é a complexidade de leitura offset-based.

## 3. Padrões de Mercado e Especificações

### Especificação El Torito
- **Versão**: El Torito Specification 1.08 (2006)
- **Setor de boot**: Primeiro setor (512 bytes ou 2048 bytes dependendo do tipo)
- **Catálogo**: Tabela de entrada que descreve a imagem de boot (LBA, segmento, setor count)
- **Media Types**:
  - `0x00`: No emulation (HD type, usado por isohybrid)
  - `0x01-0x03`: Floppy disk emulation (1.2MB, 1.44MB, 2.88MB)
  - `0x88`: Bootable entry (usado pelo chainload)

### MBR Structure (relevante para chainload)
- Offset 0x00-0x1B: Código de boot (446 bytes)
- Offset 0x1C-0x1D: Assinatura 0x55AA (2 bytes)
- Offset 0x1E-0x1F: Padding
- Offset 0x20-0x3F: Primeira entrada de partição (16 bytes)
- Cada entrada: status, CHS start, tipo, CHS end, LBA start, setor count

## 4. Benchmark de Performance (Auto-teste)

### Testes Internos Realizados
Os testes existentes cobrem os seguintes cenários:

| Cenário | Tempo Aprox | Status |
|---------|-------------|--------|
| `inspectIso` ISO sintética (~24 setores) | < 1s | ✅ Todos passam |
| `inspectIso` ISO isohybrid | < 1s | ✅ Passa |
| `inspectIso` GPT+ESP | < 1s | ✅ Passa |
| `inspectIso` non-hybrid + emulated | < 1s | ✅ Passa |
| `inspectIso` arquivo inválido | < 1s | ✅ Lança IsoError |
| `buildImage` + boot v86 (chainload) | ~20s | ✅ Detecta "OK" na serial |
| `buildImage` + boot v86 (CD-ROM) | ~20s | ✅ Detecta "OK" na serial |

### Fatores de Performance Identificados
1. **Leitura por Blob.slice**: O `readAt` function em `iso.js` só lê os setores necessários, não o arquivo todo. Isso permite analisar ISOs grandes sem travar o navegador.
2. **Montagem final**: O `buildImage` usa `Blob(parts, ...)` que referencia o original sem copiar, então o tamanho final é ISO + MBR (máximo ~512 bytes + padding).
3. **WASM loading**: O teste de boot v86 inclui o tempo de carregamento do v86.wasm + seabios.bin, que pode variar de 2-10s dependendo da conexão.

## 5. Recomendações de Stack

### Manter (Recomendado)
- **JS Module (type: "module")**: Já configurado no package.json
- **Blob API nativa**: Suportada em todos os navegadores modernos
- **v86 WASM**: Para testes de integração real (não mock)
- **Estrutura atual de src/**: iso.js → builder.js → chainload.js → asm.js

### Avaliar Futuramente
- **Web Worker**: Para não bloquear o main thread em ISOs muito grandes
- **Typed Arrays**: Otimização adicional para leitura de setores
- **IndexedDB**: Para cache de inspeções repetidas da mesma ISO

---
*Documento criado na Fase 2 - Benchmarks Referenciais*