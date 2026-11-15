# Runbook de Incidente LGPD

Este runbook descreve o processo de resposta a incidentes de segurança ou violação de dados pessoais conforme a LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018).

## Quando usar este runbook

Qualquer evento que envolva:
- Acesso não autorizado a dados pessoais
- Perda, alteração, destruição ou vazamento de dados
- Violação de segurança crítica (High/Critical)
- Tentativa de ataque detectada

## Fase 1: Detecção e Avaliação Inicial

**Responsável:** SRE / DevOps

1. **Receber alerta**
   - Fonte: Alerta Prometheus, alerta de SOC, ou notificação manual
   - Registrar em ticket (ex.: JIRA, GitHub Issue)

2. **Classificar gravidade**
   - **Critical:** Vazamento público, dados de mais de 100 usuários, dados sensíveis
   - **High:** Acesso não autorizado a dados, menos de 100 usuários
   - **Medium:** Anúncios suspeitos, falha que poderia levar a vazamento
   - **Low:** Tentativa de acesso sem sucesso, falha isolada

3. **Avaliar impacto inmediado**
   - Quantos usuários afetados?
   - Que tipo de dados? (e-mails, refresh tokens, e-mails de contato)
   - Há exposição pública?

4. **Decisão: Ativar runbook completo?**
   - Se `Critical` ou `High` → **Sim**, seguir este runbook
   - Se `Medium` ou `Low` → Documentar e monitorar, sem necessidade de comunicação imediata

## Fase 2: Contenção

**Responsável:** SRE / DevOps

1. **Isolamento**
   - Desativar conta(s) afetada(s) no banco (`users.disabled = true`)
   - Revogar refresh tokens afetados (atualizar `oauth_tokens.expires_at` para o passado)
   - Desativar acesso de IP suspeito (iptables/Cloudflare)

2. **Preservar evidências**
   - Copiar logs relevantes para `/var/log/incident/YYYY-MM-DD/`
   - Não limpar logs do sistema
   - Criar hash SHA256 dos arquivos copiados

3. **Notificar internamente**
   - Equipe de segurança (se houver)
   - Gerente de produto
   - DPO (quando houver)

## Fase 3: Investigação

**Responsável:** SRE + DPO (quando disponível)

1. **Reconstruir timeline**
   - Quando ocorreu a primeira anomalia?
   - Quais sistemas envolvidos?
   - Como o acesso foi obtido?

2. **Identificar causa raiz**
   - Falha de segurança no app? (ex.: token armazenado sem criptografia)
   - Erro de configuração do servidor?
   - Falha na validação de inputs?
   - Comprometimento de credenciais do próprio servidor?

3. **Determinar o que foi exposto**
   - Listar tipos de dados: e-mails, nomes, tokens, mensagens
   - Identificar dados sensíveis (tokens de acesso Gmail)

## Fase 4: Comunicação

**Responsável:** DPO (+ Marketing se for externo)

1. **Notificação ao ANPD (agência nacional)**
   - Prazo: até 2 dias úteis após a constatação do incidente
   - Formulário: https://www.gov.br/anpd/pt-brAssuntosNoticias/index.html
   - Dados obrigatórios:
     - Natureza do incidente
     - Número estimado de titulares afetados
     - Dados pessoais expostos
     - Medidas adotadas

2. **Notificação aos titulares (usuários)**
   - Só se houver risco real de dano
   - Modelo de comunicação:
     ```
     Assunto: Aviso de Segurança — MailChat
     
     Prezado(a) [Nome],
     
     Identificamos um incidente de segurança que pode ter afetado seus dados.
     [Detalhes resumidos]
     [Medidas tomadas]
     [O que o usuário deve fazer]
     [Contato do DPO]
     
     Atenciosamente,
     Equipe MailChat
     ```

3. **Comunicação interna**
   - Relatório técnico para a equipe
   - Registro no dev-log

## Fase 5: Recuperação e Correção

**Responsável:** SRE + Dev

1. **Corrigir a vulnerabilidade**
   - Patch de segurança
   - Atualização de dependências (npm audit fix, ou versão manual)
   - Revisão de código

2. **Comunicar novamente os titulares** (se aplicável)
   - Após correção, informar que o problema foi resolvido

3. **Testar correção**
   - Reprodutir o cenário de vulnerabilidade
   - Executar testes de penetração se relevante

## Fase 6: Aprendizado e Documentação

**Responsável:** SRE + DPO

1. **Atualizar o dev-log**
   - Data, evento, impacto, ações, lições aprendidas

2. **Atualizar estações de trabalho**
   - Atualizar checklists de segurança
   - Revisar procedimentos de incidente

3. **Registrar no DPO**
   - Lição aprendida
   - Medidas preventivas

## Contato do DPO

- **(Definir pelo usuário)**
- Email: DPO@seudominio.com
- Telefone: +55 (XX) XXXXX-XXXX

## Templates prontos

### Modelo de e-mail para titulares

```
Assunto: Aviso Importante de Segurança — MailChat

Prezado(a) [Nome],

Identificamos um incidente que pode ter afetado seus dados pessoais em 
nosso sistema MailChat em [data].

O incidente envolveu [descrição resumida]. 

Medidas imediatas adotadas:
- [Lista de medidas]

Recomendamos:
- [Ações do usuário]

Estamos trabalhando para corrigir e prevenir recorrências.

Para dúvidas, entre em contato pelo DPO: DPO@seudominio.com

Atenciosamente,
Equipe MailChat
```

## Roteiro rápido (página de referência)

| Passo | Ação | Quem |
|-------|------|------|
| ☐ Detectar | Alerta recebido | SRE |
| ☐ Classificar | Critical/High/Medium/Low | SRE |
| ☐ Contar | Isolar, revogar, notificar | SRE |
| ☐ Investigar | Timeline, causa, dados expostos | SRE + DPO |
| ☐ Comunicar ANPD | Até 2 dias | DPO |
| ☐ Comunicar titulares | Se risco real | DPO |
| ☐ Corrigir | Patch + testes | Dev |
| ☐ Aprender | Documentar | SRE + DPO |

---

**Última atualização:** $(date +%Y-%m-%d)
**Versão:** 1.0