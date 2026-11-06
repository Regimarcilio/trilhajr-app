import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';

const { width, height } = Dimensions.get('window');
type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface UserLevel {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 3,
    xp: 2450,
    xpToNext: 3000,
    title: 'Candidato Premium',
  });

  const handleResumeBuilder = () => {
    navigation.navigate('ResumeBuilder');
  };

  const cards = [
    { title: 'Novo Currículo', icon: 'file-alt', onPress: handleResumeBuilder, color: '#3B82F6' },
    { title: 'Anotações', icon: 'sticky-note', onPress: () => {}, color: '#8B5CF6' },
    { title: 'Vagas Salvas', icon: 'bookmark', onPress: () => {}, color: '#10B981' },
    { title: 'Progresso', icon: 'chart-line', onPress: () => {}, color: '#F59E0B' },
  ];

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header com saudação */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Alex!</Text>
            <Text style={styles.subtitle}>Sua candidatura está pronta?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <FontAwesome name="user-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Card de Nível */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Nível {userLevel.level}</Text>
              <Text style={styles.levelSubtitle}>Conquistas ganhas</Text>
            </View>
            <View style={styles.badges}>
              <FontAwesome name="medal" size={24} color="#F59E0B" />
            </View>
          </View>
          
          <Text style={styles.xpText}>
            {userLevel.xp} / {userLevel.xpToNext} XP
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(userLevel.xp / userLevel.xpToNext) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.nextLevel}>Próximo: Nível {userLevel.level + 1}</Text>
          </View>
        </View>

        {/* CTA Principal */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleResumeBuilder}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Criar Novo Currículo</Text>
            <FontAwesome name="rocket" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Cards de Ação */}
        <Text style={styles.sectionTitle}>Rápido Acesso</Text>
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity key={index} style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${card.color}20` }]}>
                <FontAwesome name={card.icon as any} size={24} color={card.color} />
              </View>
              <Text style={styles.actionText}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  profileButton: {
    padding: 8,
  },
  levelCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  badges: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  nextLevel: {
    fontSize: 12,
    color: '#64748B',
  },
  primaryButton: {
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});