import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { 
  Sparkles, Download, ArrowRight, User, Film, RefreshCw, Check, Copy
} from 'lucide-react';
import './StoryStudio.css';

const HERO_PRESETS = [
  { label: "🚀 Space Cadet", role: "ISRO Astronaut Cadet", world: "Moon Base 2085", goal: "Protect the lunar water vault" },
  { label: "🛕 Cyber Historian", role: "AI Temple Code Decoder", world: "Varanasi 2090", goal: "Solve a 1000-year-old mystery" },
  { label: "🌿 Eco Engineer", role: "Smart Drone Builder", world: "Bengaluru 2080", goal: "Restore clean rivers" },
  { label: "🤖 AI Inventor", role: "Village Robotics Prodigy", world: "Smart Village 2075", goal: "Build rescue robots" }
];

export function StoryStudio({ projectTheme, onSaveAsset, onNavigateNext, onOpenThemeModal }) {
  const [activeTab, setActiveTab] = useState('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Simple Hero State (defaults to student's chosen project theme)
  const [hero, setHero] = useState({
    name: 'Aarav Sharma',
    role: 'Creative Explorer',
    world: projectTheme || 'My Adventure World',
    goal: 'Discover the hidden secret and complete the mission'
  });

  // 4 Clean Scenes
  const [scenes, setScenes] = useState([
    {
      id: 1,
      type: "Scene 1: Discovery",
      title: "The Silent Crater",
      action: "Aarav inspects the dark ice vault entrance under the moon's southern stars.",
      dialogue: "Aarav: 'The telemetry signals are active... we are not alone here.'"
    },
    {
      id: 2,
      type: "Scene 2: Challenge",
      title: "Rover Alert",
      action: "Warning sirens flash red across Pragyan-X. An unregistered beacon signals nearby.",
      dialogue: "Aarav: 'Hold steady! Rerouting backup solar batteries now.'"
    },
    {
      id: 3,
      type: "Scene 3: Climax",
      title: "The Encrypted Vault",
      action: "Aarav connects his AI scanner to the ancient lunar console. Code streams across his visor.",
      dialogue: "Aarav: 'Decryption complete! The water reserves are secure!'"
    },
    {
      id: 4,
      type: "Scene 4: Victory",
      title: "Transmission Home",
      action: "Dawn breaks over Shackleton Crater. Earth glows blue on the horizon.",
      dialogue: "Aarav: 'Mission Control Bengaluru, Lunar Station Alpha is safe.'"
    }
  ]);

  const updateScene = (id, field, value) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const applyPreset = (preset) => {
    setHero(prev => ({
      ...prev,
      role: preset.role,
      world: preset.world,
      goal: preset.goal
    }));
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/ai/story-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: hero.world || projectTheme,
          archetype: hero.role,
          heroName: hero.name,
          provider: 'chatgpt'
        })
      });
      const data = await resp.json();
      setIsGenerating(false);
      if (data && data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes.map((s, idx) => ({
          id: idx + 1,
          type: `Scene ${idx + 1}`,
          title: s.title || `Scene ${idx + 1}`,
          action: s.action || '',
          dialogue: s.dialogue || ''
        })));
        setActiveTab('scenes');
      }
    } catch {
      setIsGenerating(false);
      setActiveTab('scenes');
    }
  };

  const handleExport = () => {
    const text = `# ${hero.name}'s Adventure
World: ${hero.world}
Role: ${hero.role}
Goal: ${hero.goal}

${scenes.map(s => `## ${s.type}: ${s.title}\n${s.action}\n\n${s.dialogue}\n`).join('\n---\n')}
`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${hero.name.replace(/\s+/g, '_')}_Script.md`);
    onSaveAsset('storyScript', { hero, scenes });
  };

  const copyScene = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="ca-story-simple">
      {/* Top Header */}
      <div className="ca-story-top glass-panel">
        <div>
          <span className="ca-level-tag">LEVEL 1 · CHATGPT</span>
          <h2 className="ca-story-heading">Story Writing</h2>
        </div>

        <div className="ca-story-actions">
          <button className="btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} />
            <span>Export</span>
          </button>
          <button className="btn-primary btn-sm" onClick={onNavigateNext}>
            <span>Level 2</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ca-simple-tabs">
        <button 
          className={`ca-simple-tab ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <User size={15} />
          <span>1. Hero Setup</span>
        </button>
        <button 
          className={`ca-simple-tab ${activeTab === 'scenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenes')}
        >
          <Film size={15} />
          <span>2. 4 Scenes ({scenes.length})</span>
        </button>
      </div>

      {/* TAB 1: HERO */}
      {activeTab === 'hero' && (
        <div className="ca-hero-simple-card glass-panel">
          {/* Quick Presets */}
          <div className="ca-presets-row">
            <span className="ca-preset-label">Quick Ideas:</span>
            {HERO_PRESETS.map((p, idx) => (
              <button 
                key={idx} 
                className="ca-preset-pill"
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="ca-form-simple-grid">
            <div className="ca-input-group">
              <label>Hero Name</label>
              <input 
                type="text" 
                value={hero.name} 
                onChange={e => setHero({ ...hero, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            <div className="ca-input-group">
              <label>Hero Role</label>
              <input 
                type="text" 
                value={hero.role} 
                onChange={e => setHero({ ...hero, role: e.target.value })}
                placeholder="e.g. Astronaut Cadet"
              />
            </div>

            <div className="ca-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Story World / Location</label>
                {onOpenThemeModal && (
                  <button 
                    type="button" 
                    className="ca-theme-mini-btn" 
                    onClick={onOpenThemeModal}
                    title="Change or create project theme"
                  >
                    Change Theme ✏️
                  </button>
                )}
              </div>
              <input 
                type="text" 
                value={hero.world} 
                onChange={e => setHero({ ...hero, world: e.target.value })}
                placeholder="e.g. Moon Base 2085, Mars Colony, Cyber-City..."
              />
            </div>

            <div className="ca-input-group">
              <label>Mission Goal</label>
              <input 
                type="text" 
                value={hero.goal} 
                onChange={e => setHero({ ...hero, goal: e.target.value })}
                placeholder="e.g. Protect the lunar water vault"
              />
            </div>
          </div>

          <div className="ca-generate-bar">
            <button 
              className="btn-primary"
              onClick={handleGenerateStory}
              disabled={isGenerating}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? "Generating Script..." : "Generate 4-Scene Script with ChatGPT"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 4 SCENES */}
      {activeTab === 'scenes' && (
        <div className="ca-scenes-simple-grid">
          {scenes.map((scene) => (
            <div key={scene.id} className="ca-scene-simple-card glass-panel">
              <div className="ca-scene-header-simple">
                <span className="ca-scene-tag">{scene.type}</span>
                <button 
                  className="ca-copy-btn-simple"
                  onClick={() => copyScene(scene.id, `${scene.action}\n${scene.dialogue}`)}
                >
                  {copiedId === scene.id ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                  <span>{copiedId === scene.id ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <input 
                type="text"
                className="ca-scene-title-input"
                value={scene.title}
                onChange={e => updateScene(scene.id, 'title', e.target.value)}
                placeholder="Scene Title..."
              />

              <div className="ca-scene-block">
                <label>Action</label>
                <textarea 
                  rows={2}
                  value={scene.action}
                  onChange={e => updateScene(scene.id, 'action', e.target.value)}
                  placeholder="What happens in this scene..."
                />
              </div>

              <div className="ca-scene-block">
                <label>Dialogue</label>
                <input 
                  type="text"
                  value={scene.dialogue}
                  onChange={e => updateScene(scene.id, 'dialogue', e.target.value)}
                  placeholder="Hero's line of dialogue..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
