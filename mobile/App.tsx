import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
