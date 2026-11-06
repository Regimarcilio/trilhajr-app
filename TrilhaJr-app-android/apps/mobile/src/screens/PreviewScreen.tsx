import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';
import { StatusBar } from 'expo-status-bar';
import { useUser } from './contexts/UserContext';
import { RootStackParamList } from './types';

type PreviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preview'>;

export default function PreviewScreen() {
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const { levelInfo, updateXP } = useUser();
  const route = navigation as any;
  const resumeData = route?.params?.resumeData;

  const handlePayment = () => {
    navigation.navigate('Payment');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Prévia do Currículo</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.resumeCard}>
          <Text style={styles.resumeName}>{resumeData?.name || 'Seu Nome'}</Text>
          <Text style={styles.resumeTitle}>{resumeData?.title || 'Seu Cargo'}</Text>
          <Text style={styles.resumeEmail}>{resumeData?.email || 'seu@email.com'}</Text>
          <Text style={styles.resumeText}>{resumeData?.experience || 'Sua experiência...'}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Seu Progresso</Text>
          <Text style={styles.stats}>{levelInfo.xp} XP acumulado</Text>
          <Text style={styles.levelBadge}>Nível {levelInfo.level} - {levelInfo.title}</Text>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Desbloquear Plano Premium</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginLeft: 15 },
  content: { flex: 1, padding: 20 },
  resumeCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20 },
  resumeName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  resumeTitle: { fontSize: 16, color: '#94A3B8', marginBottom: 8 },
  resumeEmail: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  resumeText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20 },
  statsCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20 },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  stats: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  levelBadge: { fontSize: 14, fontWeight: '500', color: '#3B82F6' },
  payButton: { marginBottom: 30 },
  buttonGradient: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});