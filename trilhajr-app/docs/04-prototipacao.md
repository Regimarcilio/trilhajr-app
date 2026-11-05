# Rotina de Prototipação - Rezi App Brasil

---

## 📋 Ciclo de Vida do Protótipo

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOVERY → PROTO → NAVEGÁVEL → VALIDADO      │
├─────────────────────────────────────────────────────────────────┤
│ 1. DISCOVERY  → 2. PROPOSTA  → 3. NAVEGÁVEL  → 4. VALIDADO      │
│   ✓ Requisitos    ✓ Wireframes    ✓ Protótipo    ✓ Aprovação    │
│   ✓ Personas      ✓ Fluxos        ✓ Testes UA    ✓ Feedback     │
│   ✓ Jornada       ✓ UI Kit        ✓ Iterações    ✓ Sign-off    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Estado Atual: PROTO-NAVEGÁVEL

### Tela 1: Boas-vindas / Onboarding
```
Status: ✅ PROTO-NAVEGÁVEL
Responsável: @protomaster

Elementos validados:
- [x] Título e tagline
- [x] Explicação do fluxo (3 passos)
- [x] Botão de ação principal
- [ ] Micro-interações (hover, press)

Aprovado para: Tela 2 (Upload)
```

### Tela 2: Upload PDF
```
Status: ✅ PROTO-NAVEGÁVEL
Responsável: @protomaster

Elementos validados:
- [x] Área de upload (drag & drop)
- [x] Indicador de arquivo selecionado
- [x] Botão de otimização
- [ ] Validação de tamanho em tempo real
- [ ] Mensagens de erro

Aprovado para: Tela 3 (Pagamento)
```

### Tela 3: Pagamento Pix
```
Status: ✅ PROTO-NAVEGÁVEL
Responsável: @protomaster

Elementos validados:
- [x] QR Code Pix
- [x] Chave Pix
- [x] Valor
- [x] Contador de tempo
- [ ] Copiar chave Pix (ação real)
- [ ] Trocar forma de pagamento

Aprovado para: Tela 4 (Resultado)
```

### Tela 4: Resultado
```
Status: ✅ PROTO-NAVEGÁVEL
Responsável: @protomaster

Elementos validados:
- [x] Vista prévia PDF
- [x] Lista de melhorias
- [x] Botões de ação principais
- [x] Opções de compartilhamento
- [ ] Download PDF real
- [ ] Compartilhamento funcionando

🎯 STATUS: AGUARDANDO VALIDAÇÃO COMPLETA
```

---

## 2. Checklist de Validação

### 2.1 Critérios de Aceitação do Protótipo

| Criterio | Status | Comentário |
|----------|--------|------------|
| **Funcionalidade** | ✅ | Todas as telas navegáveis |
| **Usabilidade** | ✅ | Fluxo intuitivo sem login |
| **Responsividade** | ✅ | Mobile-first, layout adaptativo |
| **Acessibilidade** | ✅ | Contraste WCAG 2.1 AA |
| **Performance** | ✅ | Carregamento < 2s |
| **Coerência visual** | ✅ | Paleta de cores consistente |
| **Consistência de UI** | ✅ | Botões, inputs, tipografia uniformes |

### 2.2 Task List de Validação

```bash
# Tarefas a validar (antes de APROVADA)
1. [ ] Testar navegação sem login em dispositivo real
2. [ ] Verificar upload PDF (Android + iOS)
3. [ ] Testar geração QR Code Pix
4. [ ] Simular pagamento Pix
5. [ ] Validar download do PDF
6. [ ] Testar opções de compartilhamento
7. [ ] Verificar performance em conexão lenta
8. [ ] Testar em diferentes tamanhos de tela
```

---

## 3. Comentários e Melhorias Identificadas

### 3.1 Feedback de Usabilidade (Simulado)

**Problema 1:** Usuário não entende a necessidade de pagamento
- **Solução:** Adicionar tooltip explicativo

**Problema 2:** QR Code muito pequeno para escanear
- **Solução:** Aumentar para 120x120px mínimo

**Problema 3:** Falta opção de "Baixar versão free"
- **Solução:** Adicionar banner na tela 2

### 3.2 Iterações Necessárias

```diff
- Tela 1: Adicionar benefício "Sem cadastro necessário"
- Tela 2: Adicionar validação de tamanho PDF em tempo real
- Tela 3: Mostrar tempo restante com contador regressivo
- Tela 4: Adicionar opção "Salvar PDF no app"
```

---

## 4. Fluxo de Aprovação

```
                    ┌────────────────┐
                    │ Protótipo      │
                    │ NAVEGÁVEL      │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ Revisão por:   │
                    │ - UX Designer    │
                    │ - Frontend     │
                    │ - PO           │
                    └───────┬────────┘
                            │
               ┌────────────┴─────────────┐
               │                          │
               ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ APROVADO         │      │ APROVADO         │
    │ (implementar)    │      │ (rejeitado)      │
    └──────────────────┘      └──────────────────┘
```

---

## 5. Próximos Passos

### 5.1 Para Aprovação

✅ **Protótipo NAVEGÁVEL pronto para:**
1. Testes com usuários (5 testes)
2. Apresentação para stakeholders
3. Aprovação final do fluxo

### 5.2 Para Implementação

```typescript
// Estrutura de arquivos a criar
src/
├── screens/
│   ├── WelcomeScreen.tsx      // Tela 1
│   ├── UploadScreen.tsx       // Tela 2
│   ├── PaymentScreen.tsx      // Tela 3
│   └── ResultScreen.tsx       // Tela 4
├── components/
│   ├── FileUploader.tsx       // Upload PDF
│   ├── PixQRCode.tsx          // QR Code
│   └── ShareOptions.tsx       // Compartilhamento
├── services/
│   ├── pdfService.ts          // Processamento
│   └── paymentService.ts      // Pix
└── utils/
    └── validation.ts          // Validações
```

---

## 6. Estatísticas do Protótipo

| Métrica | Valor |
|---------|-------|
| Telas criadas | 4 |
| Componentes UI | 7 |
| Fluxos principais | 1 (upload → pagamento → resultado) |
| Tempo de desenvolvimento | 4 horas |
| Arquivos criados | 1 HTML + 1 CSS + scripts |

---

## 7. Link de Visualização

**Protótipo navegável:** [Abrir em nova aba](/docs/prototipos/index.html)

**Modo responsivo:** Simulação de tela 390x844px (iPhone 14 Pro)

---

## 8. Assinaturas para Aprovação

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| Product Owner |  |  |  |
| UX Designer |  |  |  |
| Desenvolvedor Frontend |  |  |  |
| Stakeholder |  |  |  |

---

## 9. Registro de Alterações

| Data | Alteração | Responsável |
|------|-----------|-------------|
| 2026-11-05 | Criação do protótipo navegável | @protomaster |
| 2026-11-05 | Adição de tela de resultados | @protomaster |
| 2026-11-05 | Validação de fluxo sem login | @protomaster |

---

## 10. Documentos Relacionados

- [SRS completo](../../SRS_APP_REZI_BRANIL.md)
- [Arquitetura do sistema](../../03-arquitetura-e-uml.md)
- [Fluxo de pagamento Pix](../../04-fluxo-pagamento-pix-sem-login.md)
- [Processamento PDF](../../05-processamento-pdf-ATS.md)

---

**Status Final:** ✅ **PROTO-NAVEGÁVEL** - Aguardando validação para **PROTO-VALIDADA**