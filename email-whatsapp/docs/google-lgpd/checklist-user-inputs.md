# Checklist de Pendências do Usuário

Este checklist lista as tarefas que **precisam** ser realizadas pelo usuário/dono do projeto antes que a publicação do MailChat possa ser concluída.

## Google Cloud OAuth2

| # | Tarefa | Prioridade | Responsável | Status |
|---|--------|-------------|-------------|--------|
| P1 | Criar projeto no Google Cloud Console | Alta | Usuário | ☐ Pendente |
| P2 | Habilitar Gmail API no projeto | Alta | Usuário | ☐ Pendente |
| P3 | Configurar tela de consentimento OAuth | Alta | Usuário | ☐ Pendente |
| P4 | Obter Client ID e Client Secret | Alta | Usuário | ☐ Pendente |
| P5 | Definir domínio oficial da aplicação | Alta | Usuário | ☐ Pendente |
| P6 | Configurar URIs de redirecionamento (dev/produção) | Alta | Usuário | ☐ Pendente |
| P7 | Decidir ambiente: Testing / Internal / Production | Alta | Usuário | ☐ Pendente |
| P8 | Submeter domínio para verificação (se Production) | Média | Usuário | ☐ Pendente |
| P9 | Aguardar aprovação da Google (se Production) | Média | Usuário | ☐ Pendente |

## LGPD - Proteção de Dados

| # | Tarefa | Prioridade | Responsável | Status |
|---|--------|-------------|-------------|--------|
| LG1 | Definir DPO (Encarregado) | Alta | Usuário | ☐ Pendente |
| LG2 | Criar política de privacidade (draft já existe) | Alta | Jurídico/Usuário | ☐ Pendente |
| LG3 | Criar Termos de Uso | Alta | Jurídico/Usuário | ☐ Pendente |
| LG4 | Definir bases legais para coleta | Média | Usuário | ☐ Pendente |
| LG5 | Estabelecer prazo de retenção de dados | Média | Usuário | ☐ Pendente |
| LG6 | Definir contatos para solicitações de titulares | Média | Usuário | ☐ Pendente |

## Backup e Recuperação

| # | Tarefa | Prioridade | Responsável | Status |
|---|--------|-------------|-------------|--------|
| B1 | Definir destino de backup (off-site) | Alta | Usuário | ☐ Pendente |
| B2 | Obter/chave GPG para encriptação de backup | Alta | Usuário | ☐ Pendente |
| B3 | Testar restore de backup criptografado | Alta | Usuário | ☐ Pendente |
| B4 | Definir política de retenção de backups | Média | Usuário | ☐ Pendente |

## Observabilidade e Segurança

| # | Tarefa | Prioridade | Responsável | Status |
|---|--------|-------------|-------------|--------|
| O1 | Definir canal de alarmes (Slack, Telegram, e-mail) | Alta | Usuário | ☐ Pendente |
| O2 | Configurar Prometheus/Grafana ou equivalente | Média | Usuário | ☐ Pendente |
| O3 | Definir escalonamento/SLA de incidentes | Média | Usuário | ☐ Pendente |

## Custos

| # | Tarefa | Prioridade | Responsável | Status |
|---|--------|-------------|-------------|--------|
| C1 | Estimar custo CASA (se Production) | Alta | Usuário | ☐ Pendente |
| C2 | Estimar custo mensal GCP (Compute, Cloud Storage, etc.) | Média | Usuário | ☐ Pendente |

## Próximos passos

1. **Complete** todos os itens marcados com ☐ Pendente
2. **Retorne** este checklist atualizado após cada item concluído
3. **Notifique** quando todos os itens estiverem completos para prosseguir com o deploy