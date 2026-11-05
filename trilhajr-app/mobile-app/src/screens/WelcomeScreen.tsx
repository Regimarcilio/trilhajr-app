// Tela de Boas-vindas
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS, ANIMATION_DURATION } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WelcomeScreen = () => {
  const { setCurrentScreen } = useAppStore();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    // Sequência de animações
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.slow,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen('upload');
  };

  return (
    <LinearGradient
      colors={COLORS.gradient}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Ícone principal animado */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Text style={styles.iconText}>🧭</Text>
          </View>
          {/* Anéis decorativos */}
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </View>

        {/* Textos */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>TrilhaJr</Text>
          <Text style={styles.subtitle}>
            Seu currículo<br/>destaque no ATS
          </Text>
          <Text style={styles.description}>
            Otimize seu PDF em minutos. Sem cadastro,<br/>pagamento Pix direto no app.
          </Text>
        </View>

        {/* Benefícios */}
        <View style={styles.benefitsContainer}>
          <BenefitItem icon="📄" text="Upload PDF em 3s" />
          <BenefitItem icon="💰" text="Pix R$ 4,90 sem cadastro" />
          <BenefitItem icon="🤖" text="IA otimiza para ATS" />
          <BenefitItem icon="📥" text="Baixe e compartilhe" />
        </View>

        {/* Botão principal */}
        <Button
          title="Começar Agora"
          onPress={handleGetStarted}
          variant="success"
          size="lg"
          leftIcon={<Text style={styles.buttonIcon}>🚀</Text>}
        />

        {/* Rodapé */}
        <Text style={styles.footerText}>
          Processamento seguro • Seus dados ficam no seu dispositivo
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

// Componente de benefício
const BenefitItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.benefitItem}>
    <View style={styles.benefitIcon}>
      <Text style={styles.benefitIconText}>{icon}</Text>
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconText: {
    fontSize: 50,
  },
  ring1: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ring2: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.regular,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 28,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  benefitIconText: {
    fontSize: 20,
  },
  benefitText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.white,
  },
  buttonIcon: {
    fontSize: 20,
  },
  footerText: {
    marginTop: SPACING.xl,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});

export default WelcomeScreen;