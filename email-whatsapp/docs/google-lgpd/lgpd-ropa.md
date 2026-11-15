# Registro de Atividades de Tratamento de Dados (ROPA)

Este documento registra as atividades de tratamento de dados pessoais realizadas pela plataforma MailChat, conforme exigido pela LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018).

-----

## 1. Identificação do responsável pelo tratamento

| Campo | Informação |
|-------|--------------|
| Razão Social/Nome | MailChat |
| CNPJ/CPF | (definir pelo usuário) |
| Endereço | (definir pelo usuário) |
| Contato DPO | (definir pelo usuário) |
| Propósito geral | Cliente de e-mail com interface estilo WhatsApp |

## 2. Base legal para o tratamento

| Base Legal | Descrição | Aplicação |
|------------|-----------|-----------|
| **LGPD Art. 7º, II** | Executar contrato | Envio/recebimento de e-mails |
| **LGPD Art. 7º, III** | Adequado ao interesse legítimo** | Melhoria de serviço, análise de uso, suporte |
| **LGPD Art. 7º, V** | Cumprimento de obrigação legal | Conformidade com requisitos de segurança |
| **LGPD Art. 7º, VI** | Interesse em vitalidade** | (não aplicado) |

> **Nota:** O interesse legítimo deve ser balanceado com os direitos do titular; adequado ao fim de fornecer um serviço funcional.

## 3. Categorias de dados pessoais tratados

| Categoria | Subcategorias | Origem | Finalidade |
|-----------|--------------|--------|------------|
| **Dados de identificação** | Nome, e-mail, foto perfil | Conta Google OAuth2 | Identificação do usuário |
| **Dados de conexão** | Access/Refresh Token (OAuth2) | Gmail API | Autenticação e leitura envio |
| **Dados de comunicação** | Endereços de e-mail, conteúdo mensagens | Gmail API | Leitura, envio, sincronização |
| **Dados de uso** | Última atividade, tamanho da caixa, quotas | Aplicativo | Estimativa de performance, backup |
| **Dados de segurança** | IP de conexão, user-agent | Aplicativo | Detecção de abuso, login |

## 4. Destinatários e compartilhamento

| Destinatário | Tipo | Finalidade | Base Legal |
|--------------|------|------------|------------|
| Google (Gmail API) | Terceiro | Leitura/envio de e-mails | Contrato de serviço |
| Servidor de aplicação (usuário) | Próprio | Execução do aplicativo | Legítimo interesse |
| Servidor de backup (usuário) | Próprio | Backup criptografado | Contrato de serviço |

**Transferência internacional:** Nenhuma (dados armazenados no mesmo datacenter do provedor).

## 5. Prazo de armazenamento

| Dados | Prazo | Justificativa | Rotina de exclusão |
|-------|-------|---------------|---------------------|
| Dados de identificação | Enquanto ativo | Contrato de uso | Auto-desativação após 2 anos inatividade |
| Tokens OAuth2 | 7 dias (refresh) | Segurança | Renovação automática |
| Conteúdo de e-mails | Não armazenado | Usuário mantém no Gmail | Nenhum |
| Dados de uso | 90 dias | Métricas | Exclusão automática |
| Logs de segurança | 90 dias | Auditoria | Rotina automática |

## 6. Medidas de segurança

| Medida | Descrição | Aplicação |
|--------|-----------|-----------|
| Criptografia | AES-256-GCM para tokens, GPG para backup | `oauth_tokens` |
| Autenticação | OAuth2 PKCE | Login |
| Autorização | RBAC + scopes mínimos | API Gmail |
| Controle de acesso | Non-root no container, firewall | Deploy |
| Auditoria | Logs estruturados + métricas | Todo acesso |

## 7. Direitos do titular

Os titulares podem exercer seus direitos (art. 18 LGPD) por meio de:

- **Portabilidade:** Exportar dados via próprio app (funcionalidade futura)
- **Acesso/Exclusão:** Contatar DPO em `DPO@seudominio.com`
- **Retificação:** Autogerenciado no Gmail
- **Revogação do consentimento:** Revogar app em https://myaccount.google.com/permissions

## 8. Análise de risco

| Risco | Probabilidade | Impacto | Medida mitigadora |
|-------|---------------|---------|-------------------|
| Vazamento de tokens | Baixa | Alto | Criptografia + revogação automática |
| Acesso não autorizado | Média | Alto | AuthZ + auditoria |
| Falha de backup | Baixa | Médio | Testes periódicos + chave offline |

## 9. Documentação correlatas

- [Política de Privacidade](../google-lgpd/lgpd-privacy-policy.md)
- [Runbook de Incidente](../google-lgpd/lgpd-incident-runbook.md)
- [Checklist de Usuário](../google-lgpd/checklist-user-inputs.md)
- [Threat Model](../../security/threat-model-stride.md)

## 10. Responsáveis

| Função | Nome | Contato |
|--------|------|---------|
| DPO | (definir) | DPO@seudominio.com |
| Desenvolvedor | (definir) | dev@seudominio.com |
| SRE/DevOps | (definir) | sre@seudominio.com |

---

**Última atualização:** $(date +%Y-%m-%d)
**Versão:** 1.0

> Este documento deve ser revisado anualmente ou sempre que houver mudança relevante no tratamento de dados.