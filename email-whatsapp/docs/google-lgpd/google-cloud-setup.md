# Google Cloud Setup — Gmail API OAuth2

Este guia documenta os passos para configurar o projeto Google Cloud, habilitar a Gmail API e configurar OAuth2 para a plataforma MailChat.

## Pré-requisitos

- Conta Google (idealmente dedicada para aplicações)
- Acesso ao [Google Cloud Console](https://console.cloud.google.com/)
- Domínio próprio (opcional, mas recomendado para produção)

## Passo a passo

### 1. Criar projeto

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. No menu lateral: **IAM e Admin → Gerenciador de Projetos**
3. Clique em **Criar Projeto**
4. Preencha:
   - Nome: `MailChat` (ou `mailchat-app-production`)
   - ID do projeto: `mailchat-XXXXX` (será gerado automaticamente)
   - Região: N/A (APIs globais)
5. **Anotar** o `PROJECT_ID` — será usado nos scripts

### 2. Habilitar Gmail API

1. No menu lateral: **APIs e Serviços → Biblioteca**
2. Pesquisar: `Gmail API`
3. Clicar em **Habilitar**

### 3. Configurar tela de consentimento OAuth

**Importante:** Se usar o ambiente `Production`, a tela de consentimento passará por verificação.

1. Navegar para: **APIs e Serviços → Tela de Consentimento OAuth**
2. Tipo de usuário:
   - **External** — aplicativo público (qualquer conta Google)
   - **Internal** — apenas contas do domínio Google Workspace (sem CASA)
3. Informações obrigatórias:
   - Nome da aplicação: `MailChat`
   - Contato de suporte: email@seudominio.com
   - Desenvolvedor: seu@email.com
4. Escopos:
   - Adicionar escopo **`https://www.googleapis.com/auth/gmail.readonly`**
   - Adicionar escopo **`https://www.googleapis.com/auth/gmail.send`**
5. Salvar e continuar

### 4. Credenciais OAuth 2.0

1. **APIs e Serviços → Credenciais**
2. **Criar credenciais → ID do cliente OAuth**
3. Tipo de aplicativo: **Web application**
4. Configurar:
   - Nome: `MailChat Web`
   - **URIs de redirecionamento autorizados:**
     - Desenvolvimento: `http://localhost:5173/auth/callback`
     - Produção: `https://seudominio.com/auth/callback`
5. Anotar:
   - **Client ID** → será usado no `.env`
   - **Client Secret** → será usado no `.env` (nunca commitar!)

### 5. Configurar contas de teste (modo Testing)

Se usar `Testing`, adicione contas de teste:

1. Na tela de consentimento, aba **Usuários de teste**
2. Adicionar emails Google:
   - Seu email personal
   - Outros usuários de teste (máx. 100)
3. **Status:** `Em teste` (até 7 dias para refresh_token)

### 6. Escopos adicionais (futuro)

| Escopo | Propósito | Necessário |
|---|---|---|
| `gmail.compose` | Rascunho automático | Não (usar `gmail.send`) |
| `gmail.insert` | Inserir rascunho | Não |
| `gmail.labels` | Gerenciar rótulos | Não (sincronização já inclui) |
| `gmail.modify` | Modificar rótulos/mensagens | Não |
| `gmail.settings.basic` | Configurações de usuário | Não |
| `openid` | Identidade básica (necessário para PKCE) | **Sim** |
| `email` | Verificar email do usuário | **Sim** |

### 7. Validação do fluxo

Usareste:

```
GET https://accounts.google.com/o/oauth2/v2/auth?
  client_id=CLIENT_ID&
  redirect_uri=ENCODED_CALLBACK&
  response_type=code&
  scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send openid email&
  access_type=offline&
  prompt=consent&
  state=STATE_VALUE
```

O `prompt=consent` garante que o `refresh_token` seja retornado.

## Checklist do usuário

- [ ] Criar projeto Google Cloud (console.cloud.google.com)
- [ ] Habilitar Gmail API
- [ ] Configurar tela de consentimento com escopos adequados
- [ ] Gerar Client ID e Client Secret
- [ ] Definir domínio e URI de redirecionamento
- [ ] (Opcional) Enviar domínio para verificação se usar Production
- [ ] (Production) Submeter tela de consentimento para revisão
- [ ] (Production/Testing) Definir lista de usuários de teste
- [ ] (Production) Aguardar aprovação da Google (2-4 semanas)

## Referências

- [Gmail API OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OAuth 2.0 Authorization Code with PKCE](https://developers.google.com/identity/oauth2/web-server)
- [Google API Client Libraries](https://developers.google.com/api-client-library)