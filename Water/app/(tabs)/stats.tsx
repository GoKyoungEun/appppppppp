import { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistoryList } from '@/components/HistoryList';
import { StatsChart } from '@/components/StatsChart';
import { Surface, ThemedText, ThemedView } from '@/components/ThemedView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { lastNDays } from '@/lib/date';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';
import type { WeeklyStat } from '@/types';

export default function StatsScreen() {
  const { colors } = useThemeColors();
  const screenWidth = Dimensions.get('window').width;

  const dailyGoal = useSettingsStore((s) => s.settings.dailyGoal);
  const records = useWaterStore((s) => s.records);

  const weekly: WeeklyStat[] = useMemo(() => {
    return lastNDays(7).map((date) => {
      const r = records[date];
      const goal = r?.goal ?? dailyGoal;
      const total = r?.total ?? 0;
      return { date, total, goal, reached: total >= goal };
    });
  }, [records, dailyGoal]);

  const reachedDays = weekly.filter((s) => s.reached).length;
  const avg = Math.round(weekly.reduce((sum, s) => sum + s.total, 0) / Math.max(1, weekly.length));
  const best = Math.max(0, ...weekly.map((s) => s.total));

  const allRecords = Object.values(records)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedText variant="title">통계</ThemedText>
          <ThemedText variant="caption" tone="secondary">
            최근 7일 추이와 일별 기록입니다.
          </ThemedText>

          <Surface style={styles.chartCard}>
            <ThemedText variant="heading">최근 7일</ThemedText>
            <View style={{ marginTop: 12 }}>
              <StatsChart stats={weekly} width={screenWidth - 80} height={200} />
            </View>
          </Surface>

          <View style={styles.statRow}>
            <Surface style={[styles.statCard, { borderColor: colors.border }]}>
              <ThemedText variant="caption" tone="secondary">
                목표 달성
              </ThemedText>
              <ThemedText variant="title" tone="primary" style={{ marginTop: 4 }}>
                {reachedDays}
                <ThemedText variant="body" tone="secondary">
                  /7일
                </ThemedText>
              </ThemedText>
            </Surface>
            <Surface style={[styles.statCard, { borderColor: colors.border }]}>
              <ThemedText variant="caption" tone="secondary">
                일 평균
              </ThemedText>
              <ThemedText variant="title" style={{ marginTop: 4 }}>
                {avg.toLocaleString()}
                <ThemedText variant="body" tone="secondary">
                  ml
                </ThemedText>
              </ThemedText>
            </Surface>
            <Surface style={[styles.statCard, { borderColor: colors.border }]}>
              <ThemedText variant="caption" tone="secondary">
                최고
              </ThemedText>
              <ThemedText variant="title" style={{ marginTop: 4 }}>
                {best.toLocaleString()}
                <ThemedText variant="body" tone="secondary">
                  ml
                </ThemedText>
              </ThemedText>
            </Surface>
          </View>

          <ThemedText variant="heading" style={{ marginTop: 8 }}>
            일별 기록
          </ThemedText>
          <HistoryList records={allRecords} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80, gap: 12 },
  chartCard: { padding: 16, marginTop: 8, alignItems: 'center' },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statCard: { flex: 1, padding: 14, alignItems: 'flex-start' },
});
