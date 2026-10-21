import React, { useState, useEffect } from 'react';
import { LeftPaneNav, INDIAN_THEMES } from './components/LeftPaneNav';
import { WorkspaceTopBar } from './components/WorkspaceTopBar';
import { KeyConfigModal } from './components/KeyConfigModal';
import { CurriculumView } from './components/CurriculumView';
import { NotebookLMLab } from './components/NotebookLMLab';
import { StoryStudio } from './components/StoryStudio';
import { VisualStudio } from './components/VisualStudio';
import { MotionStudio } from './components/MotionStudio';
import { WebBuilderStudio } from './components/WebBuilderStudio';
import { CapstoneVault } from './components/CapstoneVault';
import { TrainerGuide } from './components/TrainerGuide';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { RoadmapView } from './components/RoadmapView';
import { KreomaxLandingPage } from './components/KreomaxLandingPage';
import './App.css';

// Student-Driven Fallback Modules with explicit 1-hour topics and completion titles
const FALLBACK_MODULES = [
  {
    id: "m1",
    number: 1,
    title: "Level 1: Story Writing",
    tool: "ChatGPT",
    toolBadge: "Story Writing",
    completionTitle: "AI Story Creator",
    completionBadge: "Story Creator",
    hours: "Hours 1 – 4",
    color: "#059669",
    deliverable: "Story Script (.MD)",
    studioType: "story",
    description: "Create your hero, outline 4 adventure scenes, and write screenplay dialogue with ChatGPT.",
    hoursList: [
      { hour: 1, title: "Hero Profile Setup", duration: "1 hr", summary: "Name, superpower, flaw, and adventure world.", action: "Complete hero profile." },
      { hour: 2, title: "Prompt Engineering Basics", duration: "1 hr", summary: "Master Role, Context, Task, and Constraints formula.", action: "Test prompt formula." },
      { hour: 3, title: "4-Scene Screenplay Writing", duration: "1 hr", summary: "Write 4 scenes with action lines and punchy dialogue.", action: "Draft all 4 scenes." },
      { hour: 4, title: "Script & Art Prompts Export", duration: "1 hr", summary: "Export screenplay (.MD) and concept art prompts.", action: "Download script." }
    ]
  },
  {
    id: "m2",
    number: 2,
    title: "Level 2: Research",
    tool: "NotebookLM",
    toolBadge: "Research",
    completionTitle: "AI Researcher",
    completionBadge: "Researcher",
    hours: "Hours 5 – 8",
    color: "#4F46E5",
    deliverable: "Research Guide (.MD)",
    studioType: "notebooklm",
    description: "Upload world notes and verify facts with citation sources using NotebookLM.",
    hoursList: [
      { hour: 5, title: "Source Documents Ingestion", duration: "1 hr", summary: "Add reference documents and mission source material.", action: "Upload 2 sources." },
      { hour: 6, title: "Fact Citations & Verification", duration: "1 hr", summary: "Ask questions and verify facts with exact citation proof.", action: "Find 3 verified facts." },
      { hour: 7, title: "Two-Voice Audio Briefing", duration: "1 hr", summary: "Generate two-speaker audio briefing podcast.", action: "Review audio briefing." },
      { hour: 8, title: "Research Guide Export", duration: "1 hr", summary: "Export verified research guide markdown file.", action: "Download research guide." }
    ]
  },
  {
    id: "m3",
    number: 3,
    title: "Level 3: Images & Art",
    tool: "Midjourney",
    toolBadge: "Images & Art",
    completionTitle: "Digital Artist",
    completionBadge: "Digital Artist",
    hours: "Hours 9 – 12",
    color: "#7C3AED",
    deliverable: "Concept Art (.ZIP)",
    studioType: "visual",
    description: "Generate consistent concept art for each of your 4 story scenes.",
    hoursList: [
      { hour: 9, title: "Visual Style & Art Recipe", duration: "1 hr", summary: "Choose art style, cinematic lighting, and camera angle.", action: "Select visual style." },
      { hour: 10, title: "Character Consistency Rules", duration: "1 hr", summary: "Lock character signature traits across every shot.", action: "Lock character traits." },
      { hour: 11, title: "4-Scene Art Generation", duration: "1 hr", summary: "Render widescreen 16:9 scene concept illustrations.", action: "Generate 4 images." },
      { hour: 12, title: "Concept Art Gallery Export", duration: "1 hr", summary: "Download the complete 4-image concept art pack.", action: "Download gallery ZIP." }
    ]
  },
  {
    id: "m4",
    number: 4,
    title: "Level 4: Video & Animation",
    tool: "Google Veo",
    toolBadge: "Video & Animation",
    completionTitle: "AI Animator",
    completionBadge: "Animator",
    hours: "Hours 13 – 16",
    color: "#DB2777",
    deliverable: "Video Trailer (.WEBM)",
    studioType: "motion",
    description: "Turn scene images into moving video clips with camera motion and audio.",
    hoursList: [
      { hour: 13, title: "Image-to-Video Animation", duration: "1 hr", summary: "Animate concept art keyframes into motion clips.", action: "Animate Scene 1." },
      { hour: 14, title: "Camera Angles & Direction", duration: "1 hr", summary: "Direct zooms, drone pans, and cinematic camera moves.", action: "Configure 4 clips." },
      { hour: 15, title: "Soundtrack & Voiceover Sync", duration: "1 hr", summary: "Add background score, sound effects, and voiceover.", action: "Preview trailer." },
      { hour: 16, title: "Movie Trailer Video Export", duration: "1 hr", summary: "Render and download 32-second video trailer reel.", action: "Download trailer." }
    ]
  },
  {
    id: "m5",
    number: 5,
    title: "Level 5: Website Builder",
    tool: "Web Studio",
    toolBadge: "Website Builder",
    completionTitle: "Web Developer",
    completionBadge: "Web Developer",
    hours: "Hours 17 – 20",
    color: "#D97706",
    deliverable: "Website Package (.ZIP)",
    studioType: "web-builder",
    description: "Build an interactive showcase website displaying your story, gallery, and trailer.",
    hoursList: [
      { hour: 17, title: "Showcase Page Architecture", duration: "1 hr", summary: "Configure hero banner, story reader, and video player.", action: "Set up layout." },
      { hour: 18, title: "Mobile & Tablet Testing", duration: "1 hr", summary: "Test responsive views across laptop, tablet, and phone.", action: "Test mobile view." },
      { hour: 19, title: "Media Linking & HTML/CSS", duration: "1 hr", summary: "Inspect real HTML/CSS code and link media assets.", action: "Verify live preview." },
      { hour: 20, title: "Website Package Export", duration: "1 hr", summary: "Download standalone HTML, CSS, and JS website package.", action: "Download website ZIP." }
    ]
  },
  {
    id: "m6",
    number: 6,
    title: "Level 6: Final Project",
    tool: "Project Showcase",
    toolBadge: "Final Project",
    completionTitle: "Master Innovator",
    completionBadge: "Master Innovator",
    hours: "Hours 21 – 24",
    color: "#0284C7",
    deliverable: "Project Bundle & Certificate",
    studioType: "capstone",
    description: "Review your completed deliverables, submit for rubric grading, and earn your certificate.",
    hoursList: [
      { hour: 21, title: "5-Tool Pipeline Review", duration: "1 hr", summary: "Trace full creator journey from research to live site.", action: "Check deliverables." },
      { hour: 22, title: "Portfolio Deliverables Check", duration: "1 hr", summary: "Package all 5 project assets ready for submission.", action: "Build portfolio." },
      { hour: 23, title: "Mentor Rubric Evaluation", duration: "1 hr", summary: "Complete 4-pillar evaluation for 100/100 points.", action: "Complete review." },
      { hour: 24, title: "Certificate & Bundle Export", duration: "1 hr", summary: "Download master project bundle and claim certificate.", action: "Download certificate." }
    ]
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [modules, setModules] = useState(FALLBACK_MODULES);
  const [completedHours, setCompletedHours] = useState([1, 2, 3, 4]); // 4 hours done (Badge 1 unlocked)
  const [projectTheme, setProjectTheme] = useState('My AI Adventure');
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Student Profile with Indian context
  const [userProfile, setUserProfile] = useState({
    name: "Aarav Sharma",
    email: "aarav.sharma@atl.gov.in",
    role: "ATL Student Innovator (Grade 8)",
    school: "Kendriya Vidyalaya / Bengaluru Public School",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
  });

  const [savedAssets, setSavedAssets] = useState({
    researchBrief: null,
    storyScript: null,
    visualPromptPack: null,
    conceptArtImages: [],
    videoReel: null,
    websiteCode: null
  });

  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showTrainerGuide, setShowTrainerGuide] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Fetch initial status and curriculum
  useEffect(() => {
    fetch('/api/curriculum')
      .then(res => res.json())
      .then(data => {
        if (data.modules && data.modules.length > 0) {
          setModules(data.modules);
        }
      })
      .catch(() => {});

    fetch('/api/ai/gateway/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.tools) setGatewayStatus(data.tools);
      })
      .catch(() => {});
  }, []);

  const handleToggleHour = (hourNum) => {
    setCompletedHours(prev => {
      let updated;
      if (prev.includes(hourNum)) {
        updated = prev.filter(h => h !== hourNum);
      } else {
        updated = [...prev, hourNum].sort((a, b) => a - b);
      }
      fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hour: hourNum,
          completed: updated.includes(hourNum)
        })
      }).catch(() => {});
      return updated;
    });
  };

  const handleSaveAsset = (key, data) => {
    setSavedAssets(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const toggleUserRole = () => {
    if (userProfile.role.includes("Student") || userProfile.role.includes("Innovator")) {
      setUserProfile({
        name: "Dr. Vikram Rao",
        email: "vikram.rao@isro.gov.in",
        role: "ISRO Senior Scientist & Creator Mentor",
        school: "National Space & AI Innovation Lab, Bengaluru",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      });
    } else {
      setUserProfile({
        name: "Aarav Sharma",
        email: "aarav.sharma@atl.gov.in",
        role: "ATL Student Innovator (Grade 8)",
        school: "Kendriya Vidyalaya / Bengaluru Public School",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
      });
    }
  };

  return (
    <>
      {activeTab === 'landing' ? (
        <KreomaxLandingPage 
          onLaunchStudio={(targetTab) => setActiveTab(targetTab || 'roadmap')}
          onOpenKeyModal={() => setShowKeyModal(true)}
        />
      ) : (
        <div className="ca-master-app-container">
          {/* Mobile Drawer Backdrop */}
          {isMobileNavOpen && (
            <div 
              className="ca-mobile-backdrop" 
              onClick={() => setIsMobileNavOpen(false)}
            />
          )}

          {/* LEFT PANE: Mission & Course Control Navigator */}
          <LeftPaneNav 
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsMobileNavOpen(false);
            }}
            modules={modules}
            completedHours={completedHours}
            onToggleHour={handleToggleHour}
            projectTheme={projectTheme}
            setProjectTheme={setProjectTheme}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            gatewayStatus={gatewayStatus}
            onOpenKeyModal={() => setShowKeyModal(true)}
            isMobileOpen={isMobileNavOpen}
            setIsMobileOpen={setIsMobileNavOpen}
            onOpenTrainerGuide={() => setShowTrainerGuide(true)}
            onOpenThemeModal={() => setShowThemeModal(true)}
          />

          {/* RIGHT PANE: Interactive Creative Studio Workspace */}
          <div className="ca-workspace-pane">
            {/* Workspace Topbar with Breadcrumbs, Indian Mission badge, & Quick Nav */}
            <WorkspaceTopBar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              modules={modules}
              projectTheme={projectTheme}
              onOpenKeyModal={() => setShowKeyModal(true)}
              gatewayStatus={gatewayStatus}
              onOpenMobileNav={() => setIsMobileNavOpen(true)}
              userProfile={userProfile}
              onToggleRole={toggleUserRole}
              onOpenTrainerGuide={() => setShowTrainerGuide(true)}
              onOpenThemeModal={() => setShowThemeModal(true)}
            />

            {/* Studio Canvas Router */}
            <div className="ca-studio-canvas">
              {activeTab === 'roadmap' && (
                <RoadmapView 
                  completedHours={completedHours}
                  onToggleHour={handleToggleHour}
                  onLaunchStudio={(studioType) => setActiveTab(studioType)}
                  projectTheme={projectTheme}
                  onOpenThemeModal={() => setShowThemeModal(true)}
                  onSwitchToCurriculumList={() => setActiveTab('curriculum')}
                />
              )}

              {activeTab === 'curriculum' && (
                <CurriculumView 
                  modules={modules}
                  completedHours={completedHours}
                  onToggleHour={handleToggleHour}
                  onLaunchStudio={(studioType) => setActiveTab(studioType)}
                  projectTheme={projectTheme}
                  onOpenThemeModal={() => setShowThemeModal(true)}
                  onSwitchToRoadmap={() => setActiveTab('roadmap')}
                />
              )}

              {activeTab === 'story' && (
                <StoryStudio 
                  projectTheme={projectTheme}
                  onSaveAsset={handleSaveAsset}
                  onNavigateNext={() => setActiveTab('notebooklm')}
                  onOpenThemeModal={() => setShowThemeModal(true)}
                />
              )}

              {activeTab === 'notebooklm' && (
                <NotebookLMLab 
                  projectTheme={projectTheme}
                  setProjectTheme={setProjectTheme}
                  onSaveAsset={handleSaveAsset}
                  onNavigateNext={() => setActiveTab('visual')}
                />
              )}

              {activeTab === 'visual' && (
                <VisualStudio 
                  projectTheme={projectTheme}
                  onSaveAsset={handleSaveAsset}
                  onNavigateNext={() => setActiveTab('motion')}
                />
              )}

              {activeTab === 'motion' && (
                <MotionStudio 
                  projectTheme={projectTheme}
                  onSaveAsset={handleSaveAsset}
                  onNavigateNext={() => setActiveTab('web-builder')}
                />
              )}

              {activeTab === 'web-builder' && (
                <WebBuilderStudio 
                  projectTheme={projectTheme}
                  onSaveAsset={handleSaveAsset}
                  onNavigateNext={() => setActiveTab('capstone')}
                />
              )}

              {activeTab === 'capstone' && (
                <CapstoneVault 
                  projectTheme={projectTheme}
                  userProfile={userProfile}
                  completedHours={completedHours}
                  onMarkGraduated={() => {
                    setCompletedHours(Array.from({ length: 24 }, (_, i) => i + 1));
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single Sign-On AI Gateway Modal */}
      <KeyConfigModal 
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        gatewayStatus={gatewayStatus}
        onKeysSaved={(tools) => setGatewayStatus(tools)}
      />

      {/* Assigned LMS Trainer & Mentor Guide Drawer */}
      <TrainerGuide 
        isOpen={showTrainerGuide}
        onClose={() => setShowTrainerGuide(false)}
        activeTab={activeTab}
        projectTheme={projectTheme}
        userProfile={userProfile}
      />

      {/* Project Theme & Story World Customizer Modal */}
      <ThemeSelectorModal 
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={projectTheme}
        onSelectTheme={(newTheme) => setProjectTheme(newTheme)}
      />
    </>
  );
}

export default App;
