import React, { useState } from 'react';
import { api } from '../api/client';
import { X, RefreshCw } from 'lucide-react';

export function RenewModal({ obligation, onClose, onRenewed }) {
  const [certNo, setCertNo] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!obligation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.renewObligation(obligation.id, {
        certificate_no: certNo,
        valid_from: validFrom || undefined,
        valid_to: validTo || undefined
      });
      onRenewed();
      onClose();
    } catch (err) {
      setError(err.message || 'Renewal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gothic-modal-backdrop">
      <div className="gothic-modal-content" style={{ maxWidth: '540px', padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2e2a3d', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚔️</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f5efe6' }}>
              Renew Sacred Covenant
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#b5adc4', marginBottom: '1.15rem' }}>
          Extending the covenant of <strong>{obligation.title}</strong> will preserve all past certificate cycles intact within the immutable ledger and inscribe the next epoch with pre-planned reminder tolls.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(153, 27, 27, 0.3)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '0.35rem', fontSize: '0.85rem', marginBottom: '1.15rem' }}>
            💀 {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
              New Authority Seal / Permit Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NOC-2026-9041"
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.35rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Epoch Start (Optional)
              </label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.85rem' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#7a728a' }}>Defaults to morrow of previous epoch</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Hour of Doom (Valid To)
              </label>
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.85rem' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#7a728a' }}>Defaults to sacred cadence interval</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" className="btn-gothic-stone" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gothic-blood" disabled={loading}>
              {loading ? 'Inscribing in Stone...' : 'Commit to Ledger'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
