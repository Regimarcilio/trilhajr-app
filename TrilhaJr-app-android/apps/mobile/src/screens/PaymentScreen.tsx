import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    { id: 'free', name: 'Free', price: 'R$ 0', features: ['1 Currículo', 'Validação ATS básica'], color: '#64748B' },
    { id: 'pro', name: 'Pro', price: 'R$ 29/mês', features: ['Currículos Ilimitados', 'Validação ATS Premium', 'Suporte Prioritário'], color: '#3B82F6' },
    { id: 'lifetime', name: 'Lifetime', price: 'R$ 149', features: ['Acesso Vitalício', 'Tudo do Pro', 'Badge de Lenda'], color: '#F59E0B' },
  ];

  const handlePayment = () => {
    Alert.alert(
      'Módulo PagSeguro',
      'O módulo de pagamento PagSeguro está pendente de implantação. No momento, estamos simulando a transação para testes de fluxo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Simular Pagamento', 
          onPress: () => {
            Alert.alert('Sucesso!', 'Pagamento simulado com sucesso. Plano ativado!');
            navigation.navigate('Dashboard' as never);
          } 
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Escolha seu Plano</Text>
        </View>

        <Text style={styles.subtitle}>Desbloqueie o potencial máximo do seu currículo</Text>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity 
              key={plan.id} 
              style={[styles.planCard, selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 }]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <View style={styles.features}>
                {plan.features.map((f, i) => (
                  <Text key={i} style={styles.featureItem}>✓ {f}</Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Ativar Plano {plans.find(p => p.id === selectedPlan)?.name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginLeft: 15 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 30 },
  plansContainer: { gap: 16 },
  planCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  planPrice: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  features: { gap: 4 },
  featureItem: { fontSize: 14, color: '#94A3B8' },
  payButton: { marginTop: 40, marginBottom: 40 },
  buttonGradient: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});
