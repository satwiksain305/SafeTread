import React from 'react';
import { theme, getWearColor } from '../config/theme';

/**
 * WearSeverityIndicator Component
 * Displays a professional progress bar and meter for tire wear percentage
 * with smooth animations and contextual coloring
 */
const WearSeverityIndicator = ({ wearPercentage = 0 }) => {
  // Clamp wear percentage between 0 and 100
  const safWear = Math.min(Math.max(wearPercentage, 0), 100);

  // Determine severity level
  const getSeverityLevel = (wear) => {
    if (wear < 33) return 'safe';
    if (wear < 66) return 'warning';
    return 'critical';
  };

  const severity = getSeverityLevel(safWear);
  const colorMap = {
    safe: theme.colors.success,
    warning: theme.colors.warning,
    critical: theme.colors.danger,
  };

  const severityLabel = {
    safe: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  };

  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textPrimary,
    },
    severityBadge: {
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.full,
      backgroundColor: colorMap[severity],
      color: '#fff',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    progressWrapper: {
      marginBottom: '2rem',
    },
    progressLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: `${colorMap[severity]}15`,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
      border: `1px solid ${theme.colors.border}`,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colorMap[severity],
      width: `${safWear}%`,
      transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      borderRadius: theme.borderRadius.full,
      boxShadow: `0 0 8px ${colorMap[severity]}40`,
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
    },
    metric: {
      padding: '1rem',
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.md,
      textAlign: 'center',
      border: `1px solid ${theme.colors.border}`,
    },
    metricLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    metricValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: colorMap[severity],
    },
    metricSubtext: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: '0.25rem',
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: `${colorMap[severity]}10`,
      borderLeft: `4px solid ${colorMap[severity]}`,
      borderRadius: theme.borderRadius.md,
    },
    statusDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: colorMap[severity],
      animation: severity === 'critical' ? 'pulse 2s infinite' : 'none',
    },
    statusText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
      fontWeight: theme.typography.fontWeight.medium,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header with Severity Badge */}
      <div style={styles.header}>
        <span style={styles.title}>Wear Severity Analysis</span>
        <span style={styles.severityBadge}>
          {severityLabel[severity]}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressWrapper}>
        <div style={styles.progressLabel}>
          <span>Wear Level</span>
          <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
            {safWear}%
          </span>
        </div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Remaining Life</div>
          <div style={styles.metricValue}>
            {Math.max(0, 100 - safWear)}%
          </div>
          <div style={styles.metricSubtext}>Est. tread depth</div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>Risk Level</div>
          <div style={{ ...styles.metricValue, fontSize: theme.typography.fontSize.lg }}>
            {severity === 'safe' && '🟢 Low'}
            {severity === 'warning' && '🟡 Medium'}
            {severity === 'critical' && '🔴 High'}
          </div>
          <div style={styles.metricSubtext}>Action needed</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div style={styles.statusIndicator}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>
          {severity === 'safe' && 'Your tyre is in good condition. Continue monitoring.'}
          {severity === 'warning' && 'Your tyre is showing signs of wear. Schedule replacement soon.'}
          {severity === 'critical' && 'Your tyre requires immediate replacement for safety.'}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WearSeverityIndicator;
