import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MAX_CUP, MIN_CUP } from '@/constants';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Surface, ThemedText } from './ThemedView';

type Props = {
  sizes: [number, number, number];
  onChange: (sizes: [number, number, number]) => void;
};

export const CupSizeSettings: React.FC<Props> = ({ sizes, onChange }) => {
  const { colors } = useThemeColors();
  const [drafts, setDrafts] = useState<string[]>(sizes.map(String));

  useEffect(() => {
    setDrafts(sizes.map(String));
  }, [sizes]);

  const commit = (index: number, raw: string) => {
    const n = parseInt(raw, 10);
    const valid = Number.isFinite(n) ? Math.max(MIN_CUP, Math.min(MAX_CUP, n)) : sizes[index];
    const next = [...sizes] as [number, number, number];
    next[index] = valid;
    onChange(next);
    setDrafts(next.map(String));
  };

  return (
    <Surface style={styles.card}>
      <ThemedText variant="heading">빠른 추가 컵 사이즈</ThemedText>
      <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
        홈 화면 하단의 3개 버튼에 표시될 용량(ml)입니다.
      </ThemedText>
      <View style={styles.row}>
        {drafts.map((d, i) => (
          <View key={i} style={{ flex: 1 }}>
            <ThemedText variant="caption" tone="secondary">
              컵 {i + 1}
            </ThemedText>
            <TextInput
              value={d}
              onChangeText={(t) => {
                const next = [...drafts];
                next[i] = t.replace(/[^0-9]/g, '');
                setDrafts(next);
              }}
              onBlur={() => commit(i, drafts[i])}
              onSubmitEditing={() => commit(i, drafts[i])}
              keyboardType="number-pad"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
