// Tela de Resultado
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/Button';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants';

export const ResultScreen: React.FC = () => {
  const { pdfFile, setPdfFile, resetApp, setCurrentScreen } = useAppStore();
  const [processedPdfUri, setProcessedPdfUri] = useState<string>('');

  useEffect(() => {
    // Simular processamento completo
    const timer = setTimeout(() => {
      // Mock URI do PDF processado
      setProcessedPdfUri('file:///tmp/trilhajr_optimized.pdf');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    try {
      if (processedPdfUri) {
        if (Platform.OS === 'android') {
          await Sharing.shareAsync(processedPdfUri);
        } else {
          await Share.share({
            url: processedPdfUri,
            message: 'Seu currículo TrilhaJr está otimizado! 💼',
          });
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o PDF');
    }
  };

  const handleNewUpload = () => {
    resetApp();
    setCurrentScreen('welcome');
  };

  const handleDownload = () => {
    Alert.alert(
      'Salvar PDF',
      'Seu currículo está pronto para ser salvo e enviado!',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient colors={COLORS.gradientSuccess} style={styles.container}>
      <View style={styles.content}>
        {/* Ícone de sucesso */}
        <View style={styles.successContainer}>
          <View style={styles.successBadge}>
            <Text style={styles.successNumber}>1</Text>
            <Text style={styles.successLabel}>PDF Otimizado</Text>
          </View>
          <View style={styles.checkContainer}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </View>

        {/* Mensagem de sucesso */}
        <Text style={styles.title}>Parabéns!</Text>
        <Text style={styles.subtitle}>
          Seu currículo foi otimizado para o ATS
        </Text>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <StatItem label="Compatibilidade ATS" value="95%" />
          <StatItem label="Palavras-chave" value="28" />
          <StatItem label="Tamanho" value="1.2MB" />
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <Button
            title="Baixar PDF"
            onPress={handleDownload}
            variant="primary"
            size="lg"
            leftIcon={<Text style={styles.icon}>📥</Text>}
          />
          
          <Button
            title="Compartilhar"
            onPress={handleShare}
            variant="secondary"
            size="md"
            leftIcon={<Text style={styles.icon}>📤</Text>}
          />
          
          <Button
            title="Outro PDF"
            onPress={handleNewUpload}
            variant="outline"
            size="md"
          />
        </View>

        {/* Informações */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ✅ Este PDF passará por mais filtros ATS
          </Text>
          <Text style={styles.infoText}>
            🔍 Palavras-chave otimizadas para recrutadores
          </Text>
          <Text style={styles.infoText}>
            📋 Formato compatível com LinkedIn, Stone, etc.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  successBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  successNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
  },
  successLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  checkContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  checkMark: {
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 28,
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    width: '100%',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  infoContainer: {
    gap: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.medium,
  },
  icon: {
    fontSize: 20,
  },
});

export default ResultScreen;