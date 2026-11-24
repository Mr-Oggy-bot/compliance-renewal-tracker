import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TrafficLightBadge } from '../components/TrafficLightBadge';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Filter, RefreshCw, History, Upload, Trash2 } from 'lucide-react';

export function ObligationsList({ onOpenCreateModal, onSelectObligation, onRenewRequest, onUploadRequest }) {
  const { user } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchObligations = async () => {
    try {
      setLoading(true);
      let query = '';
      if (categoryFilter) query = `category=${encodeURIComponent(categoryFilter)}`;
      const res = await api.getObligations(query);
      setObligations(res.obligations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, [categoryFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you certain you wish to banish "${title}" and all its historical cycles from the ledger?`)) return;
    try {
      await api.deleteObligation(id);
      fetchObligations();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filtered = obligations.filter(ob =>
    ob.title.toLowerCase().includes(search.toLowerCase()) ||
    ob.authority.toLowerCase().includes(search.toLowerCase()) ||
    (ob.certificate_no && ob.certificate_no.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f5efe6', letterSpacing: '0.04em' }}>
            📜 Codex of Decrees &amp; Append-Only Ledger
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#9b92a8' }}>
            Inscribed statutory obligations and immutable cycle instances carved into stone.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button className="btn-gothic-blood" onClick={onOpenCreateModal}>
            <Plus size={16} />
            Inscribe New Decree
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#7a728a' }} />
          <input
            type="text"
            placeholder="Search decrees by title, jurisdiction, or cert #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: '0.35rem', fontSize: '0.88rem' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '0.6rem 0.85rem', borderRadius: '0.35rem', fontSize: '0.88rem' }}
        >
          <option value="">All Sacred Orders</option>
          <option value="Safety & Fire">Safety &amp; Fire 🔥</option>
          <option value="Environmental">Environmental 🌿</option>
          <option value="Healthcare Licensing">Healthcare Licensing ⚕️</option>
          <option value="Quality & Equipment">Quality &amp; Equipment ⚙️</option>
          <option value="Industrial Safety">Industrial Safety 🏭</option>
        </select>
      </div>

      {/* Table */}
      <div className="gothic-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#8c859d', fontFamily: "'Cinzel', serif" }}>
            🕯️ Reading the ancient scrolls...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#7a728a' }}>
            No decrees match the invocation criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#09080e', borderBottom: '1px solid #2e2a3d', color: '#9b92a8', fontFamily: "'Cinzel', serif", fontSize: '0.78rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>State</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Decree Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Jurisdiction</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Epoch (Cycle)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Validity Range</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Warden</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ob, idx) => (
                  <tr key={ob.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #1c1a27' : 'none', background: idx % 2 === 0 ? 'rgba(15, 14, 22, 0.6)' : 'transparent' }}>
                    
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <TrafficLightBadge traffic={ob.compliance_traffic} />
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#f5efe6' }}>{ob.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7e768f' }}>
                        Cadence: <span style={{ textTransform: 'capitalize', color: '#d4af37' }}>{ob.frequency}</span> | Alert: {ob.lead_days}d
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#b5adc4' }}>
                      {ob.authority}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: "'Cinzel', serif", color: '#d4af37', background: 'rgba(197, 155, 39, 0.15)', border: '1px solid rgba(197, 155, 39, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                        Epoch #{ob.cycle_no || 1}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.82rem', color: '#d0c8b8' }}>
                        {ob.valid_from} &rarr; <strong style={{ color: '#fff' }}>{ob.valid_to}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#8d859d' }}>
                        Seal: {ob.certificate_no || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#9d95ae' }}>
                      🛡️ {ob.owner_name}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                        
                        <button
                          className="btn-gothic-stone"
                          title="View complete append-only audit trail and past compliance"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => onSelectObligation(ob.id)}
                        >
                          <History size={13} />
                          Ledger
                        </button>

                        <button
                          className="btn-gothic-blood"
                          title="Generate new renewal cycle without modifying past history"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => onRenewRequest(ob)}
                        >
                          <RefreshCw size={13} />
                          Renew
                        </button>

                        {user?.role === 'admin' && (
                          <button
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.35rem' }}
                            title="Banish Obligation"
                            onClick={() => handleDelete(ob.id, ob.title)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
