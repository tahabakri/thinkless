export type ThemeMode = 'default' | 'oled' | 'night';

interface ThemeColors {
  bg: string;
  bg2: string;
  bg3: string;
  bgCard: string;
  bgElevated: string;
  bgInput: string;
  border: string;
  borderFocus: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentDim: string;
  accentHover: string;
  danger: string;
  dangerDim: string;
  warning: string;
  success: string;
  loop: string;
  tabBar: string;
  tabBarBorder: string;
  inactive: string;
  orange: string;
}

const defaultTheme: ThemeColors = {
  bg: '#080808',
  bg2: '#111111',
  bg3: '#1a1a1a',
  bgCard: '#111111',
  bgElevated: '#1a1a1a',
  bgInput: '#1a1a1a',
  border: '#333333',
  borderFocus: '#555555',
  text: '#F2F2F2',
  textSecondary: '#8A8A8A',
  textMuted: '#555555',
  accent: '#AAFF00',
  accentDim: '#2a3d00',
  accentHover: '#ccff33',
  danger: '#FF2D2D',
  dangerDim: '#3d0a0a',
  warning: '#FF8C00',
  success: '#AAFF00',
  loop: '#FF4444',
  tabBar: '#080808',
  tabBarBorder: '#333333',
  inactive: '#555555',
  orange: '#FF4500',
};

const oledTheme: ThemeColors = {
  ...defaultTheme,
  bg: '#000000',
  bg2: '#0a0a0a',
  bg3: '#141414',
  bgCard: '#0a0a0a',
  bgElevated: '#141414',
  bgInput: '#141414',
  tabBar: '#000000',
};

const nightTheme: ThemeColors = {
  ...defaultTheme,
  bg: '#0d1117',
  bg2: '#161b22',
  bg3: '#1f2937',
  bgCard: '#161b22',
  bgElevated: '#1f2937',
  bgInput: '#1f2937',
  border: '#30363d',
  borderFocus: '#484f58',
  text: '#e6edf3',
  textSecondary: '#7d8590',
  textMuted: '#484f58',
  accent: '#7dd3fc',
  accentDim: '#1e3a5f',
  accentHover: '#a5e8ff',
  success: '#7dd3fc',
  tabBar: '#0d1117',
  tabBarBorder: '#30363d',
  inactive: '#484f58',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  default: defaultTheme,
  oled: oledTheme,
  night: nightTheme,
};

// Default export for backward compatibility
const Colors = defaultTheme;
export default Colors;

// Score gradient helpers
export function getScoreRingColor(score: number): string {
  if (score >= 70) return '#AAFF00';
  if (score >= 30) return '#FFD700';
  return '#FF4444';
}

// Monospace font
export const MONO_FONT = 'monospace';
