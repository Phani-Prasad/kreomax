import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  Download, 
  FileText, 
  Film, 
  Image as ImageIcon, 
  Layout, 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Cpu, 
  BookOpen,
  Star
} from 'lucide-react';
import './CapstoneVault.css';

export function CapstoneVault({ 
  projectTheme, 
  userProfile, 
  completedHours, 
  onMarkGraduated 
}) {
  const [rubricScores, setRubricScores] = useState({
    research: true,
    narrative: true,
    visuals: true,
    web: true
  });
  const [isExportingMaster, setIsExportingMaster] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const totalHours = 24;
  const completedCount = completedHours.length;
  const progressPct = Math.round((completedCount / totalHours) * 100);

  const handleDownloadMasterBundle = async () => {
    setIsExportingMaster(true);
    const zip = new JSZip();

    // 1. Research Brief
    zip.file("01_Research_Notes/RESEARCH_GUIDE.md", `# Research Guide: ${projectTheme}
Created at Kreomax (Level 1: NotebookLM).
Notes and verified facts about our world.
`);

    // 2. Story Screenplay
    zip.file("02_Story_Script/MY_STORY.md", `# ${projectTheme} - Story Script
Author: ${userProfile?.name}
Level 2: ChatGPT & Gemini
4-Scene Adventure Story and Character Profile.
`);
    zip.file("02_Story_Script/ART_PROMPTS.json", JSON.stringify({
      theme: projectTheme,
      prompts: [
        "Pixar 3D style, teen cyber detective on rooftop --ar 16:9",
        "Secret underground vault with golden servers --ar 16:9",
        "High-speed futuristic skyrail chase --ar 16:9",
        "Grand sunrise finale from tower balcony --ar 16:9"
      ]
    }, null, 2));

    // 3. Concept Art
    const artFolder = zip.folder("03_AI_Concept_Art");
    artFolder.file("ART_SPECS.txt", "Midjourney artworks created in Level 3 with character consistency.");

    // 4. Video Specs
    const videoFolder = zip.folder("04_Movie_Trailer");
    videoFolder.file("TRAILER_SPECS.txt", "32-Second Movie Trailer created in Level 4 with Google Veo.");

    // 5. Website Code
    const webFolder = zip.folder("05_My_Website");
    webFolder.file("index.html", `<!DOCTYPE html><html><head><title>${projectTheme}</title></head><body><h1>${projectTheme}</h1><p>Created by ${userProfile?.name}</p></body></html>`);
    webFolder.file("style.css", `body { font-family: sans-serif; background: #0A0D14; color: #FFF; }`);

    // Master manifest
    zip.file("README_MY_PROJECT.md", `# ${projectTheme} - Master Project Bundle
Creator: ${userProfile?.name}
Kreomax - 24-Hour AI Creator Course
Status: Graduated with 100/100 points!
`);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectTheme.replace(/\s+/g, '_')}_MASTER_PROJECT_BUNDLE.zip`);
    setIsExportingMaster(false);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleGenerateCertificate = () => {
    setShowCertificate(true);
    confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="ca-vault-container">
      {/* Header */}
      <div className="ca-vault-header glass-panel">
        <div className="ca-vault-title-row">
          <div className="ca-tool-badge badge-teal">
            <Award size={14} />
            <span>LEVEL 6 · FINAL PROJECT</span>
          </div>
          <button 
            className="btn-primary btn-sm" 
            onClick={handleDownloadMasterBundle}
            disabled={isExportingMaster}
          >
            <Package size={14} />
            <span>{isExportingMaster ? "Exporting..." : "Export Portfolio (.ZIP)"}</span>
          </button>
        </div>

        <h2 className="ca-vault-title">Final Project</h2>
        <p className="ca-vault-desc">
          Review your 5 project deliverables, verify your rubric evaluation, and generate your certificate.
        </p>

        {/* Pipeline Diagram Bar */}
        <div className="ca-pipeline-flow-bar">
          <div className="ca-pipe-step">
            <Cpu size={16} className="text-emerald" />
            <span className="ca-pipe-tool">1. ChatGPT</span>
            <span className="ca-pipe-deliverable">Story Script</span>
          </div>
          <div className="ca-pipe-arrow">→</div>

          <div className="ca-pipe-step">
            <BookOpen size={16} className="text-blue" />
            <span className="ca-pipe-tool">2. NotebookLM</span>
            <span className="ca-pipe-deliverable">Research Guide</span>
          </div>
          <div className="ca-pipe-arrow">→</div>

          <div className="ca-pipe-step">
            <ImageIcon size={16} className="text-purple" />
            <span className="ca-pipe-tool">3. Midjourney</span>
            <span className="ca-pipe-deliverable">Concept Art</span>
          </div>
          <div className="ca-pipe-arrow">→</div>

          <div className="ca-pipe-step">
            <Film size={16} className="text-pink" />
            <span className="ca-pipe-tool">4. Google Veo</span>
            <span className="ca-pipe-deliverable">Video Trailer</span>
          </div>
          <div className="ca-pipe-arrow">→</div>

          <div className="ca-pipe-step">
            <Layout size={16} className="text-amber" />
            <span className="ca-pipe-tool">5. Web Studio</span>
            <span className="ca-pipe-deliverable">Showcase Site</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Asset Shelf vs. Review */}
      <div className="ca-vault-grid">
        {/* Left Column: Asset Shelf */}
        <div className="ca-asset-shelf glass-panel">
          <div className="ca-shelf-hdr">
            <Package size={18} className="text-cyan" />
            <h3>Project Deliverables</h3>
          </div>

          <div className="ca-vault-items">
            {/* Asset 1 */}
            <div className="ca-vault-card">
              <div className="ca-vault-icon bg-emerald">
                <Cpu size={20} />
              </div>
              <div className="ca-vault-info">
                <span className="ca-vault-name">Level 1: Story Script (.MD)</span>
                <span className="ca-vault-meta">Hero profile, scene screenplay, and prompt pack</span>
              </div>
              <span className="badge badge-emerald">Ready ✓</span>
            </div>

            {/* Asset 2 */}
            <div className="ca-vault-card">
              <div className="ca-vault-icon bg-blue">
                <FileText size={20} />
              </div>
              <div className="ca-vault-info">
                <span className="ca-vault-name">Level 2: Research Guide (.MD)</span>
                <span className="ca-vault-meta">World research notes and verified citations</span>
              </div>
              <span className="badge badge-emerald">Ready ✓</span>
            </div>

            {/* Asset 3 */}
            <div className="ca-vault-card">
              <div className="ca-vault-icon bg-purple">
                <ImageIcon size={20} />
              </div>
              <div className="ca-vault-info">
                <span className="ca-vault-name">Level 3: Concept Art (.ZIP)</span>
                <span className="ca-vault-meta">4 scene illustrations with consistent character styling</span>
              </div>
              <span className="badge badge-emerald">Ready ✓</span>
            </div>

            {/* Asset 4 */}
            <div className="ca-vault-card">
              <div className="ca-vault-icon bg-pink">
                <Film size={20} />
              </div>
              <div className="ca-vault-info">
                <span className="ca-vault-name">Level 4: Video Trailer (.WEBM)</span>
                <span className="ca-vault-meta">Animated trailer with camera motion and audio track</span>
              </div>
              <span className="badge badge-emerald">Ready ✓</span>
            </div>

            {/* Asset 5 */}
            <div className="ca-vault-card">
              <div className="ca-vault-icon bg-amber">
                <Layout size={20} />
              </div>
              <div className="ca-vault-info">
                <span className="ca-vault-name">Level 5: Website Package (.ZIP)</span>
                <span className="ca-vault-meta">Responsive showcase website with interactive preview</span>
              </div>
              <span className="badge badge-emerald">Ready ✓</span>
            </div>
          </div>
        </div>

        {/* Right Column: Rubric & Certificate */}
        <div className="ca-rubric-panel glass-panel">
          <div className="ca-rubric-hdr">
            <ShieldCheck size={18} className="text-emerald" />
            <h3>Evaluation Rubric</h3>
          </div>

          <div className="ca-rubric-list">
            <div className="ca-rubric-item">
              <div className="ca-rubric-title-row">
                <span className="ca-rubric-name">1. Story Writing</span>
                <span className="text-emerald font-bold">25 / 25 pts</span>
              </div>
              <p className="ca-rubric-desc">
                Character design, prompt formula, and 4-scene narrative structure.
              </p>
            </div>

            <div className="ca-rubric-item">
              <div className="ca-rubric-title-row">
                <span className="ca-rubric-name">2. Research</span>
                <span className="text-emerald font-bold">25 / 25 pts</span>
              </div>
              <p className="ca-rubric-desc">
                Source document grounding, verified citations, and audio summary.
              </p>
            </div>

            <div className="ca-rubric-item">
              <div className="ca-rubric-title-row">
                <span className="ca-rubric-name">3. Images & Art</span>
                <span className="text-emerald font-bold">25 / 25 pts</span>
              </div>
              <p className="ca-rubric-desc">
                Visual style quality and character consistency across scenes.
              </p>
            </div>

            <div className="ca-rubric-item">
              <div className="ca-rubric-title-row">
                <span className="ca-rubric-name">4. Video & Web</span>
                <span className="text-emerald font-bold">25 / 25 pts</span>
              </div>
              <p className="ca-rubric-desc">
                Camera motion, timeline pacing, and responsive website assembly.
              </p>
            </div>
          </div>

          <div className="ca-rubric-total">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold">TOTAL SCORE:</span>
              <span className="text-xl font-bold text-emerald font-mono">100 / 100</span>
            </div>

            <button className="btn-success w-full" onClick={handleGenerateCertificate}>
              <Award size={16} />
              <span>View Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="ca-cert-modal" onClick={() => setShowCertificate(false)}>
          <div className="ca-cert-card" onClick={(e) => e.stopPropagation()}>
            <div className="ca-cert-border">
              <div className="ca-cert-header">
                <Award size={36} className="text-cyan mb-2" />
                <h2 className="ca-cert-title">ARYABHATA YOUNG AI INNOVATOR CERTIFICATE</h2>
                <span className="ca-cert-sub">KREOMAX 🇮🇳 ATAL INNOVATION & SPACE LABS</span>
              </div>

              <p className="ca-cert-body">
                This proudly certifies that
              </p>
              <h3 className="ca-cert-student">{userProfile?.name}</h3>
              <p className="ca-cert-body">
                has successfully graduated from the <strong>24-Hour AI Creator Course</strong>, 
                earning all 6 milestone titles:
              </p>

              <div className="ca-cert-badges-row">
                <span className="ca-cert-badge-pill">✍️ AI Story Creator</span>
                <span className="ca-cert-badge-pill">🔍 AI Researcher</span>
                <span className="ca-cert-badge-pill">🎨 Digital Artist</span>
                <span className="ca-cert-badge-pill">🎬 AI Animator</span>
                <span className="ca-cert-badge-pill">💻 Web Developer</span>
                <span className="ca-cert-badge-pill">🏆 Master Innovator</span>
              </div>

              <div className="ca-cert-project-box">
                <span>Project: <strong>{projectTheme}</strong></span>
              </div>

              <div className="ca-cert-signatures">
                <div className="ca-sig-block">
                  <span className="ca-sig-name">Dr. Vikram Rao</span>
                  <span className="ca-sig-role">ISRO Senior Scientist & Creator Mentor</span>
                </div>
                <div className="ca-sig-block">
                  <span className="ca-sig-name">{new Date().toLocaleDateString()}</span>
                  <span className="ca-sig-role">Date of Award</span>
                </div>
              </div>

              <div className="ca-cert-actions">
                <button className="btn-primary" onClick={() => setShowCertificate(false)}>
                  Celebrate & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
