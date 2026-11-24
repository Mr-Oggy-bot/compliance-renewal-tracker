import React from 'react';
import { TrafficLightBadge } from './TrafficLightBadge';
import { Hourglass, Skull, Flame } from 'lucide-react';

export function Timeline90Day({ items, onSelectObligation }) {
  const today = new Date().toISOString().split('T')[0];

  function getDaysRemaining(validTo) {
    const target = new Date(validTo + 'T00:00:00Z');
    const now = new Date(today + 'T00:00:00Z');
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (!items || items.length === 0) {
    return (
      <div className="gothic-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#8d859d', borderStyle: 'dashed' }}>
        🕯️ No statutory covenants are nearing the abyss within the 90-day horizon. Peace reigns in the sanctuary.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {items.map(item => {
          const days = getDaysRemaining(item.valid_to);
          const isOverdue = days < 0;

          return (
            <div
              key={item.obligation_id}
              onClick={() => onSelectObligation(item.obligation_id)}
              className="gothic-card"
              style={{
                borderLeft: `4px solid ${item.traffic === 'red' ? '#dc2626' : item.traffic === 'amber' ? '#d97706' : '#059669'}`,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#c59b27';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.8), 0 0 15px rgba(197, 155, 39, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#2e2a3d';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9d95ae', fontFamily: "'Cinzel', serif", textTransform: 'uppercase' }}>
                  📜 {item.category}
                </span>
                <TrafficLightBadge traffic={item.traffic} />
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#f5efe6', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                {item.title}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a69db4', borderTop: '1px solid #232030', paddingTop: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⌛ Expiry:</span>
                  <strong style={{ color: '#e5ded2' }}>{item.valid_to}</strong>
                </div>
                <div style={{
                  fontWeight: '800',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.85rem',
                  color: isOverdue ? '#f87171' : days <= 30 ? '#fbbf24' : '#34d399'
                }}>
                  {isOverdue ? `💀 ${Math.abs(days)}d Fallen` : `⏳ ${days}d Left`}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#7a728a' }}>
                🛡️ Sworn Warden: {item.owner_name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
