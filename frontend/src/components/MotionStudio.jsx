import React, { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { 
  Video, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Camera, 
  Download, 
  ArrowRight,
  Music,
  Mic,
  Globe,
  RefreshCw
} from 'lucide-react';
import './MotionStudio.css';

export function MotionStudio({ 
  projectTheme, 
  onSaveAsset, 
  onNavigateNext 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraMotion, setCameraMotion] = useState('Slow Cinematic Zoom In');
  const [motionSpeed, setMotionSpeed] = useState(4);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [hasVoiceover, setHasVoiceover] = useState(true);
  const [elevenVoiceUrl, setElevenVoiceUrl] = useState(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const narratorAudioRef = useRef(null);

  const handleGenerateElevenVoice = async () => {
    setIsGeneratingVoice(true);
    try {
      const lineToSpeak = activeScene?.voiceover || `Scene ${selectedSceneIndex + 1}: In a world of neon and shadows, the journey begins now.`;
      const resp = await fetch('/api/ai/elevenlabs-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lineToSpeak, voiceType: 'narrator' })
      });
      const data = await resp.json();
      setIsGeneratingVoice(false);
      if (data && data.audioUrl) {
        setElevenVoiceUrl(data.audioUrl);
        if (narratorAudioRef.current) {
          narratorAudioRef.current.src = data.audioUrl;
          narratorAudioRef.current.play();
        }
      }
    } catch (err) {
      setIsGeneratingVoice(false);
    }
  };

  const scenes = [
    {
      id: 1,
      title: "Scene 1: Lunar Base Signal",
      camera: "Slow Zoom In + Star Drift",
      duration: 8,
      thumb: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80",
      motionPrompt: "Image-to-video: Gentle slow camera push-in across lunar crater, Earth rising in background, visor reflecting starlight.",
      voiceover: "ISRO Base Bengaluru, do you copy? The deep ice scanner just discovered an encrypted signal!"
    },
    {
      id: 2,
      title: "Scene 2: Ancient Ice Vault",
      camera: "Slide Camera Right",
      duration: 8,
      thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      motionPrompt: "Image-to-video: Camera tracks right along glowing crystal ice formations, golden telemetry LED indicators pulsing rhythmically.",
      voiceover: "Careful Aarav. That inscription predates our lunar colony by centuries!"
    },
    {
      id: 3,
      title: "Scene 3: Solar Rover Chase",
      camera: "Fast Action Camera Orbit",
      duration: 8,
      thumb: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=80",
      motionPrompt: "Image-to-video: High-speed camera tracking beside solar rover racing across moon crater ridge, searchlights piercing stardust.",
      voiceover: "Hold on tight! Activating the magnetic thrusters now!"
    },
    {
      id: 4,
      title: "Scene 4: Golden Earthrise",
      camera: "Fly Upward to the Cosmos",
      duration: 8,
      thumb: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      motionPrompt: "Image-to-video: Slow crane up revealing expansive golden Earthrise above lunar horizon behind solitary astronaut silhouette.",
      voiceover: "We decoded it! The water vault is secured for every future astronaut!"
    }
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0); // 32s

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          const nextTime = prev + 0.5;
          const newSceneIdx = Math.min(3, Math.floor(nextTime / 8));
          setSelectedSceneIndex(newSceneIdx);
          return nextTime;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const activeScene = scenes[selectedSceneIndex];

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownloadVideo = () => {
    const metaTxt = `KREOMAX - 32-SECOND MOVIE TRAILER
Project: ${projectTheme}
Creator: Young Creator (Age 12+)
Animation Engine: Google Veo / Runway
Total Length: 32 Seconds (4 Scenes)
Audio: Adventure Music Track + Hero Voiceover Narration
Resolution: 1080p Full HD (24 FPS)

Scenes Breakdown:
- 00:00 to 00:08 | Scene 1: Rooftop Clue (Slow Zoom In)
- 00:08 to 00:16 | Scene 2: Secret Vault (Slide Camera Right)
- 00:16 to 00:24 | Scene 3: Skyrail Chase (Fast Orbit)
- 00:24 to 00:32 | Scene 4: Grand Sunrise (Fly Upward)
`;
    const blob = new Blob([metaTxt], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${projectTheme.replace(/\s+/g, '_')}_Movie_Trailer_Specs.txt`);
    onSaveAsset('videoReel', {
      title: `${projectTheme} Trailer`,
      duration: '32s',
      url: activeScene.thumb
    });
  };

  return (
    <div className="ca-motion-container">
      {/* Header */}
      <div className="ca-motion-header glass-panel">
        <div className="ca-motion-title-row">
          <div className="ca-tool-badge badge-pink">
            <Video size={14} />
            <span>LEVEL 4 · GOOGLE VEO</span>
          </div>
          <div className="ca-btn-group">
            <button className="btn-secondary btn-sm" onClick={handleDownloadVideo}>
              <Download size={14} />
              <span>Export</span>
            </button>
            <button className="btn-primary btn-sm" onClick={onNavigateNext}>
              <span>Level 5</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <h2 className="ca-motion-title">Video & Animation</h2>
      </div>

      {/* Main Studio Grid */}
      <div className="ca-motion-grid">
        {/* Left Column: Video Player Canvas */}
        <div className="ca-video-player-card glass-panel">
          <div className="ca-player-canvas">
            <img 
              src={activeScene.thumb} 
              alt={activeScene.title}
              className={`ca-canvas-motion-img ${isPlaying ? 'pan-and-zoom' : ''}`}
            />

            {/* Video Overlays */}
            <div className="ca-player-timecode">
              <span>PLAYING [24 FPS]</span>
              <span>{String(Math.floor(currentTime / 60)).padStart(2, '0')}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / 00:32</span>
            </div>

            <div className="ca-player-watermark">
              GOOGLE VEO 1080P
            </div>

            {/* Voiceover Subtitle Banner */}
            {hasVoiceover && (
              <div className="ca-subtitle-overlay">
                <span className="ca-sub-speaker">HERO DIALOGUE:</span>
                <p className="ca-sub-line">"{activeScene.voiceover}"</p>
              </div>
            )}
          </div>

          {/* Player Transport Bar */}
          <div className="ca-player-transport">
            <button className="ca-transport-btn" onClick={handleTogglePlay}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button className="ca-transport-btn" onClick={() => { setCurrentTime(0); setSelectedSceneIndex(0); }}>
              <RotateCcw size={16} />
            </button>

            {/* Scrubber Bar */}
            <div className="ca-scrubber-wrap">
              <div 
                className="ca-scrubber-progress" 
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>

            <button className="ca-transport-btn" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Timeline Sequence Strip */}
          <div className="ca-timeline-sequencer">
            <div className="ca-timeline-hdr">
              <span className="text-xs font-bold text-muted uppercase">Your 4 Movie Scenes (32 Seconds Total):</span>
              <span className="text-xs text-pink font-semibold">Watching Scene {selectedSceneIndex + 1} of 4</span>
            </div>

            <div className="ca-timeline-tracks">
              {scenes.map((s, idx) => (
                <div 
                  key={s.id}
                  className={`ca-timeline-block ${selectedSceneIndex === idx ? 'active-block' : ''}`}
                  onClick={() => { setSelectedSceneIndex(idx); setCurrentTime(idx * 8); }}
                >
                  <img src={s.thumb} alt={s.title} className="ca-block-thumb" />
                  <div className="ca-block-meta">
                    <span className="ca-block-num">0{s.id}</span>
                    <span className="ca-block-camera">{s.camera}</span>
                  </div>
                  <span className="ca-block-dur">8s</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Camera Direction & Audio Soundstage */}
        <div className="ca-director-panel glass-panel">
          <div className="ca-panel-hdr">
            <Camera size={16} className="text-pink" />
            <h3>Movie Director Controls</h3>
          </div>

          {/* Camera Moves */}
          <div className="ca-control-group">
            <label className="ca-ctrl-lbl">Pick Camera Movement (Google Veo)</label>
            <div className="ca-chip-row">
              {['Slow Cinematic Zoom In', 'Slide Camera Left/Right', '360 Spin Orbit', 'Fly Upward (Crane)', 'Fast Action Fly-Through'].map(cm => (
                <button 
                  key={cm}
                  className={`ca-chip ${cameraMotion === cm ? 'active' : ''}`}
                  onClick={() => setCameraMotion(cm)}
                >
                  {cm}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Speed Intensity Slider */}
          <div className="ca-control-group">
            <div className="flex justify-between">
              <label className="ca-ctrl-lbl">Motion Speed</label>
              <span className="text-xs font-mono text-cyan">{motionSpeed} / 10</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={motionSpeed}
              onChange={(e) => setMotionSpeed(Number(e.target.value))}
              className="ca-slider"
            />
            <span className="text-xs text-muted">Tip: Speed 3 to 5 looks the most realistic!</span>
          </div>

          {/* Audio Controls */}
          <div className="ca-soundstage-box">
            <div className="ca-soundstage-hdr">
              <Music size={14} className="text-purple" />
              <span className="text-xs font-bold uppercase text-purple">Soundtrack & Dialogue</span>
            </div>

            <div className="ca-audio-toggle-row">
              <div className="flex items-center gap-2">
                <Mic size={14} className="text-cyan" />
                <span className="text-xs font-semibold">Hero Voiceover Dialogue</span>
              </div>
              <input 
                type="checkbox" 
                checked={hasVoiceover}
                onChange={(e) => setHasVoiceover(e.target.checked)}
                className="ca-switch"
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <audio ref={narratorAudioRef} style={{ display: 'none' }} />
              <button 
                type="button"
                className="btn-secondary w-full"
                onClick={handleGenerateElevenVoice}
                disabled={isGeneratingVoice}
                style={{ fontSize: '0.78rem', padding: '6px 10px', gap: '6px' }}
              >
                {isGeneratingVoice ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-purple" />
                    <span>Synthesizing Voiceover with ElevenLabs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-purple" />
                    <span>Generate Scene Voiceover with ElevenLabs</span>
                  </>
                )}
              </button>
              {elevenVoiceUrl && (
                <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#34D399', textAlign: 'center' }}>
                  ✓ ElevenLabs Audio Loaded & Ready
                </div>
              )}
            </div>

            <p className="ca-audio-note">
              Includes exciting background music and realistic sound effects (rain, engine hum, footsteps).
            </p>
          </div>

          {/* Motion Prompt Box */}
          <div className="ca-motion-prompt-box">
            <span className="text-xs font-bold text-cyan">ANIMATION INSTRUCTION:</span>
            <code className="ca-motion-prompt-code">{activeScene.motionPrompt}</code>
          </div>

          {/* Bridge CTA */}
          <div className="ca-motion-next-bar">
            <button className="btn-success" onClick={onNavigateNext}>
              <span>Level Up to Level 5: Build Your Website</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
