import React, { useState, useEffect } from 'react';
import { Download, Clock } from 'lucide-react';
import { theme } from '../config/theme';
import Button from './Button';

/**
 * PredictionHistory Component
 * Displays a dynamic log of all tire analysis predictions
 * with timestamps, results, and ability to remove items
 */
const PredictionHistory = ({ predictions = [] }) => {
  const [history, setHistory] = useState(predictions);

  useEffect(() => {
    setHistory(predictions);
  }, [predictions]);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Wear %', 'Status', 'Recommendation'],
      ...history.map((item) => [
        new Date(item.timestamp).toLocaleString(),
        item.wearPercentage,
        item.status,
        item.recommendation,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safetread-predictions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getSeverityColor = (wear) => {
    if (wear < 30) return theme.colors.success;
    if (wear < 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      marginTop: '2rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    badge: {
      display: 'inline-block',
      backgroundColor: theme.colors.primary,
      color: '#fff',
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      color: theme.colors.textSecondary,
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    historyList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxHeight: '500px',
      overflowY: 'auto',
    },
    historyItem: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr 1fr',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: theme.colors.cardBg,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      transition: 'all 0.2s ease',
      animation: 'fadeIn 0.3s ease-out',
      cursor: 'pointer',
    },
    itemSeverity: {
      width: '8px',
      height: '60px',
      borderRadius: theme.borderRadius.md,
      flexShrink: 0,
    },
    itemContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      alignItems: 'center',
    },
    itemField: {
      display: 'flex',
      flexDirection: 'column',
    },
    itemLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.25rem',
    },
    itemValue: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textPrimary,
    },
    itemTime: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    mockBadge: {
      display: 'inline-block',
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      border: '1px solid #ffc107',
    },

  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Clock size={20} />
          Prediction History
          <span style={styles.badge}>{history.length}</span>
        </div>
        {history.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => {
              const latest = history[0];
              const reportId = latest?.predictionId || latest?.id;
              if (reportId && reportId !== 'None' && reportId !== 'null') {
                window.open(`http://localhost:5000/api/download-report/${reportId}`, '_blank');
              } else {
                alert('Report not available for this scan');
              }
            }}
          >
            Download Report
          </Button>
        )}
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <p>No predictions yet. Upload your first tyre image to get started.</p>
        </div>
      ) : (
        /* History List */
        <div style={styles.historyList}>
          {history.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => {
                const reportId = item.predictionId || item.id;
                if (reportId && reportId !== 'None' && reportId !== 'null') {
                  window.open(`http://localhost:5000/api/download-report/${reportId}`, '_blank');
                }
              }}
              style={{
                ...styles.historyItem,
                ...(index % 2 === 0 && { backgroundColor: theme.colors.lightBg }),
              }}
            >
              {/* Severity Indicator */}
              <div
                style={{
                  ...styles.itemSeverity,
                  backgroundColor: getSeverityColor(item.wearPercentage),
                }}
              />

              {/* Content */}
              <div style={styles.itemContent}>
                <div style={styles.itemField}>
                  <div style={styles.itemLabel}>Wear Level</div>
                  <div
                    style={{
                      ...styles.itemValue,
                      color: getSeverityColor(item.wearPercentage),
                    }}
                  >
                    {item.wearPercentage}%
                  </div>
                </div>
                <div style={styles.itemField}>
                  <div style={styles.itemLabel}>Status</div>
                  <div style={{ ...styles.itemValue, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.status}
                    {item.isMockPrediction && <span style={styles.mockBadge}>MOCK</span>}
                  </div>
                </div>
              </div>

              {/* Time & Download */}
              <div style={{ ...styles.itemTime, justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} />
                  {formatTime(item.timestamp)}
                </div>
                {item.predictionId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`http://localhost:5000/api/download-report/${item.predictionId}`, '_blank');
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .history-item:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.md};
          background-color: ${theme.colors.cardBg} !important;
          border-color: ${theme.colors.secondary};
        }
      `}</style>
    </div>
  );
};

export default PredictionHistory;
