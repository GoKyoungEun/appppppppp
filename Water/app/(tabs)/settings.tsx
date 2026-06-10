import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CupSizeSettings } from '@/components/CupSizeSettings';
import { GoalSettings } from '@/components/GoalSettings';
import { ReminderSettings } from '@/components/ReminderSettings';
import { Surface, ThemedText, ThemedView } from '@/components/ThemedView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptics } from '@/lib/haptics';
import { hasPermission, requestPermission } from '@/lib/notifications';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';
import type { ThemeMode } from '@/types';

export default function SettingsScreen() {
  const { colors } = useThemeColors();
  const settings = useSettingsStore((s) => s.settings);
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);
  const setCupSizes = useSettingsStore((s) => s.setCupSizes);
  const setReminderEnabled = useSettingsStore((s) => s.setReminderEnabled);
  const setReminderInterval = useSettingsStore((s) => s.setReminderInterval);
  const setActiveWindow = useSettingsStore((s) => s.setActiveWindow);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const resetSettings = useSettingsStore((s) => s.resetAll);
  const resetRecords = useWaterStore((s) => s.resetAll);

  const [permissionDenied, setPermissionDenied] = useState(false);

  const refreshPermission = useCallback(async () => {
    const granted = await hasPermission();
    setPermissionDenied(!granted);
  }, []);

  useEffect(() => {
    void refreshPermission();
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') void refreshPermission();
    });
    return () => sub.remove();
  }, [refreshPermission]);

  const handleToggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        setPermissionDenied(true);
        Alert.alert(
          '알림 권한 필요',
          '리마인더를 사용하려면 시스템 설정에서 알림을 허용해주세요.',
        );
        return;
      }
      setPermissionDenied(false);
    }
    await setReminderEnabled(enabled);
  };

  const handleReset = () => {
    Alert.alert('전체 초기화', '기록과 설정을 모두 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          haptics.warning();
          await resetSettings();
          resetRecords();
        },
      },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedText variant="title">설정</ThemedText>

          <GoalSettings goal={settings.dailyGoal} onChange={setDailyGoal} />

          <CupSizeSettings sizes={settings.cupSizes} onChange={setCupSizes} />

          <ReminderSettings
            enabled={settings.reminderEnabled}
            interval={settings.reminderInterval}
            activeStart={settings.activeStart}
            activeEnd={settings.activeEnd}
            permissionDenied={permissionDenied && settings.reminderEnabled === false}
            onToggle={handleToggleReminder}
            onIntervalChange={(h) => void setReminderInterval(h)}
            onWindowChange={(s, e) => void setActiveWindow(s, e)}
          />

          <Surface style={styles.card}>
            <ThemedText variant="heading">테마</ThemedText>
            <View style={styles.themeRow}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
                const selected = settings.themeMode === mode;
                const label = mode === 'system' ? '시스템' : mode === 'light' ? '라이트' : '다크';
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primaryMuted : 'transparent',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      variant="bodyStrong"
                      style={{ color: selected ? colors.primary : colors.textSecondary }}
                    >
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Surface>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                borderColor: colors.danger,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText variant="bodyStrong" tone="danger">
              전체 초기화
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80, gap: 16 },
  card: { padding: 16 },
  themeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
  },
  resetBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
});
