import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { X, PlusCircle } from 'lucide-react';

export function CreateObligationModal({ isOpen, onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Safety & Fire',
    authority: '',
    frequency: 'yearly',
    lead_days: 30,
    owner_user_id: '',
    initial_certificate_no: '',
    initial_valid_from: new Date().toISOString().split('T')[0],
    initial_valid_to: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getUsers()
        .then(res => {
          setUsers(res.users);
          if (res.users?.length > 0) {
            setFormData(prev => ({ ...prev, owner_user_id: res.users[0].id }));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.createObligation(formData);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to inscribe obligation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gothic-modal-backdrop">
      <div className="gothic-modal-content" style={{ maxWidth: '640px', padding: '1.85rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2e2a3d', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📜</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f5efe6' }}>
              Inscribe New Statutory Decree
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
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
              Decree Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Fire Safety Clearance Certificate"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Sacred Order (Category)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
              >
                <option value="Safety & Fire">Safety &amp; Fire 🔥</option>
                <option value="Environmental">Environmental 🌿</option>
                <option value="Healthcare Licensing">Healthcare Licensing ⚕️</option>
                <option value="Quality & Equipment">Quality &amp; Equipment ⚙️</option>
                <option value="Labor & Factory">Labor &amp; Factory 🏭</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Issuing Regulatory Authority *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. State Pollution Board"
                value={formData.authority}
                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Cadence
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="three_yearly">3-Yearly</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Lead Toll Days
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.lead_days}
                onChange={(e) => setFormData({ ...formData, lead_days: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Sworn Warden *
              </label>
              <select
                value={formData.owner_user_id}
                onChange={(e) => setFormData({ ...formData, owner_user_id: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ background: '#09080e', padding: '1rem', borderRadius: '0.4rem', border: '1px solid #2e2a3d', marginBottom: '1.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37', fontFamily: "'Cinzel', serif", textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
              ⚔️ Initial Certificate Epoch #1 (Optional)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9b92a8', marginBottom: '0.25rem' }}>Authority Seal / Cert #</label>
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-001"
                  value={formData.initial_certificate_no}
                  onChange={(e) => setFormData({ ...formData, initial_certificate_no: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '0.35rem', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9b92a8', marginBottom: '0.25rem' }}>Start Date</label>
                <input
                  type="date"
                  value={formData.initial_valid_from}
                  onChange={(e) => setFormData({ ...formData, initial_valid_from: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '0.35rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" className="btn-gothic-stone" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gothic-blood" disabled={loading}>
              {loading ? 'Inscribing...' : 'Inscribe Decree'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
