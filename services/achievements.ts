import AsyncStorage from '@react-native-async-storage/async-storage';
import achievements, { AchievementStats } from '@/constants/achievements';
import { BadgeType } from '@/components/Badge';

const STORAGE_KEY = 'unlockedBadges';

export async function getUnlockedBadges(): Promise<BadgeType[]> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export async function saveUnlockedBadges(badges: BadgeType[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
}

export function checkNewAchievements(
  stats: AchievementStats,
  currentUnlocked: BadgeType[]
): BadgeType[] {
  const newlyUnlocked: BadgeType[] = [];
  achievements.forEach((a) => {
    if (!currentUnlocked.includes(a.id) && a.check(stats)) {
      newlyUnlocked.push(a.id);
    }
  });
  return newlyUnlocked;
}
