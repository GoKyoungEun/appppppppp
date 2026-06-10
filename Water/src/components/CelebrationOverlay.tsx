import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemedText } from './ThemedView';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export const CelebrationOverlay: React.FC<Props> = ({ visible, onDismiss }) => {
  const { colors } = useThemeColors();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 140 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.7, { duration: 150 });
    }
  }, [visible, opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Pressable
      style={[StyleSheet.absoluteFill, styles.backdrop, { backgroundColor: colors.overlay }]}
      onPress={onDismiss}
    >
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <View
          style={[styles.icon, { backgroundColor: colors.primaryMuted }]}
        >
          <MaterialCommunityIcons name="trophy" size={36} color={colors.primary} />
        </View>
        <ThemedText variant="title" style={{ marginTop: 16, textAlign: 'center' }}>
          오늘의 목표 달성
        </ThemedText>
        <ThemedText
          variant="body"
          tone="secondary"
          style={{ marginTop: 6, textAlign: 'center' }}
        >
          꾸준한 수분 보충, 잘 하고 계세요.
        </ThemedText>
        <ThemedText
          variant="caption"
          tone="tertiary"
          style={{ marginTop: 14, textAlign: 'center' }}
        >
          탭하여 닫기
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
