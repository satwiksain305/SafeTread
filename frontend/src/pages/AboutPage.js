import React from 'react';
import { Target, Lightbulb } from 'lucide-react';
import { theme } from '../config/theme';
import Card from '../components/Card';

const AboutPage = () => {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      minHeight: '100vh',
    },
    hero: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '3rem 1rem',
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.textSecondary,
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    section: {
      marginBottom: '3rem',
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    sectionContent: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      lineHeight: 1.8,
      marginBottom: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem',
    },
    techCard: {
      padding: '1.5rem',
      textAlign: 'center',
    },
    techTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.secondary,
      marginBottom: '0.5rem',
    },
    techList: {
      listStyle: 'none',
      padding: 0,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    techItem: {
      padding: '0.5rem 0',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    highlight: {
      backgroundColor: `${theme.colors.accent}15`,
      padding: '1.5rem',
      borderRadius: theme.borderRadius.md,
      borderLeft: `4px solid ${theme.colors.accent}`,
      marginTop: '1rem',
    },
    highlightText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      fontStyle: 'italic',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.title}>About SafeTread</h1>
        <p style={styles.subtitle}>
          An intelligent AI-powered system designed to enhance road safety through 
          advanced tyre tread wear detection and predictive analytics.
        </p>
      </div>

      {/* Problem Statement */}
      <Card>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Target size={28} style={{ color: theme.colors.secondary }} />
            Problem Statement
          </h2>
          <p style={styles.sectionContent}>
            Tyre wear is a critical safety factor that contributes to thousands of road accidents 
            annually. Traditional inspection methods are either manual, time-consuming, or require 
            expensive specialized equipment. Many vehicle owners lack awareness about proper tyre 
            maintenance, leading to delayed replacements and increased accident risks.
          </p>
          <p style={styles.sectionContent}>
            Insufficient tread depth reduces vehicle traction, especially in wet conditions, 
            significantly increasing braking distance and the likelihood of skidding. Current 
            solutions fail to provide accessible, real-time, and predictive insights that can 
            prevent accidents before they occur.
          </p>
        </div>
      </Card>

      {/* Solution */}
      <Card>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Lightbulb size={28} style={{ color: theme.colors.accent }} />
            Our Solution
          </h2>
          <p style={styles.sectionContent}>
            SafeTread leverages cutting-edge computer vision and deep learning algorithms to 
            analyze tyre tread patterns from simple smartphone images. Our system provides:
          </p>
          <ul style={{ ...styles.sectionContent, paddingLeft: '2rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Instant Analysis:</strong> Upload a photo and receive immediate wear percentage 
              and health status
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Predictive Insights:</strong> AI-powered predictions for future wear patterns 
              and maintenance scheduling
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Accessibility:</strong> No specialized equipment needed - works with any 
              smartphone camera
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Historical Tracking:</strong> Monitor wear progression over time with 
              comprehensive reports
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Safety Alerts:</strong> Proactive notifications when tyres approach 
              critical wear levels
            </li>
          </ul>
          <div style={styles.highlight}>
            <p style={styles.highlightText}>
              "By democratizing access to tyre safety inspection, SafeTread empowers every 
              vehicle owner to make informed decisions and prevent accidents before they happen."
            </p>
          </div>
        </div>
      </Card>


    </div>
  );
};

export default AboutPage;
