export type ColorPalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryMuted: string;
  primaryContrast: string;
  water: string;
  waterLight: string;
  waterDark: string;
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
};

export const lightColors: ColorPalette = {
  background: '#F4FAFD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E1ECF3',
  text: '#0F2A3D',
  textSecondary: '#4B6B82',
  textTertiary: '#85A0B3',
  primary: '#2196F3',
  primaryMuted: '#BBDEFB',
  primaryContrast: '#FFFFFF',
  water: '#42A5F5',
  waterLight: '#90CAF9',
  waterDark: '#1976D2',
  success: '#26A69A',
  danger: '#EF5350',
  shadow: 'rgba(20, 70, 110, 0.10)',
  overlay: 'rgba(15, 42, 61, 0.45)',
};

export const darkColors: ColorPalette = {
  background: '#071520',
  surface: '#0F2330',
  surfaceElevated: '#15303F',
  border: '#1F3D50',
  text: '#E9F4FB',
  textSecondary: '#A8C2D2',
  textTertiary: '#6C8898',
  primary: '#4FC3F7',
  primaryMuted: '#1F4A66',
  primaryContrast: '#06141D',
  water: '#4FC3F7',
  waterLight: '#81D4FA',
  waterDark: '#0288D1',
  success: '#4DD0C2',
  danger: '#EF7B79',
  shadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};
