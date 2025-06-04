/**
 * AI Ground Truth Generator - Theme Configuration
 *
 * This file contains the application's theme settings for colors, typography, spacing, etc.
 * Customize these values to match your organization's branding and design guidelines.
 */

const theme = {
  /**
   * Color Palette
   * Customize these colors to match your organization's branding
   */
  colors: {
    // Primary colors
    primary: '#0078d4', // Microsoft blue
    primaryDark: '#106ebe',
    primaryLight: '#c7e0f4',

    // Secondary colors
    secondary: '#2b88d8',
    secondaryDark: '#0063b1',
    secondaryLight: '#deecf9',

    // Accent colors
    accent: '#ffaa44',

    // Semantic colors
    success: '#107c10',
    warning: '#ffb900',
    error: '#d13438',
    info: '#0078d4',

    // Text colors
    textPrimary: '#323130',
    textSecondary: '#605e5c',
    textDisabled: '#a19f9d',
    textInverse: '#ffffff',

    // Background colors
    background: '#ffffff',
    backgroundLight: '#f3f2f1',
    backgroundDark: '#edebe9',

    // Border colors
    border: '#8a8886',
    borderLight: '#c8c6c4',
  },

  /**
   * Typography
   * Customize font settings to match your organization's style guide
   */
  typography: {
    fontFamily:
      "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    fontFamilyMonospace: "'Consolas', 'Courier New', monospace",

    // Font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    // Font sizes
    fontSize: {
      tiny: '0.75rem', // 12px
      small: '0.875rem', // 14px
      base: '1rem', // 16px
      medium: '1.125rem', // 18px
      large: '1.25rem', // 20px
      xl: '1.5rem', // 24px
      xxl: '1.75rem', // 28px
      xxxl: '2rem', // 32px
    },
  },

  /**
   * Spacing
   * Consistent spacing values to use throughout the application
   */
  spacing: {
    xxs: '0.125rem', // 2px
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem', // 48px
    xxxl: '4rem', // 64px
  },

  /**
   * Border Radius
   * Customize the roundness of UI elements
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    xl: '1rem', // 16px
    round: '50%', // Circular
  },

  /**
   * Shadows
   * Customize elevation and depth effects
   */
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },

  /**
   * Transitions
   * Customize animation durations and easing functions
   */
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  /**
   * Z-index
   * Consistent z-index values for layering elements
   */
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },

  /**
   * Breakpoints
   * Responsive design breakpoints
   */
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  },
};

export default theme;
