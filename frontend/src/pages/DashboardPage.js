import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { theme } from '../config/theme';
import MetricCard from '../components/MetricCard';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    tyreHealth: 82,
    status: 'Good',
    lastScanTime: '2 hours ago',
    totalScans: 24,
  });

  // Mock trend data - in production, fetch from backend
  const trendData = [
    { date: 'Jan 10', wear: 15, threshold: 50 },
    { date: 'Jan 15', wear: 22, threshold: 50 },
    { date: 'Jan 20', wear: 28, threshold: 50 },
    { date: 'Jan 25', wear: 35, threshold: 50 },
    { date: 'Jan 30', wear: 42, threshold: 50 },
    { date: 'Feb 05', wear: 48, threshold: 50 },
    { date: 'Today', wear: 52, threshold: 50 },
  ];

  const recentScans = [
    { id: 1, date: '2024-02-05', wear: 52, status: 'Warning', recommendation: 'Consider replacement soon' },
    { id: 2, date: '2024-01-28', wear: 38, status: 'Good', recommendation: 'Tyres in good condition' },
    { id: 3, date: '2024-01-15', wear: 22, status: 'Healthy', recommendation: 'Excellent condition' },
  ];

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    alert: {
      padding: '1rem',
      backgroundColor: `${theme.colors.warning}15`,
      border: `1px solid ${theme.colors.warning}`,
      borderRadius: theme.borderRadius.md,
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    alertIcon: {
      color: theme.colors.warning,
    },
    alertText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      borderBottom: `2px solid ${theme.colors.border}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    td: {
      padding: '0.75rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
    },
  };

  const getHealthStatus = (wear) => {
    if (wear >= 75) return 'Critical';
    if (wear >= 50) return 'Warning';
    return 'Healthy';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Overview</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}!</p>
      </div>

      {/* Alert Section */}
      {dashboardData.tyreHealth < 50 && (
        <div style={styles.alert}>
          <AlertTriangle size={24} style={styles.alertIcon} />
          <div style={{ flex: 1 }}>
            <strong style={styles.alertText}>Predictive Alert: </strong>
            <span style={styles.alertText}>
              Your tyre wear is approaching critical levels. Consider scheduling maintenance soon.
            </span>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        <MetricCard
          title="Tyre Health"
          value={`${100 - dashboardData.tyreHealth}%`}
          subtitle="Current tread depth remaining"
          icon={<Activity size={24} />}
          color={dashboardData.tyreHealth < 50 ? theme.colors.success : theme.colors.warning}
        />
        <MetricCard
          title="Current Status"
          value={getHealthStatus(dashboardData.tyreHealth)}
          subtitle="Overall tyre condition"
          icon={dashboardData.tyreHealth < 50 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          color={dashboardData.tyreHealth < 50 ? theme.colors.success : theme.colors.warning}
        />
        <MetricCard
          title="Last Scan"
          value={dashboardData.lastScanTime}
          subtitle="Most recent analysis"
          icon={<Clock size={24} />}
          color={theme.colors.secondary}
        />
        <MetricCard
          title="Total Scans"
          value={dashboardData.totalScans}
          subtitle="Lifetime analyses"
          icon={<Activity size={24} />}
          color={theme.colors.accent}
          trend={{ isPositive: true, text: '+3 this week' }}
        />
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Trend Chart */}
        <Card title="Tread Wear Trend" subtitle="7-day wear progression">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={theme.colors.textSecondary}
                style={{ fontSize: '12px' }}
                label={{ value: 'Wear %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.colors.cardBg,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wear" 
                stroke={theme.colors.secondary} 
                strokeWidth={3}
                name="Wear Level"
                dot={{ fill: theme.colors.secondary, r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="threshold" 
                stroke={theme.colors.danger} 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Warning Threshold"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card title="Status Distribution" subtitle="Recent scan results">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'Healthy', count: 12 },
              { status: 'Good', count: 8 },
              { status: 'Warning', count: 3 },
              { status: 'Critical', count: 1 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis dataKey="status" stroke={theme.colors.textSecondary} />
              <YAxis stroke={theme.colors.textSecondary} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.colors.cardBg,
                  border: `1px solid ${theme.colors.border}`,
                }}
              />
              <Bar dataKey="count" fill={theme.colors.secondary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Scans Table */}
      <Card title="Recent Scans" subtitle="Your latest tyre analyses">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Wear %</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Recommendation</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((scan) => (
              <tr key={scan.id}>
                <td style={styles.td}>{scan.date}</td>
                <td style={styles.td}>{scan.wear}%</td>
                <td style={styles.td}>
                  <StatusBadge status={scan.status} size="sm" />
                </td>
                <td style={styles.td}>{scan.recommendation}</td>
                <td style={styles.td}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/reports')}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default DashboardPage;
