import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { theme } from '../config/theme';
import Button from '../components/Button';
import Card from '../components/Card';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (status === 409) {
        setError(apiMessage || 'User already exists. Try signing in instead.');
      } else if (apiMessage) {
        setError(apiMessage);
      } else {
        setError('Failed to register');
      }
      console.error(err);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: theme.colors.lightBg,
      padding: '2rem',
    },
    formCard: {
      width: '100%',
      maxWidth: '450px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textPrimary,
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      position: 'absolute',
      left: '1rem',
      color: theme.colors.textSecondary,
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.cardBg,
      color: theme.colors.textPrimary,
      transition: 'all 0.2s ease',
    },
    error: {
      padding: '0.75rem',
      backgroundColor: `${theme.colors.danger}15`,
      border: `1px solid ${theme.colors.danger}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
      textAlign: 'center',
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    link: {
      color: theme.colors.secondary,
      fontWeight: theme.typography.fontWeight.medium,
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <Card>
          <div style={styles.header}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Join SafeTread to start monitoring your tyre health</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="name" style={styles.label}>
                Full Name
              </label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.icon} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.secondary}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.icon} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.secondary}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.icon} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.secondary}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                />
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              icon={<UserPlus size={20} />}
            >
              Create Account
            </Button>
          </form>

          <div style={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
