import React from 'react';

/* Small decorative vector spots. Photographic art lives in /public/images. */

function Svg({ viewBox, title, children, className }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function Sparkle({ x, y, s = 1, c = '#B7A1F3' }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z" fill={c} />;
}

/** Spot: a path with milestones, for roadmap / progress. */
export function PathSpot({ title, className }) {
  return (
    <Svg viewBox="0 0 220 200" title={title} className={className}>
      <circle cx="110" cy="104" r="86" fill="#E8EEFF" />
      <path d="M40 160 C80 160 70 120 110 120 C150 120 130 80 176 74" stroke="#B7A1F3" strokeWidth="8" strokeDasharray="2 14" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="158" r="11" fill="#8B73E8" /><circle cx="108" cy="120" r="11" fill="#4C7DFF" />
      <path d="M176 72 V38 L204 48 L176 58" fill="#10B981" stroke="#10B981" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="176" cy="76" r="5" fill="#241C3D" />
      <Sparkle x={52} y={60} c="#8FA9FF" /><Sparkle x={140} y={160} s={.8} />
    </Svg>
  );
}
