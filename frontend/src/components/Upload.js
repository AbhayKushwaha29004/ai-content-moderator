import React, { useState, useRef } from 'react';

const Upload = ({ onResultUpdate }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Text Moderation
  const handleTextModerate = async () => {
    if (!textContent.trim()) {
      setMessage({ type: 'error', text: 'Please enter text to moderate' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/moderate/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textContent }),
      });

      if (!response.ok) {
        throw new Error('Moderation failed');
      }

      const data = await response.json();
      onResultUpdate(data);
      setMessage({ type: 'success', text: 'Moderation completed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Image Moderation
  const handleImageModerate = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/v1/moderate/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image moderation failed');
      }

      const data = await response.json();
      onResultUpdate(data);
      setMessage({ type: 'success', text: 'Image moderation completed!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setMessage({ type: 'info', text: `Selected: ${file.name}` });
    } else {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      setSelectedFile(null);
    }
  };

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setMessage({ type: 'info', text: `Selected: ${file.name}` });
    } else {
      setMessage({ type: 'error', text: 'Please drop a valid image file' });
    }
  };

  return (
    <div className="upload-container">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="upload-tabs">
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          📝 Text Moderation
        </button>
        <button
          className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          🖼️ Image Moderation
        </button>
      </div>

      {/* Text Tab */}
      <div className={`tab-content ${activeTab === 'text' ? 'active' : ''}`}>
        <div className="text-input-group">
          <label htmlFor="text-input">Enter text to moderate:</label>
          <textarea
            id="text-input"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Type your content here... (max 5000 characters)"
            maxLength={5000}
            disabled={loading}
          />
          <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
            {textContent.length} / 5000 characters
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleTextModerate}
          disabled={loading || !textContent.trim()}
        >
          {loading ? (
            <span className="loading">
              <span className="spinner"></span>
              Moderating...
            </span>
          ) : (
            '🔍 Moderate Text'
          )}
        </button>
      </div>

      {/* Image Tab */}
      <div className={`tab-content ${activeTab === 'image' ? 'active' : ''}`}>
        <div
          className="file-upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="file-upload-icon">📤</div>
          <div className="file-upload-text">
            {selectedFile ? selectedFile.name : 'Drop image here or click to select'}
          </div>
          <div className="file-upload-hint">
            Supported: JPG, PNG, GIF, BMP, WebP (Max 50 MB)
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleImageModerate}
          disabled={loading || !selectedFile}
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? (
            <span className="loading">
              <span className="spinner"></span>
              Moderating...
            </span>
          ) : (
            '🔍 Moderate Image'
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
