import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/useSettingsStore';
import { darkColors, lightColors, type ColorPalette } from '@/theme/colors';

export const useThemeColors = (): {
  colors: ColorPalette;
  isDark: boolean;
} => {
  const mode = useSettingsStore((s) => s.settings.themeMode);
  const system = useColorScheme();
  const isDark =
    mode === 'dark' || (mode === 'system' && system === 'dark');
  return { colors: isDark ? darkColors : lightColors, isDark };
};
