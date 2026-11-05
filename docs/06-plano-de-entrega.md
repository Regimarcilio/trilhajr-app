# Plano de Entrega - Rezi App Brasil
## App Mobile para PDF Sem Login (ATS Otimizado)

---

## 1. Visão Geral

| Aspecto | Detalhe |
|---------|---------|
| **Nome do Projeto** | Rezi Brasil - App Mobile PDF ATS |
| **Tipo** | Mobile App (React Native) |
| **Arquitetura** | Sem login/senha, pagamento Pix integrado |
| **Público-Alvo** | Profissionais brasileiros buscando emprego |
| **Duração Estimada** | 12 semanas (3 sprints) |
| **Orçamento Técnico** | R$ 60.000 - 85.000 |

---

## 2. Estrutura de Pastas Proposta

```
rezi-brasil-app/
├── app/                          # Frontend Mobile
│   ├── src/
│   │   ├── screens/             # Tela principal
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── UploadScreen.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   └── ResultScreen.tsx
│   │   ├── components/          # Componentes UI
│   │   ├── services/          # APIs e integrações
│   │   └── utils/              # Helpers e validações
│   ├── assets/                 # Imagens, ícones
│   ├── tests/                  # Testes unitários
│   ├── app.json                # Configuração Expo
│   └── package.json            # Dependências
│
├── api/                        # Backend API
│   ├── src/
│   │   ├── controllers/       # Lógica de negócios
│   │   ├── routes/            # Definição de rotas
│   │   ├── services/          # Serviços (PDF, Pix, AI)
│   │   ├── middleware/        # Auth, upload, erros
│   │   └── config/            # Configurações
│   ├── tests/                  # Testes API
│   ├── Dockerfile             # Deploy
│   └── package.json
│
├── ai-service/                 # Microserviço IA
│   ├── main.py                # FastAPI server
│   ├── services/              # Lógica de otimização
│   ├── models/                # Modelos ML
│   └── requirements.txt
│
├── docs/                       # Documentação
│   ├── SRS.md
│   ├── 03-arquitetura-e-uml.md
│   ├── 04-fluxo-pagamento-pix-sem-login.md
│   ├── 05-processamento-pdf-ATS.md
│   ├── 04-rotina-prototipacao-telas.md
│   └── 05-backlog.md
│
├── .env                       # Variáveis de ambiente
├── docker-compose.yml         # Orquestração
└── README.md
```

---

## 3. Comandos de Setup

### 3.1 Pre-requisitos

```bash
# Verificar Node.js
node --version  # >= 18.x
npm --version   # >= 9.x

# Instalar Expo CLI
npm install -g expo-cli

# Instalar dependências
npm install
```

### 3.2 Setup Frontend Mobile

```bash
# Navegar para pasta do app
cd app

# Instalar dependências
npm install

# Instalar dependências nativas
npx expo install

# Executar em modo desenvolvimento
npx expo start
```

### 3.3 Setup Backend API

```bash
# Navegar para API
cd api

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar variáveis: API_KEY_ASAAS, DATABASE_URL, etc.

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### 3.4 Setup Microserviço IA

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar serviço
python main.py
```

### 3.5 Deploy com Docker

```bash
# Build de imagens
docker build -t rezi-api -f api/Dockerfile .
docker build -t rezi-ai -f ai-service/Dockerfile .

# Subir serviços
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs -f
```

---

## 4. Estratégia de Branches

```
develop          # Branch principal de desenvolvimento
├── feature/us-001-upload-pdf
├── feature/us-002-pix-payment
├── feature/us-004-ats-optimization
├── feature/us-005-share
│
feature/         # Branches por funcionalidade
│
release/v1.0.0   # Preparação para release
│
hotfix/          # Correções críticas
│
main             # Branch de produção (PROTECTED)
```

### Regras de Merge

1. **Pull Request** obrigatório para `develop`
2. **2 reviewers** mínimos
3. **Review de código** + **Testes** obrigatórios
4. **Squad CI** passar (lint, testes, security)

### Conventional Commits

```bash
feat(api): adiciona endpoint de upload PDF
fix(payment): corrige validação de QR Code Pix
docs(proto): atualiza telas de prototipação
refactor(ai): otimiza algoritmo de keywords
test(share): adiciona testes de compartilhamento
```

---

## 5. CI/CD Mínimo (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ develop, feature/* ]
  pull_request:
    branches: [ develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Android
        run: npx expo export:android
      - name: Build iOS
        run: npx expo export:ios
```

---

## 6. Checklist Anti-Retrabalho

### Pré-Desenvolvimento
- [x] SRS validado
- [x] Protótipo APROVADO
- [x] Arquitetura definida
- [ ] ADRs criados (001-arquitetura-sem-login.md)
- [ ] DevLog configurado

### Durante Desenvolvimento
- [ ] Cobertura de testes > 70%
- [ ] Lint passando (ESLint/Prettier)
- [ ] Segurança (kalimaster-sast limpo)
- [ ] Documentação atualizada

### Pós-Desenvolvimento
- [ ] Testes E2E passando
- [ ] Performance < 2s carregamento
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Deploy em staging validado

---

## 7. Cronograma de Entrega

### Sprint 1 (Semana 1-2) - Fundação
| Dia | Atividade | Responsável |
|-----|-----------|-------------|
| 1 | Setup projeto React Native + Expo | @developer |
| 2 | Configuração ambiente de dev | @developer |
| 3-4 | Tela 1: Boas-vindas + navegação | @developer |
| 5-6 | Tela 2: Upload PDF + validação | @developer |
| 7 | Tela 3: Mock Pix QR Code | @developer |
| 8-9 | Integração Asaas Sandbox | @developer |
| 10 | Testes e revisão código | @qa |
| 11 | Documentação inicial | @developer |
| 12 | Demo para stakeholders | @product |

### Sprint 2 (Semana 3-4) - Processamento
| Dia | Atividade | Responsável |
|-----|-----------|-------------|
| 1-2 | Backend API + rotas | @developer |
| 3-4 | Webhook de pagamento | @developer |
| 5-6 | Processamento PDF básico | @developer |
| 7-8 | Geração PDF ATS-safe | @developer |
| 9 | Tela 4: Resultado + download | @developer |
| 10 | Testes de integração | @qa |
| 11 | Documentação técnica | @developer |
| 12 | Demo beta funcional | @product |

### Sprint 3 (Semana 5-6) - Compartilhamento
| Dia | Atividade | Responsável |
|-----|-----------|-------------|
| 1-2 | Integração compartilhamento | @developer |
| 3 | Otimização de performance | @developer |
| 4 | Testes E2E completos | @qa |
| 5 | Correções e melhorias | @developer |
| 6 | Preparação para release | @team |
| 7 | Build final + deploy staging | @devops |
| 8 | Validação staging | @qa |
| 9-10 | Ajustes finais | @team |
| 11-12 | Release para produção | @devops |

---

## 8. Configuração do DevLog

Criar `docs/dev-log.md` com estrutura:

```markdown
# Dev Log - Rezi Brasil

## [2026-11-05] - Task: #123
**Descrição:** Configuração inicial do projeto
**Arquivos:** app/package.json, api/package.json, docker-compose.yml
**Testes:** npm run test (95% coverage)
**Decisões:** Usar Expo para acelerar desenvolvimento mobile
```

---

## 9. Recursos Necessários

### Humanos
| Nome | Função | Horas/semana |
|------|--------|--------------|
| Developer Fullstack | Mobile + API | 20h |
| QA Engineer | Testes automatizados | 8h |
| Product Owner | Gestão de backlog | 4h |
| DevOps | Deploy e infra | 6h |

### Técnicos
| Recurso | Versão | Finalidade |
|---------|--------|--------------|
| Node.js | 18.x LTS | Backend API |
| React Native | 0.74+ | Mobile App |
| Expo | 49.x | Desenvolvimento |
| Asaas | API v3 | Pagamento Pix |
| PDF-lib | 1.17.x | Manipulação PDF |
| Docker | 24.x | Containerização |

---

## 10. Documentos de Handoff

| Documento | Status | Local |
|-----------|--------|-------|
| SRS.md | ✅ | docs/SRS_APP_REZI_BRANIL.md |
| Arquitetura | ✅ | docs/03-arquitetura-e-uml.md |
| Fluxo Pix | ✅ | docs/04-fluxo-pagamento-pix-sem-login.md |
| Prototipação | ✅ | docs/prototipos/index.html |
| Backlog Scrum | ✅ | docs/05-backlog.md |
| Plano de Entrega | ✅ | docs/06-plano-de-entrega.md |
| ADRs | ❌ | docs/04-ADRs/ (criar) |
| Runbook | ❌ | docs/runbook.md (criar) |

---

## 11. Próximos Comandos Recomendados

```bash
# 1. Iniciar projeto mobile
npx create-expo-app app rezi-brasil --template typescript

# 2. Iniciar API backend
npm init -y && npm install express cors dotenv pdf-parse axios

# 3. Configurar repositório
git checkout -b develop
git push -u origin develop

# 4. Criar ADR inicial
mkdir -p docs/04-ADRs
```

---

## Resumo Executivo

**✅ Status: PRONTO PARA DESENVOLVIMENTO**

O projeto foi totalmente planejado com:
- 4 telas navegáveis (protótipo validado)
- Fluxo de pagamento Pix sem login
- Arquitetura minimalista (sem database complexo)
- Backlog Scrum com 8 User Stories
- CI/CD básico configurado

**Próximo passo:** Executar setup inicial e iniciar Sprint 1 no branch `develop`.

---

*Documento gerado em: 2026-11-05*  
*Versão: 1.0*  
*Responsável: @planmaster*