import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText, ThemedView } from '@/components/ThemedView';
import { MAX_GOAL, MIN_GOAL } from '@/constants';
import { useThemeColors } from '@/hooks/useThemeColors';
import { requestPermission } from '@/lib/notifications';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [step, setStep] = useState<0 | 1>(0);
  const [goalDraft, setGoalDraft] = useState('2000');

  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);
  const setReminderEnabled = useSettingsStore((s) => s.setReminderEnabled);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const commitGoal = () => {
    const n = parseInt(goalDraft, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.max(MIN_GOAL, Math.min(MAX_GOAL, n));
      setDailyGoal(clamped);
    }
  };

  const handleEnableNotifications = async () => {
    commitGoal();
    const granted = await requestPermission();
    if (granted) await setReminderEnabled(true);
    completeOnboarding();
    router.replace('/');
  };

  const handleSkipNotifications = () => {
    commitGoal();
    completeOnboarding();
    router.replace('/');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {step === 0 ? (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <View style={[styles.icon, { backgroundColor: colors.primaryMuted }]}>
                <MaterialCommunityIcons name="water" size={56} color={colors.primary} />
              </View>
              <ThemedText variant="title" style={{ textAlign: 'center' }}>
                Water Tracker
              </ThemedText>
              <ThemedText variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                매일의 수분 섭취를 간단하게 기록하고,{'\n'}꾸준한 습관을 만들어 보세요.
              </ThemedText>

              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ThemedText variant="heading">하루 목표량</ThemedText>
                <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                  나중에 설정에서 언제든 바꿀 수 있습니다.
                </ThemedText>
                <View style={styles.inputRow}>
                  <TextInput
                    value={goalDraft}
                    onChangeText={(t) => setGoalDraft(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                  <ThemedText variant="bodyStrong" tone="secondary">
                    ml
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  commitGoal();
                  setStep(1);
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <ThemedText variant="bodyStrong" style={{ color: colors.primaryContrast }}>
                  다음
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <View style={[styles.icon, { backgroundColor: colors.primaryMuted }]}>
                <MaterialCommunityIcons name="bell-ring-outline" size={56} color={colors.primary} />
              </View>
              <ThemedText variant="title" style={{ textAlign: 'center' }}>
                리마인더 사용
              </ThemedText>
              <ThemedText variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                활동 시간대에 정해진 간격으로{'\n'}수분 보충 알림을 보냅니다.
              </ThemedText>

              <Pressable
                onPress={handleEnableNotifications}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <ThemedText variant="bodyStrong" style={{ color: colors.primaryContrast }}>
                  알림 허용하고 시작
                </ThemedText>
              </Pressable>

              <Pressable onPress={handleSkipNotifications} style={{ paddingVertical: 10 }}>
                <ThemedText variant="body" tone="secondary">
                  나중에 설정
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
});
