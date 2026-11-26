# Documento de Visão e Escopo - bootable-studio

## 1. Problema
Facilitar a criação e teste de imagens de pendrive bootável a partir de arquivos ISO 9660/El Torito diretamente no navegador, sem necessidade de ferramentas externas ou gravação em mídia física.

## 2. Público-Alvo
- Desenvolvedores e testadores que precisam validar ISOs em ambientes virtuais (v86, QEMU, etc.)
- QA engineers que precisam testar bootabilidade em diferentes configurações de hardware
- Entusiastas e profissionais que precisam criar pendrives bootáveis rapidamente

## 3. Objetivos
### Objetivos Principais
- [x] Parser ISO 9660/El Torito completo (já implementado em src/iso.js)
- [x] Geração de imagem MBR chainload para boot BIOS legado (já implementado em src/builder.js + src/chainload.js)
- [x] Detecção automática de modo isohybrid e GPT/ESP para UEFI
- [x] Teste de boot integrado via v86 emulation (já testado em tests/boot.test.mjs)
- [x] Interface browser-first (todos os processamentos ficam no cliente)

### Objetivos Secundários
- [ ] Suporte a ISOs multi-boot (múltiplas entradas El Torito)
- [ ] Interface visual de seleção de modo de boot (raw vs chainload)
- [ ] Download direto do .img gerado
- [ ] Suporte a ISOs > 2GB (limite atual do Blob do navegador)

## 4. Escopo

### ESCOPO INCLUSO
- ✅ Inspeção completa de ISO (PVD, boot record, catalog, MBR, GPT)
- ✅ Escolha automática de modo de build (raw vs chainload)
- ✅ Geração de imagem .img com MBR adequado
- ✅ Relatório de warnings sobre inconsistências
- ✅ Testes automatizados (5 testes básicos + 1 boot test)

### ESCOPO EXCLUÍDO (por agora)
- ❌ Criação de mídia física (dd, Rufus, Etcher fora do navegador)
- ❌ Conversão entre formatos de imagem diferentes (.iso ↔ .img)
- ❌ Montagem de loopback de ISO já gravada
- ❌ Suporte a boot UEFI nativo via chainload (requer ISO original + Rufus/Etcher)
- ❌ Criptografia ou assinatura de imagens geradas

## 5. Restrições
- **Technical**: Apenas processamento no navegador (browser-first)
- **Performance**: ISOs até 2GB suportadas (limite de Blob do navegador)
- **Compatibilidade**: Navegadores modernos com support para Blob, FileReader, WASM
- **LGPD**: Nenhum dado sai do computador do usuário (arquivos ISO permanecem locais)

## 6. Critérios de Sucesso
1. Parser ISO identifica corretamente PVD, boot record e catalog
2. Modo chainload gera MBR funcional que boota em v86 (comprovado pelos testes)
3. Modo raw copia ISO preservando boot original
4. Warnings são gerados para situações não-ideais (non-hybrid, emulated entries, etc.)
5. Todos os testes existentes passam

## 7. Stakeholders
- **Usuário final**: Desenvolvedores/testadores que precisam testar bootability
- **Equipe de desenvolvimento**: Manutenção e evolução do parser/builder
- **Comunidade open-source**: Contribuições, issues, melhorias

---
*Documento criado na Fase 1 - Descoberta da Demanda*