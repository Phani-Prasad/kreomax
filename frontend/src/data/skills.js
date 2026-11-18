// The seven cognitive skills Kreomax practises, and where in the 24-hour course each one is used.
// Single source of truth for the landing page and the workspace level cards.

export const SKILLS = [
  {
    id: 'logical',
    title: 'Logical & Analytical Thinking',
    short: 'Logical',
    line: 'Break ideas into steps and see how the pieces fit.',
    color: '#6D4FD8',
  },
  {
    id: 'memory',
    title: 'Memory & Recall',
    short: 'Memory',
    line: 'Keep characters, facts and style consistent across every scene.',
    color: '#4C7DFF',
  },
  {
    id: 'critical',
    title: 'Critical Thinking',
    short: 'Critical',
    line: 'Question AI answers, check sources and spot what does not add up.',
    color: '#0EA5E9',
  },
  {
    id: 'creative',
    title: 'Creative Thinking',
    short: 'Creative',
    line: 'Turn a blank page into an original story, artwork and film.',
    color: '#EC4899',
  },
  {
    id: 'problem',
    title: 'Problem-Solving & Decision-Making',
    short: 'Problem-solving',
    line: 'Try, test and choose the best option, from prompts to layouts.',
    color: '#F59E0B',
  },
  {
    id: 'communication',
    title: 'Communication & Collaboration',
    short: 'Communication',
    line: 'Explain ideas clearly, give and take feedback, present your work.',
    color: '#10B981',
  },
  {
    id: 'metacognition',
    title: 'Metacognition & Self-Learning',
    short: 'Self-learning',
    line: 'Reflect on what worked, score your own work and plan the next step.',
    color: '#8B5CF6',
  },
];

// Skills practised in each level (1-6). Keep to three or fewer per level.
export const LEVEL_SKILLS = {
  1: ['logical', 'creative', 'communication'],
  2: ['critical', 'memory'],
  3: ['creative', 'memory'],
  4: ['problem', 'creative'],
  5: ['logical', 'problem'],
  6: ['critical', 'communication', 'metacognition'],
};

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function skillsForLevel(level) {
  return (LEVEL_SKILLS[level] || []).map((id) => SKILL_BY_ID[id]);
}

export function levelsForSkill(id) {
  return Object.entries(LEVEL_SKILLS)
    .filter(([, ids]) => ids.includes(id))
    .map(([level]) => Number(level));
}

// The six studios, in course order.
export const LEVELS = [
  { n: 1, name: 'Story Studio', output: 'a Story Script', color: '#10B981' },
  { n: 2, name: 'Research Lab', output: 'a Research Guide', color: '#4C7DFF' },
  { n: 3, name: 'Visual Studio', output: 'Concept Art', color: '#8B5CF6' },
  { n: 4, name: 'Motion Studio', output: 'a Video Trailer', color: '#EC4899' },
  { n: 5, name: 'Web Builder', output: 'a Live Website', color: '#F59E0B' },
  { n: 6, name: 'Final Project', output: 'a Certificate', color: '#0EA5E9' },
];
