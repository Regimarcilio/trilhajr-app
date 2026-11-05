// Tela de Pagamento Pix
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/appStore';
import { api } from '@/services/api';
import { Button } from '@/components/Button';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, APP_CONFIG, ANIMATION_DURATION } from '@/constants';

interface QRCodeComponentProps {
  value: string;
  size?: number;
}

// Componente QR Code mock (em produção usar react-native-qrcode-svg)
const QRCode: React.FC<QRCodeComponentProps> = ({ value, size = 200 }) => {
  // Simula QR Code - em produção usar biblioteca real
  return (
    <View style={{ width: size, height: size, backgroundColor: COLORS.white }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
      }}>
        <Text style={{ fontSize: 12, color: COLORS.gray[600], textAlign: 'center' }}>
          QR CODE
        </Text>
        <Text style={{ fontSize: 10, color: COLORS.gray[500], marginTop: 4 }}>
          {value.substring(0, 30)}...
        </Text>
      </View>
    </View>
  );
};

export const PaymentScreen: React.FC = () => {
  const { pdfFile, paymentStatus, setPaymentStatus, setCurrentScreen } = useAppStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutos
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Verificar se PDF foi carregado
    if (!pdfFile) {
      Alert.alert('Erro', 'Nenhum PDF foi selecionado', [{ text: 'OK' }]);
      setCurrentScreen('upload');
      return;
    }

    // Criar pagamento
    createPayment();

    // Timer de expiração
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const createPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Em produção, chamar API real
      // const response = await api.post('/payment/pix', { 
      //   pdfId: pdfFile.id, 
      //   customerId: 'temp_customer' 
      // });
      
      // Mock da resposta para desenvolvimento
      const mockPaymentId = `pay_${Date.now()}`;
      const mockQrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51...';
      
      setPaymentStatus({
        status: 'pending',
        paymentId: mockPaymentId,
        qrCodeBase64: mockQrCodeBase64,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

      setQrCodeUrl(mockQrCodeBase64);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      Alert.alert('Erro', 'Não foi possível criar o pagamento. Tente novamente.');
      setCurrentScreen('upload');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = async () => {
    try {
      // Em produção, verificar status real via webhook
      // Simulação de pagamento confirmado
      setPaymentStatus({
        ...paymentStatus,
        status: 'confirmed',
      });

      // Navegar para resultado após breve delay
      setTimeout(() => {
        setCurrentScreen('result');
      }, 1500);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível confirmar o pagamento.');
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus({ status: 'pending' });
    setCountdown(15 * 60);
  };

  const renderStatusContent = () => {
    switch (paymentStatus.status) {
      case 'pending':
        return (
          <>
            <Text style={styles.title}>Pagamento via Pix</Text>
            <Text style={styles.subtitle}>
              Valor: R$ {APP_CONFIG.price.toFixed(2).replace('.', ',')}
            </Text>
            
            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode value={paymentStatus.paymentId || 'loading'} size={180} />
            </View>

            {/* Informações */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>📱 Pague com o app do seu banco</Text>
              <Text style={styles.infoText}>⏰ Válido por {formatTime(countdown)}</Text>
              <Text style={styles.infoText}>📄 PDF pronto: {pdfFile?.name}</Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                title="Pagamento Confirmado"
                onPress={handleConfirmPayment}
                variant="success"
                size="lg"
              />
              
              <Button
                title="Carregar QR Code Novamente"
                onPress={handleRetryPayment}
                variant="outline"
                size="md"
              />
            </View>
          </>
        );

      case 'confirmed':
        return (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✅</Text>
            </View>
            <Text style={styles.title}>Pagamento Confirmado!</Text>
            <Text style={styles.subtitle}>Processando seu PDF...</Text>
          </>
        );

      case 'processing':
        return (
          <>
            <Text style={styles.title}>Processando PDF...</Text>
            <Text style={styles.subtitle}>Isso pode levar alguns segundos</Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.container}>
      <View style={styles.content}>
        {/* Header com voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('upload')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.body}>
          {renderStatusContent()}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Seus dados permanecem no seu dispositivo. Nenhuma conta necessária.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FONT_WEIGHTS.medium,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  qrContainer: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
  },
  infoContainer: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.medium,
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  successIconText: {
    fontSize: 40,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
});

import { BORDER_RADIUS } from '@/constants';
import { SHADOWS } from '@/constants';