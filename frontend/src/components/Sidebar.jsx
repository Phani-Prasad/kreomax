import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles, BookOpen, Image as ImageIcon, Video, Layout, Award, Compass, LayoutGrid, Check,
  ChevronUp, X, Pencil, Settings, Globe, LogOut,
} from 'lucide-react';
import { KreomaxIcon } from './KreomaxLogo';
import { Avatar } from './Avatar';
import { THEMES, LEVEL_SHORT_NAMES } from '../data/workspace';
import './Sidebar.css';

const LEVEL_ICONS = { 1: Sparkles, 2: BookOpen, 3: ImageIcon, 4: Video, 5: Layout, 6: Award };

export function Sidebar({
  activeTab, setActiveTab, modules, completedHours, onToggleHour, projectTheme, userProfile,
  gatewayStatus, onOpenKeyModal, isMobileOpen, setIsMobileOpen, onOpenThemeModal, onEditProfile, onLeaveStudio,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const done = completedHours.length;
  const pct = Math.round((done / 24) * 100);
  const theme = THEMES.find((t) => t.title === projectTheme);
  const themeName = theme ? theme.shortTitle : projectTheme;
  const themeTag = theme ? theme.tag : 'Your own project';
  const aiReady = Boolean(gatewayStatus?.gemini?.configured);
  const isAdmin = new URLSearchParams(window.location.search).has('admin');

  const go = (tab) => setActiveTab(tab);

  return (
    <aside className={`sb ${isMobileOpen ? 'is-open' : ''}`} aria-label="Workspace navigation">
      <div className="sb-top">
        <button type="button" className="sb-brand" onClick={() => go('landing')} aria-label="Kreomax, back to website">
          <KreomaxIcon size={32} />
          <span className="sb-brand-text">
            <span className="sb-brand-name">KREO<b>MAX</b></span>
            <span className="sb-brand-sub">Creator Studio</span>
          </span>
        </button>
        <button type="button" className="sb-close" onClick={() => setIsMobileOpen(false)} aria-label="Close navigation">
          <X size={18} />
        </button>
      </div>

      <div className="sb-scroll">
        <button type="button" className="sb-project" onClick={onOpenThemeModal}>
          <span className="sb-project-label">Your project</span>
          <span className="sb-project-name">{themeName}</span>
          <span className="sb-project-meta">{themeTag} <span className="sb-project-change"><Pencil size={11} aria-hidden="true" /> Change</span></span>
        </button>

        <div className="sb-progress" role="group" aria-label="Course progress">
          <div className="sb-progress-row">
            <span>Progress</span>
            <span><strong>{done}</strong> of 24 hours</span>
          </div>
          <div className="sb-bar" role="progressbar" aria-valuemin={0} aria-valuemax={24} aria-valuenow={done}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>

        <nav className="sb-nav" aria-label="Course">
          <p className="sb-group">Overview</p>
          <button type="button" className={`sb-item ${activeTab === 'roadmap' ? 'is-active' : ''}`} aria-current={activeTab === 'roadmap' ? 'page' : undefined} onClick={() => go('roadmap')}>
            <span className="sb-icon sb-icon--plain"><Compass size={16} /></span>
            <span className="sb-label">Journey roadmap</span>
          </button>
          <button type="button" className={`sb-item ${activeTab === 'curriculum' ? 'is-active' : ''}`} aria-current={activeTab === 'curriculum' ? 'page' : undefined} onClick={() => go('curriculum')}>
            <span className="sb-icon sb-icon--plain"><LayoutGrid size={16} /></span>
            <span className="sb-label">Curriculum</span>
          </button>

          <p className="sb-group">Levels</p>
          {modules.map((mod) => {
            const hours = mod.hoursList.map((h) => h.hour);
            const doneCount = hours.filter((h) => completedHours.includes(h)).length;
            const complete = doneCount === hours.length;
            const active = activeTab === mod.studioType;
            const Icon = LEVEL_ICONS[mod.number] || Sparkles;
            return (
              <div key={mod.id} className="sb-level">
                <button
                  type="button"
                  className={`sb-item ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => go(mod.studioType)}
                >
                  <span className="sb-icon" style={{ '--lv': mod.color }}><Icon size={16} /></span>
                  <span className="sb-label">
                    <span className="sb-level-n">Level {mod.number}</span>
                    {LEVEL_SHORT_NAMES[mod.id] || mod.toolBadge}
                  </span>
                  <span className={`sb-status ${complete ? 'is-done' : ''}`} aria-label={complete ? 'Completed' : `${doneCount} of ${hours.length} hours`}>
                    {complete ? <Check size={13} strokeWidth={3} /> : `${doneCount}/${hours.length}`}
                  </span>
                </button>

                {active && (
                  <ul className="sb-hours">
                    {mod.hoursList.map((h) => {
                      const checked = completedHours.includes(h.hour);
                      return (
                        <li key={h.hour}>
                          <button
                            type="button"
                            className={`sb-hour ${checked ? 'is-checked' : ''}`}
                            onClick={() => onToggleHour(h.hour)}
                            aria-pressed={checked}
                            title="Mark this hour as complete"
                          >
                            <span className="sb-check" aria-hidden="true">{checked && <Check size={11} strokeWidth={3} />}</span>
                            <span><span className="sb-hour-n">Hour {h.hour}</span> {h.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="sb-user" ref={menuRef}>
        {menuOpen && (
          <div className="sb-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEditProfile(); }}><Pencil size={15} /> Edit profile</button>
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onOpenThemeModal(); }}><Sparkles size={15} /> Change project</button>
            {isAdmin && (
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onOpenKeyModal(); }}>
                <Settings size={15} /> AI settings <span className={`sb-dot ${aiReady ? 'is-on' : ''}`} aria-label={aiReady ? 'Connected' : 'Not connected'} />
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); go('landing'); }}><Globe size={15} /> Back to website</button>
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onLeaveStudio(); }}><LogOut size={15} /> Leave the studio</button>
          </div>
        )}
        <button type="button" className="sb-user-btn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
          <Avatar name={userProfile?.name} size={34} />
          <span className="sb-user-text">
            <span className="sb-user-name">{userProfile?.name}</span>
            <span className="sb-user-role">{userProfile?.role}</span>
          </span>
          <ChevronUp size={16} className={`sb-user-caret ${menuOpen ? 'is-open' : ''}`} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
