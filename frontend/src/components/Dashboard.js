import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="message error">
          Error: {error}
        </div>
        <button className="btn btn-primary" onClick={fetchStats}>
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="message info">
          No data available yet. Upload content to see statistics.
        </div>
      </div>
    );
  }

  const classifiers = [
    { key: 'hate_speech', label: 'Hate Speech' },
    { key: 'violence', label: 'Violence' },
    { key: 'adult_content', label: 'Adult Content' },
    { key: 'self_harm', label: 'Self-Harm' },
    { key: 'misinformation', label: 'Misinformation' },
    { key: 'child_safety', label: 'Child Safety' },
  ];

  const avgScores = stats.average_scores || {};
  const maxScore = Math.max(...Object.values(avgScores).filter(v => typeof v === 'number'), 0);

  return (
    <div className="dashboard-container">
      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_submissions || 0}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.high_risk_count || 0}</div>
          <div className="stat-label">High Risk Content</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.total_submissions > 0 
              ? ((stats.high_risk_count / stats.total_submissions) * 100).toFixed(1)
              : 0
            }%
          </div>
          <div className="stat-label">Risk Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.total_submissions > 0 ? stats.total_submissions : 0}
          </div>
          <div className="stat-label">Processed</div>
        </div>
      </div>

      {/* Average Scores Chart */}
      <div className="chart-container">
        <h3 className="chart-title">📊 Average Risk Scores by Classifier</h3>
        <div className="chart-bars">
          {classifiers.map((classifier) => {
            const score = avgScores[classifier.key] || 0;
            const percentage = (score * 100).toFixed(1);
            const height = maxScore > 0 ? (score / maxScore) * 100 : 0;

            return (
              <div key={classifier.key} className="chart-bar">
                <div className="chart-bar-label">{classifier.label}</div>
                <div className="chart-bar-item">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${height}%` }}
                  />
                  <div className="chart-bar-value">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Scores Table */}
      <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>📈 Detailed Statistics</h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <thead>
            <tr style={{ background: '#f0f1ff' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Classifier</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Avg Score</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {classifiers.map((classifier) => {
              const score = avgScores[classifier.key] || 0;
              const percentage = (score * 100).toFixed(2);
              
              return (
                <tr key={classifier.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>{classifier.label}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                    {score.toFixed(3)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>📋 Summary</h3>
        <div style={{ lineHeight: '1.8' }}>
          <p>
            The system has processed <strong>{stats.total_submissions}</strong> submissions.
            Out of these, <strong>{stats.high_risk_count}</strong> were flagged as high-risk content
            (requires human review or removal).
          </p>
          <p>
            The most common risk detected is{' '}
            <strong>
              {classifiers[classifiers.findIndex(c => 
                avgScores[c.key] === Math.max(...Object.values(avgScores).filter(v => typeof v === 'number'))
              )]?.label}
            </strong>
            , with an average score of{' '}
            <strong>
              {(Math.max(...Object.values(avgScores).filter(v => typeof v === 'number')) * 100).toFixed(1)}%
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={fetchStats}>
          🔄 Refresh Statistics
        </button>
        <span style={{ marginLeft: '1rem', color: '#999', fontSize: '0.9rem' }}>
          Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
