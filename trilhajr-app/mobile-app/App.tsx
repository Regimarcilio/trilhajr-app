import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { UploadScreen } from '@/screens/UploadScreen';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants';

// Tela temporária de pagamento
const PaymentScreen = () => (
  <LinearGradient colors={COLORS.gradient} style={styles.screen}>
    <Text style={styles.title}>Tela de Pagamento</Text>
    <Text style={styles.subtitle}>Em desenvolvimento...</Text>
  </LinearGradient>
);

// Tela temporária de resultado
const ResultScreen = () => (
  <LinearGradient colors={COLORS.gradient} style={styles.screen}>
    <Text style={styles.title}>PDF Otimizado!</Text>
    <Text style={styles.subtitle}>Seu currículo está pronto</Text>
  </LinearGradient>
);

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slideFromRight',
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});