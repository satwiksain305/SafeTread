import React, { useState } from 'react';
import { Filter, Download, Eye, Calendar } from 'lucide-react';
import { theme } from '../config/theme';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

const ReportsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual backend data
  const allScans = [
    { id: 1, date: '2024-02-05', time: '14:30', wear: 75, status: 'Critical', recommendation: 'Immediate replacement required', image: '/placeholder1.jpg' },
    { id: 2, date: '2024-02-03', time: '10:15', wear: 58, status: 'Warning', recommendation: 'Schedule replacement soon', image: '/placeholder2.jpg' },
    { id: 3, date: '2024-01-28', time: '16:45', wear: 52, status: 'Warning', recommendation: 'Monitor closely', image: '/placeholder3.jpg' },
    { id: 4, date: '2024-01-25', time: '09:20', wear: 38, status: 'Good', recommendation: 'Tyres in good condition', image: '/placeholder4.jpg' },
    { id: 5, date: '2024-01-20', time: '11:30', wear: 28, status: 'Healthy', recommendation: 'Excellent condition', image: '/placeholder5.jpg' },
    { id: 6, date: '2024-01-15', time: '13:00', wear: 22, status: 'Healthy', recommendation: 'Excellent condition', image: '/placeholder6.jpg' },
    { id: 7, date: '2024-01-10', time: '15:45', wear: 15, status: 'Healthy', recommendation: 'New tyre condition', image: '/placeholder7.jpg' },
    { id: 8, date: '2024-01-05', time: '08:30', wear: 45, status: 'Good', recommendation: 'Good condition overall', image: '/placeholder8.jpg' },
  ];

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
        {filteredScans.length > 0 ? (
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
                      <StatusBadge status={scan.status} size="sm" />
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
