import React from 'react';
import { theme } from '../config/theme';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  noPadding = false,
  hoverable = false,
}) => {
  const styles = {
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      cursor: hoverable ? 'pointer' : 'default',
    },
    cardHover: hoverable ? {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    } : {},
    header: {
      padding: theme.spacing.md,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textPrimary,
      margin: 0,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: '0.25rem',
    },
    content: {
      padding: noPadding ? 0 : theme.spacing.md,
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className={className}
      style={{
        ...styles.card,
        ...(isHovered && styles.cardHover),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(title || subtitle) && (
        <div style={styles.header}>
          {title && <h3 style={styles.title}>{title}</h3>}
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Card;
