import React from 'react';
import { theme, getStatusColor } from '../config/theme';

const StatusBadge = ({ status, size = 'md', showDot = true }) => {
  const statusColor = getStatusColor(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const styles = {
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      borderRadius: theme.borderRadius.full,
      fontWeight: theme.typography.fontWeight.medium,
      backgroundColor: `${statusColor}15`,
      color: statusColor,
      border: `1px solid ${statusColor}40`,
      transition: 'all 0.2s ease-in-out',
    },
    dot: {
      borderRadius: '50%',
      backgroundColor: statusColor,
    },
  };

  return (
    <span 
      className={sizeClasses[size]} 
      style={styles.badge}
    >
      {showDot && (
        <span 
          className={dotSizes[size]} 
          style={styles.dot}
        />
      )}
      <span style={{ textTransform: 'capitalize' }}>
        {status}
      </span>
    </span>
  );
};

export default StatusBadge;
