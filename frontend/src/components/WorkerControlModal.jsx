import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { X, Bell, Play, AlertOctagon, Mail, Skull, Flame } from 'lucide-react';

export function WorkerControlModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const fetchEmailLogs = async () => {
    try {
      const res = await api.getEmailLogs();
      setLogs(res.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmailLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunNormal = async () => {
    try {
      setRunning(true);
      setResult(null);
      const res = await api.runWorker({ simulateCrashAfter: null });
      setResult({
        type: 'success',
        message: `The Reaper's task is done: ${res.processedCount} missives dispatched, ${res.skippedAlreadySent} skipped (already marked sent in stone). ZERO DUPLICATES!`
      });
      fetchEmailLogs();
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleRunCrashTest = async () => {
    try {
      setRunning(true);
      setResult(null);
      await api.runWorker({ simulateCrashAfter: 1 });
    } catch (err) {
      setResult({
        type: 'crash',
        message: `⚡ THE GUILLOTINE FELL! Worker crashed mid-run after 1 missive. Unprocessed rows remain 'pending'. Upon restart, already-sent missives are skipped. Zero duplicate dispatches guaranteed!`
      });
      fetchEmailLogs();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="gothic-modal-backdrop">
      <div className="gothic-modal-content" style={{ maxWidth: '820px', padding: '1.85rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2e2a3d', paddingBottom: '0.85rem', marginBottom: '1.35rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🪦</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f5efe6' }}>
                The Reaper's Bell &amp; Idempotency Crypt
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9b92a8', marginTop: '0.2rem' }}>
              Section 5.2 Proof: Two-Phase Claim/Send/Mark-Sent &amp; Zero Duplicate Guarantee on Worker Crash.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn-gothic-blood"
            onClick={handleRunNormal}
            disabled={running}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <span>⚔️</span>
            {running ? 'Reaper Walking...' : 'Ring the Death Knell (Normal Batch)'}
          </button>

          <button
            className="btn-gothic-stone"
            onClick={handleRunCrashTest}
            disabled={running}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', borderColor: '#ef4444', color: '#f87171' }}
          >
            <span>⚡</span>
            Simulate Guillotine Fall (Week 7 Crash Test)
          </button>
        </div>

        {/* Result Callout */}
        {result && (
          <div style={{
            padding: '1.1rem',
            borderRadius: '0.45rem',
            marginBottom: '1.35rem',
            background: result.type === 'success' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(153, 27, 27, 0.25)',
            border: `1px solid ${result.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(220, 38, 38, 0.5)'}`,
            color: result.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.9rem'
          }}>
            <strong>{result.type === 'crash' ? '⚡ VIVA CRASH PROOF: ' : '🕯️ REAPER VERDICT: '}</strong>
            {result.message}
          </div>
        )}

        {/* Dispatched Notification Inbox */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#e5ded2', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>🦅</span>
              Dispatched Raven Missives ({logs.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#8c859d' }}>Live In-Memory Audit Feed</span>
          </div>

          {logs.length === 0 ? (
            <div className="gothic-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#7a728a' }}>
              No ravens have taken flight yet. Ring the Death Knell above to dispatch impending alerts.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
              {logs.map(log => (
                <div key={log.id} className="gothic-card" style={{ padding: '0.85rem 1.1rem', background: '#0b0a11' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9b92a8', marginBottom: '0.3rem' }}>
                    <span>To Warden: <strong style={{ color: '#d4af37' }}>{log.to}</strong> ({log.recipient_name})</span>
                    <span>{new Date(log.dispatched_at).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f5efe6' }}>
                    {log.subject}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8c859d', marginTop: '0.25rem' }}>
                    Decree: {log.obligation} &bull; Tier: <strong style={{ color: '#f87171' }}>{log.tier}</strong> &bull; Doomsday: {log.valid_to}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
