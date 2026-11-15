# Plano — Verificação Google, CASA e conformidade LGPD

- **Versão:** 1.0
- **Data:** 2026-11-15
- **Issues mãe:** [#12](https://github.com/Regimarcilio/trilhajr-app/issues/12) · [#13](https://github.com/Regimarcilio/trilhajr-app/issues/13)
- **Referências:** [SRS](SRS-gmail-oauth2.md) · [ADR-001](adr/ADR-001-oauth2-vs-senha-de-app.md) · [ADR-002](adr/ADR-002-gmail-api-vs-imap-smtp-xoauth2.md)

> Valores de custo e prazo são **estimativas de planejamento** e devem ser confirmados com o
> Google e com o laboratório CASA na data da contratação. Nada aqui é garantia contratual.

## 1. Situação de partida

| Item | Estado |
|---|---|
| Projeto no Google Cloud | **não existe** — depende do usuário |
| Gmail API habilitada | não |
| Tela de consentimento | não configurada |
| Domínio verificado | não |
| Política de privacidade pública | não existe |
| Redirect URI HTTPS | depende do domínio do deploy |
| App em modo Testing | não |

## 2. Caminhos possíveis

| Caminho | Quem pode usar | Verificação | Refresh token | CASA | Observação |
|---|---|---|---|---|---|
| **A. Testing (External)** | Até 100 usuários de teste cadastrados manualmente | Não | Expira em **7 dias** | Não | Ideal para desenvolvimento e piloto |
| **B. Production (External)** | Qualquer conta Google | Sim, para escopos restritos | Longa duração | Sim (Tier 2, anual) | Necessário para uso público |
| **C. Internal (Google Workspace)** | Somente usuários do mesmo domínio Workspace | Não | Longa duração | Não | Melhor opção se todos os usuários estiverem no mesmo Workspace |

**Recomendação:** começar em **A** (piloto), e escolher entre **B** e **C** conforme o público.
Se o grupo for fechado e usa Google Workspace, **C** elimina a necessidade de CASA e reduz custo
drasticamente.

> Escopos `gmail.readonly` e `gmail.send` são **restritos**. A verificação inclui revisão de
> privacidade/uso de dados e, para uso público, avaliação de segurança CASA.

## 3. Passo a passo (depende do usuário)

1. Criar projeto no Google Cloud Console (nome sugerido: `mailchat-prod`).
2. Habilitar **Gmail API** (APIs & Services → Library).
3. Configurar **OAuth consent screen**:
   - User type: External (ou Internal, caminho C).
   - App name, logo, e-mail de suporte, domínio da aplicação, política de privacidade, termos.
   - Authorized domains: domínio do deploy.
   - Scopes: `openid`, `email`, `profile`, `.../auth/gmail.readonly`, `.../auth/gmail.send`.
   - Test users (caminho A): lista nominal, máximo 100.
4. Criar **OAuth Client ID** do tipo "Web application".
   - Authorized redirect URIs **exatas**: `https://<host>/api/auth/google/callback`
     e, se necessário, `http://localhost:3000/api/auth/google/callback` apenas para dev.
   - Sem curingas, sem HTTP em produção.
5. Guardar `client_id` e `client_secret` **somente** no secret manager do servidor
   (nunca no repositório, nunca no frontend).
6. Verificar o domínio no Google Search Console (necessário para o consent screen).
7. Publicar política de privacidade e termos de uso em URLs públicas e estáveis.
8. Solicitar verificação do app (caminho B) e agendar **CASA Tier 2** com laboratório autorizado.
9. Solicitar aumento de quota, se necessário (formulário de quota da Gmail API).
10. Configurar alertas de quota e de erros no Google Cloud Monitoring.

## 4. Linha do tempo estimada

| Etapa | Duração estimada | Bloqueia |
|---|---|---|
| Criar projeto + habilitar API + client | 1 dia | F1 |
| Consent screen em Testing + test users | 1 dia | F1 (piloto) |
| Política de privacidade e termos | 3–5 dias | Verificação |
| Verificação de domínio | 1–2 dias | Verificação |
| Revisão de verificação do Google | 1–4 semanas | Go-live público |
| CASA Tier 2 (laboratório) | 4–12 semanas | Go-live público |
| Aumento de quota | 1–3 semanas | Escala |

**Conclusão de planejamento:** o piloto pode rodar em semanas; o uso público depende de um
processo externo que pode levar **2 a 4 meses** no total.

## 5. Custos estimados (confirmar)

| Item | Faixa estimada |
|---|---|
| Verificação Google | sem custo direto |
| CASA Tier 2 (laboratório autorizado) | ordem de milhares de dólares (varia por laboratório e escopo) |
| Recertificação anual | idem |
| Infra (VM + Postgres + backup) | dezenas de dólares/mês no porte inicial |
| Domínio + TLS | ~US$ 10–20/ano (TLS via Let's Encrypt é gratuito) |

## 6. Requisitos de publicação (checklist do Google)

- [ ] App name coerente com o produto e sem marcas de terceiros.
- [ ] Logo e domínio próprios.
- [ ] Homepage pública descrevendo a funcionalidade.
- [ ] Política de privacidade pública, linkada no consent screen.
- [ ] Termos de uso públicos.
- [ ] Declaração de uso de dados compatível com a **Limited Use Policy** do Google.
- [ ] Explicação de por que cada escopo é necessário.
- [ ] Demonstração em vídeo do fluxo OAuth (quando solicitado).
- [ ] E-mail de suporte monitorado.
- [ ] Redirect URIs exatas e HTTPS.

## 7. LGPD — plano de conformidade

### 7.1 Papéis

| Papel | Quem |
|---|---|
| Controlador | Usuário operador da instância (quem faz o deploy) |
| Operador | Provedor de infraestrutura, se houver |
| Subprocessador | Google (Gmail API / OAuth) |
| Titulares | Usuários do MailChat (donos das caixas) |
| Encarregado (DPO) | A definir pelo controlador |

### 7.2 Bases legais

| Tratamento | Base legal |
|---|---|
| Autenticar e acessar a caixa do próprio titular | Execução de contrato (art. 7º, V) |
| Consentimento para escopos do Gmail | Consentimento (art. 7º, I) — coletado no fluxo OAuth |
| Auditoria e segurança | Legítimo interesse (art. 7º, IX), com avaliação de impacto |
| Cumprimento de obrigação legal | Art. 7º, II |

### 7.3 Princípios aplicados

- **Finalidade:** exibir, organizar e responder e-mails do próprio titular.
- **Minimização:** metadados na sincronização; corpo sob demanda; sem cópia integral por padrão.
- **Transparência:** tela explicando escopos antes do consentimento.
- **Segurança:** criptografia em repouso de tokens, TLS, controle de acesso, auditoria.
- **Não discriminação:** nenhuma decisão automatizada sobre o titular nesta fase.

### 7.4 Retenção e descarte

| Dado | Retenção padrão | Após desconexão |
|---|---|---|
| Tokens | enquanto a conta estiver conectada | apagados imediatamente |
| Threads/mensagens | enquanto a conta estiver ativa | expurgo em até 30 dias |
| Auditoria | 12 meses | mantida (base legal de segurança), sem corpo de e-mail |
| Backups | 30 dias rotativos | expiram no ciclo natural |
| Logs de aplicação | 30 dias | expiram no ciclo natural |

### 7.5 Direitos do titular (implementação)

| Direito | Como é atendido |
|---|---|
| Confirmação e acesso | `GET /api/privacy/export` |
| Correção | edição de dados cadastrais (nome) |
| Eliminação | `DELETE /api/privacy/account-data` + expurgo |
| Portabilidade | exportação JSON |
| Informação sobre compartilhamento | política de privacidade (Google como subprocessador) |
| Revogação de consentimento | desconectar conta (revoga token no Google) |

### 7.6 Registros e governança

- **ROPA** (Registro de Operações de Tratamento) com finalidade, base legal, categorias de dados,
  destinatários, transferência internacional e prazo.
- **DPIA** simplificada, dado o volume de dados de comunicação.
- **Transferência internacional:** Google (EUA) — fundamentar com cláusulas contratuais/SCCs e
  avaliar impacto.
- **Plano de incidente:** detectar, conter, avaliar risco, notificar ANPD e titulares quando
  aplicável (referência: prazo de 72 h usado como padrão de mercado), registrar lição aprendida.
- **Treinamento:** operador ciente de que conteúdo de e-mail é dado pessoal.

### 7.7 O que não fazer

- Não usar conteúdo de e-mail para treinar modelos sem consentimento específico.
- Não compartilhar dados com terceiros fora do necessário.
- Não manter cópia de e-mail após exclusão solicitada.
- Não logar corpo de mensagem, anexos ou tokens.

## 8. Dependências do usuário (bloqueantes)

1. Criar o projeto no Google Cloud e me fornecer apenas o **nome do projeto** e o **client_id**
   (o `client_secret` vai direto para o secret manager, nunca para o chat/repositório).
2. Definir o domínio de deploy e liberar HTTPS.
3. Publicar política de privacidade e termos.
4. Cadastrar os usuários de teste iniciais.
5. Decidir entre caminho B (público, com CASA) e C (Workspace interno).
6. Aprovar o orçamento de CASA, se caminho B.
7. Informar se haverá DPO formal e qual o canal de solicitações.

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Verificação reprovada por política de privacidade incompleta | Revisar checklist §6 antes de submeter |
| CASA acima do orçamento | Preferir caminho C; negociar escopo com o laboratório |
| Quota insuficiente no piloto | Janela menor, cache, pedido de aumento com dados de uso |
| Expiração semanal de token em Testing | Aviso na UI + reconexão; migrar para produção/Internal |
| Multa por retenção indevida | Job de expurgo testado + evidência em auditoria |
