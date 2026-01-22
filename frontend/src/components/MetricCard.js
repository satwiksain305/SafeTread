import React from 'react';
import { theme } from '../config/theme';

const MetricCard = ({ title, value, subtitle, icon, color, trend }) => {
  const styles = {
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      boxShadow: theme.shadows.md,
      transition: 'all 0.3s ease-in-out',
      border: `1px solid ${theme.colors.border}`,
    },
    iconContainer: {
      width: '3rem',
      height: '3rem',
      borderRadius: theme.borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color ? `${color}15` : `${theme.colors.secondary}15`,
      color: color || theme.colors.secondary,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: '0.5rem',
    },
    value: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: color || theme.colors.textPrimary,
      marginBottom: '0.25rem',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    trend: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: trend?.isPositive ? theme.colors.success : theme.colors.danger,
      marginTop: '0.5rem',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? theme.shadows.lg : theme.shadows.md,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && (
        <div style={styles.iconContainer}>
          {icon}
        </div>
      )}
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
      {trend && (
        <div style={styles.trend}>
          {trend.isPositive ? '↑' : '↓'} {trend.text}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
