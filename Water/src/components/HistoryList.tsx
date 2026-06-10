import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { dayLabel, timeLabel } from '@/lib/date';
import type { DayRecord } from '@/types';
import { Surface, ThemedText } from './ThemedView';

type Props = {
  records: DayRecord[];
};

export const HistoryList: React.FC<Props> = ({ records }) => {
  const { colors } = useThemeColors();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <Surface style={styles.empty}>
        <ThemedText variant="body" tone="secondary">
          아직 기록이 없습니다.
        </ThemedText>
      </Surface>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {records.map((r) => {
        const isOpen = expanded === r.date;
        const pct = Math.min(100, Math.round((r.total / Math.max(1, r.goal)) * 100));
        return (
          <Surface key={r.date} style={{ overflow: 'hidden' }}>
            <Pressable
              onPress={() => setExpanded(isOpen ? null : r.date)}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText variant="bodyStrong">{dayLabel(r.date)}</ThemedText>
                <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                  {r.total.toLocaleString()} / {r.goal.toLocaleString()} ml · {pct}%
                </ThemedText>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
            {isOpen ? (
              <View
                style={[
                  styles.logs,
                  { borderTopColor: colors.border, borderTopWidth: 1 },
                ]}
              >
                {r.logs.length === 0 ? (
                  <ThemedText variant="caption" tone="tertiary">
                    이 날의 상세 기록이 없습니다.
                  </ThemedText>
                ) : (
                  r.logs
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((log) => (
                      <View key={log.id} style={styles.logRow}>
                        <ThemedText variant="body">{timeLabel(log.timestamp)}</ThemedText>
                        <ThemedText variant="bodyStrong" tone="primary">
                          +{log.amount}ml
                        </ThemedText>
                      </View>
                    ))
                )}
              </View>
            ) : null}
          </Surface>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  logs: { padding: 14, gap: 8 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between' },
  empty: { padding: 24, alignItems: 'center' },
});
