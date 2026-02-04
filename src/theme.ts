/**
 * Axis Communications Brand Theme
 */

import type { AxisTheme } from '@/types';

export const theme: AxisTheme = {
  colors: {
    primary: '#FFCC33',      // Axis Yellow
    secondary: '#FF0033',    // Axis Red
    bgMain: '#FFFFFF',
    bgAlt: '#F7F7F7',
    bgCard: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#E0E0E0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    ndaa: '#FF0033',
    cloud: '#7C3AED',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
  },
};

export default theme;
