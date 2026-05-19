import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Settings, LogOut, BarChart3, Upload, Info, Home } from 'lucide-react';
import { theme } from '../config/theme';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const styles = {
    nav: {
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadows.md,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem',
    },
    navContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '4rem',
    },
    logo: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navLink: {
      color: 'rgba(255, 255, 255, 0.85)',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navLinkHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
    },
    activeLink: {
      backgroundColor: theme.colors.accent,
      color: '#FFFFFF',
    },
    button: {
      backgroundColor: 'transparent',
      border: `1px solid rgba(255, 255, 255, 0.3)`,
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    mobileMenuButton: {
      display: 'none',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#FFFFFF',
      cursor: 'pointer',
      padding: '0.5rem',
    },
    mobileMenu: {
      display: 'none',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem 0',
      backgroundColor: theme.colors.primary,
    },
  };

  const NavLinkComponent = ({ to, icon, children, isExternal = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (isExternal) {
      return (
        <a
          href={to}
          style={{
            ...styles.navLink,
            ...(isHovered && styles.navLinkHover),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {icon}
          {children}
        </a>
      );
    }

    return (
      <NavLink
        to={to}
        style={({ isActive }) => ({
          ...styles.navLink,
          ...(isActive && styles.activeLink),
          ...(isHovered && !isActive && styles.navLinkHover),
        })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {icon}
        {children}
      </NavLink>
    );
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.navContent}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <Home size={24} />
            SafeTread
          </Link>

          {/* Desktop Navigation */}
          <div style={{ ...styles.navLinks, display: window.innerWidth < 768 ? 'none' : 'flex' }}>
            {user ? (
              <>
                <NavLinkComponent to="/dashboard" icon={<BarChart3 size={18} />}>
                  Dashboard
                </NavLinkComponent>
                <NavLinkComponent to="/upload" icon={<Upload size={18} />}>
                  Analyze
                </NavLinkComponent>
                <NavLinkComponent to="/reports" icon={<BarChart3 size={18} />}>
                  Reports
                </NavLinkComponent>
                <NavLinkComponent to="/about" icon={<Info size={18} />}>
                  About
                </NavLinkComponent>
                <NavLinkComponent to="/settings" icon={<Settings size={18} />}>
                  Settings
                </NavLinkComponent>
                <button 
                  onClick={handleLogout} 
                  style={styles.button}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLinkComponent to="/" icon={<Home size={18} />}>
                  Home
                </NavLinkComponent>
                <NavLinkComponent to="/about" icon={<Info size={18} />}>
                  About
                </NavLinkComponent>
                <NavLinkComponent to="/login">
                  Login
                </NavLinkComponent>
                <NavLinkComponent to="/register">
                  Register
                </NavLinkComponent>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            style={{
              ...styles.mobileMenuButton,
              display: window.innerWidth < 768 ? 'block' : 'none',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={styles.mobileMenu}>
            {user ? (
              <>
                <NavLinkComponent to="/dashboard" icon={<BarChart3 size={18} />}>
                  Dashboard
                </NavLinkComponent>
                <NavLinkComponent to="/upload" icon={<Upload size={18} />}>
                  Analyze
                </NavLinkComponent>
                <NavLinkComponent to="/reports" icon={<BarChart3 size={18} />}>
                  Reports
                </NavLinkComponent>
                <NavLinkComponent to="/about" icon={<Info size={18} />}>
                  About
                </NavLinkComponent>
                <NavLinkComponent to="/settings" icon={<Settings size={18} />}>
                  Settings
                </NavLinkComponent>
                <button onClick={handleLogout} style={styles.button}>
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLinkComponent to="/" icon={<Home size={18} />}>
                  Home
                </NavLinkComponent>
                <NavLinkComponent to="/about" icon={<Info size={18} />}>
                  About
                </NavLinkComponent>
                <NavLinkComponent to="/login">
                  Login
                </NavLinkComponent>
                <NavLinkComponent to="/register">
                  Register
                </NavLinkComponent>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
