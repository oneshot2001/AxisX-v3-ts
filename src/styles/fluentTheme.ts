/**
 * Axis Communications Fluent UI Theme
 *
 * Custom theme tokens based on Axis brand guidelines.
 * Primary: #FFCC33 (Axis Yellow)
 * Secondary: #FF0033 (Axis Red)
 */

import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from '@fluentui/react-components';

// =============================================================================
// AXIS BRAND COLORS
// =============================================================================

/**
 * Axis yellow palette generated for Fluent UI compatibility.
 * Scale from 10 (lightest) to 160 (darkest).
 */
const axisBrand: BrandVariants = {
  10: '#FFF9E6',
  20: '#FFF3CC',
  30: '#FFECB3',
  40: '#FFE699',
  50: '#FFDF80',
  60: '#FFD966',
  70: '#FFD24D',
  80: '#FFCC33', // Primary Axis Yellow
  90: '#E6B82E',
  100: '#CCa329',
  110: '#B38F24',
  120: '#997A1F',
  130: '#80661A',
  140: '#665214',
  150: '#4D3D0F',
  160: '#33290A',
};

// =============================================================================
// THEME CREATION
// =============================================================================

/**
 * Axis Light Theme - Primary theme for the application
 */
export const axisLightTheme: Theme = {
  ...createLightTheme(axisBrand),
  // Override specific tokens for better brand alignment
  colorBrandForeground1: '#1A1A1A',
  colorBrandForeground2: '#1A1A1A',
  colorNeutralForeground1: '#1A1A1A',
  colorNeutralForeground2: '#4A4A4A',
  colorNeutralForeground3: '#888888',
  colorNeutralBackground1: '#FFFFFF',
  colorNeutralBackground2: '#F7F7F7',
  colorNeutralBackground3: '#EFEFEF',
  colorNeutralStroke1: '#E0E0E0',
  colorNeutralStroke2: '#D0D0D0',
  // Status colors
  colorPaletteRedBackground3: '#FF0033', // NDAA / Error
  colorPaletteRedForeground1: '#FF0033',
  colorPaletteGreenBackground3: '#10B981', // Success
  colorPaletteGreenForeground1: '#10B981',
  colorPaletteYellowBackground3: '#F59E0B', // Warning
  colorPaletteYellowForeground1: '#F59E0B',
  // Focus ring
  colorStrokeFocus1: '#FFCC33',
  colorStrokeFocus2: '#1A1A1A',
};

/**
 * Axis Dark Theme - For dark mode support
 */
export const axisDarkTheme: Theme = {
  ...createDarkTheme(axisBrand),
  colorBrandForeground1: '#FFCC33',
  colorBrandForeground2: '#FFD966',
  colorNeutralForeground1: '#FFFFFF',
  colorNeutralForeground2: '#E0E0E0',
  colorNeutralForeground3: '#A0A0A0',
  colorNeutralBackground1: '#1A1A1A',
  colorNeutralBackground2: '#262626',
  colorNeutralBackground3: '#333333',
  colorNeutralStroke1: '#404040',
  colorNeutralStroke2: '#4A4A4A',
  colorStrokeFocus1: '#FFCC33',
  colorStrokeFocus2: '#FFFFFF',
};

// =============================================================================
// SEMANTIC TOKENS
// =============================================================================

/**
 * Axis-specific semantic color tokens for use throughout the app.
 * These extend Fluent UI with security-industry specific categories.
 */
export const axisTokens = {
  // Brand
  primary: '#FFCC33',
  primaryDark: '#E6B82E',
  primaryLight: '#FFE699',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Security categories
  ndaa: '#FF0033',        // NDAA banned (Hikvision, Dahua, Uniview)
  cloud: '#7C3AED',       // Cloud-dependent (Verkada, Rhombus)
  legacyAxis: '#FFCC33',  // Legacy Axis models

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#888888',

  // Backgrounds
  bgMain: '#FFFFFF',
  bgAlt: '#F7F7F7',
  bgCard: '#FFFFFF',

  // Borders
  border: '#E0E0E0',
  borderHover: '#CCCCCC',
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default axisLightTheme;
