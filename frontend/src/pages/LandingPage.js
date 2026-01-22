import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, TrendingUp, AlertCircle } from 'lucide-react';
import { theme } from '../config/theme';
import Button from '../components/Button';
import Card from '../components/Card';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    hero: {
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      color: '#FFFFFF',
      padding: '5rem 2rem',
      textAlign: 'center',
    },
    heroTitle: {
      fontSize: theme.typography.fontSize['5xl'],
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: '1rem',
      lineHeight: 1.2,
    },
    heroTagline: {
      fontSize: theme.typography.fontSize.xl,
      marginBottom: '2rem',
      opacity: 0.95,
      maxWidth: '700px',
      margin: '0 auto 2rem',
    },
    features: {
      padding: '4rem 2rem',
      backgroundColor: theme.colors.lightBg,
    },
    featuresGrid: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: '3rem',
    },
    featureIcon: {
      width: '3.5rem',
      height: '3.5rem',
      margin: '0 auto 1rem',
      color: theme.colors.secondary,
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textPrimary,
      marginBottom: '0.75rem',
      textAlign: 'center',
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 1.6,
    },
    cta: {
      padding: '4rem 2rem',
      backgroundColor: theme.colors.cardBg,
      textAlign: 'center',
    },
    ctaTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '1rem',
    },
    ctaText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem',
    },
  };

  const features = [
    {
      icon: <Camera size={56} />,
      title: 'Real-time Detection',
      description: 'Instantly analyze tyre tread wear using advanced computer vision and AI algorithms.',
    },
    {
      icon: <TrendingUp size={56} />,
      title: 'Predictive Analysis',
      description: 'Get insights on future wear patterns and maintenance schedules before issues arise.',
    },
    {
      icon: <Shield size={56} />,
      title: 'Camera-Based (No Sensors)',
      description: 'No expensive sensors needed. Just capture an image with your smartphone camera.',
    },
    {
      icon: <AlertCircle size={56} />,
      title: 'Road Safety Enhancement',
      description: 'Prevent accidents by ensuring tyres are in optimal condition at all times.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={styles.heroTitle}>SafeTread</h1>
          <p style={styles.heroTagline}>
            AI-Powered Tyre Tread Wear Detection for Safer Roads
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/upload')}
              icon={<Camera size={20} />}
            >
              Analyze Tyre
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              onClick={() => navigate('/about')}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose SafeTread?</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card key={index} hoverable>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <p style={styles.ctaText}>
          Join thousands of users who trust SafeTread to keep their vehicles safe and road-ready.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;
