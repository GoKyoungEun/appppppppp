import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useMidnightReset } from '@/hooks/useMidnightReset';
import { storage } from '@/lib/storage';
import { ensureAndroidChannel } from '@/lib/notifications';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';

function HydrationGate({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useThemeColors();
  const [ready, setReady] = useState(false);

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateWater = useWaterStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.isHydrated);
  const waterHydrated = useWaterStore((s) => s.isHydrated);

  useEffect(() => {
    (async () => {
      await storage.ensureVersion();
      const [settings, records] = await Promise.all([
        storage.loadSettings(),
        storage.loadRecords(),
      ]);
      hydrateSettings(settings);
      hydrateWater(records, settings.dailyGoal);
      await ensureAndroidChannel();
      setReady(true);
    })().catch((e) => {
      console.warn('[hydrate] failed', e);
      setReady(true);
    });
  }, [hydrateSettings, hydrateWater]);

  useRouteGuard(ready && settingsHydrated && waterHydrated);
  useMidnightReset();

  if (!ready || !settingsHydrated || !waterHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  return <>{children}</>;
}

function useRouteGuard(ready: boolean) {
  const router = useRouter();
  const segments = useSegments();
  const onboardingCompleted = useSettingsStore((s) => s.settings.onboardingCompleted);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingCompleted && inOnboarding) {
      router.replace('/');
    }
  }, [ready, onboardingCompleted, router, segments]);
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HydrationGate>
          <RootStack />
        </HydrationGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { isDark } = useThemeColors();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
