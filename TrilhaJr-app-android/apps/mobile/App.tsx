import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ResumeBuilderScreen from './src/screens/ResumeBuilderScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slideFromBottom',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}