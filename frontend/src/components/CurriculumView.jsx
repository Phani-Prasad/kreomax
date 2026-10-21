import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle,
  Edit3,
  Compass
} from 'lucide-react';
import './CurriculumView.css';

const LEVELS = [
  {
    id: "m1",
    number: 1,
    title: "Story Writing",
    tool: "ChatGPT",
    completionTitle: "AI Story Creator",
    color: "#059669",
    studioType: "story",
    icon: Sparkles
  },
  {
    id: "m2",
    number: 2,
    title: "Research",
    tool: "NotebookLM",
    completionTitle: "AI Researcher",
    color: "#4F46E5",
    studioType: "notebooklm",
    icon: BookOpen
  },
  {
    id: "m3",
    number: 3,
    title: "Images & Art",
    tool: "Midjourney",
    completionTitle: "Digital Artist",
    color: "#7C3AED",
    studioType: "visual",
    icon: ImageIcon
  },
  {
    id: "m4",
    number: 4,
    title: "Video & Animation",
    tool: "Google Veo",
    completionTitle: "AI Animator",
    color: "#DB2777",
    studioType: "motion",
    icon: Video
  },
  {
    id: "m5",
    number: 5,
    title: "Website Builder",
    tool: "Web Studio",
    completionTitle: "Web Developer",
    color: "#D97706",
    studioType: "web-builder",
    icon: Layout
  },
  {
    id: "m6",
    number: 6,
    title: "Final Project",
    tool: "Review & Cert",
    completionTitle: "Master Innovator",
    color: "#0284C7",
    studioType: "capstone",
    icon: Award
  }
];

export function CurriculumView({ 
  modules, 
  completedHours, 
  onLaunchStudio,
  projectTheme,
  onOpenThemeModal,
  onSwitchToRoadmap
}) {
  const totalCompleted = completedHours.length;
  const progressPct = Math.round((totalCompleted / 24) * 100);

  const activeLevel = LEVELS.find(lvl => {
    const mod = modules.find(m => m.id === lvl.id);
    if (!mod) return false;
    const hours = mod.hoursList.map(h => h.hour);
    return !hours.every(h => completedHours.includes(h));
  }) || LEVELS[0];

  return (
    <div className="ca-curr-container">
      {/* Simple Header */}
      <div className="ca-hero-banner glass-panel">
        <div className="ca-hero-content">
          <h1 className="ca-hero-headline">AI Creator Course</h1>
          <div className="ca-hero-theme-row">
            <span className="ca-theme-prefix">Project:</span>
            <span className="theme-highlight">{projectTheme}</span>
            <button 
              className="ca-theme-edit-btn" 
              onClick={onOpenThemeModal}
              title="Create your own project theme or pick an example"
            >
              <Edit3 size={12} />
              <span>Change / Create Theme</span>
            </button>
          </div>
        </div>

        <div className="ca-hero-action-box">
          {onSwitchToRoadmap && (
            <button 
              className="ca-roadmap-switch-hero-btn"
              onClick={onSwitchToRoadmap}
              title="Switch to pictorial visual journey representation"
            >
              <Compass size={15} />
              <span>🗺️ Learning Journey Roadmap</span>
            </button>
          )}

          <div className="ca-progress-pill">
            <span>{totalCompleted}/24 Hours Done ({progressPct}%)</span>
            <div className="ca-progress-track">
              <div className="ca-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <button 
            className="ca-resume-btn"
            onClick={() => onLaunchStudio(activeLevel.studioType)}
            style={{ background: activeLevel.color }}
          >
            <PlayCircle size={16} />
            <span>Open Level {activeLevel.number}: {activeLevel.title}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 6 Simple Level Cards */}
      <div className="ca-cards-grid">
        {LEVELS.map((level) => {
          const mod = modules.find(m => m.id === level.id);
          const hours = mod ? mod.hoursList.map(h => h.hour) : [];
          const isDone = hours.length > 0 && hours.every(h => completedHours.includes(h));
          const IconComp = level.icon;

          return (
            <div 
              key={level.id}
              className={`ca-level-card glass-panel ${isDone ? 'completed' : ''}`}
              onClick={() => onLaunchStudio(level.studioType)}
            >
              <div className="ca-card-top-row">
                <div 
                  className="ca-card-icon-pill"
                  style={{ color: level.color, background: `${level.color}15` }}
                >
                  <IconComp size={20} />
                </div>

                {isDone ? (
                  <span className="ca-done-chip">
                    <CheckCircle2 size={13} />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="ca-level-pill" style={{ color: level.color }}>
                    LEVEL {level.number}
                  </span>
                )}
              </div>

              <div className="ca-card-main-content">
                <div className="ca-card-title-row">
                  <h3 className="ca-card-level-title">{level.title}</h3>
                  <span className="ca-tool-chip">{level.tool}</span>
                </div>

                {/* Milestone Title Badge */}
                <div className={`ca-card-milestone-pill ${isDone ? 'earned' : 'target'}`}>
                  <span className="ca-milestone-icon">{isDone ? '🏆' : '🎯'}</span>
                  <span className="ca-milestone-lbl">
                    {isDone ? 'Title Earned: ' : 'Unlock Title: '}
                    <strong>{level.completionTitle}</strong>
                  </span>
                </div>

                {/* 4-Hour Curriculum Plan */}
                <div className="ca-card-hours-stack">
                  {mod?.hoursList?.map((h) => {
                    const isHourDone = completedHours.includes(h.hour);
                    return (
                      <div key={h.hour} className={`ca-card-hour-pill ${isHourDone ? 'done' : ''}`}>
                        <span className="ca-card-hour-dot">{isHourDone ? '✓' : h.hour}</span>
                        <span className="ca-card-hour-name">{h.title}</span>
                        <span className="ca-card-hour-time">{h.duration || "1 hr"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ca-card-action">
                <span>{isDone ? 'Review Studio' : 'Start Practice'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
