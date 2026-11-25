import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TrafficLightBadge } from './TrafficLightBadge';
import { X, History, FileCheck, AlertTriangle, Search, Upload, RefreshCw, Download } from 'lucide-react';

export function LedgerHistoryModal({ obligationId, onClose, onRenewRequest, onUploadRequest }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditDate, setAuditDate] = useState('2024-02-15');
  const [auditResult, setAuditResult] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async (doc) => {
    try {
      setDownloadError('');
      const blob = await api.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setDownloadError(error.message);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getObligation(obligationId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (obligationId) {
      loadData();
    }
  }, [obligationId]);

  const handleRunAudit = async (e) => {
    e.preventDefault();
    if (!auditDate) return;
    try {
      setAuditLoading(true);
      const res = await api.getObligation(obligationId, auditDate);
      setAuditResult(res.auditResult);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (!obligationId) return null;

  return (
    <div className="gothic-modal-backdrop">
      <div className="gothic-modal-content" style={{ maxWidth: '880px', padding: '1.85rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2e2a3d', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⚰️</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f5efe6' }}>
                The Crypt of Predecessors &bull; Append-Only Codex
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9b92a8' }}>
              Immutable audit chronicles of all historical renewal cycles inscribed in stone. Past deeds are never erased.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {downloadError && <p role="alert" style={{ color: '#f87171' }}>{downloadError}</p>}
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#9b92a8', fontFamily: "'Cinzel', serif" }}>
            🕯️ Exhuming ancient scrolls from the archives...
          </div>
        ) : (
          <div>
            {/* Obligation Summary Banner */}
            <div className="gothic-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#0e0d16' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f5efe6' }}>📜 {data?.obligation?.title}</h3>
                <div style={{ fontSize: '0.82rem', color: '#8e869e', marginTop: '0.25rem' }}>
                  Order: <strong style={{ color: '#d4af37' }}>{data?.obligation?.category}</strong> &bull; Authority: <strong style={{ color: '#d4af37' }}>{data?.obligation?.authority}</strong> &bull; Cadence: <strong>{data?.obligation?.frequency}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-gothic-blood"
                  onClick={() => onRenewRequest(data.obligation)}
                >
                  <RefreshCw size={14} />
                  Renew Next Epoch
                </button>
              </div>
            </div>

            {/* Historical Compliance Date Auditor (Viva Defense Feature) */}
            <div className="gothic-card" style={{ border: '1px solid #8d7023', background: 'linear-gradient(180deg, #181524, #0f0e18)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.92rem', color: '#f5efe6', fontFamily: "'Cinzel', serif", marginBottom: '0.35rem' }}>
                <span>🔮</span>
                Summon the Chronicles of the Past (Point-in-Time Inquest)
              </div>
              <p style={{ fontSize: '0.84rem', color: '#b5adc4', marginBottom: '0.85rem' }}>
                Answer the Grand Inquisitor's question: <em>"Was the realm compliant on a specific date in history?"</em>
              </p>

              <form onSubmit={handleRunAudit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: '0.35rem',
                    fontSize: '0.85rem'
                  }}
                />
                <button type="submit" className="btn-gothic-gold" style={{ padding: '0.45rem 0.85rem' }} disabled={auditLoading}>
                  {auditLoading ? 'Divining...' : 'Invoke Inquest'}
                </button>
              </form>

              {auditResult && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.85rem',
                  borderRadius: '0.35rem',
                  background: auditResult.isCompliant ? 'rgba(5, 150, 105, 0.18)' : 'rgba(153, 27, 27, 0.25)',
                  border: `1px solid ${auditResult.isCompliant ? 'rgba(16, 185, 129, 0.4)' : 'rgba(220, 38, 38, 0.5)'}`,
                  fontSize: '0.88rem',
                  color: auditResult.isCompliant ? '#34d399' : '#f87171',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{auditResult.isCompliant ? '🕯️' : '💀'}</span>
                  <div>
                    <strong>Date {auditResult.asOfDate}: </strong>
                    {auditResult.verdict}
                  </div>
                </div>
              )}
            </div>

            {/* The Append-Only Ledger Table */}
            <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#f5efe6', marginBottom: '0.85rem' }}>
              📜 Inscribed Epochs (The Append-Only Ledger)
            </h4>

            <div style={{ border: '1px solid #2e2a3d', borderRadius: '0.4rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#09080e', borderBottom: '1px solid #2e2a3d', color: '#9b92a8', fontFamily: "'Cinzel', serif", fontSize: '0.78rem' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Epoch</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Validity Range</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Seal / Cert No</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>State</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Tolls (Reminders)</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Parchment</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.instances?.map((inst, index) => (
                    <tr key={inst.id} style={{ borderBottom: index < data.instances.length - 1 ? '1px solid #1c1a27' : 'none', background: index === 0 ? 'rgba(197, 155, 39, 0.04)' : 'transparent' }}>
                      
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: '800', color: '#d4af37', fontFamily: "'Cinzel', serif" }}>
                        Epoch {inst.cycle_no} {index === 0 && <span style={{ fontSize: '0.65rem', background: '#991b1b', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '3px', marginLeft: '4px' }}>CURRENT</span>}
                      </td>

                      <td style={{ padding: '0.75rem 0.85rem', color: '#d0c8b8' }}>
                        {inst.valid_from} &rarr; <strong style={{ color: '#fff' }}>{inst.valid_to}</strong>
                      </td>

                      <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'monospace', color: '#c59b27' }}>
                        {inst.certificate_no || <em style={{ color: '#7a728a' }}>No seal inscribed</em>}
                      </td>

                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          fontFamily: "'Cinzel', serif",
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          background: inst.status === 'active' ? 'rgba(5, 150, 105, 0.2)' : inst.status === 'renewed' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(153, 27, 27, 0.2)',
                          color: inst.status === 'active' ? '#34d399' : inst.status === 'renewed' ? '#94a3b8' : '#f87171'
                        }}>
                          {inst.status === 'active' ? '🟢 Living' : inst.status === 'renewed' ? '📜 Archived' : '💀 Lapsed'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {inst.reminders?.map(rem => (
                            <span
                              key={rem.id}
                              title={`Tier ${rem.tier} (Due: ${rem.due_date}) - Status: ${rem.status}`}
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                fontFamily: "'Cinzel', serif",
                                padding: '0.15rem 0.4rem',
                                borderRadius: '3px',
                                background: rem.status === 'sent' ? 'rgba(5, 150, 105, 0.2)' : '#161422',
                                color: rem.status === 'sent' ? '#34d399' : '#8c859d',
                                border: '1px solid',
                                borderColor: rem.status === 'sent' ? 'rgba(16, 185, 129, 0.3)' : '#2e2a3d'
                              }}
                            >
                              {rem.tier}:{rem.status === 'sent' ? '✓' : '…'}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {inst.documents?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {inst.documents.map(doc => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => handleDownload(doc)}
                                style={{ color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}
                              >
                                <Download size={13} /> {doc.file_name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => onUploadRequest(inst.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9b92a8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.78rem'
                            }}
                          >
                            <Upload size={12} /> 📜 Attach Parchment
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
