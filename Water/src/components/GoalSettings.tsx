import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MAX_GOAL, MIN_GOAL } from '@/constants';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Surface, ThemedText } from './ThemedView';

type Props = {
  goal: number;
  onChange: (next: number) => void;
};

export const GoalSettings: React.FC<Props> = ({ goal, onChange }) => {
  const { colors } = useThemeColors();
  const [draft, setDraft] = useState(String(goal));

  useEffect(() => {
    setDraft(String(goal));
  }, [goal]);

  const apply = (n: number) => {
    const clamped = Math.max(MIN_GOAL, Math.min(MAX_GOAL, n));
    setDraft(String(clamped));
    onChange(clamped);
  };

  const handleSubmit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n)) apply(n);
    else setDraft(String(goal));
  };

  return (
    <Surface style={styles.card}>
      <ThemedText variant="heading">일일 목표량</ThemedText>
      <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
        하루에 마실 목표 수분량을 설정합니다.
      </ThemedText>
      <View style={styles.row}>
        <TextInput
          value={draft}
          onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
          onBlur={handleSubmit}
          onSubmitEditing={handleSubmit}
          keyboardType="number-pad"
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
          ]}
        />
        <ThemedText variant="bodyStrong" tone="secondary">
          ml
        </ThemedText>
      </View>
      <View style={styles.presets}>
        {[1500, 2000, 2500, 3000].map((v) => {
          const selected = v === goal;
          return (
            <Pressable
              key={v}
              onPress={() => apply(v)}
              style={({ pressed }) => [
                styles.preset,
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
                {v}ml
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
  },
});
