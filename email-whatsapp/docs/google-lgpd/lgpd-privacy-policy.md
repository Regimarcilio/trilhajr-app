# Política de Privacidade do MailChat

**Última atualização:** $(date +%Y-%m-%d)  
**Versão:** 1.0

## 1. Introdução

Bem-vindo ao MailChat. Esta Política de Privacidade descreve como recolhemos, usamos, armazenamos e compartilhamos seus dados pessoais quando você utiliza nosso serviço de cliente de e-mail baseado em Gmail API com interface estilo WhatsApp.

Esta política está alinhada à Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e às normas internacionais de privacidade.

## 2. Dados que recolhemos

### 2.1 Dados fornecidos por você
- **E-mail e nome:** obtidos via OAuth2 quando você conecta sua conta Gmail.
- **Foto de perfil:** usada para identificação na interface.

### 2.2 Dados coletados automaticamente
- **Endereços de e-mail e conteúdo:** lidos diretamente da sua conta Gmail via API.
- **Tokens de acesso (OAuth2):** usados para autenticação e leitura/envio de e-mails.
- **Endereços de retorno e anexos:** para download e envio.

### 2.3 Dados de uso e conexão
- **IP de conexão, user-agent, timestamp:** para detecção de abuso.
- **Métricas de uso:** para melhoria do serviço.

## 3. Como usamos seus dados

| Finalidade | Dados envolvidos | Base legal |
|------------|------------------|------------|
| Autenticação | E-mail, nome, foto | Execução de contrato |
| Leitura de e-mails | Conteúdo, endereços | Execução de contrato |
| Envio de e-mails | Conteúdo, anexos | Execução de contrato |
| Sincronização | E-mails, metadados | Execução de contrato |
| Segurança | IP, timestamps, logs | Legítimo interesse |
| Suporte | Histórico de uso | Legítimo interesse |
| Melhoria do produto | Dados agregados | Legítimo interesse |

## 4. Compartilhamento de dados

**Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.**

Podemos compartilhar:
- **Google:** apenas para acesso via Gmail API (já regido pelo contrato deles).
- **Fornecedores de serviços:** para hospedagem, backup e monitoramento (com acordos de confidencialidade).
- **Autoridades públicas:** se exigido por lei ou ordem judicial.

## 5. Backup e segurança

- **Tokens de acesso:** são criptografados com AES-256-GCM e armazenados separados da base de dados.
- **Backup de configuração:** criptografado com GPG, retenção de 14 dias.
- **Logs:** armazenados 90 dias para auditoria.

## 6. Seus direitos (LGPD)

Você tem o direito de:
- **Acessar** seus dados
- **Retificarar** dados incompletos ou incorretos
- **Solicitar exclusão** dos seus dados (sujeito a limitações legais)
- **Portabilidade** dos dados (em desenvolvimento)
- **Revogar o consentimento** de sincronização (em https://myaccount.google.com/permissions)
- **Obter informações** sobre compartilhamento

**Como exercer seus direitos:**
- Envie um e-mail para: **DPO@seudominio.com**
- Ou acesse as configurações da conta Google para revogar o acesso.

## 7. Retenção de dados

| Tipo de dado | Prazo | Motivo |
|--------------|-------|--------|
| Conta do usuário | Enquanto ativo | Contrato de uso |
| Tokens OAuth2 | 7 dias | Segurança |
| Conteúdo de e-mails | Não armazenado | Usuário mantém no Gmail |
| Logs de segurança | 90 dias | Auditoria |
| Métricas de uso | 90 dias | Melhoria |

## 8. Transição internacional

Os nossos servidores podem estar localizados em [Brasil/outros]. Seus dados pessoais são tratados conforme as leis de privacidade vigentes e com os mesmos níveis de proteção.

## 9. Segurança

- Criptografia AES-256 para tokens
- HTTPS obrigatório
- Backup criptografado
- Monitoramento de segurança 24h

## 10. Contato do Encarregado (DPO)

Para dúvidas, reclamações ou exercer seus direitos:
- **E-mail:** DPO@seudominio.com
- **Telefone:** +55 (XX) XXXXX-XXXX

## 11. Alterações nesta política

Podemos atualizar esta política periodicamente. Notificaremos as mudanças significativas através do e-mail ou aviso no app.

---

**Este documento está em conformidade com a LGPD e deve ser revisado anualmente.**