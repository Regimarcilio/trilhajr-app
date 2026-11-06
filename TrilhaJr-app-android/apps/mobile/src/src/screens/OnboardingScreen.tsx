import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './types';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const steps = [
    {
      title: 'Crie seu currículo perfeito',
      description: 'Receba dicas em tempo real para otimizar seu currículo para sistemas ATS.',
      icon: 'file-alt',
    },
    {
      title: 'Receba feedback inteligente',
      description: 'Nossa IA analisa seu currículo e sugere melhorias com palavras-chave.',
      icon: 'brain',
    },
    {
      title: 'Aproveite seu plano',
      description: 'Teste grátis por 7 dias. Faça upgrade quando quiser!',
      icon: 'star',
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Salva que completou onboarding
      AsyncStorage.setItem('hasOnboarded', 'true');
      navigation.replace('Dashboard');
    }
  };

  const handleSkip = () => {
    navigation.replace('Dashboard');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.step}>{`${currentStep + 1} de ${steps.length}`}</Text>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
        </View>

        <View style={styles Illustration}>
          <FontAwesome name={steps[currentStep].icon as string} size={80} color="#3B82F6" />
        </View>

        <Text style={styles.description}>{steps[currentStep].description}</Text>

        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === currentStep && { backgroundColor: '#3B82F6' }
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  step: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  Illustration: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  description: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  skipButton: { alignItems: 'center', marginBottom: 20 },
  skipText: { color: '#64748B', fontSize: 14 },
  nextButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});