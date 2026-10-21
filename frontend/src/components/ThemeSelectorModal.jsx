import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Rocket, 
  Landmark, 
  Compass, 
  ShieldAlert, 
  Edit3, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import './ThemeSelectorModal.css';

export const EXAMPLE_TEMPLATES = [
  {
    id: "chandrayaan",
    title: "🚀 Mission Chandrayaan 2085: Secret of the Lunar Water Vault",
    shortTitle: "Chandrayaan 2085",
    tag: "ISRO Space Exploration",
    icon: Rocket,
    color: "#0284C7",
    description: "Astronaut cadets protecting hidden ice reserves in the Moon's South Pole."
  },
  {
    id: "varanasi",
    title: "🛕 Cyber-Varanasi 2090: The Floating Solar Ghats",
    shortTitle: "Cyber-Varanasi 2090",
    tag: "Heritage & Clean Energy",
    icon: Landmark,
    color: "#D97706",
    description: "Young coders restoring floating solar grids across the holy river."
  },
  {
    id: "hampi",
    title: "🏛️ Hampi Algorithm Code: Secrets of the Vijayanagara AI Relic",
    shortTitle: "Hampi Algorithm Code",
    tag: "Archaeology & AI",
    icon: Compass,
    color: "#059669",
    description: "Decode 500-year-old stone temple mathematics using neural networks."
  },
  {
    id: "coastal",
    title: "🌊 Sundarbans 2100: Bio-Engineered Mangrove Sentinels",
    shortTitle: "Sundarbans 2100",
    tag: "Eco-Tech Defense",
    icon: ShieldAlert,
    color: "#DB2777",
    description: "Autonomous drone network defending coastal mangroves from super-cyclones."
  }
];

const INSPIRATION_IDEAS = [
  "🚀 Mars Colony 2075: The Underground Bio-Dome",
  "🤖 AI Wildlife Rangers of the Western Ghats",
  "🌊 Deep-Sea Robotics & the Andaman Trench",
  "⚡ Solar Hover-Train: Kashmir to Kanyakumari",
  "🏛️ Indus Valley Secrets: Decoded with Quantum AI"
];

export function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) {
  const [customInput, setCustomInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    if (customInput.trim()) {
      onSelectTheme(customInput.trim());
      onClose();
    }
  };

  const handlePickInspiration = (idea) => {
    setCustomInput(idea);
  };

  const handlePickExample = (template) => {
    onSelectTheme(template.title);
    onClose();
  };

  const isCustom = !EXAMPLE_TEMPLATES.some(t => t.title === currentTheme);

  return (
    <div className="ca-theme-modal-backdrop" onClick={onClose}>
      <div className="ca-theme-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ca-theme-modal-header">
          <div className="ca-theme-modal-title-group">
            <div className="ca-theme-header-icon">
              <Sparkles size={18} className="text-cyan" />
            </div>
            <div>
              <h2 className="ca-theme-modal-title">Choose or Create Project Theme</h2>
              <p className="ca-theme-modal-sub">
                Every student can design their own original adventure, or use an example template.
              </p>
            </div>
          </div>
          <button className="ca-theme-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Current Active Theme Banner */}
        <div className="ca-current-theme-banner">
          <span className="ca-banner-label">CURRENT ACTIVE THEME:</span>
          <div className="ca-banner-title-line">
            <span className="ca-banner-title-text">{currentTheme}</span>
            <span className={`ca-banner-type-badge ${isCustom ? 'custom' : 'example'}`}>
              {isCustom ? "Custom Student Theme" : "Example Template"}
            </span>
          </div>
        </div>

        {/* Section 1: Create Your Own Theme */}
        <div className="ca-theme-section">
          <div className="ca-section-heading">
            <Edit3 size={15} className="text-primary" />
            <span>Option 1: Create Your Own Original Project</span>
          </div>

          <form onSubmit={handleApplyCustom} className="ca-custom-theme-form">
            <div className="ca-custom-input-wrap">
              <input 
                type="text"
                className="ca-custom-theme-input"
                placeholder="Type your own story world... (e.g., Solar Train 2090, Deep Sea Lab)"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn-primary ca-apply-btn"
                disabled={!customInput.trim()}
              >
                <span>Set as My Project</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="ca-inspiration-box">
              <div className="ca-insp-label">
                <Lightbulb size={13} className="text-amber" />
                <span>Quick Ideas (Click to use):</span>
              </div>
              <div className="ca-insp-pills-row">
                {INSPIRATION_IDEAS.map((idea, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className="ca-insp-pill"
                    onClick={() => handlePickInspiration(idea)}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Section 2: Example Templates */}
        <div className="ca-theme-section">
          <div className="ca-section-heading">
            <Lightbulb size={15} className="text-emerald" />
            <span>Option 2: Or Start from an Example Template</span>
          </div>

          <div className="ca-examples-grid">
            {EXAMPLE_TEMPLATES.map((tmpl) => {
              const IconComp = tmpl.icon;
              const isSelected = currentTheme === tmpl.title;
              return (
                <div 
                  key={tmpl.id}
                  className={`ca-example-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePickExample(tmpl)}
                >
                  <div className="ca-example-card-top">
                    <div 
                      className="ca-example-icon-box"
                      style={{ color: tmpl.color, background: `${tmpl.color}15` }}
                    >
                      <IconComp size={16} />
                    </div>
                    <span className="ca-example-tag">{tmpl.tag}</span>
                    {isSelected && (
                      <span className="ca-selected-badge">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="ca-example-title">{tmpl.shortTitle}</h4>
                  <p className="ca-example-desc">{tmpl.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
