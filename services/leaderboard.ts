import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from '@/types';

export async function getLeaderboard(currentDeviceId: string): Promise<{
  entries: LeaderboardEntry[];
  userRank: number | null;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select('device_id, display_name, chamber_score, total_drains, total_tribunals, current_streak')
    .order('chamber_score', { ascending: false })
    .limit(50);

  if (error) throw error;

  const entries: LeaderboardEntry[] = (data || []).map((row, index) => ({
    id: row.device_id,
    name: row.display_name || `user_${row.device_id.slice(0, 6)}`,
    score: row.chamber_score || 0,
    actionsTaken: (row.total_drains || 0) + (row.total_tribunals || 0),
    avgResponseTime: '',
    rank: index + 1,
    streak: row.current_streak || 0,
    isYou: row.device_id === currentDeviceId,
  }));

  const userRank = entries.findIndex((e) => e.isYou) + 1 || null;

  return { entries, userRank };
}
