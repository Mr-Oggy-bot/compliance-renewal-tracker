import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Upload, FileCheck, Skull, Hourglass } from 'lucide-react';

export function MyTasks({ onRenewRequest, onUploadRequest }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getMyTasks();
      setTasks(res.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.75rem' }}>
      
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f5efe6', letterSpacing: '0.04em' }}>
          ⚔️ Warden's Sacred Vigil (My Action Queue)
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#9b92a8' }}>
          Decrees entrusted to the guard of <strong>{user?.name}</strong>.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#8c859d', fontFamily: "'Cinzel', serif" }}>
          🕯️ Reading the Warden's scroll...
        </div>
      ) : tasks.length === 0 ? (
        <div className="gothic-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#8c859d' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🕯️</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399', marginBottom: '0.4rem' }}>
            All Covenants Are Honored &bull; No Active Decrees Due
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#9b92a8' }}>
            No decrees under your vigil are currently lapsing into darkness. Peace rests upon your sanctuary.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {tasks.map(task => {
            const isOverdue = task.valid_to < today;
            return (
              <div
                key={task.obligation_id}
                className="gothic-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderLeft: `5px solid ${isOverdue ? '#dc2626' : '#d97706'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: "'Cinzel', serif", color: '#d4af37', background: 'rgba(197, 155, 39, 0.15)', border: '1px solid rgba(197, 155, 39, 0.3)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                      📜 {task.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', fontFamily: "'Cinzel', serif", color: isOverdue ? '#f87171' : '#fbbf24' }}>
                      {isOverdue ? '💀 LAPSED INTO DECAY' : '⏳ TWILIGHT COVENANT DUE'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f5efe6', marginBottom: '0.4rem' }}>
                    {task.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#9b92a8' }}>
                    <span>Hour of Doom: <strong style={{ color: '#e5ded2' }}>{task.valid_to}</strong></span>
                    <span>Current Seal: <strong style={{ color: '#d4af37', fontFamily: 'monospace' }}>{task.certificate_no || 'None'}</strong></span>
                    {task.reminder_status && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                        ⏳ Toll <strong>{task.tier}</strong> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    className="btn-gothic-stone"
                    onClick={() => onUploadRequest(task.instance_id)}
                  >
                    <Upload size={14} />
                    📜 Attach Seal
                  </button>
                  <button
                    className="btn-gothic-blood"
                    onClick={() => onRenewRequest({ id: task.obligation_id, title: task.title })}
                  >
                    <RefreshCw size={14} />
                    ⚔️ Renew Decree
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
