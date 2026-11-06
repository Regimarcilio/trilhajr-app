import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@vector-icons/react-native-fontawesome';
import { StatusBar } from 'expo-status-bar';
import { useUser } from './contexts/UserContext';
import { RootStackParamList } from './types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { levelInfo, updateXP } = useUser();

  const menuItems = [
    { icon: 'file-alt', label: 'Meus Currículos', onPress: () => {} },
    { icon: 'bookmark', label: 'Vagas Salvas', onPress: () => {} },
    { icon: 'chart-line', label: 'Estatísticas', onPress: () => {} },
    { icon: 'shield-alt', label: 'Privacidade', onPress: () => {} },
    { icon: 'question-circle', label: 'Ajuda e Suporte', onPress: () => {} },
    { icon: 'star', label: 'Tornar-se Premium', onPress: () => navigation.navigate('Payment') },
  ];

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <FontAwesome name="user-circle" size={60} color="#3B82F6" />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>L{levelInfo.level}</Text>
            </View>
          </View>
          <Text style={styles.name}>Alex Johnson</Text>
          <Text style={styles.title}>{levelInfo.title}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{levelInfo.xp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.450</Text>
            <Text style={styles.statLabel}>Candidaturas</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <FontAwesome name={item.icon as string} size={20} color="#94A3B8" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <FontAwesome name="chevron-right" size={16} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <FontAwesome name="sign-out-alt" size={16} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { position: 'relative', marginBottom: 16 },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  title: { fontSize: 14, color: '#94A3B8' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  menuContainer: { gap: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '500', marginLeft: 8 },
});