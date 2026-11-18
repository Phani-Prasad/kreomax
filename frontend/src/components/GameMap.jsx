import React from 'react';
import { Check } from 'lucide-react';
import './GameMap.css';

/**
 * Illustrated game map with numbered, clickable markers and a built-in key.
 * The artwork carries no text: every label lives here so it stays sharp,
 * translatable and accessible.
 *
 * marker: { id, label, title, output, color, x, y, icon?, state? }
 *   x / y   position as a percentage of the image
 *   label   short text shown in the marker (a level number or a glyph)
 *   state   'done' | 'current' | 'locked' (optional, for progress-aware maps)
 *
 * Pass `aside` (and optionally `selectedId`) for a compact two-column layout:
 * map on the left, aside + key on the right.
 */
export function GameMap({ image, alt, width, height, markers, onSelect, legendTitle = 'Map key', aside, selectedId }) {
  const split = Boolean(aside);

  return (
    <div className={`gm ${split ? 'gm--split' : ''}`}>
      <div className="gm-stage">
        <img className="gm-img" src={image} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        {markers.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              className={`gm-marker ${m.state ? `gm-marker--${m.state}` : ''} ${selectedId === m.id ? 'gm-marker--selected' : ''}`}
              style={{ left: `${m.x}%`, top: `${m.y}%`, '--gm-color': m.color }}
              onClick={() => onSelect?.(m)}
              aria-label={`${m.title}: ${m.output}`}
              aria-pressed={selectedId ? selectedId === m.id : undefined}
            >
              <span className="gm-pin" aria-hidden="true">
                {m.state === 'done' ? <Check size={14} strokeWidth={3} /> : Icon ? <Icon size={14} /> : m.label}
              </span>
              <span className="gm-tip" role="tooltip">
                <strong>{m.title}</strong>
                <span>{m.output}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="gm-side">
        {aside}
        <div className="gm-legend" role="list" aria-label={legendTitle}>
          <p className="gm-legend-title">{legendTitle}</p>
          {markers.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                role="listitem"
                className={`gm-key ${m.state ? `gm-key--${m.state}` : ''} ${selectedId === m.id ? 'gm-key--selected' : ''}`}
                style={{ '--gm-color': m.color }}
                onClick={() => onSelect?.(m)}
              >
                <span className="gm-key-pin" aria-hidden="true">
                  {m.state === 'done' ? <Check size={13} strokeWidth={3} /> : Icon ? <Icon size={13} /> : m.label}
                </span>
                <span className="gm-key-text">
                  <span className="gm-key-title">{split && m.short ? m.short : m.title}</span>
                  <span className="gm-key-output">{m.output}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
