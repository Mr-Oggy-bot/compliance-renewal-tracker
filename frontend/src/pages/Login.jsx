import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invocation failed. The gates remain barred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    try {
      setLoading(true);
      setError('');
      await login(demoEmail, 'Password123!');
    } catch (err) {
      setError(err.message || 'Invocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#07070a' }}>
      
      <div style={{ maxWidth: '460px', width: '100%' }}>
        
        {/* Ornate Gothic Crest & Seal */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/assets/gothic_seal_emblem.jpg"
            alt="The Grim Seal"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              border: '3px solid #8d7023',
              boxShadow: '0 0 25px rgba(197, 155, 39, 0.45), 0 0 10px rgba(153, 27, 27, 0.6)'
            }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fbf7ee', letterSpacing: '0.08em', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
            THE GRIM LEDGER 📜
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9b92a8', marginTop: '0.35rem', fontFamily: "'MedievalSharp', cursive" }}>
            Sanctuary of Append-Only Decrees &amp; Idempotent Omens 🕯️
          </p>
        </div>

        {/* Login Gothic Card */}
        <div className="gothic-card" style={{ padding: '2.25rem' }}>
          
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(153, 27, 27, 0.3)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '0.35rem', fontSize: '0.85rem', marginBottom: '1.35rem' }}>
              💀 {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Warden's Inscribed Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#7a728a' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@apexhealth.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.35rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Cinzel', serif", marginBottom: '0.4rem' }}>
                Crypt Passphrase
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#7a728a' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: '0.35rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-gothic-blood"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem' }}
              disabled={loading}
            >
              {loading ? 'Unsealing the Gates...' : 'Unseal the Sanctuary'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Gothic Persona Switcher */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.35rem', borderTop: '1px solid #282436' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#8c859d', fontFamily: "'Cinzel', serif", marginBottom: '0.85rem', textAlign: 'center' }}>
              ⚔️ Viva Evaluation Quick Summon ⚔️
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
              <button
                type="button"
                className="btn-gothic-stone"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                onClick={() => handleQuickLogin('admin@apexhealth.org')}
                disabled={loading}
              >
                👑 Apex Inquisitor
              </button>
              <button
                type="button"
                className="btn-gothic-stone"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                onClick={() => handleQuickLogin('manager@apexhealth.org')}
                disabled={loading}
              >
                🗝️ Apex Chancellor
              </button>
              <button
                type="button"
                className="btn-gothic-stone"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                onClick={() => handleQuickLogin('facility@apexhealth.org')}
                disabled={loading}
              >
                🛡️ Crypt Warden
              </button>
              <button
                type="button"
                className="btn-gothic-stone"
                style={{ fontSize: '0.75rem', padding: '0.45rem', borderColor: '#a855f7', color: '#c084fc' }}
                title="Log into Meridian Keep to prove tenant isolation"
                onClick={() => handleQuickLogin('admin@meridianmfg.com')}
                disabled={loading}
              >
                🏰 Meridian Keep
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
