import React from 'react';

const PALETTE = ['#6D4FD8', '#4C7DFF', '#0EA5E9', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6'];

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Initials avatar: no stock photos, no personal images. */
export function Avatar({ name, size = 36 }) {
  const seed = [...(name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = PALETTE[seed % PALETTE.length];
  return (
    <span
      className="ca-avatar"
      aria-hidden="true"
      style={{
        width: size, height: size, flex: 'none', display: 'inline-grid', placeItems: 'center', borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #241C3D))`,
        color: '#fff', font: `700 ${Math.round(size * 0.38)}px/1 'Inter', sans-serif`, letterSpacing: '0.02em',
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
