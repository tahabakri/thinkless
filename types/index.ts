export interface ThoughtDrain {
  id: string;
  text: string;
  socraResponse: string;
  timestamp: number;
  loopScore: number;
  resolved: boolean;
}

export interface TribunalSession {
  id: string;
  topic: string;
  sideA: string;
  sideB: string;
  verdict: string;
  decision: string;
  timestamp: number;
  locked: boolean;
}

export interface Commitment {
  id: string;
  decision: string;
  timestamp: number;
  deadline: number;
  proofRequired: 'photo' | 'text' | 'voice';
  proofSubmitted: boolean;
  proofText?: string;
  shamed: boolean;
  source: 'drain' | 'tribunal' | 'manual';
  sharedWith?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'socra';
  text: string;
  timestamp: number;
}

export type SocraPersonality = 'default' | 'drill_sergeant' | 'stoic' | 'dark_humor' | 'deadline';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  actionsTaken: number;
  avgResponseTime: string;
  rank: number;
}

export interface EchoReport {
  loopScore: number;
  repetitions: number;
  circularPatterns: number;
  catastrophizing: number;
  pseudoIntellectual: number;
  topLoops: string[];
}

export interface DailyScore {
  date: string;
  score: number;
  thoughtToAction: number;
  loopsDetected: number;
  commitmentsKept: number;
  externalInputs: number;
}

export interface UserStats {
  chamberScore: number;
  totalDrains: number;
  totalTribunals: number;
  commitmentsKept: number;
  commitmentsBroken: number;
  currentStreak: number;
  longestStreak: number;
  weeklyScores: DailyScore[];
  lastCheckInDate?: string;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  avoidingDecision: string;
  committedAction: string;
  yesterdayLoop: string;
  timestamp: number;
}

export interface SpiralTimer {
  id: string;
  topic: string;
  durationMinutes: number;
  startedAt: number;
  completedAt?: number;
  decided: boolean;
  decision?: string;
}

export interface ExternalInput {
  id: string;
  type: 'book' | 'conversation' | 'article' | 'therapy' | 'podcast' | 'other';
  description: string;
  timestamp: number;
}

export interface PatternDNA {
  topLoops: string[];
  avoidanceStyle: string;
  avgThoughtToActionMinutes: number;
  totalDrainsAnalyzed: number;
  loopFrequency: Record<string, number>;
  generatedAt: number;
}

export interface WeeklyReport {
  weekOf: string;
  avgEscapeScore: number;
  loopsBroken: number;
  commitmentsKept: number;
  commitmentsMissed: number;
  totalDrains: number;
  totalTribunals: number;
  streakDays: number;
  socraVerdict: string;
  topPattern: string;
}

export interface GraveyardEntry {
  id: string;
  type: 'broken_commitment' | 'unresolved_loop' | 'unmade_decision';
  description: string;
  timestamp: number;
  originalId?: string;
}
