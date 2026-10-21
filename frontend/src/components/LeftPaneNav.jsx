import React, { useState, useEffect } from 'react';
import { KreomaxIcon } from './KreomaxLogo';
import { 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Award, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  Circle,
  X,
  Compass,
  Rocket,
  Landmark,
  ShieldAlert,
  GraduationCap,
  Zap,
  Key,
  Check,
  User,
  MessageSquare
} from 'lucide-react';
import './LeftPaneNav.css';

export const INDIAN_THEMES = [
  {
    id: "chandrayaan",
    title: "🚀 Mission Chandrayaan 2085: Secret of the Lunar Water Vault",
    shortTitle: "Chandrayaan 2085",
    tag: "ISRO Space Exploration",
    icon: Rocket,
    color: "#38BDF8"
  },
  {
    id: "varanasi",
    title: "🛕 Cyber-Varanasi 2090: The Floating Solar Ghats",
    shortTitle: "Cyber-Varanasi 2090",
    tag: "Heritage & Renewable Energy",
    icon: Landmark,
    color: "#F59E0B"
  },
  {
    id: "hampi",
    title: "🏛️ Hampi Algorithm Code: Secrets of the Vijayanagara AI Relic",
    shortTitle: "Hampi Algorithm Code",
    tag: "Archaeology & Cryptography",
    icon: Compass,
    color: "#10B981"
  },
  {
    id: "coastal",
    title: "🌊 Sundarbans 2100: Bio-Engineered Mangrove Sentinels",
    shortTitle: "Sundarbans 2100",
    tag: "Eco-Tech & Climate Defense",
    icon: ShieldAlert,
    color: "#EC4899"
  }
];

const LEVEL_ICONS = {
  1: Sparkles,
  2: BookOpen,
  3: ImageIcon,
  4: Video,
  5: Layout,
  6: Award
};

export const LEVEL_SHORT_NAMES = {
  m1: "Story Writing",
  m2: "Research",
  m3: "Images & Art",
  m4: "Video & Animation",
  m5: "Website Builder",
  m6: "Final Project"
};

export const LEVEL_BADGES = {
  m1: { title: "AI Story Creator", icon: "✍️", badge: "Story Creator" },
  m2: { title: "AI Researcher", icon: "🔍", badge: "Researcher" },
  m3: { title: "Digital Artist", icon: "🎨", badge: "Digital Artist" },
  m4: { title: "AI Animator", icon: "🎬", badge: "Animator" },
  m5: { title: "Web Developer", icon: "💻", badge: "Web Developer" },
  m6: { title: "Master Innovator", icon: "🏆", badge: "Master Innovator" }
};

export function LeftPaneNav({
  activeTab,
  setActiveTab,
  modules,
  completedHours,
  onToggleHour,
  projectTheme,
  setProjectTheme,
  userProfile,
  setUserProfile,
  gatewayStatus,
  onOpenKeyModal,
  isMobileOpen,
  setIsMobileOpen,
  onOpenTrainerGuide,
  onOpenThemeModal
}) {
  const [expandedModuleId, setExpandedModuleId] = useState('m1');
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const mod = modules.find(m => m.studioType === activeTab);
    if (mod) setExpandedModuleId(mod.id);
  }, [activeTab, modules]);

  const totalCompleted = completedHours.length;
  const progressPct = Math.round((totalCompleted / 24) * 100);

  const toggleUserRole = () => {
    if (userProfile.role.includes("Student") || userProfile.role.includes("Innovator") || userProfile.role.includes("Learner")) {
      setUserProfile({
        name: "Dr. Vikram Rao",
        email: "vikram.rao@isro.gov.in",
        role: "ISRO Mentor",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      });
    } else {
      setUserProfile({
        name: "Aarav Sharma",
        email: "aarav.sharma@atl.gov.in",
        role: "ATL Innovator (Grade 8)",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"
      });
    }
  };

  const handleSelectTheme = (theme) => {
    setProjectTheme(theme.title);
    setShowThemePicker(false);
  };

  const currentThemeObj = INDIAN_THEMES.find(t => t.title === projectTheme) || {
    id: "custom",
    title: projectTheme,
    shortTitle: projectTheme.length > 20 ? projectTheme.slice(0, 20) + "..." : projectTheme,
    tag: "Custom Project",
    icon: Sparkles,
    color: "#4F46E5"
  };

  return (
    <aside className={`ca-sidebar-pane ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile Close Button */}
      <button 
        className="ca-sidebar-mobile-close"
        onClick={() => setIsMobileOpen(false)}
        aria-label="Close navigation"
      >
        <X size={18} />
      </button>

      {/* Kreomax Brand Header with Logo */}
      <div className="ca-sidebar-brand" onClick={() => setActiveTab('landing')} title="Kreomax — Return to Home Landing Page">
        <div className="ca-brand-icon kreomax-logo-wrap">
          <KreomaxIcon size={34} />
        </div>
        <div className="ca-brand-info">
          <span className="ca-brand-title">
            KREO<span className="ca-brand-max">MAX</span>
          </span>
          <span className="ca-brand-tag">CREATOR STUDIO</span>
        </div>
      </div>

      {/* Unified User & Mentor Card */}
      <div className="ca-profile-dock glass-panel">
        <div className="ca-user-mini-row" onClick={toggleUserRole} title="Click to toggle Student / Mentor view">
          <img 
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"} 
            alt={userProfile?.name} 
            className="ca-profile-avatar"
          />
          <div className="ca-profile-names">
            <span className="ca-profile-student-name">{userProfile?.name}</span>
            <span className="ca-profile-student-role">{userProfile?.role}</span>
          </div>
        </div>

        {/* Mentor Shortcut Bar */}
        <div className="ca-mentor-action-bar" onClick={onOpenTrainerGuide} title="Open AI Mentor Guidance">
          <div className="ca-mentor-left">
            <span className="ca-mentor-pulse-dot" />
            <span className="ca-mentor-text">Mentor: <strong>Dr. Vikram Rao</strong></span>
          </div>
          <span className="ca-mentor-ask-tag">Ask 💬</span>
        </div>
      </div>

      {/* Project Theme Selector / Customizer */}
      <div className="ca-theme-compact-box">
        <button 
          className="ca-theme-compact-btn"
          onClick={onOpenThemeModal}
          title="Click to customize your project theme or pick an example template"
        >
          <div className="flex items-center gap-2 min-w-0">
            <currentThemeObj.icon size={14} style={{ color: currentThemeObj.color, flexShrink: 0 }} />
            <div className="text-left min-w-0">
              <div className="ca-theme-compact-title">{currentThemeObj.shortTitle}</div>
              <div className="ca-theme-compact-sub">{currentThemeObj.tag} · Change ✏️</div>
            </div>
          </div>
          <Sparkles size={13} className="text-cyan" />
        </button>
      </div>

      {/* Minimal Progress Bar */}
      <div className="ca-progress-compact">
        <div className="ca-progress-row">
          <span>Course Completion</span>
          <span className="ca-pct-value">{progressPct}%</span>
        </div>
        <div className="ca-progress-track">
          <div 
            className="ca-progress-bar" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Missions Nav Header */}
      <div className="ca-nav-heading-row">
        <span>CURRICULUM</span>
      </div>


      <nav className="ca-missions-list">
        {modules.map((mod) => {
          const hours = mod.hoursList.map(h => h.hour);
          const isDone = hours.every(h => completedHours.includes(h));
          const isActive = activeTab === mod.studioType;
          const isExpanded = expandedModuleId === mod.id;
          const IconComp = LEVEL_ICONS[mod.number] || Sparkles;

          return (
            <div key={mod.id} className={`ca-mission-item ${isActive ? 'active' : ''}`}>
              <div 
                className="ca-mission-header-row"
                onClick={() => {
                  setActiveTab(mod.studioType);
                  setExpandedModuleId(mod.id);
                }}
              >
                <div 
                  className="ca-mission-icon-wrap"
                  style={{ color: mod.color, background: `${mod.color}15` }}
                >
                  <IconComp size={14} />
                </div>

                <div className="ca-mission-title-group">
                  <span className="ca-level-tag-mini" style={{ color: mod.color }}>L{mod.number}</span>
                  <span className="ca-mission-label">{LEVEL_SHORT_NAMES[mod.id] || mod.toolBadge}</span>
                </div>

                <div className="ca-mission-right-tools">
                  {isDone ? (
                    <CheckCircle2 size={13} className="text-emerald" />
                  ) : (
                    <span className="ca-hours-badge">4h</span>
                  )}
                  <button 
                    className="ca-expand-chevron"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedModuleId(isExpanded ? null : mod.id);
                    }}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                </div>
              </div>

              {/* Detailed 4-Hour Breakdown with Milestone Title */}
              {isExpanded && (
                <div className="ca-hours-detail-container">
                  <div className={`ca-milestone-title-pill ${isDone ? 'earned' : 'target'}`}>
                    <span className="ca-milestone-icon">{isDone ? '🏆' : '🎯'}</span>
                    <span className="ca-milestone-text">
                      {isDone ? 'Title: ' : 'Unlocks: '}
                      <strong>{LEVEL_BADGES[mod.id]?.title || mod.completionTitle}</strong>
                    </span>
                  </div>

                  <div className="ca-hours-breakdown-list">
                    {mod.hoursList.map((h) => {
                      const hourDone = completedHours.includes(h.hour);
                      return (
                        <div 
                          key={h.hour}
                          className={`ca-hour-item-row ${hourDone ? 'done' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHour(h.hour);
                          }}
                          title={`Hour ${h.hour}: Click to mark complete`}
                        >
                          <div className={`ca-hour-check-box ${hourDone ? 'checked' : ''}`}>
                            {hourDone ? <Check size={10} /> : <span className="ca-hour-num-text">{h.hour}</span>}
                          </div>
                          <div className="ca-hour-info-col">
                            <div className="ca-hour-title-line">
                              <span className="ca-hour-title-name">{h.title}</span>
                              <span className="ca-hour-duration-chip">{h.duration || "1 hr"}</span>
                            </div>
                            {h.summary && (
                              <div className="ca-hour-summary-text">{h.summary}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: AI Hub Status */}
      <div className="ca-sidebar-bottom">
        <button 
          className={`ca-hub-status-pill ${gatewayStatus?.gemini?.configured || gatewayStatus?.chatgpt?.configured ? 'active' : 'idle'}`}
          onClick={onOpenKeyModal}
        >
          <Zap size={13} className={gatewayStatus?.gemini?.configured ? "text-emerald" : "text-amber"} />
          <div className="text-left flex-1 min-w-0">
            <div className="ca-hub-title">LMS AI Gateway</div>
            <div className="ca-hub-sub">
              {gatewayStatus?.gemini?.configured ? "Multi-Tool Hub Active ✓" : "Connect AI Hub"}
            </div>
          </div>
          <Key size={12} className="text-cyan" />
        </button>
      </div>
    </aside>
  );
}
