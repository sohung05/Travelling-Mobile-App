import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { DarkModeProvider } from './src/contexts/DarkModeContext';
import { queryClient, persister } from './src/api/cache/queryClient';
import { useWebMouseDrag } from './src/utils/useWebMouseDrag';

export default function App() {
  useWebMouseDrag();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <DarkModeProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </DarkModeProvider>
        </PersistQueryClientProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
