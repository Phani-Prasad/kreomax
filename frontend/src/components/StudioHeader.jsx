import React from 'react';
import { Sparkles, BookOpen, Image as ImageIcon, Video, Layout, Award } from 'lucide-react';
import './StudioHeader.css';

const LEVELS = {
  1: { icon: Sparkles, color: '#10B981', name: 'Story Studio' },
  2: { icon: BookOpen, color: '#4C7DFF', name: 'Research Lab' },
  3: { icon: ImageIcon, color: '#8B5CF6', name: 'Visual Studio' },
  4: { icon: Video, color: '#EC4899', name: 'Motion Studio' },
  5: { icon: Layout, color: '#F59E0B', name: 'Website Builder' },
  6: { icon: Award, color: '#0EA5E9', name: 'Final Project' },
};

/** One consistent header for every studio screen. */
export function StudioHeader({ level, title, subtitle, actions, art, artAlt = '' }) {
  const meta = LEVELS[level];
  const Icon = meta.icon;
  return (
    <header className="sh" style={{ '--lv': meta.color }}>
      <span className="sh-icon" aria-hidden="true"><Icon size={22} /></span>
      <div className="sh-text">
        <p className="sh-eyebrow">Level {level} · {meta.name}</p>
        <h1 className="sh-title">{title}</h1>
        {subtitle && <p className="sh-sub">{subtitle}</p>}
      </div>
      {actions && <div className="sh-actions">{actions}</div>}
      {art && <img className="sh-art" src={art} alt={artAlt} width="900" height="675" loading="lazy" decoding="async" />}
    </header>
  );
}
