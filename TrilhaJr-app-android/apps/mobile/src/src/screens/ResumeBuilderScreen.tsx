import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
type ResumeBuilderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResumeBuilder'>;

export default function ResumeBuilderScreen() {
  const navigation = useNavigation<ResumeBuilderScreenNavigationProp>();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    experience: '',
    skills: '',
    education: '',
  });

  const [atsScore, setAtsScore] = useState<number | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateResume = async () => {
    // Simulação de validação ATS com IoT edge device
    const score = await simulateAtsValidation();
    setAtsScore(score);
    
    if (score >= 70) {
      navigation.navigate('Preview', { 
        resumeData: formData,
        atsScore: score 
      } as never);
    } else {
      // Mostra warning e sugere melhorias
      Alert.alert(
        'Pontuação ATS baixa',
        `Sua redação atual tem ${score}% de compatibilidade com ATS. Quer ajustar?`,
        [{ text: 'Ajustar', onPress: () => {} }, { text: 'Gerar mesmo', style: 'default' }]
      );
    }
  };

  const simulateAtsValidation = async (): Promise<number> => {
    // Simula validação via IoT edge device
    const keywords = ['Java', 'Android', 'React', 'SQL', 'API'];
    let score = 50; // Base
    
    if (formData.skills) {
      keywords.forEach(kw => {
        if (formData.skills.includes(kw)) score += 5;
      });
    }
    
    if (formData.experience && formData.experience.length > 100) score += 10;
    if (formData.title) score += 15;
    
    return Math.min(score, 95);
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    multiline = false,
    numberOfLines = 1 
  }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={500}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Currículo</Text>
          <Text style={styles.atsIndicator}>
            <FontAwesome name="microchip" size={16} color="#10B981" /> ATS
          </Text>
        </View>

        <ScrollView 
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaped="handled"
        >
          <View style={styles.form}>
            <InputField
              label="Nome Completo"
              value={formData.name}
              onChangeText={(val: string) => handleInputChange('name', val)}
              placeholder="Digite seu nome completo"
            />

            <InputField
              label="Título profissional"
              value={formData.title}
              onChangeText={(val: string) => handleInputChange('title', val)}
              placeholder="Desenvolvedor Android, Engenheiro de Software..."
            />

            <InputField
              label="E-mail"
              value={formData.email}
              onChangeText={(val: string) => handleInputChange('email', val)}
              placeholder="seu@email.com"
            />

            <InputField
              label="Telefone"
              value={formData.phone}
              onChangeText={(val: string) => handleInputChange('phone', val)}
              placeholder="(11) 99999-9999"
            />

            <InputField
              label="Experiência profissional"
              value={formData.experience}
              onChangeText={(val: string) => handleInputChange('experience', val)}
              placeholder="Desenvolvedor Android na Empresa X (2020-2023)..."
              multiline
              numberOfLines={4}
            />

            <InputField
              label="Habilidades (separe por vírgula)"
              value={formData.skills}
              onChangeText={(val: string) => handleInputChange('skills', val)}
              placeholder="Java, React Native, SQL, Firebase..."
            />

            <InputField
              label="Formação"
              value={formData.education}
              onChangeText={(val: string) => handleInputChange('education', val)}
              placeholder="Bacharelado em Ciência da Computação - Universidade..."
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Botão de validação IoT */}
          <View style={styles.bottomSection}>
            {atsScore !== null && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Pontuação ATS</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{atsScore}%</Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateResume}>
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.generateButtonText}>
                  {atsScore ? 'Gerar Currículo' : 'Validar ATS'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  atsIndicator: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scroll: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    height: 100,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generateButton: {
    marginTop: 8,
  },
  buttonGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});