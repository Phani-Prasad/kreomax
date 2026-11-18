import { Rocket, Landmark, Compass, ShieldAlert } from 'lucide-react';

// Example project worlds students can pick (or they can write their own).
export const THEMES = [
  {
    id: 'chandrayaan',
    title: '🚀 Mission Chandrayaan 2085: Secret of the Lunar Water Vault',
    shortTitle: 'Chandrayaan 2085',
    tag: 'Space exploration',
    icon: Rocket,
    color: '#38BDF8',
  },
  {
    id: 'varanasi',
    title: '🛕 Cyber-Varanasi 2090: The Floating Solar Ghats',
    shortTitle: 'Cyber-Varanasi 2090',
    tag: 'Heritage & renewable energy',
    icon: Landmark,
    color: '#F59E0B',
  },
  {
    id: 'hampi',
    title: '🏛️ Hampi Algorithm Code: Secrets of the Vijayanagara AI Relic',
    shortTitle: 'Hampi Algorithm Code',
    tag: 'Archaeology & cryptography',
    icon: Compass,
    color: '#10B981',
  },
  {
    id: 'coastal',
    title: '🌊 Sundarbans 2100: Bio-Engineered Mangrove Sentinels',
    shortTitle: 'Sundarbans 2100',
    tag: 'Eco-tech & climate',
    icon: ShieldAlert,
    color: '#EC4899',
  },
];

export const LEVEL_SHORT_NAMES = {
  m1: 'Story Writing',
  m2: 'Research',
  m3: 'Images & Art',
  m4: 'Video & Animation',
  m5: 'Website Builder',
  m6: 'Final Project',
};

export const LEVEL_BADGES = {
  m1: { title: 'AI Story Creator', icon: '✍️', badge: 'Story Creator' },
  m2: { title: 'AI Researcher', icon: '🔍', badge: 'Researcher' },
  m3: { title: 'Digital Artist', icon: '🎨', badge: 'Digital Artist' },
  m4: { title: 'AI Animator', icon: '🎬', badge: 'Animator' },
  m5: { title: 'Web Developer', icon: '💻', badge: 'Web Developer' },
  m6: { title: 'Master Innovator', icon: '🏆', badge: 'Master Innovator' },
};

export const GRADES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Other'];

export const PROFILE_KEY = 'kreomax.profile.v1';
export const PROGRESS_KEY = 'kreomax.progress.v1';
export const THEME_KEY = 'kreomax.theme.v1';

export function loadStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode): the session still works */
  }
}
