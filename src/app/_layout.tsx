import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="reserve/[id]"
            options={{
              headerShown: true,
              title: 'Spot Details & Slots',
              headerTintColor: Colors.primaryDark,
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Colors.white },
            }}
          />
          <Stack.Screen
            name="booking/summary"
            options={{
              headerShown: true,
              title: 'Reservation Summary',
              headerTintColor: Colors.primaryDark,
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Colors.white },
            }}
          />
          <Stack.Screen
            name="booking/payment"
            options={{
              headerShown: true,
              title: 'Digital Payment (Demo)',
              headerTintColor: Colors.primaryDark,
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Colors.white },
            }}
          />
          <Stack.Screen
            name="booking/confirmation"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="operator"
            options={{
              headerShown: true,
              title: 'Parking Management',
              headerTintColor: Colors.primaryDark,
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Colors.white },
            }}
          />
        </Stack>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
