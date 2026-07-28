import { Evolution } from './constants';

export interface GameState {
  level: number;
  xp: number;
  hp: number;
  maxHP: number;
  lessons: number;
  topicsCompleted: number;
  topicProgress: number;
  currentTopic: string;
  xpPerLevel: number;
  kbText: string;
}

export interface SessionState {
  sessionStarted: boolean;
  sessionEnded: boolean;
  timeRemaining: number;
  dailySessionsUsed: number;
  lastSessionDate: string;
  cooldownUntil: number | null;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  useFallback: boolean;
  sessionCap: number; // in minutes
  cooldownMin: number; // in minutes
  dailyCap: number;
  warningSec: number;
  voiceUnlockLevel: number;
  cmdUnlockLevel: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'sys' | 'correct' | 'wrong' | 'timeout';
  content: string;
  sender?: string;
  timestamp: number;
}
