/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#101828',
    background: '#FFFFFF',
    backgroundElement: '#F5F7FA',
    backgroundSelected: '#E9EFF8',
    textSecondary: '#475467',
    royalBlue: '#1D4ED8',
    deepBlue: '#1E3A8A',
    purple: '#6D28D9',
    blueTint: '#EFF6FF',
    purpleTint: '#F5F3FF',
    border: '#D7DEE8',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B1220',
    backgroundElement: '#151F2E',
    backgroundSelected: '#202D40',
    textSecondary: '#B5C0D0',
    royalBlue: '#8AB4FF',
    deepBlue: '#C6D9FF',
    purple: '#C4A7FF',
    blueTint: '#14243A',
    purpleTint: '#241D38',
    border: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
