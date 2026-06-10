import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useThemeColors } from '@/hooks/useThemeColors';
import { dayLabelShort } from '@/lib/date';
import type { WeeklyStat } from '@/types';

type Props = {
  stats: WeeklyStat[];
  width?: number;
  height?: number;
};

const PADDING_X = 20;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 32;

export const StatsChart: React.FC<Props> = ({
  stats,
  width = 320,
  height = 200,
}) => {
  const { colors } = useThemeColors();

  const maxGoal = Math.max(...stats.map((s) => s.goal), 1);
  const maxTotal = Math.max(...stats.map((s) => s.total), 0);
  const yMax = Math.max(maxGoal, maxTotal) * 1.1;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const chartWidth = width - PADDING_X * 2;
  const slotWidth = chartWidth / stats.length;
  const barWidth = Math.max(12, slotWidth * 0.55);

  const goalY = PADDING_TOP + chartHeight - (maxGoal / yMax) * chartHeight;

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={PADDING_X}
          y1={goalY}
          x2={width - PADDING_X}
          y2={goalY}
          stroke={colors.textTertiary}
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <SvgText
          x={width - PADDING_X}
          y={goalY - 6}
          fontSize={10}
          fill={colors.textTertiary}
          textAnchor="end"
        >
          {`목표 ${maxGoal}ml`}
        </SvgText>

        {stats.map((s, i) => {
          const h = yMax > 0 ? (s.total / yMax) * chartHeight : 0;
          const x = PADDING_X + slotWidth * i + (slotWidth - barWidth) / 2;
          const y = PADDING_TOP + chartHeight - h;
          const barColor = s.reached ? colors.water : colors.primaryMuted;
          return (
            <React.Fragment key={s.date}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, h)}
                fill={barColor}
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={PADDING_TOP + chartHeight + 16}
                fontSize={10}
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {dayLabelShort(s.date)}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={PADDING_TOP + chartHeight + 28}
                fontSize={9}
                fill={colors.textTertiary}
                textAnchor="middle"
              >
                {Math.round(s.total / 100) / 10}L
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export const chartStyles = StyleSheet.create({});
