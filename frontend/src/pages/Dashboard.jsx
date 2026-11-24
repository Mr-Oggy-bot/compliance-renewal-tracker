import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TrafficLightBadge } from '../components/TrafficLightBadge';
import { Timeline90Day } from '../components/Timeline90Day';
import { Flame, Hourglass, Skull, Scroll, Plus, Bell, ShieldCheck, ChevronRight } from 'lucide-react';

export function Dashboard({ onOpenCreateModal, onSelectObligation, onOpenWorkerModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: '#9d95ae', fontFamily: "'Cinzel', serif" }}>
        🕯️ Inquiring upon the ancient stones... Loading telemetry...
      </div>
    );
  }

  const { metrics, timeline90Days, obligations } = data || {};

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.75rem' }}>
      
      {/* Gothic Cathedral Hero Banner with Generated AI Artwork */}
      <div style={{
        position: 'relative',
        borderRadius: '0.65rem',
        overflow: 'hidden',
        border: '1px solid #3d3550',
        boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(153, 27, 27, 0.25)',
        marginBottom: '2rem'
      }}>
        <img
          src="/assets/gothic_cathedral_banner.jpg"
          alt="Gothic Cathedral"
          style={{ width: '100%', height: '240px', objectFit: 'cover', filter: 'brightness(0.55) contrast(1.15)' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8, 7, 11, 0.2) 0%, rgba(10, 9, 16, 0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#c59b27', fontFamily: "'MedievalSharp', cursive", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                ⚔️ Memento Mori &bull; Sanctum of Statutory Decrees 🕯️
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#fbf7ee', textShadow: '0 2px 10px rgba(0,0,0,0.9)', letterSpacing: '0.04em' }}>
                The Grand Altar of Compliance
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#b5adc4', maxWidth: '650px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                Immutable surveillance of eternal licences, tiered reminder auguries, and append-only ledger codices.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-gothic-stone" onClick={onOpenWorkerModal}>
                <Bell size={15} />
                ⚰️ The Reaper's Bell
              </button>
              <button className="btn-gothic-blood" onClick={onOpenCreateModal}>
                <Plus size={15} />
                Inscribe New Decree
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gothic KPI Cards (M5) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        
        {/* Total Inscribed Decrees */}
        <div className="gothic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#1c1a27', padding: '0.85rem', borderRadius: '0.5rem', color: '#c59b27', border: '1px solid #3a344d', fontSize: '1.5rem' }}>
            📜
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9b92a8', fontFamily: "'Cinzel', serif" }}>
              Inscribed Covenants
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#f5efe6', fontFamily: "'Cinzel', serif" }}>
              {metrics?.totalObligations || 0}
            </div>
          </div>
        </div>

        {/* Living Covenants (Green) */}
        <div className="gothic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #059669' }}>
          <div style={{ background: 'rgba(5, 150, 105, 0.15)', padding: '0.85rem', borderRadius: '0.5rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '1.5rem' }}>
            🕯️
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', fontFamily: "'Cinzel', serif" }}>
              Sacred &amp; Whole (Green)
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#34d399', fontFamily: "'Cinzel', serif" }}>
              {metrics?.green || 0}
            </div>
          </div>
        </div>

        {/* Waxing Twilight (Amber) */}
        <div className="gothic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ background: 'rgba(217, 119, 6, 0.15)', padding: '0.85rem', borderRadius: '0.5rem', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '1.5rem' }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24', fontFamily: "'Cinzel', serif" }}>
              Waxing Twilight (Amber)
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#fbbf24', fontFamily: "'Cinzel', serif" }}>
              {metrics?.amber || 0}
            </div>
          </div>
        </div>

        {/* Damned / Expired (Red) */}
        <div className="gothic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #dc2626' }}>
          <div style={{ background: 'rgba(153, 27, 27, 0.2)', padding: '0.85rem', borderRadius: '0.5rem', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.4)', fontSize: '1.5rem' }}>
            💀
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f87171', fontFamily: "'Cinzel', serif" }}>
              Damned &amp; Lapsed (Red)
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#f87171', fontFamily: "'Cinzel', serif" }}>
              {metrics?.red || 0}
            </div>
          </div>
        </div>

      </div>

      {/* Memento Mori 90-Day Radar */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f5efe6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚰️ Memento Mori: 90-Day Expiry Radar
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#9b92a8' }}>
              Approaching deadlines nearing the hour of darkness.
            </p>
          </div>
        </div>

        <Timeline90Day items={timeline90Days} onSelectObligation={onSelectObligation} />
      </div>

      {/* Decrees Overview Table */}
      <div className="gothic-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f5efe6' }}>
              📜 Standing Statutory Decrees
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#8d859d' }}>Inscribed mandates under eternal surveillance.</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#d4af37', fontFamily: "'Cinzel', serif", fontWeight: '600' }}>
            {obligations?.length || 0} Decrees Guarded
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#09080e', borderBottom: '1px solid #2e2a3d', color: '#9b92a8', fontFamily: "'Cinzel', serif", fontSize: '0.78rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>State</th>
                <th style={{ padding: '0.75rem 1rem' }}>Decree Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Jurisdiction</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date of Doom (Valid To)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Sworn Warden</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Codex</th>
              </tr>
            </thead>
            <tbody>
              {obligations?.map((ob, idx) => (
                <tr key={ob.id} style={{ borderBottom: idx < obligations.length - 1 ? '1px solid #1c1a27' : 'none', background: idx % 2 === 0 ? 'rgba(15, 14, 22, 0.6)' : 'transparent' }}>
                  
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <TrafficLightBadge traffic={ob.traffic} />
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: '700', color: '#f5efe6' }}>{ob.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888099' }}>Cat: {ob.category}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#b5adc4' }}>
                    🏛️ {ob.authority}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: ob.traffic === 'red' ? '#f87171' : '#e5ded2', fontFamily: "'Cinzel', serif" }}>
                    {ob.valid_to || 'N/A'}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#9d95ae' }}>
                    🛡️ {ob.owner_name}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn-gothic-stone"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => onSelectObligation(ob.id)}
                    >
                      Inspect Ledger &rarr;
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
