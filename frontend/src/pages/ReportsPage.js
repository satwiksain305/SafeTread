import React, { useState, useEffect } from 'react';
import { Filter, Download, Eye, Calendar, RefreshCw } from 'lucide-react';
import { theme } from '../config/theme';
import apiClient from '../api/axios';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

const ReportsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [allScans, setAllScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const response = await apiClient.get('/tire-history');
      console.log('Fetched tire history:', response.data);
      // Transform backend response to match table format
      const scans = response.data.map((item, index) => {
        const analyzedDate = new Date(item.analyzed_at);
        return {
          id: index + 1,
          date: analyzedDate.toISOString().split('T')[0],
          time: analyzedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          wear: item.wear_percentage,
          status: item.status,
          recommendation: item.recommendation,
          isMockPrediction: item.model_used === 'Mock',
          image: '/placeholder.jpg',
          rawData: item,
        };
      });
      console.log('Transformed scans:', scans);
      setAllScans(scans);
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

  useEffect(() => {
    fetchScans();
    const intervalId = setInterval(() => {
      fetchScans(true);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredScans = filterStatus === 'all' 
    ? allScans 
    : allScans.filter(scan => scan.status.toLowerCase() === filterStatus.toLowerCase());

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
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    filterLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    select: {
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.cardBg,
      cursor: 'pointer',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      padding: '1.5rem',
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.sm,
      textAlign: 'center',
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: '0.25rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: `2px solid ${theme.colors.border}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    td: {
      padding: '1rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
    },
    noData: {
      padding: '3rem',
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.lg,
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
    },
    mockBadge: {
      display: 'inline-block',
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '0.25rem 0.5rem',
      borderRadius: theme.borderRadius.sm,
      fontSize: '0.65rem',
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      border: '1px solid #ffc107',
      marginLeft: '0.5rem',
    },
  };

  const getStatusCount = (status) => {
    return allScans.filter(scan => scan.status.toLowerCase() === status.toLowerCase()).length;
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Export functionality would download a CSV/PDF report');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Scan Reports & History</h1>
        <div style={styles.filterContainer}>
          <Filter size={20} style={{ color: theme.colors.textSecondary }} />
          <span style={styles.filterLabel}>Filter:</span>
          <select 
            style={styles.select}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="good">Good</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <Button 
            variant="secondary" 
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={fetchScans}
          >
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{allScans.length}</div>
          <div style={styles.statLabel}>Total Scans</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${theme.colors.success}` }}>
          <div style={{ ...styles.statValue, color: theme.colors.success }}>
            {getStatusCount('healthy')}
          </div>
          <div style={styles.statLabel}>Healthy</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${theme.colors.warning}` }}>
          <div style={{ ...styles.statValue, color: theme.colors.warning }}>
            {getStatusCount('warning')}
          </div>
          <div style={styles.statLabel}>Warning</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${theme.colors.danger}` }}>
          <div style={{ ...styles.statValue, color: theme.colors.danger }}>
            {getStatusCount('critical')}
          </div>
          <div style={styles.statLabel}>Critical</div>
        </div>
      </div>

      {/* Reports Table */}
      <Card title="Scan History" subtitle={`Showing ${filteredScans.length} records`}>
        {loading ? (
          <div style={styles.noData}>Loading scan history...</div>
        ) : filteredScans.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Wear %</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Recommendation</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => (
                  <tr key={scan.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} style={{ color: theme.colors.textSecondary }} />
                        {scan.date}
                      </div>
                    </td>
                    <td style={styles.td}>{scan.time}</td>
                    <td style={styles.td}>
                      <span style={{ 
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: scan.wear >= 75 ? theme.colors.danger : 
                               scan.wear >= 50 ? theme.colors.warning : 
                               theme.colors.success,
                      }}>
                        {scan.wear}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <StatusBadge status={scan.status} size="sm" />
                        {scan.isMockPrediction && <span style={styles.mockBadge}>MOCK</span>}
                      </div>
                    </td>
                    <td style={styles.td}>{scan.recommendation}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => alert(`Viewing details for scan #${scan.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          icon={<Download size={14} />}
                          onClick={() => alert(`Downloading report for scan #${scan.id}`)}
                        >
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noData}>
            No scans found for the selected filter.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
