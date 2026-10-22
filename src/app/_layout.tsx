import { Slot } from 'expo-router';
import { SafeAreaView, View } from 'react-native';

import { PortalHost } from '@rn-primitives/portal';
import '../../global.css';
import { AuthProvider } from '@/services/auth-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
        <PortalHost />
      </AuthProvider>
    </SafeAreaProvider>
  );
}