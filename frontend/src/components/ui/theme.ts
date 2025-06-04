// Theme variables for the application
// This centralizes all design tokens for consistency

// Color palette
export const colors = {
  // Primary colors
  primary: {
    main: '#0078d4', // Microsoft blue
    light: '#2b88d8',
    dark: '#005a9e',
    contrastText: '#ffffff',
  },
  // Secondary colors
  secondary: {
    main: '#0078d4',
    light: '#e6f3ff',
    dark: '#004578',
    contrastText: '#ffffff',
  },
  // Grey palette
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Feedback colors
  success: {
    main: '#107c10', // Green
    light: '#dff6dd',
    dark: '#054b05',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d83b01', // Red
    light: '#fed9cc',
    dark: '#a80000',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffb900', // Yellow
    light: '#fff4ce',
    dark: '#d18f00',
    contrastText: '#000000',
  },
  info: {
    main: '#0078d4', // Blue
    light: '#e6f3ff',
    dark: '#004578',
    contrastText: '#ffffff',
  },
  // Common colors
  common: {
    black: '#000000',
    white: '#ffffff',
    transparent: 'transparent',
  },
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#9e9e9e',
  },
  // Background colors
  background: {
    default: '#ffffff',
    paper: '#f9f9f9',
    alt: '#f3f2f1',
  },
  // Divider
  divider: '#e0e0e0',
};

// Spacing system (in pixels)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
  unit: 8, // Base unit for calculations
  // Helper function to get spacing by multiples of the unit
  get: (multiplier: number) => `${multiplier * spacing.unit}px`,
};

// Typography
export const typography = {
  fontFamily: {
    primary:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    code: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    xxl: '1.5rem', // 24px
    xxxl: '2rem', // 32px
  },
  lineHeight: {
    xs: 1.1,
    sm: 1.25,
    md: 1.5,
    lg: 1.75,
    xl: 2,
  },
};

// Responsive breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
} as const;

// Media query helpers
export const media = {
  up: (key: keyof typeof breakpoints) =>
    `@media (min-width: ${breakpoints[key]})`,
  down: (key: keyof typeof breakpoints) =>
    `@media (max-width: ${breakpoints[key]})`,
};

// Border radius
export const borderRadius = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  circle: '50%',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
};

// Transitions
export const transitions = {
  duration: {
    short: '150ms',
    medium: '300ms',
    long: '500ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Z-index values
export const zIndex = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Export a default theme object that combines all the above
export const theme = {
  colors,
  spacing,
  typography,
  breakpoints,
  media,
  borderRadius,
  shadows,
  transitions,
  zIndex,
};

export default theme;
