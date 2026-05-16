import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Loader } from 'lucide-react';

/**
 * AppDownloadLinks Component
 * 
 * Displays downloadable links for staff and student portal apps.
 * Fetches download URLs from Appwrite school document.
 * 
 * Props:
 *   schoolCode: The school code (e.g., 'SHMCE')
 *   schoolId: The school document ID from Appwrite
 */
export function AppDownloadLinks({ schoolCode, schoolId }) {
  const [downloads, setDownloads] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
  const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!schoolId || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
        setError('Configuration missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${APPWRITE_ENDPOINT}/v1/databases/academicx_db/collections/schools/documents/${schoolId}`,
          {
            headers: {
              'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch school data');
        }

        const school = await response.json();
        
        // Parse downloads from the data field
        try {
          const data = JSON.parse(school.data || '{}');
          const schoolDownloads = data.downloads || {};
          if (Object.keys(schoolDownloads).length > 0) {
            setDownloads(schoolDownloads);
          } else {
            // Fallback: query `apps` collection for per-school or universal (ACADEMICX) entries
            try {
              const appsResp = await fetch(
                `${APPWRITE_ENDPOINT}/v1/databases/academicx_db/collections/apps/documents?limit=1000`,
                { headers: { 'X-Appwrite-Project': APPWRITE_PROJECT_ID } }
              );
              if (appsResp.ok) {
                const appsJson = await appsResp.json();
                const docs = appsJson.documents || [];
                const byPlatform = {};
                const codeUpper = String(schoolCode || '').trim().toUpperCase();
                for (const d of docs) {
                  const docCode = String(d.code || '').toUpperCase();
                  if (docCode !== codeUpper && docCode !== 'ACADEMICX') continue;
                  const platform = String(d.platform || 'unknown').toLowerCase();
                  byPlatform[platform] = byPlatform[platform] || [];
                  byPlatform[platform].push({ filename: d.filename, url: d.url, size: d.size });
                }
                if (Object.keys(byPlatform).length > 0) {
                  setDownloads(byPlatform);
                } else {
                  setDownloads({});
                }
              } else {
                setDownloads({});
              }
            } catch (err) {
              console.warn('Fallback apps fetch failed:', err);
              setDownloads({});
            }
          }
        } catch {
          setError('Could not parse download data');
        }
      } catch (err) {
        console.error('Error fetching downloads:', err);
        setError('Could not load downloads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [schoolId, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID]);

  if (loading) {
    return (
      <div className="app-downloads-loading">
        <Loader className="spinner" size={24} />
        <p>Loading apps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-downloads-error">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  if (!downloads || Object.keys(downloads).length === 0) {
    return (
      <div className="app-downloads-empty">
        <p>Apps are not yet available for your school.</p>
        <p className="subtitle">Check back soon!</p>
      </div>
    );
  }

  const platformLabels = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    android: 'Android',
  };

  return (
    <div className="app-downloads-container">
      <div className="downloads-section">
        <h3>Download Our Apps</h3>
        <p className="section-subtitle">
          Download the {schoolCode} staff and student portal apps for your device
        </p>

        <div className="platforms-grid">
          {Object.entries(downloads).map(([platform, files]) => (
            <div key={platform} className="platform-block">
              <h4>{platformLabels[platform] || platform}</h4>
              <div className="files-list">
                {files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    download
                    className="download-link"
                    title={file.filename}
                  >
                    <Download size={16} />
                    <span className="filename">{file.filename}</span>
                    {file.size && <span className="filesize">({formatFileSize(file.size)})</span>}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="downloads-note">
          <p>
            <strong>Installation Instructions:</strong> Follow the on-screen prompts to install the app on your device.
            For Android, you may need to enable "Unknown Sources" in settings.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback - iOS Unavailable Banner
 * Shows when iOS app is not yet available
 */
export function IosUnavailableBanner() {
  return (
    <div className="app-unavailable-banner ios-banner">
      <AlertCircle size={20} />
      <div className="banner-content">
        <h4>iOS App Coming Soon</h4>
        <p>In the meantime, use our web version at <a href="https://academicx.app" target="_blank" rel="noopener noreferrer">academicx.app</a></p>
      </div>
    </div>
  );
}

/**
 * Helper function to format file sizes
 */
function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default AppDownloadLinks;
