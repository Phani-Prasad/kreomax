import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Layout, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code2, 
  Eye, 
  Download, 
  Palette, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import './WebBuilderStudio.css';

export function WebBuilderStudio({ 
  projectTheme, 
  onSaveAsset, 
  onNavigateNext 
}) {
  const [deviceViewport, setDeviceViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [activeStoryScene, setActiveStoryScene] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Scenes for the website reader (Indian Young Creator Context)
  const storyScenes = [
    {
      num: 1,
      title: "Scene 1: Lunar Base Signal",
      text: "Earth hangs like a glowing blue sapphire against the velvet black cosmos. 14-year-old student cadet Aarav kneels on the moon surface beside the Pragyan-X rover.",
      dialogue: "AARAV: 'ISRO Base Bengaluru, do you copy? The deep ice scanner just discovered an encrypted signal!'"
    },
    {
      num: 2,
      title: "Scene 2: Ancient Ice Vault",
      text: "Massive glowing crystal ice pillars hum with mysterious energy. Golden telemetry lights reflect on Aarav's lunar suit as the rover illuminates the cavern.",
      dialogue: "DR. VIKRAM RAO: 'Careful Aarav. That inscription predates our lunar colony by centuries!'"
    },
    {
      num: 3,
      title: "Scene 3: High-Speed Solar Rover Chase",
      text: "A sleek solar rover zooms across the crater rim. Autonomous security probes sweep golden beams of light as Aarav maneuvers through low-gravity boulder fields.",
      dialogue: "AARAV: 'Hold on tight! Activating the magnetic thrusters now!'"
    },
    {
      num: 4,
      title: "Scene 4: Golden Earthrise Finale",
      text: "The sun crowns the moon horizon in dazzling gold and diamond rays. The central communication spire pulses green as the transmission reaches Bengaluru.",
      dialogue: "AARAV: 'We decoded it! The water vault is secured for every future astronaut!'"
    }
  ];

  const galleryImages = [
    { title: "Rooftop Clue", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80", tag: "Scene 1" },
    { title: "Secret Data Vault", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80", tag: "Scene 2" },
    { title: "Skyrail Action Chase", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80", tag: "Scene 3" },
    { title: "Grand Sunrise Finale", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80", tag: "Scene 4" }
  ];

  // Generated code snippets for the Code Inspector
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectTheme} | My Showcase Website</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Hero Welcome -->
  <header class="hero-section">
    <div class="container">
      <span class="badge">MY CREATOR ADVENTURE</span>
      <h1>${projectTheme}</h1>
      <p class="hero-sub">An epic story created with AI tools: NotebookLM, ChatGPT, Midjourney, and Google Veo!</p>
      <div class="hero-btns">
        <a href="#trailer" class="btn-primary">Watch My Movie Trailer</a>
        <a href="#story" class="btn-outline">Read The Story</a>
      </div>
    </div>
  </header>

  <!-- Movie Trailer -->
  <section id="trailer" class="section">
    <div class="container">
      <h2>Movie Trailer (Google Veo)</h2>
      <div class="video-container">
        <img src="assets/trailer_still.jpg" alt="Trailer Preview">
        <button class="play-overlay">▶</button>
      </div>
    </div>
  </section>

  <!-- Interactive Story Reader -->
  <section id="story" class="section">
    <div class="container">
      <h2>Read The 4 Adventure Scenes</h2>
      <div class="story-tabs">
        <button class="tab-btn active" onclick="showScene(1)">Scene 1</button>
        <button class="tab-btn" onclick="showScene(2)">Scene 2</button>
        <button class="tab-btn" onclick="showScene(3)">Scene 3</button>
        <button class="tab-btn" onclick="showScene(4)">Scene 4</button>
      </div>
      <div id="story-content" class="story-card">
        <h3>Scene 1: The Rooftop Clue</h3>
        <p>Neon rain shines on the glass catwalk...</p>
      </div>
    </div>
  </section>

  <!-- Art Gallery -->
  <section id="gallery" class="section">
    <div class="container">
      <h2>My AI Concept Art Gallery</h2>
      <div class="gallery-grid">
        ${galleryImages.map(img => `<div class="gallery-card"><img src="${img.url}" alt="${img.title}"><h4>${img.title}</h4></div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <footer>
    <p>Created by Alex Mercer (Age 14) • Built at Kreomax</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

  const cssCode = `:root {
  --primary: ${accentColor};
  --bg-dark: #0A0D14;
  --bg-card: rgba(18, 24, 38, 0.7);
  --text: #F8FAFC;
}

body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text);
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.hero-section { padding: 90px 0 50px; text-align: center; }
.hero-section h1 { font-family: 'Outfit', sans-serif; font-size: 3rem; margin: 16px 0; }
.badge { background: rgba(139, 92, 246, 0.2); color: var(--primary); padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; }
.btn-primary { background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; margin: 8px; }
.btn-outline { border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 8px; }

.section { padding: 50px 0; }
.video-container { position: relative; border-radius: 16px; overflow: hidden; max-width: 800px; margin: 24px auto 0; }
.video-container img { width: 100%; display: block; }
.play-overlay { position: absolute; inset: 0; margin: auto; width: 64px; height: 64px; border-radius: 50%; background: var(--primary); border: none; color: #fff; font-size: 24px; cursor: pointer; }

.gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 24px; }
.gallery-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; }
.gallery-card img { width: 100%; height: 180px; object-fit: cover; }
.gallery-card h4 { padding: 12px; margin: 0; font-size: 0.95rem; }
`;

  const jsCode = `// Switch story scenes when buttons are clicked!
function showScene(sceneNum) {
  const scenes = {
    1: { title: "Scene 1: The Rooftop Clue", text: "Neon rain shines on the glass catwalk..." },
    2: { title: "Scene 2: Secret Data Vault", text: "Massive glowing computer servers hum in the shadows..." },
    3: { title: "Scene 3: High-Speed Skyrail Chase", text: "A sleek futuristic train zooms above the clouds..." },
    4: { title: "Scene 4: The Grand Sunrise Finale", text: "The sun rises over the city in stunning gold and purple..." }
  };
  const card = document.getElementById('story-content');
  if (card && scenes[sceneNum]) {
    card.innerHTML = '<h3>' + scenes[sceneNum].title + '</h3><p>' + scenes[sceneNum].text + '</p>';
  }
}
`;

  const handleDownloadWebsiteZip = async () => {
    setIsExporting(true);
    const zip = new JSZip();

    zip.file("index.html", htmlCode);
    zip.file("style.css", cssCode);
    zip.file("script.js", jsCode);
    zip.file("README.md", `# ${projectTheme} - My Real Website
Created at Kreomax!

## How to View:
1. Double-click \`index.html\` to open your website offline in Chrome, Edge, or Safari!
2. You can upload this folder to GitHub Pages, Netlify, or Vercel to put it online for free!
`);

    const assetsFolder = zip.folder("assets");
    assetsFolder.file("info.txt", "Website media files.");

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectTheme.replace(/\s+/g, '_')}_Website_Package.zip`);
    setIsExporting(false);
    onSaveAsset('websiteCode', { html: htmlCode, css: cssCode });
  };

  return (
    <div className="ca-builder-container">
      {/* Header */}
      <div className="ca-builder-header glass-panel">
        <div className="ca-builder-title-row">
          <div className="ca-tool-badge badge-amber">
            <Layout size={14} />
            <span>LEVEL 5 · WEBSITE BUILDER</span>
          </div>
          <div className="ca-btn-group">
            <button 
              className="btn-secondary btn-sm" 
              onClick={handleDownloadWebsiteZip}
              disabled={isExporting}
            >
              <Download size={14} />
              <span>{isExporting ? "Exporting..." : "Export Website"}</span>
            </button>
            <button className="btn-success btn-sm" onClick={onNavigateNext}>
              <span>Level 6</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <h2 className="ca-builder-title">Website Builder</h2>
        <p className="ca-builder-desc">
          Preview and export your project showcase website.
        </p>

        {/* Viewport & View Mode Bar */}
        <div className="ca-builder-controls-bar">
          <div className="ca-view-toggles">
            <button 
              className={`ca-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>
            <button 
              className={`ca-toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
              onClick={() => setViewMode('code')}
            >
              <Code2 size={15} />
              <span>HTML & CSS</span>
            </button>
          </div>

          {viewMode === 'preview' && (
            <div className="ca-device-toggles">
              <button 
                className={`ca-device-btn ${deviceViewport === 'desktop' ? 'active' : ''}`}
                onClick={() => setDeviceViewport('desktop')}
                title="Laptop View"
              >
                <Monitor size={15} />
                <span>Laptop</span>
              </button>
              <button 
                className={`ca-device-btn ${deviceViewport === 'tablet' ? 'active' : ''}`}
                onClick={() => setDeviceViewport('tablet')}
                title="Tablet View"
              >
                <Tablet size={15} />
                <span>Tablet</span>
              </button>
              <button 
                className={`ca-device-btn ${deviceViewport === 'mobile' ? 'active' : ''}`}
                onClick={() => setDeviceViewport('mobile')}
                title="Phone View"
              >
                <Smartphone size={15} />
                <span>Phone</span>
              </button>
            </div>
          )}

          {/* Color accent picker */}
          <div className="ca-accent-picker">
            <span className="text-xs font-bold text-muted mr-2">FAVORITE COLOR:</span>
            {['#8B5CF6', '#06B6D4', '#10B981', '#EC4899', '#F59E0B'].map(c => (
              <button 
                key={c}
                className="ca-color-dot"
                style={{ backgroundColor: c, border: accentColor === c ? '2px solid #FFF' : 'none' }}
                onClick={() => setAccentColor(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {viewMode === 'preview' ? (
        <div className="ca-preview-canvas-wrapper">
          <div className={`ca-preview-frame frame-${deviceViewport} glass-panel`}>
            {/* Mock Website Canvas */}
            <div className="mock-site-body">
              {/* Mock Hero */}
              <div className="mock-hero" style={{ '--mock-accent': accentColor }}>
                <span className="mock-badge">STUDENT CREATOR SHOWCASE</span>
                <h1 className="mock-title">{projectTheme}</h1>
                <p className="mock-sub">
                  An adventure story created using real AI tools: NotebookLM, ChatGPT, Midjourney, and Google Veo!
                </p>
                <div className="mock-btns">
                  <button className="mock-btn-primary" style={{ backgroundColor: accentColor }}>
                    Watch Movie Trailer
                  </button>
                  <button className="mock-btn-outline">
                    Read 4 Story Scenes
                  </button>
                </div>
              </div>

              {/* Mock Video Section */}
              <div className="mock-section">
                <h2 className="mock-sec-title">Movie Trailer (Google Veo)</h2>
                <div className="mock-video-box">
                  <img 
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80" 
                    alt="Trailer Still"
                    className="mock-video-img"
                  />
                  <div className="mock-play-btn" style={{ backgroundColor: accentColor }}>▶</div>
                </div>
              </div>

              {/* Mock Story Section */}
              <div className="mock-section">
                <h2 className="mock-sec-title">Interactive Story Reader</h2>
                <div className="mock-story-tabs">
                  {storyScenes.map(sc => (
                    <button 
                      key={sc.num}
                      className={`mock-tab-btn ${activeStoryScene === sc.num ? 'active' : ''}`}
                      style={{ borderBottomColor: activeStoryScene === sc.num ? accentColor : 'transparent' }}
                      onClick={() => setActiveStoryScene(sc.num)}
                    >
                      Scene 0{sc.num}
                    </button>
                  ))}
                </div>

                <div className="mock-story-card">
                  <h3 className="mock-story-title">{storyScenes[activeStoryScene - 1].title}</h3>
                  <p className="mock-story-text">{storyScenes[activeStoryScene - 1].text}</p>
                  <blockquote className="mock-dialogue">{storyScenes[activeStoryScene - 1].dialogue}</blockquote>
                </div>
              </div>

              {/* Mock Gallery Section */}
              <div className="mock-section">
                <h2 className="mock-sec-title">My AI Concept Art Gallery (Midjourney)</h2>
                <div className="mock-gallery-grid">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="mock-gallery-item">
                      <img src={img.url} alt={img.title} />
                      <div className="mock-item-meta">
                        <span className="mock-item-tag" style={{ color: accentColor }}>{img.tag}</span>
                        <span className="mock-item-title">{img.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Footer */}
              <footer className="mock-footer">
                <p>Created by Alex Mercer (Age 14) • Built at Kreomax</p>
              </footer>
            </div>
          </div>

          {/* Bridge CTA */}
          <div className="ca-builder-next-bar">
            <button className="btn-success" onClick={onNavigateNext}>
              <span>Continue to Level 6: Final Project</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Code Inspector View */
        <div className="ca-code-inspector glass-panel">
          <div className="ca-code-tabs">
            <span className="ca-code-tab-active">index.html (Webpage Code)</span>
            <span>style.css (Design & Colors)</span>
            <span>script.js (Button Clicks)</span>
          </div>

          <pre className="ca-code-block">
            <code>{htmlCode}</code>
          </pre>

          <div className="ca-code-footer">
            <p className="text-xs text-muted">
              This is real, clean HTML code! You can unzip this folder and double-click index.html on any computer to run your website offline.
            </p>
            <button className="btn-primary" onClick={handleDownloadWebsiteZip}>
              <Download size={15} />
              <span>Download My Website ZIP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
