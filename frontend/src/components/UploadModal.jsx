import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Upload } from 'lucide-react';

export function UploadModal({ instanceId, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxFileSizeMB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 10);

  if (!instanceId) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a certificate parchment (PDF, PNG, JPEG)');
      return;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`Select a file smaller than ${maxFileSizeMB} MB.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('instance_id', instanceId);
      formData.append('file', file);

      await api.uploadDocument(formData);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gothic-modal-backdrop">
      <div className="gothic-modal-content" style={{ maxWidth: '500px', padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2e2a3d', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📜</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f5efe6' }}>
              Attach Supporting Parchment
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(153, 27, 27, 0.3)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '0.35rem', fontSize: '0.85rem', marginBottom: '1.15rem' }}>
            💀 {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
              Select Document Parchment (PDF, PNG, JPG &lt; {maxFileSizeMB}MB)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" className="btn-gothic-stone" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gothic-blood" disabled={loading}>
              {loading ? 'Binding...' : 'Bind to Epoch'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
