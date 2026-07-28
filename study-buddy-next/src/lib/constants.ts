export type Evolution = {
  level: number;
  name: string;
  title: string;
  emoji: string;
  color: string;
};

export const EVOLUTIONS: Evolution[] = [
  { level: 1, name: 'Dunce Twin', title: 'The Beginner', emoji: '🧠', color: '#fcd34d' },
  { level: 2, name: 'Curious Sprout', title: 'The Learner', emoji: '🌿', color: '#6b9e7a' },
  { level: 3, name: 'Bright Star', title: 'The Thinker', emoji: '🌟', color: '#fbbf24' },
  { level: 5, name: 'Spark Wizard', title: 'The Smart One', emoji: '⚡', color: '#a78bfa' },
  { level: 10, name: 'Ember Mage', title: 'The Wise One', emoji: '🔥', color: '#f472b6' },
  { level: 20, name: 'Wave Sage', title: 'The Master', emoji: '🌊', color: '#60a5fa' },
  { level: 50, name: 'Royal Scholar', title: 'The Legend', emoji: '👑', color: '#f59e0b' },
];

export const TOPICS = [
  'The Basics', 'Numbers', 'Words', 'Colors', 'Shapes', 
  'Animals', 'Plants', 'Space', 'Weather', 'Music', 
  'Food', 'History', 'Geography', 'Science', 'Math'
];

export type MentorMode = {
  id: string;
  label: string;
  system: string;
  welcome: string;
};

export const MENTOR_MODES: Record<string, MentorMode> = {
  homework: {
    id: 'homework',
    label: 'Homework Helper',
    system: 'You are Study Buddy, a peer-styled homework helper. You help students understand concepts step-by-step. Be encouraging, use simple language, and give practical examples. Never do the work for them — guide them to the answer.',
    welcome: '📚 Stuck on homework? Share your question or topic.'
  },
  explain: {
    id: 'explain',
    label: 'Topic Explainer',
    system: 'You are Study Buddy, a topic explainer. Break down complex topics into simple, clear explanations. Use analogies and real-world examples. Keep it conversational and friendly.',
    welcome: '💡 What topic should I explain? I\'ll make it simple.'
  },
  career: {
    id: 'career',
    label: 'Career Expert',
    system: 'You are Study Buddy, a career guidance expert. Help students with career paths, skill development, and professional growth. Be practical and encouraging.',
    welcome: '🎯 Tell me about your interests or career goals.'
  },
  resume: {
    id: 'resume',
    label: 'Resume Review',
    system: 'You are Study Buddy, a resume analyst. Review resumes against job requirements and provide specific, actionable improvement suggestions.',
    welcome: '📄 Paste your resume or describe your experience.'
  },
  references: {
    id: 'references',
    label: 'Reference Generator',
    system: 'You are Study Buddy, an academic reference generator. Create properly formatted references in APA, MLA, or Chicago style.',
    welcome: '📖 Give me your sources and I\'ll format them.'
  },
  pitch: {
    id: 'pitch',
    label: 'Pitch Generator',
    system: 'You are Study Buddy, a pitch generator. Help students develop compelling project pitches with: Title, Problem, Solution, Features, Audience, Impact. End with a note about PPTX export.',
    welcome: '🚀 Share your project idea for a pitch deck.'
  },
};
