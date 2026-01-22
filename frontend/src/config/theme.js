// SafeTread Theme Configuration
// Centralized color palette for consistent design across the application

export const theme = {
  colors: {
    primary: '#0A2540',
    secondary: '#1E90FF',
    accent: '#00B4D8',
    success: '#2ECC71',
    warning: '#F4A261',
    danger: '#E63946',
    lightBg: '#F5F7FA',
    darkBg: '#0B132B',
    cardBg: '#FFFFFF',
    textPrimary: '#1C1C1C',
    textSecondary: '#6C757D',
    border: '#E5E7EB',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

// Status-based utilities
export const getStatusColor = (status) => {
  const statusMap = {
    healthy: theme.colors.success,
    good: theme.colors.success,
    warning: theme.colors.warning,
    moderate: theme.colors.warning,
    critical: theme.colors.danger,
    danger: theme.colors.danger,
  };
  return statusMap[status?.toLowerCase()] || theme.colors.textSecondary;
};

export const getWearColor = (wearPercentage) => {
  if (wearPercentage >= 75) return theme.colors.danger;
  if (wearPercentage >= 50) return theme.colors.warning;
  return theme.colors.success;
};

export default theme;
