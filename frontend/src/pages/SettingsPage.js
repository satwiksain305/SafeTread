import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Bell, Shield, User } from 'lucide-react';
import { theme } from '../config/theme';
import Card from '../components/Card';
import Button from '../components/Button';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    critical: true,
  });

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: darkMode ? theme.colors.darkBg : theme.colors.lightBg,
      minHeight: '100vh',
      transition: 'background-color 0.3s ease',
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: darkMode ? '#FFFFFF' : theme.colors.primary,
      marginBottom: '2rem',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: darkMode ? '#FFFFFF' : theme.colors.primary,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: `1px solid ${darkMode ? '#1E293B' : theme.colors.border}`,
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.base,
      color: darkMode ? '#E2E8F0' : theme.colors.textPrimary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    settingDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: darkMode ? '#94A3B8' : theme.colors.textSecondary,
      marginTop: '0.25rem',
    },
    toggle: {
      position: 'relative',
      width: '3rem',
      height: '1.5rem',
      backgroundColor: darkMode ? theme.colors.accent : '#CBD5E1',
      borderRadius: theme.borderRadius.full,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    toggleActive: {
      backgroundColor: theme.colors.secondary,
    },
    toggleKnob: {
      position: 'absolute',
      top: '0.125rem',
      left: '0.125rem',
      width: '1.25rem',
      height: '1.25rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '50%',
      transition: 'transform 0.3s ease',
    },
    toggleKnobActive: {
      transform: 'translateX(1.5rem)',
    },
    themePreview: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '1rem',
    },
    colorBox: {
      padding: '1rem',
      borderRadius: theme.borderRadius.md,
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In production, save to localStorage or backend
  };

  const toggleNotification = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const Toggle = ({ active, onChange }) => (
    <div 
      style={{
        ...styles.toggle,
        ...(active && styles.toggleActive),
      }}
      onClick={onChange}
    >
      <div 
        style={{
          ...styles.toggleKnob,
          ...(active && styles.toggleKnobActive),
        }}
      />
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      {/* Appearance Settings */}
      <Card style={{ backgroundColor: darkMode ? '#1E293B' : theme.colors.cardBg }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Palette size={20} />
            Appearance
          </h2>
          
          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>
                {darkMode ? <Moon size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> : <Sun size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                Dark Mode
              </div>
              <div style={styles.settingDescription}>
                Switch between light and dark theme
              </div>
            </div>
            <Toggle active={darkMode} onChange={toggleDarkMode} />
          </div>

          {/* Theme Preview */}
          <div style={{ marginTop: '2rem' }}>
            <div style={styles.settingLabel}>Color Palette</div>
            <div style={styles.themePreview}>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.primary }}>
                Primary
              </div>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.secondary }}>
                Secondary
              </div>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.accent }}>
                Accent
              </div>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.success }}>
                Success
              </div>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.warning }}>
                Warning
              </div>
              <div style={{ ...styles.colorBox, backgroundColor: theme.colors.danger }}>
                Danger
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card style={{ backgroundColor: darkMode ? '#1E293B' : theme.colors.cardBg }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Bell size={20} />
            Notifications
          </h2>
          
          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Email Notifications</div>
              <div style={styles.settingDescription}>
                Receive scan results and updates via email
              </div>
            </div>
            <Toggle 
              active={notifications.email} 
              onChange={() => toggleNotification('email')} 
            />
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Push Notifications</div>
              <div style={styles.settingDescription}>
                Get real-time alerts on your device
              </div>
            </div>
            <Toggle 
              active={notifications.push} 
              onChange={() => toggleNotification('push')} 
            />
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Critical Alerts</div>
              <div style={styles.settingDescription}>
                Important safety warnings for critical tyre wear
              </div>
            </div>
            <Toggle 
              active={notifications.critical} 
              onChange={() => toggleNotification('critical')} 
            />
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card style={{ backgroundColor: darkMode ? '#1E293B' : theme.colors.cardBg }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Shield size={20} />
            Privacy & Security
          </h2>
          
          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Data Retention</div>
              <div style={styles.settingDescription}>
                Keep scan history for 90 days
              </div>
            </div>
            <Toggle active={true} onChange={() => {}} />
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Anonymous Analytics</div>
              <div style={styles.settingDescription}>
                Help improve SafeTread with usage data
              </div>
            </div>
            <Toggle active={true} onChange={() => {}} />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="danger" size="sm">
              Delete All Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card style={{ backgroundColor: darkMode ? '#1E293B' : theme.colors.cardBg }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <User size={20} />
            Account
          </h2>
          
          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Change Password</div>
              <div style={styles.settingDescription}>
                Update your account password
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Change
            </Button>
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Export Data</div>
              <div style={styles.settingDescription}>
                Download all your scan data
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Export
            </Button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="secondary" size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
