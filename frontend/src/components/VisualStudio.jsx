import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Camera, 
  Sliders, 
  Download, 
  Maximize2, 
  ArrowRight,
  RefreshCw,
  Palette,
  Globe
} from 'lucide-react';
import './VisualStudio.css';

export function VisualStudio({ 
  projectTheme, 
  onSaveAsset, 
  onNavigateNext 
}) {
  const [selectedScene, setSelectedScene] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [stylePreset, setStylePreset] = useState('Pixar 3D Animation');
  const [lightingPreset, setLightingPreset] = useState('Glowing Neon Lights');
  const [lensPreset, setLensPreset] = useState('Close-Up Hero Portrait');
  const [characterConsistency, setCharacterConsistency] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Keyframes matching the 4 story scenes
  const [keyframes, setKeyframes] = useState([
    {
      id: 1,
      title: "Scene 1: Lunar Base Signal",
      prompt: "Pixar 3D style, cute 14-year-old Indian student space cadet kneeling on lunar crater beside ISRO Pragyan-X rover, Earth rising in background, glowing visor, cinematic lighting, 16:9 widescreen",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&auto=format&fit=crop&q=80",
      aspect: "16:9",
      tags: ["Pixar 3D", "ISRO Rover", "Moon Base", "Scene 1"]
    },
    {
      id: 2,
      title: "Scene 2: Ancient Ice Vault",
      prompt: "Epic 3D animation still of an underground lunar ice cavern filled with glowing golden crystal formations and floating stardust, mysterious and magical atmosphere --ar 16:9",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
      aspect: "16:9",
      tags: ["Ice Vault", "Golden Glow", "Mystery", "Scene 2"]
    },
    {
      id: 3,
      title: "Scene 3: High-Speed Solar Rover Chase",
      prompt: "Exciting action movie still of a high-tech ISRO solar rover drifting across low-gravity moon craters under starry galaxy skies, dynamic motion blur, vibrant colors --ar 16:9",
      image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&auto=format&fit=crop&q=80",
      aspect: "16:9",
      tags: ["Fast Chase", "ISRO Rover", "Action", "Scene 3"]
    },
    {
      id: 4,
      title: "Scene 4: Golden Earthrise Finale",
      prompt: "Inspirational movie ending frame, silhouette of a heroic young Indian astronaut watching a breathtaking golden Earthrise from a glass lunar dome, beautiful lighting --ar 16:9",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      aspect: "16:9",
      tags: ["Hero Earthrise", "Victory", "Golden Light", "Scene 4"]
    }
  ]);

  const activeKeyframe = keyframes.find(k => k.id === selectedScene) || keyframes[0];

  const handleSimulateRender = async () => {
    setIsRendering(true);
    try {
      const fullPrompt = `${stylePreset} style, ${activeKeyframe.prompt}, ${lightingPreset}, ${lensPreset}, cinematic, highly detailed, 8k render`;
      const resp = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          sceneNumber: activeKeyframe.id,
          seed: Math.floor(Math.random() * 50000)
        })
      });
      const data = await resp.json();
      setIsRendering(false);
      if (data && data.imageUrl) {
        setKeyframes(prev => prev.map(k => k.id === activeKeyframe.id ? { 
          ...k, 
          image: data.imageUrl, 
          prompt: fullPrompt,
          tags: [stylePreset, lightingPreset, lensPreset, `Scene ${activeKeyframe.id}`]
        } : k));
        onSaveAsset('conceptArtImages', keyframes);
      }
    } catch (e) {
      setIsRendering(false);
      onSaveAsset('conceptArtImages', keyframes);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder("my_art_gallery");

    let metaTxt = `KREOMAX - CONCEPT ART GALLERY\n`;
    metaTxt += `Project: ${projectTheme}\n`;
    metaTxt += `Creator: Young Creator (Age 12+)\n`;
    metaTxt += `===========================================\n\n`;

    keyframes.forEach(k => {
      metaTxt += `Scene ${k.id}: ${k.title}\n`;
      metaTxt += `Prompt: ${k.prompt}\n`;
      metaTxt += `Shape: ${k.aspect}\n\n`;
    });

    folder.file("ART_PROMPT_RECIPES.txt", metaTxt);

    for (let i = 0; i < keyframes.length; i++) {
      const k = keyframes[i];
      try {
        const response = await fetch(k.image);
        const blob = await response.blob();
        folder.file(`scene_${k.id}_${k.title.replace(/\s+/g, '_').toLowerCase()}.jpg`, blob);
      } catch (err) {
        console.error("Failed to fetch image for zip:", err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${projectTheme.replace(/\s+/g, '_')}_Art_Gallery.zip`);
  };

  return (
    <div className="ca-visual-container">
      {/* Header */}
      <div className="ca-visual-header glass-panel">
        <div className="ca-visual-title-row">
          <div className="ca-tool-badge badge-purple">
            <ImageIcon size={14} />
            <span>LEVEL 3 · MIDJOURNEY</span>
          </div>
          <div className="ca-btn-group">
            <button className="btn-secondary btn-sm" onClick={handleDownloadZip}>
              <Download size={14} />
              <span>Export</span>
            </button>
            <button className="btn-primary btn-sm" onClick={onNavigateNext}>
              <span>Level 4</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <h2 className="ca-visual-title">Images & Art</h2>

        {/* Scene Selector Strip */}
        <div className="ca-scene-strip">
          {keyframes.map(k => (
            <button
              key={k.id}
              className={`ca-scene-tab-btn ${selectedScene === k.id ? 'active' : ''}`}
              onClick={() => setSelectedScene(k.id)}
            >
              <span className="ca-tab-num">0{k.id}</span>
              <span className="ca-tab-title">{k.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workbench */}
      <div className="ca-visual-grid">
        {/* Left Column: Parameter & Prompt Engine */}
        <div className="ca-controls-panel glass-panel">
          <div className="ca-panel-hdr">
            <Sliders size={16} className="text-purple" />
            <h3>Your Art Recipe Controls</h3>
          </div>

          <div className="ca-control-group">
            <label className="ca-ctrl-lbl">1. Choose an Art Style</label>
            <div className="ca-chip-row">
              {['Pixar 3D Animation', 'Anime & Manga', 'Graphic Comic Book', 'Cinematic Movie Still'].map(p => (
                <button 
                  key={p} 
                  className={`ca-chip ${stylePreset === p ? 'active' : ''}`}
                  onClick={() => setStylePreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="ca-control-group">
            <label className="ca-ctrl-lbl">2. Choose the Lighting</label>
            <div className="ca-chip-row">
              {['Glowing Neon Lights', 'Warm Sunset Golden Hour', 'Mysterious Shadows', 'Bright Sunny Day'].map(l => (
                <button 
                  key={l} 
                  className={`ca-chip ${lightingPreset === l ? 'active' : ''}`}
                  onClick={() => setLightingPreset(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="ca-control-group">
            <label className="ca-ctrl-lbl">3. Choose the Camera View</label>
            <div className="ca-chip-row">
              {['Close-Up Hero Portrait', 'Wide Epic Landscape', 'Action Angle', 'Birds-Eye Top View'].map(lens => (
                <button 
                  key={lens} 
                  className={`ca-chip ${lensPreset === lens ? 'active' : ''}`}
                  onClick={() => setLensPreset(lens)}
                >
                  {lens}
                </button>
              ))}
            </div>
          </div>

          <div className="ca-control-group">
            <label className="ca-ctrl-lbl">4. Picture Shape</label>
            <div className="ca-ar-selector">
              {[
                { label: '16:9 Widescreen (For Videos)', value: '16:9' },
                { label: '21:9 Ultra-Wide Banner', value: '21:9' },
                { label: '1:1 Square Album', value: '1:1' },
                { label: '9:16 Phone Screen', value: '9:16' }
              ].map(ar => (
                <button 
                  key={ar.value}
                  className={`ca-ar-btn ${aspectRatio === ar.value ? 'active' : ''}`}
                  onClick={() => setAspectRatio(ar.value)}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ca-toggle-card">
            <div className="ca-toggle-info">
              <span className="ca-toggle-title">Keep My Hero Consistent (--cref)</span>
              <span className="ca-toggle-sub">Locks hair, clothes, and face across all 4 scenes</span>
            </div>
            <input 
              type="checkbox" 
              checked={characterConsistency}
              onChange={(e) => setCharacterConsistency(e.target.checked)}
              className="ca-switch"
            />
          </div>

          <button 
            className="btn-primary w-full mt-4"
            onClick={handleSimulateRender}
            disabled={isRendering}
          >
            {isRendering ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Generating Real AI Artwork Stream...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Real AI Concept Art</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Keyframe Canvas */}
        <div className="ca-canvas-panel glass-panel">
          <div className="ca-canvas-top">
            <div className="ca-canvas-tag">
              <Camera size={14} className="text-cyan" />
              <span>OFFICIAL ARTWORK: {activeKeyframe.title}</span>
            </div>
            <button 
              className="ca-lightbox-btn"
              onClick={() => setLightboxImg(activeKeyframe.image)}
              title="View Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="ca-canvas-img-wrap">
            <img 
              src={activeKeyframe.image} 
              alt={activeKeyframe.title}
              className="ca-canvas-img"
            />
            <div className="ca-canvas-overlay">
              <div className="ca-overlay-tags">
                {activeKeyframe.tags.map((t, idx) => (
                  <span key={idx} className="badge badge-purple">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Formula Output Box */}
          <div className="ca-keyframe-prompt-card">
            <div className="ca-prompt-lbl-row">
              <span className="text-xs font-bold text-cyan">MIDJOURNEY PROMPT RECIPE:</span>
              <span className="badge badge-teal">--ar {aspectRatio}</span>
            </div>
            <code className="ca-keyframe-prompt-text">{activeKeyframe.prompt}</code>
          </div>

          {/* Bridge CTA */}
          <div className="ca-visual-next-bar">
            <button className="btn-success" onClick={onNavigateNext}>
              <span>Level Up to Level 4: Animate into a Movie Trailer (Google Veo)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="ca-lightbox-modal" onClick={() => setLightboxImg(null)}>
          <div className="ca-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Artwork Fullscreen" className="ca-lightbox-img" />
            <button className="ca-close-lightbox" onClick={() => setLightboxImg(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
