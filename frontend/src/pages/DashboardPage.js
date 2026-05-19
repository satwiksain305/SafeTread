import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { theme } from '../config/theme';
import MetricCard from '../components/MetricCard';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

// Module-level helper — no stale closure possible
const computeTimeAgo = (date) => {
  if (!date) return 'No scans yet';
  const timeDiff = Date.now() - date.getTime();
  if (timeDiff < 0) return 'Just now';
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours   / 24);
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours   < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allScans, setAllScans] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    tyreHealth: 0,
    status: 'Unknown',
    totalScans: 0,
  });
  const [lastScanTimeAgo, setLastScanTimeAgo] = useState('No scans yet');
  // Keep a ref to the latest scan date so the tick interval never reads stale state
  const lastScanDateRef = useRef(null);
  const [trendData, setTrendData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);

  const fetchScans = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      // Use the correct endpoint that returns prediction history
      const response = await apiClient.get('/api/prediction-history');
      const historyItems = response.data.history || [];
      const scans = historyItems.map((item, index) => {
        // Only use the created_at field for time — it is a full ISO datetime string
        // IMPORTANT: bare 'YYYY-MM-DD' strings (item.date) parse as midnight UTC in JS,
        // causing a wrong ~20h offset. We must ONLY use full datetime strings with a time component.
        const rawDateStr = item.created_at || item.analyzed_at || null;
        
        let analyzedDate = null;
        if (rawDateStr) {
          const parsed = new Date(rawDateStr);
          // Only accept if it has a real time component (not midnight UTC from a date-only parse)
          // Check if the rawDateStr contains 'T' (has time part) or is a full ISO with time
          const hasTimeComponent = rawDateStr.includes('T') || /\d{4}-\d{2}-\d{2}T/.test(rawDateStr);
          if (!isNaN(parsed.getTime()) && hasTimeComponent) {
            analyzedDate = parsed;
          }
        }

        // Read wear_level (new field) or fall back to 100 - health_score
        const rawWear = item.wear_level != null ? item.wear_level : (100 - (item.health_score || 0));
        const wear = isNaN(parseFloat(rawWear)) ? 0 : Math.round(parseFloat(rawWear));
        return {
          id: item.id || index + 1,
          date: item.date || (analyzedDate ? analyzedDate.toLocaleDateString('en-CA') : 'Unknown'),
          wear,
          status: item.prediction || item.status || 'Unknown',
          recommendation: item.recommendation || '',
          isMockPrediction: item.model_used === 'Mock' || item.model_type?.includes?.('Mock'),
          analyzedAt: analyzedDate, // null if no real datetime available
          rawData: item,
        };
      });

      setAllScans(scans);
      calculateDashboardData(scans);
      generateTrendData(scans);
      generateStatusDistribution(scans);
    } catch (error) {
      console.error('Failed to fetch scan history:', error);
      if (!isBackground) {
        setAllScans([]);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const calculateDashboardData = (scans) => {
    if (scans.length === 0) {
      setDashboardData({ tyreHealth: 0, status: 'No Data', totalScans: 0 });
      lastScanDateRef.current = null;
      setLastScanTimeAgo('No scans yet');
      return;
    }

    const latestScan = scans[0];
    const lastScanDate =
      latestScan.analyzedAt instanceof Date && !isNaN(latestScan.analyzedAt)
        ? latestScan.analyzedAt
        : null;

    // Update the ref first so the interval always reads the fresh value
    lastScanDateRef.current = lastScanDate;

    setDashboardData({
      tyreHealth: latestScan.wear,
      status: latestScan.status,
      totalScans: scans.length,
    });
    // Compute immediately — no stale closure risk because computeTimeAgo is module-level
    setLastScanTimeAgo(computeTimeAgo(lastScanDate));
  };

  const generateTrendData = (scans) => {
    if (scans.length === 0) {
      setTrendData([]);
      return;
    }

    const last7Scans = scans.slice(0, 7).reverse();
    const trend = last7Scans.map(scan => ({
      date: new Date(scan.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      // Ensure wear is always a valid number for the chart
      wear: typeof scan.wear === 'number' && !isNaN(scan.wear) ? scan.wear : 0,
      threshold: 50,
    }));
    setTrendData(trend);
  };

  const generateStatusDistribution = (scans) => {
    const statusCounts = {
      'Healthy': 0,
      'Good': 0,
      'Warning': 0,
      'Critical': 0,
    };

    scans.forEach(scan => {
      if (statusCounts.hasOwnProperty(scan.status)) {
        statusCounts[scan.status]++;
      }
    });

    const distribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    setStatusDistribution(distribution);
  };

  useEffect(() => {
    fetchScans();
    // Refresh data every 30 seconds in the background
    const dataIntervalId = setInterval(() => {
      fetchScans(true);
    }, 30000);
    return () => clearInterval(dataIntervalId);
  }, []);

  // Independently refresh the "Last Scan" time label every 60 seconds
  // Uses a ref so the closure always reads the latest date, never stale
  useEffect(() => {
    const tickIntervalId = setInterval(() => {
      setLastScanTimeAgo(computeTimeAgo(lastScanDateRef.current));
    }, 60000);
    return () => clearInterval(tickIntervalId);
  }, []); // empty deps — ref never triggers re-subscription

  const recentScans = allScans.slice(0, 3);

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
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
        <div>
          <h1 style={styles.title}>Dashboard Overview</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}!</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchScans}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textSecondary }}>
          Loading dashboard data...
        </div>
      ) : allScans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: theme.colors.textSecondary, marginBottom: '1rem' }}>
            No tire scans yet. Upload your first tire image to get started!
          </p>
          <Button onClick={() => navigate('/upload')}>Upload Tire Image</Button>
        </div>
      ) : (
        <>
          {/* Alert Section */}
          {dashboardData.tyreHealth >= 50 && (
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

          {/* Metrics Grid — only Current Status, Last Scan, Total Scans */}
          <div style={styles.metricsGrid}>
            <MetricCard
              title="Current Status"
              value={dashboardData.status}
              subtitle="Overall tyre condition"
              icon={dashboardData.tyreHealth >= 50 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              color={dashboardData.tyreHealth >= 80 ? theme.colors.danger : dashboardData.tyreHealth >= 50 ? theme.colors.warning : theme.colors.success}
            />
            <MetricCard
              title="Last Scan"
              value={lastScanTimeAgo}
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
            />
          </div>

          {/* Charts Grid */}
          <div style={styles.chartsGrid}>
            {/* Trend Chart */}
            <Card title="Tread Wear Trend" subtitle={`${trendData.length > 0 ? 'Recent' : 'No'} wear progression`}>
              {trendData.length > 0 ? (
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
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.textSecondary }}>
                  No trend data available yet
                </div>
              )}
            </Card>

            {/* Status Distribution */}
            <Card title="Status Distribution" subtitle="Scan results breakdown">
              {statusDistribution.length > 0 && statusDistribution.some(s => s.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistribution}>
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
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.textSecondary }}>
                  No distribution data available yet
                </div>
              )}
            </Card>
          </div>

          {/* Recent Scans Table */}
          <Card title="Recent Scans" subtitle="Your latest tyre analyses">
            {recentScans.length > 0 ? (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StatusBadge status={scan.status} size="sm" />
                          {scan.isMockPrediction && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: '#FFA50033',
                              color: '#FF8C00',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}>
                              MOCK
                            </span>
                          )}
                        </div>
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
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.textSecondary }}>
                No recent scans available
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
