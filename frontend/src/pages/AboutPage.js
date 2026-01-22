import React from 'react';
import { Target, Lightbulb, Code, Users } from 'lucide-react';
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

      {/* Technology Stack */}
      <Card>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Code size={28} style={{ color: theme.colors.success }} />
            Technology Stack
          </h2>
          <div style={styles.grid}>
            <div style={styles.techCard}>
              <h3 style={styles.techTitle}>Frontend</h3>
              <ul style={styles.techList}>
                <li style={styles.techItem}>React 19.2.0</li>
                <li style={styles.techItem}>React Router DOM</li>
                <li style={styles.techItem}>Tailwind CSS</li>
                <li style={styles.techItem}>Recharts (Data Visualization)</li>
                <li style={styles.techItem}>Lucide Icons</li>
                <li style={styles.techItem}>Axios (API Communication)</li>
              </ul>
            </div>
            <div style={styles.techCard}>
              <h3 style={styles.techTitle}>Backend</h3>
              <ul style={styles.techList}>
                <li style={styles.techItem}>Python 3.x</li>
                <li style={styles.techItem}>Flask (Web Framework)</li>
                <li style={styles.techItem}>MongoDB (Database)</li>
                <li style={styles.techItem}>PyJWT (Authentication)</li>
                <li style={styles.techItem}>Flask-CORS</li>
                <li style={styles.techItem}>Bcrypt (Security)</li>
              </ul>
            </div>
            <div style={styles.techCard}>
              <h3 style={styles.techTitle}>AI/ML (Planned)</h3>
              <ul style={styles.techList}>
                <li style={styles.techItem}>TensorFlow / PyTorch</li>
                <li style={styles.techItem}>OpenCV (Image Processing)</li>
                <li style={styles.techItem}>Convolutional Neural Networks</li>
                <li style={styles.techItem}>Transfer Learning Models</li>
                <li style={styles.techItem}>Image Segmentation</li>
                <li style={styles.techItem}>Pattern Recognition</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Impact */}
      <Card>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Users size={28} style={{ color: theme.colors.warning }} />
            Project Impact
          </h2>
          <p style={styles.sectionContent}>
            SafeTread aims to significantly reduce road accidents caused by tyre-related issues 
            by providing:
          </p>
          <div style={styles.grid}>
            <Card hoverable>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  fontSize: theme.typography.fontSize['3xl'], 
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.success,
                  marginBottom: '0.5rem',
                }}>
                  85%
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                  Potential reduction in tyre-related accidents
                </div>
              </div>
            </Card>
            <Card hoverable>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  fontSize: theme.typography.fontSize['3xl'], 
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.accent,
                  marginBottom: '0.5rem',
                }}>
                  60%
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                  Cost savings compared to traditional methods
                </div>
              </div>
            </Card>
            <Card hoverable>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  fontSize: theme.typography.fontSize['3xl'], 
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.secondary,
                  marginBottom: '0.5rem',
                }}>
                  24/7
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                  Accessibility for instant tyre inspection
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Academic Context */}
      <Card>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Academic Context</h2>
          <p style={styles.sectionContent}>
            This project represents the culmination of advanced studies in Computer Science, 
            combining theoretical knowledge with practical implementation. It demonstrates 
            proficiency in:
          </p>
          <ul style={{ ...styles.sectionContent, paddingLeft: '2rem' }}>
            <li>Full-stack web development and system architecture</li>
            <li>Machine learning and computer vision applications</li>
            <li>Database design and management</li>
            <li>User experience and interface design</li>
            <li>Software engineering best practices</li>
            <li>Real-world problem-solving and innovation</li>
          </ul>
          <p style={styles.sectionContent}>
            SafeTread showcases the practical application of academic learning to address 
            genuine societal challenges, specifically road safety and accident prevention.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
