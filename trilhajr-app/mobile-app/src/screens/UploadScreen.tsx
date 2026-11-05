// Tela de Upload PDF
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS, APP_CONFIG } from '@/constants';

export const UploadScreen = () => {
  const { pdfFile, setPdfFile, setCurrentScreen, setProcessingStatus } = useAppStore();
  const [isPicking, setIsPicking] = useState(false);

  const handlePickDocument = async () => {
    if (isPicking) return;
    setIsPicking(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: APP_CONFIG.acceptedMimeTypes,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsPicking(false);
        return;
      }

      const file = result.assets[0];
      
      // Validações
      if (file.size > APP_CONFIG.maxFileSize) {
        Alert.alert(
          'Arquivo muito grande',
          `O arquivo deve ter no máximo ${APP_CONFIG.maxFileSize / (1024 * 1024)}MB`,
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      if (!file.mimeType?.includes('pdf')) {
        Alert.alert(
          'Formato inválido',
          'Por favor, selecione um arquivo PDF',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      // Sucesso - salvar no store
      const pdfFileData = {
        uri: file.uri,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType || 'application/pdf',
      };

      setPdfFile(pdfFileData);
      setProcessingStatus({
        stage: 'uploading',
        progress: 100,
        message: 'PDF carregado com sucesso!',
      });

      // Navegar para pagamento após breve delay
      setTimeout(() => {
        setCurrentScreen('payment');
      }, 800);

    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo. Tente novamente.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setProcessingStatus({
      stage: 'uploading',
      progress: 0,
      message: 'Aguardando arquivo...',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <LinearGradient
      colors={COLORS.gradient}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header com voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('welcome')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.stepNumber}>1 de 3</Text>
          <Text style={styles.title}>Carregue seu PDF</Text>
          <Text style={styles.subtitle}>
            Selecione seu currículo em formato PDF
          </Text>
        </View>

        {/* Área de upload */}
        <View style={styles.uploadContainer}>
          {pdfFile ? (
            // PDF selecionado
            <View style={styles.fileSelected}>
              <View style={styles.fileIcon}>
                <Text style={styles.fileIconText}>📄</Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{pdfFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(pdfFile.size)}</Text>
              </View>
              <TouchableOpacity
                onPress={handleRemoveFile}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Área de drop/click
            <TouchableOpacity
              onPress={handlePickDocument}
              disabled={isPicking}
              style={[
                styles.uploadArea,
                isPicking && styles.uploadAreaDisabled,
              ]}
            >
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>📁</Text>
              </View>
              <Text style={[
                styles.uploadText,
                isPicking && styles.uploadTextDisabled,
              ]}>
                {isPicking ? 'Selecionando...' : 'Toque para selecionar PDF'}
              </Text>
              <Text style={styles.uploadHint}>
                Ou arraste o arquivo aqui
              </Text>
              <View style={styles.uploadDetails}>
                <Text style={styles.detailItem}>📄 Apenas PDF</Text>
                <Text style={styles.detailItem}>📏 Máx. 10MB</Text>
                <Text style={styles.detailItem}>🔒 Processamento local</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Dicas */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipTitle}>💡 Dicas para melhor resultado:</Text>
          <TipItem text="Use currículo atualizado (últimos 6 meses)" />
          <TipItem text="Inclua palavras-chave da vaga desejada" />
          <TipItem text="Evite imagens, tabelas complexas ou colunas" />
        </View>

        {/* Botão continuar */}
        {pdfFile && (
          <Button
            title="Continuar para Pagamento →"
            onPress={() => setCurrentScreen('payment')}
            variant="success"
            size="lg"
            leftIcon={<Text style={styles.buttonIcon}>💰</Text>}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipBullet}>•</Text>
    <Text style={styles.tipText}>{text}</Text>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  uploadContainer: {
    marginBottom: SPACING.xl,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  uploadAreaDisabled: {
    opacity: 0.6,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uploadIconText: {
    fontSize: 36,
  },
  uploadText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  uploadTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  uploadHint: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.lg,
  },
  uploadDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  detailItem: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  fileSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  removeButton: {
    padding: SPACING.sm,
  },
  removeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.medium,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tipTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.warning,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipBullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    lineHeight: 20,
  },
  buttonIcon: {
    fontSize: 20,
  },
});

export default UploadScreen;