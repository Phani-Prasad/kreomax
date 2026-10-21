import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Check,
  PlayCircle,
  Edit3,
  MapPin,
  Trophy,
  Compass,
  Star,
  List,
  Layers,
  Clock,
  Sparkle,
  Zap,
  ChevronRight
} from 'lucide-react';
import './RoadmapView.css';

const ROADMAP_STATIONS = [
  {
    level: 1,
    id: "m1",
    title: "Story Writing Lab",
    subtitle: "Narrative Arc & World Building",
    tool: "ChatGPT",
    color: "#059669",
    glowColor: "#10B981",
    heroImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(5, 150, 105, 0.08)",
    borderColor: "rgba(5, 150, 105, 0.3)",
    studioType: "story",
    hoursRange: "Hours 1 – 4",
    hours: [1, 2, 3, 4],
    completionTitle: "AI Story Creator",
    deliverable: "Multi-Scene Story Script & Lore",
    badgeEmoji: "✍️",
    summary: "Write rich character profiles, lore, and a 4-scene narrative blueprint.",
    milestones: [
      { h: 1, name: "Prompt Basics", desc: "Foundations & Persona setup" },
      { h: 2, name: "World Lore", desc: "Setting the scene & atmosphere" },
      { h: 3, name: "Hero Backstory", desc: "Character flaws & motivation" },
      { h: 4, name: "Script Polishing", desc: "Final 4-scene dialogue script" }
    ]
  },
  {
    level: 2,
    id: "m2",
    title: "AI Research Core",
    subtitle: "Source-Grounded Fact Dossier",
    tool: "NotebookLM",
    color: "#4F46E5",
    glowColor: "#3B82F6",
    heroImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.3)",
    studioType: "notebooklm",
    hoursRange: "Hours 5 – 8",
    hours: [5, 6, 7, 8],
    completionTitle: "AI Researcher",
    deliverable: "Verified Research Dossier & Audio Brief",
    badgeEmoji: "🔬",
    summary: "Grounded research with citations, fact validation, and deep-dive notes.",
    milestones: [
      { h: 5, name: "Source Upload", desc: "Ingesting verified knowledge PDFs" },
      { h: 6, name: "Fact Mining", desc: "Grounded Q&A with real citations" },
      { h: 7, name: "Audio Overview", desc: "Podcast-style concept synthesis" },
      { h: 8, name: "Dossier Export", desc: "Exporting clean briefing notes" }
    ]
  },
  {
    level: 3,
    id: "m3",
    title: "Digital Art Studio",
    subtitle: "Concept Art & Character Keyframes",
    tool: "Midjourney",
    color: "#7C3AED",
    glowColor: "#A855F7",
    heroImage: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(124, 58, 237, 0.08)",
    borderColor: "rgba(124, 58, 237, 0.3)",
    studioType: "visual",
    hoursRange: "Hours 9 – 12",
    hours: [9, 10, 11, 12],
    completionTitle: "Digital Artist",
    deliverable: "4K Character & Environment Art Pack",
    badgeEmoji: "🎨",
    summary: "Master visual style prompts, lighting, camera angles, and high-res art renders.",
    milestones: [
      { h: 9, name: "Visual Prompting", desc: "Styles, aspect ratios & lighting" },
      { h: 10, name: "Hero Character", desc: "Consistent portrait generation" },
      { h: 11, name: "Keyframe Scenes", desc: "4 panoramic story world frames" },
      { h: 12, name: "Art Pack Export", desc: "High-res asset bundle download" }
    ]
  },
  {
    level: 4,
    id: "m4",
    title: "Motion & Animation Lab",
    subtitle: "Cinematic Trailer Reel",
    tool: "Google Veo",
    color: "#DB2777",
    glowColor: "#F43F5E",
    heroImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(219, 39, 119, 0.08)",
    borderColor: "rgba(219, 39, 119, 0.3)",
    studioType: "motion",
    hoursRange: "Hours 13 – 16",
    hours: [13, 14, 15, 16],
    completionTitle: "AI Animator",
    deliverable: "32-Second Movie Trailer Reel",
    badgeEmoji: "🎬",
    summary: "Transform still images into dynamic camera motion clips with audio synchronization.",
    milestones: [
      { h: 13, name: "Image-to-Video", desc: "Keyframe animation & prompt motion" },
      { h: 14, name: "Camera Direction", desc: "Cinematic drone pans & zooms" },
      { h: 15, name: "Soundtrack Sync", desc: "Voiceover & background SFX" },
      { h: 16, name: "Trailer Export", desc: "Final 32s MP4 video render" }
    ]
  },
  {
    level: 5,
    id: "m5",
    title: "Interactive Web Studio",
    subtitle: "Showcase Website Architecture",
    tool: "Web Studio",
    color: "#D97706",
    glowColor: "#F59E0B",
    heroImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(217, 119, 6, 0.08)",
    borderColor: "rgba(217, 119, 6, 0.3)",
    studioType: "web-builder",
    hoursRange: "Hours 17 – 20",
    hours: [17, 18, 19, 20],
    completionTitle: "Web Developer",
    deliverable: "Live Showcase Website Package (.ZIP)",
    badgeEmoji: "💻",
    summary: "Code and publish a portfolio website showcasing your story, gallery, and video.",
    milestones: [
      { h: 17, name: "Showcase Layout", desc: "Hero banner, reader & media grid" },
      { h: 18, name: "Device Testing", desc: "Mobile & tablet responsiveness" },
      { h: 19, name: "HTML/CSS Code", desc: "Inspect markup & connect assets" },
      { h: 20, name: "Site ZIP Export", desc: "Download deployable website package" }
    ]
  },
  {
    level: 6,
    id: "m6",
    title: "Capstone Vault & Review",
    subtitle: "Portfolio Rubric & Certification",
    tool: "Review & Cert",
    color: "#0284C7",
    glowColor: "#38BDF8",
    heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    accentBg: "rgba(2, 132, 199, 0.08)",
    borderColor: "rgba(2, 132, 199, 0.3)",
    studioType: "capstone",
    hoursRange: "Hours 21 – 24",
    hours: [21, 22, 23, 24],
    completionTitle: "Master Innovator",
    deliverable: "100/100 Rubric Score & Official Certificate",
    badgeEmoji: "🌟",
    summary: "Assemble all 5 assets, complete mentor rubric review, and claim graduation honors.",
    milestones: [
      { h: 21, name: "Pipeline Review", desc: "Audit full 5-tool creator flow" },
      { h: 22, name: "Portfolio Bundle", desc: "Package master deliverables zip" },
      { h: 23, name: "Mentor Rubric", desc: "Grade across 4 evaluative pillars" },
      { h: 24, name: "Official Cert", desc: "Claim verifiable ATL certificate" }
    ]
  }
];

export function RoadmapView({
  completedHours = [],
  onToggleHour,
  onLaunchStudio,
  projectTheme,
  onOpenThemeModal,
  onSwitchToCurriculumList
}) {
  const [selectedStation, setSelectedStation] = useState(null);

  const totalCompleted = completedHours.length;
  const progressPct = Math.round((totalCompleted / 24) * 100);

  // Determine current active station
  const currentStation = ROADMAP_STATIONS.find(s => {
    return !s.hours.every(h => completedHours.includes(h));
  }) || ROADMAP_STATIONS[ROADMAP_STATIONS.length - 1];

  const badgesUnlockedCount = ROADMAP_STATIONS.filter(s => 
    s.hours.every(h => completedHours.includes(h))
  ).length;

  return (
    <div className="ca-roadmap-container">
      {/* Top Hero & View Switcher */}
      <div className="ca-roadmap-hero glass-panel">
        <div className="ca-roadmap-hero-main">
          <div className="ca-roadmap-badge-top">
            <Compass size={14} className="text-blue" />
            <span>LEARNING JOURNEY</span>
          </div>
          <h1 className="ca-roadmap-title">The 24-Hour Creator Odyssey</h1>
          <p className="ca-roadmap-subtitle">
            An interactive visual path from your first spark of inspiration to a certified, published AI portfolio.
          </p>

          <div className="ca-roadmap-theme-bar">
            <span className="ca-theme-label">Active Project:</span>
            <span className="ca-theme-value">{projectTheme}</span>
            <button 
              className="ca-theme-change-pill"
              onClick={onOpenThemeModal}
              title="Change or create your original project theme"
            >
              <Edit3 size={12} />
              <span>Change / Create Theme</span>
            </button>
          </div>
        </div>

        {/* Gamified Summary Stats */}
        <div className="ca-roadmap-stats-card">
          <div className="ca-stat-item">
            <div className="ca-stat-num">{totalCompleted}<span className="ca-stat-max">/24</span></div>
            <div className="ca-stat-lbl">Hours Completed</div>
          </div>
          <div className="ca-stat-divider" />
          <div className="ca-stat-item">
            <div className="ca-stat-num text-amber">{badgesUnlockedCount}<span className="ca-stat-max">/6</span></div>
            <div className="ca-stat-lbl">Titles Earned</div>
          </div>
          <div className="ca-stat-divider" />
          <div className="ca-stat-item">
            <div className="ca-stat-num text-blue">{progressPct}%</div>
            <div className="ca-stat-lbl">Journey Progress</div>
          </div>

          <div className="ca-roadmap-view-toggle">
            <button 
              className="ca-toggle-btn active"
              title="Visual Roadmap"
            >
              <Compass size={13} />
              <span>Roadmap</span>
            </button>
            <button 
              className="ca-toggle-btn"
              onClick={onSwitchToCurriculumList}
              title="Detailed Table / Cards"
            >
              <List size={13} />
              <span>Curriculum Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* PICTORIAL JOURNEY BOARD: 6 Illustrated Visual Stations */}
      <div className="ca-pictorial-board">
        {ROADMAP_STATIONS.map((station, index) => {
          const isDone = station.hours.every(h => completedHours.includes(h));
          const isCurrent = currentStation.id === station.id;
          const completedCount = station.hours.filter(h => completedHours.includes(h)).length;
          const isExpanded = selectedStation === station.id;

          return (
            <div 
              key={station.id} 
              className={`ca-station-card glass-panel ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
              style={{ 
                '--station-color': station.color,
                '--station-border': station.borderColor,
                '--station-bg': station.accentBg
              }}
            >
              {/* Top Station Header */}
              <div className="ca-station-header">
                <div className="ca-station-level-badge">
                  <span className="ca-level-num">LEVEL 0{station.level}</span>
                  <span className="ca-station-tool-pill">{station.tool}</span>
                </div>

                {isDone ? (
                  <div className="ca-status-chip done">
                    <CheckCircle2 size={13} />
                    <span>COMPLETED</span>
                  </div>
                ) : isCurrent ? (
                  <div className="ca-status-chip current">
                    <div className="ca-live-dot" />
                    <span>IN PROGRESS</span>
                  </div>
                ) : (
                  <div className="ca-status-chip pending">
                    <span>UPCOMING</span>
                  </div>
                )}
              </div>

              {/* Professional Visual Hero Banner */}
              <div 
                className="ca-station-artwork bright-power-banner"
                onClick={() => onLaunchStudio(station.studioType)}
                title={`Open Level ${station.level}: ${station.title}`}
              >
                <img 
                  src={station.heroImage} 
                  alt={station.title}
                  className="ca-power-hero-img"
                  loading="lazy" 
                />

                {/* Subtle Gradient Overlay for Readable Badges */}
                <div 
                  className="ca-power-gradient-overlay" 
                  style={{ 
                    background: `linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.3) 45%, rgba(15, 23, 42, 0.9) 100%)` 
                  }}
                />

                {/* Subtle Accent Stripe at Top */}
                <div className="ca-power-glow-stripe" style={{ background: station.color }} />

                {/* Clean Floating Badges */}
                <div className="ca-power-floating-badges">
                  <div className="ca-power-tool-badge" style={{ background: station.color }}>
                    <Sparkles size={11} />
                    <span>{station.tool}</span>
                  </div>

                  <div className="ca-power-milestone-badge">
                    <Trophy size={11} className="text-amber" />
                    <span>{isDone ? `🏆 ${station.completionTitle}` : `🎯 ${station.completionTitle}`}</span>
                  </div>
                </div>

                {/* Hover Launch Overlay */}
                <div className="ca-station-hover-overlay">
                  <PlayCircle size={28} />
                  <span>Launch Level {station.level}</span>
                </div>
              </div>

              {/* Station Body */}
              <div className="ca-station-body">
                {/* Title & Hours */}
                <div className="ca-station-title-row">
                  <h3 className="ca-station-name">{station.title}</h3>
                  <span className="ca-station-hours-chip">{station.hoursRange}</span>
                </div>

                {/* Key Deliverable (Single Line) */}
                <div className="ca-station-deliv-line">
                  <Sparkles size={12} style={{ color: station.color, flexShrink: 0 }} />
                  <span className="ca-deliv-text"><strong>Output:</strong> {station.deliverable}</span>
                </div>

                {/* 4-Hour Compact Stepping Strip */}
                <div className="ca-station-steps-row">
                  {station.milestones.map((ms) => {
                    const hourDone = completedHours.includes(ms.h);
                    return (
                      <button 
                        key={ms.h}
                        className={`ca-mini-step-pill ${hourDone ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHour(ms.h);
                        }}
                        title={`Hour ${ms.h}: ${ms.name} (Click to toggle)`}
                      >
                        {hourDone ? <Check size={10} strokeWidth={3} /> : <span className="ca-mini-num">{ms.h}</span>}
                        <span className="ca-mini-name">{ms.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Launch Studio Button */}
                <button 
                  className="ca-station-launch-btn compact"
                  onClick={() => onLaunchStudio(station.studioType)}
                  style={{ background: station.color }}
                >
                  <span>Open Level {station.level}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Connecting arrow indicator between cards in sequence */}
              {index < ROADMAP_STATIONS.length - 1 && (
                <div className="ca-station-connector-arrow">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graduation Vault Callout Banner */}
      <div className="ca-graduation-vault-callout glass-panel">
        <div className="ca-vault-icon-badge">
          <Award size={36} className="text-amber" />
        </div>
        <div className="ca-vault-content">
          <div className="ca-vault-tag">FINAL DESTINATION • HOUR 24</div>
          <h2 className="ca-vault-title">The Master AI Creator Portfolio & Certificate</h2>
          <p className="ca-vault-desc">
            Complete all 6 stations for <strong>{projectTheme}</strong> to compile your research dossier, 4-scene script, 4K art gallery, 32-second video trailer, and responsive website into an official, verifiable portfolio.
          </p>
        </div>
        <button 
          className="ca-vault-enter-btn"
          onClick={() => onLaunchStudio('capstone')}
        >
          <Award size={16} />
          <span>View Capstone Vault</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Custom Pictorial SVG Illustrations for each station
function renderStationIllustration(type, primaryColor) {
  switch (type) {
    case 'story':
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#storyGrad)" stroke="#059669" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Scroll / Manuscript */}
          <rect x="40" y="28" width="130" height="74" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
          <line x1="56" y1="44" x2="144" y2="44" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="58" x2="130" y2="58" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="70" x2="140" y2="70" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="82" x2="110" y2="82" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

          {/* AI Quill / Sparkle Pen */}
          <path d="M210 30 L245 65 L215 95 L200 85 Z" fill="#059669" opacity="0.85" />
          <path d="M195 90 L185 102 L202 96 Z" fill="#F59E0B" />
          <circle cx="255" cy="40" r="4" fill="#10B981" />
          <circle cx="270" cy="55" r="2.5" fill="#F59E0B" />
          <circle cx="240" cy="20" r="3" fill="#059669" />
          
          {/* Floating Dialogue Cloud */}
          <rect x="190" y="45" width="85" height="32" rx="16" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.2" />
          <text x="232" y="66" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700" fontFamily="sans-serif">ChatGPT</text>
        </svg>
      );

    case 'research':
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="resGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#resGrad)" stroke="#4F46E5" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Central Knowledge Node */}
          <circle cx="160" cy="65" r="26" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="160" cy="65" r="14" fill="#4F46E5" />
          
          {/* Orbiting Satellite Data Pods */}
          <line x1="160" y1="65" x2="80" y2="40" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="80" cy="40" r="16" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
          <text x="80" y="44" textAnchor="middle" fill="#1E40AF" fontSize="9" fontWeight="700">PDF</text>

          <line x1="160" y1="65" x2="240" y2="45" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="240" cy="45" r="16" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
          <text x="240" y="49" textAnchor="middle" fill="#1E40AF" fontSize="9" fontWeight="700">FACT</text>

          <line x1="160" y1="65" x2="110" y2="95" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="110" cy="95" r="14" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
          <text x="110" y="99" textAnchor="middle" fill="#1E40AF" fontSize="8" fontWeight="700">CITE</text>

          <line x1="160" y1="65" x2="225" y2="92" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="225" cy="92" r="14" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
          <text x="225" y="96" textAnchor="middle" fill="#1E40AF" fontSize="8" fontWeight="700">AUDIO</text>
        </svg>
      );

    case 'art':
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="artGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3E8FF" />
              <stop offset="100%" stopColor="#E9D5FF" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#artGrad)" stroke="#7C3AED" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Framed Canvas */}
          <rect x="45" y="24" width="120" height="80" rx="6" fill="url(#canvasGrad)" stroke="#7C3AED" strokeWidth="1.8" />
          {/* Mountain / Sun in Canvas */}
          <circle cx="80" cy="46" r="10" fill="#F59E0B" />
          <polygon points="50,95 85,60 115,95" fill="#7C3AED" opacity="0.6" />
          <polygon points="90,95 125,50 160,95" fill="#6D28D9" opacity="0.8" />

          {/* Artist Palette */}
          <path d="M225 35 C255 35 275 55 275 75 C275 95 255 105 230 105 C215 105 200 95 200 85 C200 78 208 72 208 65 C208 50 215 35 225 35 Z" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.8" />
          <circle cx="235" cy="50" r="5" fill="#EF4444" />
          <circle cx="255" cy="62" r="5" fill="#3B82F6" />
          <circle cx="255" cy="82" r="5" fill="#10B981" />
          <circle cx="235" cy="92" r="5" fill="#F59E0B" />
          <circle cx="218" cy="85" r="4.5" fill="#F1F5F9" stroke="#7C3AED" strokeWidth="1" />
        </svg>
      );

    case 'video':
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DB2777" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#vidGrad)" stroke="#DB2777" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Film Strip Frame */}
          <rect x="40" y="32" width="140" height="68" rx="8" fill="#1E293B" stroke="#DB2777" strokeWidth="1.5" />
          <rect x="48" y="42" width="124" height="48" rx="4" fill="#0F172A" />
          {/* Play Triangle */}
          <polygon points="105,56 122,66 105,76" fill="#DB2777" />
          {/* Perforations */}
          <rect x="48" y="35" width="8" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />
          <rect x="70" y="35" width="8" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />
          <rect x="92" y="35" width="8" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />
          <rect x="114" y="35" width="8" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />
          <rect x="136" y="35" width="8" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />

          {/* Clapperboard */}
          <rect x="210" y="40" width="70" height="52" rx="6" fill="#FFFFFF" stroke="#DB2777" strokeWidth="1.6" />
          <rect x="210" y="40" width="70" height="16" fill="#DB2777" />
          <line x1="225" y1="40" x2="235" y2="56" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="245" y1="40" x2="255" y2="56" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="265" y1="40" x2="275" y2="56" stroke="#FFFFFF" strokeWidth="2.5" />
          <text x="245" y="78" textAnchor="middle" fill="#DB2777" fontSize="10" fontWeight="700">VEO 4K</text>
        </svg>
      );

    case 'web':
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="webGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#webGrad)" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Browser Window */}
          <rect x="40" y="24" width="150" height="82" rx="8" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.6" />
          <rect x="40" y="24" width="150" height="18" rx="8" fill="#FEF3C7" />
          <circle cx="52" cy="33" r="3" fill="#EF4444" />
          <circle cx="62" cy="33" r="3" fill="#F59E0B" />
          <circle cx="72" cy="33" r="3" fill="#10B981" />
          <rect x="85" y="28" width="90" height="10" rx="4" fill="#FFFFFF" />

          {/* Web layout skeleton */}
          <rect x="50" y="48" width="60" height="24" rx="4" fill="#FDE68A" />
          <rect x="118" y="48" width="62" height="10" rx="2" fill="#E2E8F0" />
          <rect x="118" y="62" width="45" height="8" rx="2" fill="#E2E8F0" />
          <rect x="50" y="78" width="130" height="18" rx="3" fill="#F1F5F9" />

          {/* Floating Mobile Device */}
          <rect x="220" y="32" width="45" height="74" rx="7" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.6" />
          <rect x="225" y="40" width="35" height="56" rx="3" fill="#FEF3C7" />
          <circle cx="242" cy="101" r="2" fill="#D97706" />
        </svg>
      );

    case 'capstone':
    default:
      return (
        <svg viewBox="0 0 320 130" className="ca-station-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="110" rx="12" fill="url(#capGrad)" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="3 3" />
          
          {/* Trophy Cup */}
          <path d="M140 35 L180 35 L175 68 C175 78 168 84 160 84 C152 84 145 78 145 68 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <path d="M140 42 C125 42 125 58 142 60" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          <path d="M180 42 C195 42 195 58 178 60" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          {/* Trophy Base */}
          <rect x="156" y="84" width="8" height="12" fill="#D97706" />
          <rect x="146" y="96" width="28" height="8" rx="2" fill="#B45309" />

          {/* Star Laurels */}
          <circle cx="160" cy="55" r="5" fill="#FFFFFF" />
          <circle cx="95" cy="65" r="18" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <text x="95" y="70" textAnchor="middle" fill="#0369A1" fontSize="12" fontWeight="700">100</text>
          
          <circle cx="225" cy="65" r="18" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <text x="225" y="70" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="700">CERT</text>
        </svg>
      );
  }
}
