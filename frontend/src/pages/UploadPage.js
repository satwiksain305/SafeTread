import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileCheck, AlertCircle, Loader, TrendingDown } from 'lucide-react';
import apiClient from '../api/axios';
import { theme, getWearColor } from '../config/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import WearSeverityIndicator from '../components/WearSeverityIndicator';
import ConditionBadge from '../components/ConditionBadge';
import PredictionHistory from '../components/PredictionHistory';

const UploadPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setError('');
      setAnalysisResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    setIsAnimating(true);

    if (!imageFile) {
      setError('Please select an image to upload.');
      setLoading(false);
      setIsAnimating(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await apiClient.post('/analyze-tire', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = {
        wearPercentage: response.data.wear_percentage,
        status: response.data.status,
        recommendation: response.data.recommendation,
        confidence: response.data.confidence,
        modelType: response.data.model_type,
        isMockPrediction: response.data.is_mock_prediction,
        timestamp: new Date().toISOString(),
      };
      
      setAnalysisResult(result);
      setMessage(response.data.message || '✅ Analysis completed successfully!');
      setPredictionHistory([result, ...predictionHistory]);
      
      setTimeout(() => setIsAnimating(false), 500);
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred during upload.');
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.colors.lightBg,
      minHeight: '100vh',
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
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
    },
    uploadArea: {
      border: `2px dashed ${theme.colors.border}`,
      borderRadius: theme.borderRadius.lg,
      padding: '3rem 2rem',
      textAlign: 'center',
      backgroundColor: theme.colors.cardBg,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    uploadAreaActive: {
      borderColor: theme.colors.secondary,
      backgroundColor: `${theme.colors.secondary}05`,
    },
    uploadIcon: {
      margin: '0 auto 1rem',
      color: theme.colors.secondary,
    },
    uploadText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textPrimary,
      marginBottom: '0.5rem',
    },
    uploadHint: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    previewContainer: {
      marginTop: '2rem',
      textAlign: 'center',
    },
    preview: {
      maxWidth: '100%',
      maxHeight: '400px',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
    },
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem',
    },
    resultCard: {
      padding: '1.5rem',
      textAlign: 'center',
    },
    resultLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: '0.5rem',
    },
    resultValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: '1rem',
    },
    recommendation: {
      padding: '1.5rem',
      backgroundColor: theme.colors.lightBg,
      borderRadius: theme.borderRadius.md,
      marginTop: '2rem',
    },
    recommendationTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    recommendationText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      lineHeight: 1.6,
    },
    alert: {
      padding: '1rem',
      borderRadius: theme.borderRadius.md,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '2rem',
      flexWrap: 'wrap',
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tyre Analysis</h1>
        <p style={styles.subtitle}>Upload a tyre image for instant AI-powered wear detection</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Upload Area */}
          {!preview && (
            <label 
              style={{
                ...styles.uploadArea,
                ...(imageFile && styles.uploadAreaActive),
              }}
              htmlFor="image-upload"
            >
              <Upload size={48} style={styles.uploadIcon} />
              <div style={styles.uploadText}>
                {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
              </div>
              <div style={styles.uploadHint}>
                PNG, JPG, JPEG up to 10MB
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {/* Preview */}
          {preview && (
            <div style={styles.previewContainer}>
              <img src={preview} alt="Tyre preview" style={styles.preview} />
              <Button 
                variant="ghost" 
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                  setAnalysisResult(null);
                }}
                style={{ marginTop: '1rem' }}
              >
                Change Image
              </Button>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div style={{ ...styles.alert, backgroundColor: `${theme.colors.success}15`, border: `1px solid ${theme.colors.success}` }}>
              <FileCheck size={20} style={{ color: theme.colors.success }} />
              <span style={{ color: theme.colors.success }}>{message}</span>
            </div>
          )}
          {error && (
            <div style={{ ...styles.alert, backgroundColor: `${theme.colors.danger}15`, border: `1px solid ${theme.colors.danger}` }}>
              <AlertCircle size={20} style={{ color: theme.colors.danger }} />
              <span style={{ color: theme.colors.danger }}>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          {imageFile && !analysisResult && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Button 
                type="submit" 
                size="lg"
                disabled={loading}
                icon={loading ? <Loader size={20} className="animate-spin" /> : <Camera size={20} />}
              >
                {loading ? 'Analyzing...' : 'Analyze Tyre'}
              </Button>
            </div>
          )}
        </form>

        {/* Analysis Results */}
        {analysisResult && (
          <div style={{ 
            marginTop: '3rem',
            animation: isAnimating ? 'fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}>
            <h3 style={{ 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary,
              marginBottom: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}>
              <TrendingDown size={24} />
              Analysis Results
              {analysisResult.isMockPrediction && (
                <span style={styles.mockBadge}>MOCK</span>
              )}
            </h3>

            {/* Condition Badge */}
            <div style={{ marginBottom: '2rem' }}>
              <ConditionBadge 
                status={analysisResult.status}
                size="lg"
              />
            </div>

            {/* Wear Severity Indicator */}
            <WearSeverityIndicator 
              wearPercentage={analysisResult.wearPercentage}
            />

            {/* Recommendation Card */}
            <div style={{
              ...styles.recommendation,
              animation: 'slideUp 0.6s ease-out 0.2s both',
              marginTop: '2rem',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.md,
            }}>
              <div style={styles.recommendationTitle}>
                <AlertCircle size={20} />
                Recommendation
              </div>
              <p style={styles.recommendationText}>
                {analysisResult.recommendation}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <Button 
                variant="secondary"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                  setAnalysisResult(null);
                  setMessage('');
                  setIsAnimating(false);
                }}
              >
                Analyze Another
              </Button>
              <Button onClick={() => navigate('/reports')}>
                View All Reports
              </Button>
            </div>
          </div>
        )}

        {/* Prediction History */}
        <PredictionHistory predictions={predictionHistory} />
      </Card>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UploadPage;
