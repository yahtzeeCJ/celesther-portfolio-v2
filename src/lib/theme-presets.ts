export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  emoji: string;
  hueRotate?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'ocean', name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#0891b2', emoji: '🌊', hueRotate: '0deg' },
  { id: 'sunset', name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#ec4899', emoji: '🌅', hueRotate: '165deg' },
  { id: 'winter', name: 'Winter', primary: '#a5b4fc', secondary: '#c7d2fe', accent: '#e0e7ff', emoji: '❄️', hueRotate: '-20deg' },
  { id: 'forest', name: 'Forest', primary: '#22c55e', secondary: '#16a34a', accent: '#15803d', emoji: '🌲', hueRotate: '-100deg' },
  { id: 'neon', name: 'Neon', primary: '#a855f7', secondary: '#ec4899', accent: '#f43f5e', emoji: '⚡', hueRotate: '60deg' },
  { id: 'monochrome', name: 'Mono', primary: '#e4e4e7', secondary: '#a1a1aa', accent: '#71717a', emoji: '🖤', hueRotate: '0deg' }, // For mono, hue rotate doesn't matter much without grayscale, but we'll leave it 0deg
];
