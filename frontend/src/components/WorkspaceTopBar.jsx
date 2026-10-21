import React from 'react';
import { 
  Menu, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  GraduationCap, 
  Zap, 
  Key, 
  Compass, 
  BookOpen, 
  Cpu, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Award,
  Sparkles,
  Edit3,
  Home
} from 'lucide-react';
import './WorkspaceTopBar.css';
import { INDIAN_THEMES, LEVEL_SHORT_NAMES } from './LeftPaneNav';

export function WorkspaceTopBar({
  activeTab,
  setActiveTab,
  modules,
  projectTheme,
  onOpenKeyModal,
  gatewayStatus,
  onOpenMobileNav,
  userProfile,
  onToggleRole,
  onOpenTrainerGuide,
  onOpenThemeModal
}) {
  const currentModIndex = modules.findIndex(m => m.studioType === activeTab);
  const currentMod = currentModIndex >= 0 ? modules[currentModIndex] : null;

  const prevMod = currentModIndex > 0 ? modules[currentModIndex - 1] : null;
  const nextMod = currentModIndex >= 0 && currentModIndex < modules.length - 1 ? modules[currentModIndex + 1] : null;

  const currentThemeObj = INDIAN_THEMES.find(t => t.title === projectTheme) || {
    id: "custom",
    title: projectTheme,
    shortTitle: projectTheme.length > 22 ? projectTheme.slice(0, 22) + "..." : projectTheme,
    tag: "Custom Project",
    icon: Sparkles,
    color: "#4F46E5"
  };

  return (
    <header className="ca-workspace-topbar glass-panel">
      <div className="ca-topbar-left">
        {/* Mobile Hamburger */}
        <button 
          className="ca-topbar-mobile-btn"
          onClick={onOpenMobileNav}
          aria-label="Open mission sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="ca-breadcrumbs">
          <button 
            className="ca-breadcrumb-item ca-bc-home"
            onClick={() => setActiveTab('landing')}
            title="Return to Kreomax Landing Page"
          >
            <Home size={13} className="text-cyan" />
            <span>Kreomax</span>
          </button>

          <ChevronRight size={13} className="ca-bc-arrow" />

          <button 
            className="ca-breadcrumb-item ca-bc-home"
            onClick={() => setActiveTab('roadmap')}
          >
            <Compass size={13} className="text-cyan" />
            <span>Roadmap</span>
          </button>

          <ChevronRight size={13} className="ca-bc-arrow" />

          {currentMod ? (
            <>
              <span className="ca-breadcrumb-item ca-bc-level" style={{ color: currentMod.color }}>
                Level {currentMod.number}: {LEVEL_SHORT_NAMES[currentMod.id] || currentMod.toolBadge}
              </span>
              <ChevronRight size={13} className="ca-bc-arrow" />
              <span className="ca-breadcrumb-item ca-bc-active">
                {currentMod.deliverable.split('(')[0].trim()}
              </span>
            </>
          ) : activeTab === 'curriculum' ? (
            <span className="ca-breadcrumb-item ca-bc-active">
              Curriculum Cards
            </span>
          ) : (
            <span className="ca-breadcrumb-item ca-bc-active">
              Learning Journey
            </span>
          )}
        </div>
      </div>

      {/* Center: Mission Theme Pill (Clickable) */}
      <div className="ca-topbar-center">
        <button 
          className="ca-mission-chip ca-mission-chip-btn"
          onClick={onOpenThemeModal}
          title="Click to customize your project theme or choose an example"
        >
          <currentThemeObj.icon size={13} style={{ color: currentThemeObj.color }} />
          <span className="ca-mission-tag">THEME:</span>
          <span className="ca-mission-title">{currentThemeObj.shortTitle}</span>
          <Edit3 size={11} className="ca-edit-theme-icon" />
        </button>
      </div>

      {/* Right: Actions & Step Nav */}
      <div className="ca-topbar-right">
        {/* Landing Page Button */}
        <button 
          className="ca-topbar-btn ca-btn-landing"
          onClick={() => setActiveTab('landing')}
          title="Return to Kreomax Landing Page"
        >
          <Home size={14} />
          <span className="hide-mobile">Landing Page</span>
        </button>

        {/* Roadmap Button if not already on roadmap */}
        {activeTab !== 'roadmap' && (
          <button 
            className="ca-topbar-btn ca-btn-roadmap"
            onClick={() => setActiveTab('roadmap')}
            title="View pictorial learning journey roadmap"
          >
            <Compass size={15} />
            <span>Roadmap</span>
          </button>
        )}

        {/* Prev / Next Step Buttons */}
        {prevMod && (
          <button 
            className="ca-topbar-btn ca-btn-nav"
            onClick={() => setActiveTab(prevMod.studioType)}
            title={`Go back to Level ${prevMod.number}`}
          >
            <ArrowLeft size={14} />
            <span className="hide-mobile">Level {prevMod.number}</span>
          </button>
        )}

        {nextMod ? (
          <button 
            className="ca-topbar-btn ca-btn-nav-primary"
            onClick={() => setActiveTab(nextMod.studioType)}
            style={{ background: `linear-gradient(135deg, ${nextMod.color}, #4338CA)` }}
            title={`Advance to Level ${nextMod.number}`}
          >
            <span>Next: Level {nextMod.number}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          activeTab !== 'curriculum' && activeTab !== 'roadmap' && (
            <button 
              className="ca-topbar-btn ca-btn-nav-primary"
              onClick={() => setActiveTab('capstone')}
              style={{ background: '#0284C7' }}
            >
              <span>Final Project</span>
            </button>
          )
        )}

        {/* Assigned Trainer & Mentor Guide Button */}
        <button 
          className="ca-topbar-btn ca-btn-trainer"
          onClick={onOpenTrainerGuide}
          title="Open Trainer & Mentor Guidance Panel (Dr. Vikram Rao)"
          style={{
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            color: '#38BDF8'
          }}
        >
          <GraduationCap size={15} className="text-cyan" />
          <span>🎓 Mentor Guide</span>
          <span className="ca-trainer-pulse-dot" />
        </button>

        {/* Master AI Gateway Pill */}
        <button 
          className={`ca-topbar-ai-pill ${gatewayStatus?.gemini?.configured || gatewayStatus?.chatgpt?.configured ? 'connected' : 'unconfigured'}`}
          onClick={onOpenKeyModal}
          title="Single Sign-On AI Gateway for ChatGPT, Gemini & ElevenLabs"
        >
          <Zap size={14} className={gatewayStatus?.gemini?.configured ? "text-emerald" : "text-amber"} />
          <span className="ca-topbar-ai-text hide-mobile">
            {gatewayStatus?.gemini?.configured ? "AI Hub: Active ✓" : "Connect AI Hub"}
          </span>
        </button>

        {/* User Profile Mini Avatar */}
        <div 
          className="ca-topbar-user" 
          onClick={onToggleRole}
          title={`Active User: ${userProfile?.name} (${userProfile?.role}). Click to switch role.`}
        >
          <img 
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"} 
            alt={userProfile?.name} 
            className="ca-topbar-avatar"
          />
        </div>
      </div>
    </header>
  );
}
