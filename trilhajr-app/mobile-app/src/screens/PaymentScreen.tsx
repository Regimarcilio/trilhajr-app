// Tela de Pagamento PagSeguro (Web)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/appStore';
import { api } from '@/services/api';
import { Button } from '@/components/Button';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, APP_CONFIG } from '@/constants';

// PagSeguro Web Checkout - credenciais via environment variables
// Importante: Configurar via .env (Expo Application Config)
const PAGSEGURO_EMAIL = process.env.EXPO_PUBLIC_PAGSEGURO_EMAIL || '';
const PAGSEGURO_TOKEN = process.env.EXPO_PUBLIC_PAGSEGURO_TOKEN || '';
const PAGSEGURO_MODE = process.env.EXPO_PUBLIC_PAGSEGURO_MODE || 'sandbox';

export const PaymentScreen: React.FC = () => {
  const { pdfFile, paymentStatus, setPaymentStatus, setCurrentScreen } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentLink, setPaymentLink] = useState<string>('');

  useEffect(() => {
    if (!pdfFile) {
      Alert.alert('Erro', 'Nenhum PDF foi selecionado', [{ text: 'OK' }]);
      setCurrentScreen('upload');
      return;
    }

    createPagSeguroPayment();
  }, []);

  const createPagSeguroPayment = async () => {
    try {
      setIsProcessing(true);

      // Mock PagSeguro - em produção, chamar backend que gera checkout PagSeguro
      // PagSeguro usa: /checkout/order
      const mockPaymentId = `TR-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Link de pagamento PagSeguro (sandbox ou produção)
      const link = `https://pagseguro.uol.com.br/checkout?code=${mockPaymentId}`;
      
      setPaymentLink(link);
      
      setPaymentStatus({
        status: 'pending',
        paymentId: mockPaymentId,
      });

    } catch (error) {
      console.error('Erro no pagamento:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o pagamento');
      setCurrentScreen('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = () => {
    // Em web: redireciona para PagSeguro
    if (Platform.OS === 'web') {
      window.location.href = paymentLink;
    } else {
      // Em mobile: abrir WebView ou app PagSeguro
      Alert.alert(
        'PagSeguro',
        'Você será redirecionado para o PagSeguro para concluir o pagamento.\n\nValor: R$ 4,90',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Pagar com PagSeguro',
            onPress: () => {
              // Aqui abriria um WebView ou link
              console.log('Abrir PagSeguro:', paymentLink);
            }
          }
        ]
      );
    }
  };

  const handleConfirmPayment = () => {
    setPaymentStatus({ ...paymentStatus, status: 'confirmed' });
    setTimeout(() => setCurrentScreen('result'), 1500);
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pagamento Seguro</Text>
          <Text style={styles.subtitle}>TrilhaJr - PagSeguro</Text>
        </View>

        {/* Conteúdo */}
        {isProcessing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.processingText}>Preparando pagamento...</Text>
          </View>
        ) : (
          <>
            {/* QR Code ou Cartão */}
            <View style={styles.qrContainer}>
              <Text style={styles.qrLabel}>
                📱 Pague com PagSeguro
              </Text>
              
              {/* QR Code PagSeguro - placeholder */}
              <View style={styles.qrCodeBox}>
                <Text style={styles.qrCodeText}>QR CODE</Text>
                <Text style={styles.qrSubtext}>PagSeguro</Text>
              </View>
            </View>

            {/* Dados do pagamento */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Produto:</Text>
                <Text style={styles.summaryValue}>Otimização de Currículo ATS</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Valor:</Text>
                <Text style={styles.summaryValue}>R$ 4,90</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Documento:</Text>
                <Text style={styles.summaryValue}>{pdfFile?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Forma de pagamento:</Text>
                <Text style={styles.summaryValue}>Cartão, Boleto, Pix</Text>
              </View>
            </View>

            {/* Informações */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>✅ Pague uma única vez - sem assinatura</Text>
              <Text style={styles.infoText}>✅ Seu PDF será entregue imediatamente</Text>
              <Text style={styles.infoText}>✅ PagSeguro: proteção ao comprador</Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                title="Continuar Pagamento"
                onPress={handlePayNow}
                variant="success"
                size="lg"
              />
              <Button
                title="Já Fui Pago"
                onPress={handleConfirmPayment}
                variant="outline"
              />
            </View>
          </>
        )}

        {/* Footer */}
        <Text style={styles.footerText}>
          PagSeguro: pagamento rápido e seguro • Cancelamento facilitado
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  processingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  qrLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginBottom: SPACING.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  qrCodeBox: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  qrCodeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  qrSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoContainer: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});

import { Platform } from 'react-native';