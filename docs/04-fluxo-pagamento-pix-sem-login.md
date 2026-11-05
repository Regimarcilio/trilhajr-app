# Fluxo de Pagamento Pix - Rezi App Brasil

---

## 1. Arquitetura do Sistema de Pagamento

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO PIX SEM LOGIN                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Usuário seleciona PDF →                              [Tela 1] │
│ 2. Botão "Otimizar Completo"                                 ▼  │
│ 3. Criação cobrança Asaas                            [Tela 2]    │
│    - Valor: R$ 4,90 (desconto 25% para Brasil)                   │
│    - QR Code dinâmico                                           │
│    - txid único (UUID)                                          │
│ 4. Usuário escaneia QR Code                          [Pix App]  │
│ 5. Confirma pagamento                                    [Pix]   │
│ 6. Webhook Asaas → API Backend                     [WebHook]   │
│ 7. Processamento PDF → Download                      [Tela 3]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Integração Asaas - Pix sem Login

### 2.1 Configuração Inicial

**Endpoint de criação de cobrança:**
```http
POST https://api.asaas.com/v3/payments
Authorization: Bearer API_KEY
Content-Type: application/json
```

**Payload:**
```json
{
  "customer": "cust_abc123",
  "hour": 2,
  "dueDate": "2024-12-31",
  "totalValue": 4.90,
  "description": "Otimização completa de currículo - Rezi Brasil",
  "notificationTypes": [],
  "bankAccount": {
    "id": "acc_123456"
  },
  "invoiceUrl": "https://app.rezibrasil.com/payment/confirmado",
  "splitRules": [],
  "originalValue": 4.90,
  "discountValue": 0,
  "percentualDiscount": 0,
  "fixedDiscountValue": 0
}
```

**Resposta:**
```json
{
  "id": "pay_123456",
  "status": "PENDING",
  "dueDate": "2024-12-31",
  "originalValue": 4.9,
  "totalValue": 4.9,
  "barCode": "12345678901234567890123456789012345678901234",
  "boletoLink": "https://pay.asaas.com/xyz",
  "invoiceUrl": "https://app.rezibrasil.com/payment/confirmado"
}
```

### 2.2 Geração do QR Code Pix

**Endpoint Asaas:**
```http
GET https://api.asaas.com/v3/payments/pay_123456/pix
Authorization: Bearer API_KEY
```

**Resposta:**
```json
{
  "payload": "000201...",  // String completa Pix
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "qrCodeHash": "a1b2c3d4..."
}
```

---

## 3. Integração React Native

### 3.1 Dependências Necessárias

```bash
npm install @asaas/payment-sdk
npm install react-native-qrcode-svg
npm install @react-native-async-storage/async-storage
npm install axios
```

### 3.2 Serviço de Pagamento

```typescript
// services/paymentService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASASAS_API = 'https://api.asaas.com/v3/payments';
const API_KEY = 'ASAAAS_KEY_PROD';

export class PaymentService {
  static async createPixPayment(transactionId: string, amount: number = 4.90) {
    try {
      // Criar cobrança no Asaas
      const response = await axios.post(ASASAS_API, {
        customer: `temp_${transactionId}`,
        dueDate: new Date(Date.now() + 15 * 60000).toISOString().split('T')[0], // 15 min
        totalValue: amount,
        description: `Otimização currículo - Rezi Brasil (${transactionId})`,
        notificationTypes: ['PAYMENT_CONFIRMED_WEBHOOK']
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Adicionar à storage local para validação posterior
      await AsyncStorage.setItem(
        `pending_${transactionId}`,
        JSON.stringify({
          paymentId: response.data.id,
          status: 'pending',
          createdAt: Date.now()
        })
      );

      return {
        paymentId: response.data.id,
        pixPayload: response.data.qrCode?.payload || '',
        qrCode: response.data.qrCode?.qrCode || ''
      };
    } catch (error) {
      console.error('Erro ao criar Pix:', error);
      throw error;
    }
  }

  static async validatePayment(transactionId: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(`pending_${transactionId}`);
      if (!stored) return false;

      const data = JSON.parse(stored);
      const expirationTime = data.createdAt + 15 * 60 * 1000; // 15 min

      // Verificar se expirou
      if (Date.now() > expirationTime) {
        await AsyncStorage.removeItem(`pending_${transactionId}`);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  static async markPaymentComplete(transactionId: string) {
    await AsyncStorage.setItem(
      `completed_${transactionId}`,
      JSON.stringify({
        status: 'completed',
        completedAt: Date.now()
      })
    );
    await AsyncStorage.removeItem(`pending_${transactionId}`);
  }
}
```

---

## 4. Webhook Handler (Node.js)

```typescript
// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { PDFService } from '../services/pdfService';

export class PaymentController {
  static async handleWebhook(req: Request, res: Response) {
    const event = req.body;
    const signature = req.headers['x-asaas-signature'] as string;

    // Validar webhook (usar library oficial Asaas)
    // if (!await validateSignature(req.body, signature)) {
    //   return res.status(401).send('Unauthorized');
    // }

    console.log('Webhook recebido:', event.eventType);

    switch (event.eventType) {
      case 'PAYMENT_CONFIRMED_WEBHOOK':
        await this.handlePaymentConfirmed(event);
        break;
      case 'PAYMENT_CANCELLED_WEBHOOK':
        await this.handlePaymentCancelled(event);
        break;
      default:
        console.log('Evento ignorado:', event.eventType);
    }

    res.status(200).send('OK');
  }

  private static async handlePaymentConfirmed(event: any) {
    const { payment } = event;
    const transactionId = this.extractTransactionId(payment.description);

    if (transactionId) {
      // Marcar pagamento como concluído
      await PaymentService.markPaymentComplete(transactionId);

      // Notificar via push ou update de status
      await this.notifyPDFReady(transactionId);
    }
  }

  private static async handlePaymentCancelled(event: any) {
    const { payment } = event;
    const transactionId = this.extractTransactionId(payment.description);

    if (transactionId) {
      // Limpar storage
      await AsyncStorage.removeItem(`pending_${transactionId}`);
    }
  }

  private static extractTransactionId(description: string): string | null {
    const match = description.match(/Rezi Brasil \(([^)]+)\)/);
    return match ? match[1] : null;
  }

  private static async notifyPDFReady(transactionId: string) {
    // Emitir evento WebSocket ou notificação push
    // O app pode verificar status via polling
  }
}
```

---

## 5. Experiência do Usuário

### Tela 1 - Upload PDF
```
┌─────────────────────────────────┐
│        Rezi Brasil              │
├─────────────────────────────────┤
│ [📎] Carregar seu currículo    │
│                                 │
│ Formatos: PDF (até 10MB)        │
│ Tamanho: 3,2MB / 10MB           │
│                                 │
│ [Prévia do PDF]                 │
│                                 │
│ [Botão: "Otimizar Completo"]   │
└─────────────────────────────────┘
```

### Tela 2 - Pagamento Pix
```
┌─────────────────────────────────┐
│        Otimização Completa      │
├─────────────────────────────────┤
│ Valor: R$ 4,90                  │
│ Escaneie o QR Code abaixo:      │
│                                 │
│    ┌─────────────────┐          │
│    │   [QR CODE]     │          │
│    └─────────────────┘          │
│                                 │
│ Ou copie e cole:                │
│ [000201...]                     │
│                                 │
│ [Cancelar]   [Verificar pagamento] │
└─────────────────────────────────┘
```

### Tela 3 - Resultado
```
┌─────────────────────────────────┐
│        PDF Otimizado!           │
├─────────────────────────────────┤
│ [✓] Currículo processado        │
│ Melhorias:                      │
│ • +5 palavras-chave ATS         │
│ • Formato ABRATS corrigido      │
│ • Experiência reorganizada      │
│                                 │
│ [📥 Baixar PDF]                 │
│ [↗ Compartilhar]                │
│ [WhatsApp] [E-mail] [Copy Link] │
│                                 │
│ Otimização básica gratuita      │
│ expira em: 23:59                │
└─────────────────────────────────┘
```

---

## 6. Alternativa: Pagamento Direto no App

Para reduzir dependências, pode-se usar apenas:

### 6.1 SDK Asaas Mobile

```typescript
// Instalar SDK
// npm install @asaas/mobile-sdk

import { AsaasSDK } from '@asaas/mobile-sdk';

const asaas = new AsaasSDK({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // ou 'sandbox'
});

// Criar Pix
const payment = await asaas.createPixPayment({
  amount: 4.90,
  description: 'Otimização currículo',
  callbackUrl: 'https://yourapp.com/callback'
});

// Exibir QR Code
console.log(payment.qrCode); // Base64 image
console.log(payment.pixKey); // String for cop/colar
```

### 6.2 Validação Sem Webhook

Como alternativa quando webhook não é viável:

```typescript
// Polling a cada 10 segundos
async function checkPaymentStatus(transactionId: string) {
  const pending = await AsyncStorage.getItem(`pending_${transactionId}`);
  if (!pending) return 'not_found';

  const data = JSON.parse(pending);
  const age = Date.now() - data.createdAt;

  if (age > 15 * 60 * 1000) {
    return 'expired';
  }

  // Verificar via API Asaas
  const response = await fetch(`https://api.asaas.com/v3/payments/${data.paymentId}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });

  const payment = await response.json();
  
  if (payment.status === 'PAID') {
    await PaymentService.markPaymentComplete(transactionId);
    return 'paid';
  }

  return 'pending';
}
```

---

## 7. Segurança e Compliance

### 7.1 Proteção contra Fraude

```typescript
// Rate limiting por IP
const rateLimiter = {
  maxRequests: 5, // 5 pagamentos/24h por IP
  timeWindow: 24 * 60 * 60 * 1000 // 24h
};

// Validação de dados
const paymentSchema = yup.object({
  transactionId: yup.string().uuid().required(),
  amount: yup.number().min(1).max(100).required(),
  timestamp: yup.number().min(Date.now() - 24*60*60*1000).required()
});
```

### 7.2 Dados Mínimos Necessários

```typescript
// Após pagamento, apenas isso é armazenado localmente:
interface PaymentRecord {
  transactionId: string;      // ID usuário temporário
  pdfHash: string;            // Hash do PDF processado
  completedAt: number;        // Timestamp
  expiresAt: number;          // Timestamp + 30 dias
}
```

### 7.3 LGPD Compliance Pix

- **Dados coletados**: Apenas transaction_id anônimo
- **IP**: Hash IP para rate limit (não armazenado como IP original)
- **Pagamento**: Todos os dados são gerenciados pelo Asaas
- **Exclusão**: Botão "Excluir meus dados" removes storage local

---

## 8. Custos e Taxas

### 8.1 Taxas Asaas Pix

| Tipo | Taxa |
|------|------|
| **Adquirente** | 2.9% + R$ 0,40 |
| **Taxa fixa** | R$ 0,40/transação |
| **Câmbio** | Sem custo (Pix é BRL) |

### 8.2 Estimativa para 1000 pagamentos/mês

```
Transações: 1.000
Valor médio: R$ 4,90
Taxa adquirente: 2.9% = R$ 142,10
Taxa fixa: 1.000 × R$ 0,40 = R$ 400,00
TOTAL TAXAS: R$ 542,10
```

### 8.3 Receita Líquida Estimada

```
Receita bruta: 1.000 × R$ 4,90 = R$ 4.900,00
Taxas Asaas: - R$ 542,10
OUTROS custos: - R$ 145 (infra) = R$ 4.212,90 líquido/mês
Margem líquida: ~86%
```

---

## 9. Monitoramento e Alertas

### 9.1 Webhooks de Monitoramento

```typescript
// Eventos a monitorar
const events = [
  'PAYMENT_CONFIRMED_WEBHOOK',
  'PAYMENT_CANCELLED_WEBHOOK',
  'PAYMENT_OVERDUE_WEBHOOK'
];

// Alertas críticos
const alerts = {
  webhookFailure: 'Webhook Asaas falhou > 5 vezes',
  paymentDispute: 'Pagamento contestado',
  lowBalance: 'Saldo Asaas < R$ 100,00'
};
```

### 9.2 Métricas de Pagamento

| Métrica | Target |
|---------|--------|
| Taxa de conversão Pix | > 60% |
| Tempo pagamento → download | < 5 min |
| Reembolsos | < 1% |
| Erros de pagamento | < 0.5% |

---

## 10. Documentação Técnica Adicional

### 10.1 Endpoints da API

```typescript
// Rota pública para validação (sem auth)
app.get('/api/v1/payment/status/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  
  const status = await PaymentService.checkStatus(transactionId);
  
  res.json({
    transactionId,
    status,
    pdfReady: status === 'paid'
  });
});

// Rota de download (após pagamento)
app.get('/api/v1/pdf/download/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  
  // Verificar pagamento primeiro
  const isPaid = await PaymentService.isPaid(transactionId);
  
  if (!isPaid) {
    return res.status(403).json({ error: 'Pagamento necessário' });
  }
  
  // Retornar PDF
  const pdfPath = await PDFService.getOptimizedPath(transactionId);
  res.download(pdfPath);
});
```

### 10.2 Variáveis de Ambiente

```bash
# .env
ASAAAS_API_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
ASAAAS_SANDBOX_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
WEBHOOK_URL=https://api.rezibrasil.com/webhooks/asaas
BASE_URL=https://api.asaas.com
ENVIRONMENT=production  # ou sandbox
```

---

Este é um fluxo completo de Pix **sem necessidade de login ou cadastro**, totalmente compatível com o modelo sem login do app Rezi Brasil. O usuário só precisa escanear um QR Code e pagar R$ 4,90 para receber o PDF otimizado.