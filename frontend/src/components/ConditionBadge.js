import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { theme } from '../config/theme';

/**
 * ConditionBadge Component
 * Displays tire condition with color-coded visual indicator
 * States: Safe (green), Warning (yellow), Critical (red)
 */
const ConditionBadge = ({ status = 'healthy', size = 'md' }) => {
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      icon: CheckCircle,
      color: theme.colors.success,
      bgColor: `${theme.colors.success}15`,
      borderColor: theme.colors.success,
      description: 'Your tyre is in excellent condition',
    },
    moderate: {
      label: 'Moderate Wear',
      icon: AlertCircle,
      color: theme.colors.warning,
      bgColor: `${theme.colors.warning}15`,
      borderColor: theme.colors.warning,
      description: 'Your tyre is showing normal wear',
    },
    warning: {
      label: 'Warning',
      icon: AlertTriangle,
      color: theme.colors.warning,
      bgColor: `${theme.colors.warning}15`,
      borderColor: theme.colors.warning,
      description: 'Schedule replacement soon',
    },
    critical: {
      label: 'Critical',
      icon: AlertTriangle,
      color: theme.colors.danger,
      bgColor: `${theme.colors.danger}15`,
      borderColor: theme.colors.danger,
      description: 'Immediate replacement required',
    },
  };

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
  const config = statusConfig[normalizedStatus] || statusConfig.healthy;
  const Icon = config.icon;

  const sizeMap = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: theme.typography.fontSize.sm,
      iconSize: 16,
      gapSize: '0.5rem',
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: theme.typography.fontSize.base,
      iconSize: 20,
      gapSize: '0.75rem',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: theme.typography.fontSize.lg,
      iconSize: 24,
      gapSize: '1rem',
    },
  };

  const sizeConfig = sizeMap[size] || sizeMap.md;

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: sizeConfig.gapSize,
      padding: sizeConfig.padding,
      backgroundColor: config.bgColor,
      border: `2px solid ${config.borderColor}`,
      borderRadius: theme.borderRadius.lg,
      fontSize: sizeConfig.fontSize,
      fontWeight: theme.typography.fontWeight.semibold,
      color: config.color,
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.5s ease-out',
    },
    icon: {
      color: config.color,
      flexShrink: 0,
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    main: {
      fontWeight: theme.typography.fontWeight.bold,
    },
    description: {
      fontSize: theme.typography.fontSize.xs,
      color: `${config.color}cc`,
      fontWeight: theme.typography.fontWeight.normal,
    },
  };

  return (
    <>
      <div style={styles.container}>
        <Icon size={sizeConfig.iconSize} style={styles.icon} />
        <div style={styles.label}>
          <div style={styles.main}>{config.label}</div>
          {size !== 'sm' && (
            <div style={styles.description}>{config.description}</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ConditionBadge;
