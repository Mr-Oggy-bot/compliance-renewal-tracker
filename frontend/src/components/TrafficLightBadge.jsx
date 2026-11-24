import React from 'react';

export function TrafficLightBadge({ traffic, label }) {
  let bg = 'rgba(5, 150, 105, 0.15)';
  let border = 'rgba(16, 185, 129, 0.4)';
  let color = '#34d399';
  let dotColor = '#10b981';
  let dotClass = 'pulse-emerald';
  let defaultLabel = 'Living Covenant';
  let icon = '???';

  if (traffic === 'amber') {
    bg = 'rgba(217, 119, 6, 0.18)';
    border = 'rgba(245, 158, 11, 0.45)';
    color = '#fbbf24';
    dotColor = '#f59e0b';
    dotClass = 'flicker-candle';
    defaultLabel = 'Waxing Twilight';
    icon = '?';
  } else if (traffic === 'red') {
    bg = 'rgba(153, 27, 27, 0.25)';
    border = 'rgba(220, 38, 38, 0.55)';
    color = '#f87171';
    dotColor = '#dc2626';
    dotClass = 'pulse-crimson';
    defaultLabel = 'Damned & Lapsed';
    icon = '??';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '0.35rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.04em',
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color: color,
        boxShadow: traffic === 'red' ? '0 0 10px rgba(185, 28, 28, 0.25)' : 'none'
      }}
    >
      <span style={{ fontSize: '0.85rem' }}>{icon}</span>
      <span
        className={dotClass}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor
        }}
      />
      {label || defaultLabel}
    </span>
  );
}
