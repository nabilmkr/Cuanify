/**
 * CUANIFY — App.tsx (Entry Point)
 * Bersih: hanya load font, init auth, render navigator.
 * Semua logika bisnis ada di screens & services.
 */
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  useFonts,
  Orbitron_600SemiBold,
  Orbitron_700Bold,
} from '@expo-google-fonts/orbitron';
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { Colors } from './src/theme/colors';

export default function App() {
  const { isLoading, loadToken } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Orbitron_600SemiBold,
    Orbitron_700Bold,
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  // Load persisted token on startup
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Splash / loading state
  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  splash: {
    flex: 1,
    backgroundColor: Colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
