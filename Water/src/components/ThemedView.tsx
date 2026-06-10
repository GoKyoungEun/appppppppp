import { View, ViewProps, Text, TextProps } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

export const ThemedView = ({ style, ...rest }: ViewProps) => {
  const { colors } = useThemeColors();
  return <View style={[{ backgroundColor: colors.background }, style]} {...rest} />;
};

export const Surface = ({ style, ...rest }: ViewProps) => {
  const { colors } = useThemeColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export const ThemedText = ({
  style,
  variant = 'body',
  tone = 'default',
  ...rest
}: TextProps & {
  variant?: 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'small';
  tone?: 'default' | 'secondary' | 'tertiary' | 'primary' | 'danger';
}) => {
  const { colors } = useThemeColors();
  const toneColor = {
    default: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    primary: colors.primary,
    danger: colors.danger,
  }[tone];
  const sizeMap = {
    display: { fontSize: 48, fontWeight: '700' as const },
    title: { fontSize: 24, fontWeight: '700' as const },
    heading: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    bodyStrong: { fontSize: 16, fontWeight: '600' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    small: { fontSize: 11, fontWeight: '500' as const },
  };
  return <Text style={[{ color: toneColor }, sizeMap[variant], style]} {...rest} />;
};
