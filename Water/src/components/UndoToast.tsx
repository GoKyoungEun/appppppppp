import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemedText } from './ThemedView';

type Props = {
  visible: boolean;
  amount: number;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
};

export const UndoToast: React.FC<Props> = ({
  visible,
  amount,
  onUndo,
  onDismiss,
  durationMs = 5000,
}) => {
  const { colors } = useThemeColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!visible) return;
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(20, { duration: 200 });
      setTimeout(onDismiss, 200);
    }, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border, shadowColor: colors.shadow },
      ]}
      pointerEvents="box-none"
    >
      <View style={{ flex: 1 }}>
        <ThemedText variant="bodyStrong">+{amount}ml 추가됨</ThemedText>
        <ThemedText variant="caption" tone="secondary">
          되돌리려면 탭하세요
        </ThemedText>
      </View>
      <Pressable
        onPress={onUndo}
        style={({ pressed }) => [
          styles.undoBtn,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="arrow-undo" size={16} color={colors.primaryContrast} />
        <ThemedText
          variant="bodyStrong"
          style={{ color: colors.primaryContrast, marginLeft: 6 }}
        >
          되돌리기
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
