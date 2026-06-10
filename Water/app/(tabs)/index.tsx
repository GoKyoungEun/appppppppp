import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { CustomAmountModal } from '@/components/CustomAmountModal';
import { ProgressBottle } from '@/components/ProgressBottle';
import { ThemedText, ThemedView } from '@/components/ThemedView';
import { UndoToast } from '@/components/UndoToast';
import { WaterButton } from '@/components/WaterButton';
import { useGoalCelebration } from '@/hooks/useGoalCelebration';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptics } from '@/lib/haptics';
import { todayKey } from '@/lib/date';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';

export default function HomeScreen() {
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [toastAmount, setToastAmount] = useState<number | null>(null);

  const dailyGoal = useSettingsStore((s) => s.settings.dailyGoal);
  const cupSizes = useSettingsStore((s) => s.settings.cupSizes);

  const today = useWaterStore((s) => s.records[todayKey()]);
  const addWater = useWaterStore((s) => s.addWater);
  const undoLast = useWaterStore((s) => s.undoLast);
  const lastAddedLogId = useWaterStore((s) => s.lastAddedLogId);
  const ensureTodayRecord = useWaterStore((s) => s.ensureTodayRecord);

  useEffect(() => {
    ensureTodayRecord(dailyGoal);
  }, [dailyGoal, ensureTodayRecord]);

  const total = today?.total ?? 0;
  const goal = today?.goal ?? dailyGoal;
  const progress = goal > 0 ? total / goal : 0;
  const remaining = Math.max(0, goal - total);

  const { celebrating, dismiss } = useGoalCelebration({
    date: today?.date ?? todayKey(),
    total,
    goal,
  });

  const handleAdd = (amount: number) => {
    haptics.light();
    addWater(amount, dailyGoal);
    setToastAmount(amount);
  };

  const handleUndo = () => {
    haptics.medium();
    undoLast();
    setToastAmount(null);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="title">오늘</ThemedText>
            <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
              {remaining > 0
                ? `목표까지 ${remaining.toLocaleString()}ml 남았어요.`
                : '오늘의 목표를 달성했습니다.'}
            </ThemedText>
          </View>

          <View style={styles.bottleWrap}>
            <ProgressBottle progress={progress} total={total} goal={goal} />
          </View>

          <View style={styles.quickRow}>
            <WaterButton amount={cupSizes[0]} onPress={() => handleAdd(cupSizes[0])} />
            <WaterButton
              amount={cupSizes[1]}
              onPress={() => handleAdd(cupSizes[1])}
              variant="primary"
            />
            <WaterButton amount={cupSizes[2]} onPress={() => handleAdd(cupSizes[2])} />
          </View>

          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.customBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <ThemedText variant="bodyStrong" tone="primary" style={{ marginLeft: 8 }}>
              직접 입력
            </ThemedText>
          </Pressable>
        </ScrollView>

        <UndoToast
          visible={toastAmount !== null && lastAddedLogId !== null}
          amount={toastAmount ?? 0}
          onUndo={handleUndo}
          onDismiss={() => setToastAmount(null)}
        />

        <CustomAmountModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAdd}
        />

        <CelebrationOverlay visible={celebrating} onDismiss={dismiss} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 120, gap: 20 },
  header: { gap: 2 },
  bottleWrap: { alignItems: 'center', marginTop: 8 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
