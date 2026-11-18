import React from 'react';
import { Menu, ChevronRight, MessagesSquare } from 'lucide-react';
import { LEVEL_SHORT_NAMES } from '../data/workspace';
import './TopBar.css';

export function TopBar({ activeTab, setActiveTab, modules, onOpenMobileNav, onOpenTrainerGuide }) {
  const mod = modules.find((m) => m.studioType === activeTab) || null;

  let section = 'Journey roadmap';
  if (activeTab === 'curriculum') section = 'Curriculum';
  if (mod) section = `Level ${mod.number} · ${LEVEL_SHORT_NAMES[mod.id] || mod.toolBadge}`;

  return (
    <header className="tb">
      <div className="tb-inner">
        <button type="button" className="tb-menu" onClick={onOpenMobileNav} aria-label="Open navigation">
          <Menu size={20} />
        </button>

        <nav className="tb-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => setActiveTab('landing')}>Kreomax</button>
          <ChevronRight size={14} aria-hidden="true" />
          {mod ? (
            <>
              <button type="button" onClick={() => setActiveTab('roadmap')}>Roadmap</button>
              <ChevronRight size={14} aria-hidden="true" />
            </>
          ) : null}
          <span aria-current="page" className="tb-current">{section}</span>
        </nav>

        <button type="button" className="tb-mentor" onClick={onOpenTrainerGuide}>
          <MessagesSquare size={16} aria-hidden="true" />
          <span>Ask your mentor</span>
        </button>
      </div>
    </header>
  );
}
