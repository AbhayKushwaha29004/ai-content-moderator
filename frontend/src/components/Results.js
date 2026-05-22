import React from 'react';

const Results = ({ result }) => {
  if (!result) {
    return <div className="results-container">No results to display</div>;
  }

  const {
    submission_id,
    content_type,
    results,
    timestamp,
  } = result;

  const classifiers = [
    { key: 'hate_speech', label: '🎯 Hate Speech', icon: '⚠️' },
    { key: 'violence', label: '💥 Violence', icon: '🔴' },
    { key: 'adult_content', label: '🔞 Adult Content', icon: '⛔' },
    { key: 'self_harm', label: '⚕️ Self-Harm', icon: '🆘' },
    { key: 'misinformation', label: '📰 Misinformation', icon: '❌' },
    { key: 'child_safety', label: '👶 Child Safety', icon: '🛡️' },
  ];

  const getRiskColor = (score) => {
    if (score >= 0.7) return '#dc3545'; // Red
    if (score >= 0.4) return '#ffc107'; // Yellow
    return '#28a745'; // Green
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="results-container">
      <div className="result-header">
        <div className="result-id">
          📋 Submission ID: <strong>{submission_id}</strong>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          📁 Content Type: <strong>{content_type.toUpperCase()}</strong>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          ⏰ Analyzed: <strong>{formatTime(timestamp)}</strong>
        </div>
        
        <div>
          Risk Level:{' '}
          <span className={`risk-level ${results.risk_level}`}>
            {results.risk_level}
          </span>
        </div>
      </div>

      {/* Overall Score */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Overall Risk Score</h3>
        <div className="score-bar">
          <div
            className="score-fill"
            style={{
              width: `${results.overall_score * 100}%`,
              background: getRiskColor(results.overall_score),
            }}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          {(results.overall_score * 100).toFixed(1)}% Risk
        </div>
      </div>

      {/* Classifier Scores */}
      <h3 style={{ marginBottom: '1rem' }}>Classifier Breakdown</h3>
      <div className="score-grid">
        {classifiers.map((classifier) => {
          const score = results[classifier.key] || 0;
          const percentage = (score * 100).toFixed(1);
          const color = getRiskColor(score);

          return (
            <div key={classifier.key} className="score-item">
              <div className="score-label">
                {classifier.icon} {classifier.label}
              </div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${percentage}%`,
                    background: color,
                  }}
                />
              </div>
              <div className="score-value">
                {percentage}% Risk
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Assessment */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Risk Assessment</h3>
        <div style={{ lineHeight: '1.8' }}>
          {results.risk_level === 'LOW' && (
            <p>
              ✅ <strong>Low Risk:</strong> This content appears to be safe and suitable for
              publication. No concerning patterns detected.
            </p>
          )}
          {results.risk_level === 'MEDIUM' && (
            <p>
              ⚠️ <strong>Medium Risk:</strong> This content requires human review before
              publication. One or more classifiers detected potential issues.
            </p>
          )}
          {results.risk_level === 'HIGH' && (
            <p>
              ❌ <strong>High Risk:</strong> This content should be flagged for removal or
              revision. Multiple concerning patterns detected.
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f0f1ff', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recommendations</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          {results.risk_level === 'LOW' && (
            <li>Content is suitable for automatic approval</li>
          )}
          {results.risk_level === 'MEDIUM' && (
            <>
              <li>Assign to human reviewer for final decision</li>
              <li>Consider requesting content modification</li>
            </>
          )}
          {results.risk_level === 'HIGH' && (
            <>
              <li>Recommend content removal or significant revision</li>
              <li>Consider user warning or account review</li>
            </>
          )}
          <li>Store this analysis for future reference</li>
          <li>Track patterns for policy improvements</li>
        </ul>
      </div>

      {/* Technical Details */}
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Technical Details</h3>
        <pre style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '0.85rem',
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            const dataStr = JSON.stringify(results, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `moderation-${submission_id}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
        >
          💾 Download JSON
        </button>
      </div>
    </div>
  );
};

export default Results;
