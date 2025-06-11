import React, { useState, useCallback } from 'react';
import './App.css';

interface ImportProgress {
  stage: 'parsing' | 'converting' | 'creating' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

interface ConversionResult {
  success: boolean;
  nodesCreated: number;
  edgesCreated: number;
  errors: string[];
  warnings: string[];
}

const App: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(
    null
  );
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection via input
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    []
  );

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  // Process the selected file
  const processFile = async (file: File) => {
    if (!file.name.endsWith('.canvas')) {
      setError('Please select a .canvas file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError(
        'File size too large. Please select a file smaller than 10MB.'
      );
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      setResult(null);
      setProgress(null);

      const fileContent = await file.text();

      // Send to main thread for processing
      parent.postMessage(
        {
          pluginMessage: {
            type: 'import-canvas',
            fileContent,
          },
        },
        '*'
      );
    } catch (err) {
      setError('Failed to read file. Please try again.');
      setIsImporting(false);
    }
  };

  // Handle messages from main thread
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const {
        type,
        progress: progressData,
        result: resultData,
        message,
      } = event.data.pluginMessage || {};

      switch (type) {
        case 'progress':
          setProgress(progressData);
          break;
        case 'import-complete':
          setIsImporting(false);
          setResult(resultData);
          setProgress(null);
          break;
        case 'error':
          setIsImporting(false);
          setError(message);
          setProgress(null);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCancel = () => {
    parent.postMessage(
      {
        pluginMessage: { type: 'cancel' },
      },
      '*'
    );
  };

  const handleReset = () => {
    setIsImporting(false);
    setProgress(null);
    setResult(null);
    setError(null);
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'parsing':
        return 'Parsing Canvas File';
      case 'converting':
        return 'Converting Nodes';
      case 'creating':
        return 'Creating Elements';
      case 'complete':
        return 'Import Complete';
      case 'error':
        return 'Import Failed';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h2>Canvas2Canvas</h2>
        <p>Import Obsidian Canvas files into FigJam</p>
      </div>

      {!isImporting && !result && !error && (
        <div className="upload-area">
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-content">
              <div className="icon">📄</div>
              <h3>Drop your .canvas file here</h3>
              <p>or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".canvas"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                Choose File
              </label>
            </div>
          </div>

          <div className="info">
            <h4>What gets imported:</h4>
            <ul>
              <li>📝 Text nodes → Sticky notes</li>
              <li>📄 File nodes → Text elements</li>
              <li>🔗 Link nodes → Shapes with URLs</li>
              <li>📦 Groups → Frames</li>
              <li>↔️ Connections → Connectors</li>
            </ul>
          </div>
        </div>
      )}

      {isImporting && progress && (
        <div className="progress-area">
          <div className="progress-header">
            <h3>{getStageLabel(progress.stage)}</h3>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <p className="progress-message">
            {progress.message || 'Processing...'}
          </p>

          <div className="progress-percentage">
            {Math.round(progress.progress)}%
          </div>
        </div>
      )}

      {result && (
        <div className="result-area">
          <div className="result-header">
            <h3>✅ Import Successful!</h3>
          </div>

          <div className="result-stats">
            <div className="stat">
              <span className="stat-number">
                {result.nodesCreated}
              </span>
              <span className="stat-label">Nodes Created</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {result.edgesCreated}
              </span>
              <span className="stat-label">Connectors Created</span>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="warnings">
              <h4>⚠️ Warnings:</h4>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="errors">
              <h4>❌ Errors:</h4>
              <ul>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleReset} className="reset-button">
            Import Another File
          </button>
        </div>
      )}

      {error && (
        <div className="error-area">
          <div className="error-header">
            <h3>❌ Import Failed</h3>
          </div>
          <p className="error-message">{error}</p>
          <button onClick={handleReset} className="reset-button">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
