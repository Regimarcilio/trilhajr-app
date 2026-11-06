import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './types';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [progress, progressAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animação
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Progresso carregamento
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Timer de navegação após 4 segundos
    const timer = setTimeout(() => {
      checkUserStatus();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const checkUserStatus = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      if (hasOnboarded === 'true') {
        navigation.replace('Dashboard' as never);
      } else {
        navigation.replace('Onboarding' as never);
      }
    } catch (error) {
      navigation.replace('Onboarding' as never);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient simulado */}
      <View style={StyleSheet.absoluteFill} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo ReziFlow com animação */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>ReziFlow</Text>
          <Text style={styles.tagline}>Otimizamos sua candidatura para o ATS perfeito</Text>
        </View>

        {/* Lottie Animation - Foguete pousando */}
        <LottieView
          source={require('../assets/foguete.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, width - 60],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.loadingText}>Carregando seu fluxo de candidatura...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    text-shadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 250,
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  progressContainer: {
    width: width - 40,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
});