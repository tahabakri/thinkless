import { BadgeType } from '@/components/Badge';

export interface AchievementDef {
  id: BadgeType;
  label: string;
  description: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalDrains: number;
  totalTribunals: number;
  commitmentsKept: number;
  currentStreak: number;
  totalChatMessages: number;
  loopsBroken: number;
}

const achievements: AchievementDef[] = [
  {
    id: 'first_drain',
    label: 'FIRST DRAIN',
    description: 'Completed your first thought drain',
    check: (s) => s.totalDrains >= 1,
  },
  {
    id: 'ten_drains',
    label: 'DRAIN MASTER',
    description: 'Completed 10 thought drains',
    check: (s) => s.totalDrains >= 10,
  },
  {
    id: 'first_tribunal',
    label: 'DEBATER',
    description: 'Held your first tribunal',
    check: (s) => s.totalTribunals >= 1,
  },
  {
    id: 'streak_7',
    label: '7-DAY FIRE',
    description: '7-day action streak',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    label: '30-DAY LEGEND',
    description: '30-day action streak',
    check: (s) => s.currentStreak >= 30,
  },
  {
    id: 'commitments_10',
    label: 'COMMITTED',
    description: 'Kept 10 commitments',
    check: (s) => s.commitmentsKept >= 10,
  },
  {
    id: 'loop_breaker',
    label: 'LOOP BREAKER',
    description: 'Broke 5 thought loops',
    check: (s) => s.loopsBroken >= 5,
  },
  {
    id: 'socra_regular',
    label: 'SOCRA REGULAR',
    description: '50 messages with Socra',
    check: (s) => s.totalChatMessages >= 50,
  },
];

export default achievements;
