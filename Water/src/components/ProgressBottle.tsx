import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  ClipPath,
  G,
} from 'react-native-svg';

import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemedText } from './ThemedView';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  progress: number;
  total: number;
  goal: number;
  width?: number;
  height?: number;
};

const BOTTLE_WIDTH = 180;
const BOTTLE_HEIGHT = 280;
const NECK_TOP = 10;
const NECK_BOTTOM = 60;
const BODY_TOP = 60;
const BODY_BOTTOM = 270;

export const ProgressBottle: React.FC<Props> = ({
  progress,
  total,
  goal,
  width = BOTTLE_WIDTH,
  height = BOTTLE_HEIGHT,
}) => {
  const { colors, isDark } = useThemeColors();
  const fill = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    fill.value = withSpring(clamped, { damping: 18, stiffness: 120 });
  }, [progress, fill]);

  const fillRange = BODY_BOTTOM - BODY_TOP;

  const animatedProps = useAnimatedProps(() => {
    const h = fill.value * fillRange;
    return {
      y: BODY_BOTTOM - h,
      height: h,
    };
  });

  const percent = Math.min(100, Math.round((total / Math.max(1, goal)) * 100));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${BOTTLE_WIDTH} ${BOTTLE_HEIGHT}`}>
        <Defs>
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.waterLight} stopOpacity="0.95" />
            <Stop offset="1" stopColor={colors.waterDark} stopOpacity="1" />
          </LinearGradient>
          <ClipPath id="bottleClip">
            <Path
              d={`
                M 60 ${NECK_TOP}
                L 120 ${NECK_TOP}
                L 120 ${NECK_BOTTOM}
                Q 150 ${NECK_BOTTOM + 5} 150 ${BODY_TOP + 30}
                L 150 ${BODY_BOTTOM - 20}
                Q 150 ${BODY_BOTTOM} 130 ${BODY_BOTTOM}
                L 50 ${BODY_BOTTOM}
                Q 30 ${BODY_BOTTOM} 30 ${BODY_BOTTOM - 20}
                L 30 ${BODY_TOP + 30}
                Q 30 ${NECK_BOTTOM + 5} 60 ${NECK_BOTTOM}
                Z
              `}
            />
          </ClipPath>
        </Defs>

        <G clipPath="url(#bottleClip)">
          <Rect
            x={0}
            y={0}
            width={BOTTLE_WIDTH}
            height={BOTTLE_HEIGHT}
            fill={isDark ? '#0B2030' : '#EAF6FC'}
          />
          <AnimatedRect
            x={0}
            width={BOTTLE_WIDTH}
            fill="url(#waterGrad)"
            animatedProps={animatedProps}
          />
        </G>

        <Path
          d={`
            M 60 ${NECK_TOP}
            L 120 ${NECK_TOP}
            L 120 ${NECK_BOTTOM}
            Q 150 ${NECK_BOTTOM + 5} 150 ${BODY_TOP + 30}
            L 150 ${BODY_BOTTOM - 20}
            Q 150 ${BODY_BOTTOM} 130 ${BODY_BOTTOM}
            L 50 ${BODY_BOTTOM}
            Q 30 ${BODY_BOTTOM} 30 ${BODY_BOTTOM - 20}
            L 30 ${BODY_TOP + 30}
            Q 30 ${NECK_BOTTOM + 5} 60 ${NECK_BOTTOM}
            Z
          `}
          stroke={colors.border}
          strokeWidth={2}
          fill="none"
        />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <ThemedText variant="display" style={{ color: colors.primaryContrast }}>
          {percent}
          <ThemedText variant="title" style={{ color: colors.primaryContrast }}>
            %
          </ThemedText>
        </ThemedText>
        <ThemedText
          variant="caption"
          style={{ color: colors.primaryContrast, opacity: 0.85, marginTop: 4 }}
        >
          {total.toLocaleString()} / {goal.toLocaleString()} ml
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
