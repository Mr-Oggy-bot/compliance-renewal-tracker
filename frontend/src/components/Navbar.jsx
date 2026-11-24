import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, BookOpen, Skull, Bell, LogOut, KeyRound } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenWorkerModal }) {
  const { user, login, logout } = useAuth();

  const handleQuickSwitch = async (email) => {
    try {
      await login(email, 'Password123!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header style={{ background: '#0a0910', borderBottom: '1px solid #2d283c', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
      {/* Top Banner: Gothic Brand & Heraldry */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Heraldic Brand with Generated Seal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/assets/gothic_seal_emblem.jpg"
            alt="Gothic Crest"
            style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #8d7023', boxShadow: '0 0 10px rgba(197, 155, 39, 0.4)' }}
          />
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: '900', fontSize: '1.15rem', color: '#f5efe6', letterSpacing: '0.06em', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              THE GRIM LEDGER ??
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9b92a8', fontFamily: "'MedievalSharp', cursive" }}>
              Domain: <strong style={{ color: '#d4af37' }}>?? {user?.organization?.name || 'Apex Healthcare'}</strong>
            </div>
          </div>
        </div>

        {/* Persona Switcher for Gothic Viva / Demo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#12111b', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', border: '1px solid #2b263b' }}>
          <span style={{ fontSize: '0.7rem', color: '#8e859f', fontFamily: "'Cinzel', serif", fontWeight: '700' }}>?? INQUISITION:</span>
          <button
            onClick={() => handleQuickSwitch('admin@apexhealth.org')}
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '0.25rem',
              border: '1px solid',
              background: user?.role === 'admin' && user?.email.includes('apex') ? 'linear-gradient(180deg, #991b1b, #601010)' : '#191724',
              color: user?.role === 'admin' && user?.email.includes('apex') ? '#fff' : '#aaa',
              borderColor: user?.role === 'admin' && user?.email.includes('apex') ? '#dc2626' : '#332e44',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              fontWeight: '600'
            }}
          >
            Lord Inquisitor (Admin)
          </button>
          <button
            onClick={() => handleQuickSwitch('manager@apexhealth.org')}
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '0.25rem',
              border: '1px solid',
              background: user?.role === 'manager' ? 'linear-gradient(180deg, #991b1b, #601010)' : '#191724',
              color: user?.role === 'manager' ? '#fff' : '#aaa',
              borderColor: user?.role === 'manager' ? '#dc2626' : '#332e44',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              fontWeight: '600'
            }}
          >
            Abbey Chancellor (Mgr)
          </button>
          <button
            onClick={() => handleQuickSwitch('facility@apexhealth.org')}
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '0.25rem',
              border: '1px solid',
              background: user?.role === 'owner' ? 'linear-gradient(180deg, #991b1b, #601010)' : '#191724',
              color: user?.role === 'owner' ? '#fff' : '#aaa',
              borderColor: user?.role === 'owner' ? '#dc2626' : '#332e44',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              fontWeight: '600'
            }}
          >
            Crypt Warden (Owner)
          </button>
          <button
            onClick={() => handleQuickSwitch('admin@meridianmfg.com')}
            title="Switch to Meridian Fortress to prove tenant isolation"
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '0.25rem',
              border: '1px solid',
              background: user?.email.includes('meridian') ? 'linear-gradient(180deg, #6b21a8, #3b0764)' : '#191724',
              color: user?.email.includes('meridian') ? '#f3e8ff' : '#888',
              borderColor: user?.email.includes('meridian') ? '#a855f7' : '#332e44',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              fontWeight: '600'
            }}
          >
            ?? Meridian Keep (Org B)
          </button>
        </div>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#e5ded2', fontFamily: "'Cinzel', serif" }}>
              {user?.name} ???
            </div>
            <div style={{ fontSize: '0.75rem', color: '#d4af37' }}>
              Rank: <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Leave the Sanctuary"
            style={{ background: '#1c1a27', border: '1px solid #3d3752', color: '#a89fb8', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.35rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

      {/* Navigation Tabs Styled Like Cathedral Portals */}
      <div style={{ background: '#0e0d16', borderTop: '1px solid #1f1c2b' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '2rem' }}>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.85rem',
              fontFamily: "'Cinzel', serif",
              fontWeight: activeTab === 'dashboard' ? '700' : '500',
              color: activeTab === 'dashboard' ? '#d4af37' : '#8c859d',
              borderBottom: activeTab === 'dashboard' ? '2px solid #d4af37' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            ?? Citadel Altar
          </button>

          <button
            onClick={() => setActiveTab('obligations')}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.85rem',
              fontFamily: "'Cinzel', serif",
              fontWeight: activeTab === 'obligations' ? '700' : '500',
              color: activeTab === 'obligations' ? '#d4af37' : '#8c859d',
              borderBottom: activeTab === 'obligations' ? '2px solid #d4af37' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            ?? Codex of Decrees &amp; Ledger
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.85rem',
              fontFamily: "'Cinzel', serif",
              fontWeight: activeTab === 'tasks' ? '700' : '500',
              color: activeTab === 'tasks' ? '#d4af37' : '#8c859d',
              borderBottom: activeTab === 'tasks' ? '2px solid #d4af37' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            ?? Warden Quests
          </button>

          <button
            onClick={onOpenWorkerModal}
            style={{
              marginLeft: 'auto',
              padding: '0.75rem 0.25rem',
              fontSize: '0.82rem',
              fontFamily: "'Cinzel', serif",
              fontWeight: '700',
              color: '#f87171',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Bell size={15} />
            ?? The Reaper's Bell &amp; Worker Crypt
          </button>

        </div>
      </div>
    </header>
  );
}
