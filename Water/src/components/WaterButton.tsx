import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemedText } from './ThemedView';

type Props = {
  amount: number;
  onPress: () => void;
  variant?: 'primary' | 'outline';
};

export const WaterButton: React.FC<Props> = ({ amount, onPress, variant = 'outline' }) => {
  const { colors } = useThemeColors();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? colors.primary : colors.surface,
          borderColor: isPrimary ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="cup-water"
        size={22}
        color={isPrimary ? colors.primaryContrast : colors.primary}
      />
      <View>
        <ThemedText
          variant="bodyStrong"
          style={{ color: isPrimary ? colors.primaryContrast : colors.text }}
        >
          {amount}
          <ThemedText
            variant="caption"
            style={{ color: isPrimary ? colors.primaryContrast : colors.textSecondary }}
          >
            {' '}
            ml
          </ThemedText>
        </ThemedText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
});
