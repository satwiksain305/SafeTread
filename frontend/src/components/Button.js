import React from 'react';
import { theme } from '../config/theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
  className = '',
}) => {
  const variants = {
    primary: {
      backgroundColor: theme.colors.secondary,
      color: '#FFFFFF',
      border: 'none',
      hover: {
        backgroundColor: theme.colors.accent,
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.secondary,
      border: `2px solid ${theme.colors.secondary}`,
      hover: {
        backgroundColor: theme.colors.secondary,
        color: '#FFFFFF',
      },
    },
    success: {
      backgroundColor: theme.colors.success,
      color: '#FFFFFF',
      border: 'none',
      hover: {
        backgroundColor: '#27AE60',
      },
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: '#FFFFFF',
      border: 'none',
      hover: {
        backgroundColor: '#C92A36',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.textPrimary,
      border: 'none',
      hover: {
        backgroundColor: theme.colors.lightBg,
      },
    },
  };

  const sizes = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...sizes[size],
    ...variants[variant],
    ...(isHovered && !disabled && variants[variant].hover),
  };

  return (
    <button
      type={type}
      className={className}
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
