import { supabase } from '@/lib/supabase';
import { UserStats, SocraPersonality, PatternDNA, WeeklyReport } from '@/types';

interface ProfileRow {
  id: string;
  device_id: string;
  display_name: string | null;
  personality: SocraPersonality;
  is_pro: boolean;
  chamber_score: number;
  current_streak: number;
  longest_streak: number;
  total_drains: number;
  total_tribunals: number;
  commitments_kept: number;
  commitments_broken: number;
  last_checkin_date: string | null;
  notification_enabled: boolean;
  slap_enabled: boolean;
  slap_frequency: 'aggressive' | 'daily' | 'gentle';
  created_at: string;
  updated_at: string;
}

export interface ProfileSettings {
  personality: SocraPersonality;
  isPro: boolean;
  notificationEnabled: boolean;
  slapEnabled: boolean;
  slapFrequency: 'aggressive' | 'daily' | 'gentle';
  displayName: string | null;
}

export function mapProfileToStats(row: ProfileRow): UserStats {
  return {
    chamberScore: row.chamber_score,
    totalDrains: row.total_drains,
    totalTribunals: row.total_tribunals,
    commitmentsKept: row.commitments_kept,
    commitmentsBroken: row.commitments_broken,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    weeklyScores: [],
    lastCheckInDate: row.last_checkin_date || undefined,
  };
}

export function mapProfileToSettings(row: ProfileRow): ProfileSettings {
  return {
    personality: row.personality,
    isPro: row.is_pro,
    notificationEnabled: row.notification_enabled,
    slapEnabled: row.slap_enabled,
    slapFrequency: row.slap_frequency,
    displayName: row.display_name,
  };
}

export async function getProfile(deviceId: string): Promise<{ stats: UserStats; settings: ProfileSettings } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (error || !data) return null;
  return {
    stats: mapProfileToStats(data),
    settings: mapProfileToSettings(data),
  };
}

export async function updateProfileStats(
  deviceId: string,
  updates: Partial<{
    chamber_score: number;
    total_drains: number;
    total_tribunals: number;
    commitments_kept: number;
    commitments_broken: number;
    current_streak: number;
    longest_streak: number;
    last_checkin_date: string;
  }>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('device_id', deviceId);

  if (error) throw error;
}

export async function incrementStat(
  deviceId: string,
  field: 'total_drains' | 'total_tribunals' | 'commitments_kept' | 'commitments_broken',
  scoreBoost: number
): Promise<UserStats> {
  // Fetch current profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (fetchError || !profile) throw fetchError || new Error('Profile not found');

  const updates: Record<string, number | string> = {
    [field]: (profile[field] || 0) + 1,
    chamber_score: Math.min(100, (profile.chamber_score || 0) + scoreBoost),
  };

  // Handle streak logic for commitments_kept
  if (field === 'commitments_kept') {
    updates.current_streak = (profile.current_streak || 0) + 1;
    updates.longest_streak = Math.max(
      profile.longest_streak || 0,
      (profile.current_streak || 0) + 1
    );
  }

  // Reset streak on broken commitment
  if (field === 'commitments_broken') {
    updates.current_streak = 0;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('device_id', deviceId);

  if (error) throw error;

  return mapProfileToStats({ ...profile, ...updates } as ProfileRow);
}

export async function updateSettings(
  deviceId: string,
  updates: Partial<{
    personality: SocraPersonality;
    is_pro: boolean;
    notification_enabled: boolean;
    slap_enabled: boolean;
    slap_frequency: 'aggressive' | 'daily' | 'gentle';
    display_name: string;
  }>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('device_id', deviceId);

  if (error) throw error;
}

// Pattern DNA
interface PatternDNARow {
  id: string;
  device_id: string;
  top_loops: string[];
  avoidance_style: string | null;
  avg_thought_to_action_minutes: number;
  total_drains_analyzed: number;
  loop_frequency: Record<string, number>;
  generated_at: string;
}

function mapPatternDNA(row: PatternDNARow): PatternDNA {
  return {
    topLoops: row.top_loops || [],
    avoidanceStyle: row.avoidance_style || '',
    avgThoughtToActionMinutes: row.avg_thought_to_action_minutes,
    totalDrainsAnalyzed: row.total_drains_analyzed,
    loopFrequency: row.loop_frequency || {},
    generatedAt: new Date(row.generated_at).getTime(),
  };
}

export async function getPatternDNA(deviceId: string): Promise<PatternDNA | null> {
  const { data, error } = await supabase
    .from('pattern_dna')
    .select('*')
    .eq('device_id', deviceId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPatternDNA(data) : null;
}

export async function savePatternDNA(deviceId: string, dna: PatternDNA): Promise<void> {
  const { error } = await supabase.from('pattern_dna').insert({
    device_id: deviceId,
    top_loops: dna.topLoops,
    avoidance_style: dna.avoidanceStyle,
    avg_thought_to_action_minutes: dna.avgThoughtToActionMinutes,
    total_drains_analyzed: dna.totalDrainsAnalyzed,
    loop_frequency: dna.loopFrequency,
    generated_at: new Date(dna.generatedAt).toISOString(),
  });

  if (error) throw error;
}

// Weekly Reports
interface WeeklyReportRow {
  id: string;
  device_id: string;
  week_of: string;
  avg_escape_score: number;
  loops_broken: number;
  commitments_kept: number;
  commitments_missed: number;
  total_drains: number;
  total_tribunals: number;
  streak_days: number;
  socra_verdict: string | null;
  top_pattern: string | null;
  created_at: string;
}

function mapWeeklyReport(row: WeeklyReportRow): WeeklyReport {
  return {
    weekOf: row.week_of,
    avgEscapeScore: row.avg_escape_score,
    loopsBroken: row.loops_broken,
    commitmentsKept: row.commitments_kept,
    commitmentsMissed: row.commitments_missed,
    totalDrains: row.total_drains,
    totalTribunals: row.total_tribunals,
    streakDays: row.streak_days,
    socraVerdict: row.socra_verdict || '',
    topPattern: row.top_pattern || '',
  };
}

export async function getWeeklyReports(deviceId: string): Promise<WeeklyReport[]> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('device_id', deviceId)
    .order('week_of', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWeeklyReport);
}

export async function saveWeeklyReport(deviceId: string, report: WeeklyReport): Promise<void> {
  const { error } = await supabase.from('weekly_reports').insert({
    device_id: deviceId,
    week_of: report.weekOf,
    avg_escape_score: report.avgEscapeScore,
    loops_broken: report.loopsBroken,
    commitments_kept: report.commitmentsKept,
    commitments_missed: report.commitmentsMissed,
    total_drains: report.totalDrains,
    total_tribunals: report.totalTribunals,
    streak_days: report.streakDays,
    socra_verdict: report.socraVerdict,
    top_pattern: report.topPattern,
  });

  if (error) throw error;
}

export async function clearAllData(deviceId: string): Promise<void> {
  await Promise.all([
    supabase.from('drains').delete().eq('device_id', deviceId),
    supabase.from('tribunal_sessions').delete().eq('device_id', deviceId),
    supabase.from('commitments').delete().eq('device_id', deviceId),
    supabase.from('chat_messages').delete().eq('device_id', deviceId),
    supabase.from('checkins').delete().eq('device_id', deviceId),
    supabase.from('spiral_timers').delete().eq('device_id', deviceId),
    supabase.from('external_inputs').delete().eq('device_id', deviceId),
    supabase.from('graveyard_entries').delete().eq('device_id', deviceId),
    supabase.from('pattern_dna').delete().eq('device_id', deviceId),
    supabase.from('weekly_reports').delete().eq('device_id', deviceId),
  ]);

  await supabase
    .from('profiles')
    .update({
      chamber_score: 0,
      current_streak: 0,
      total_drains: 0,
      total_tribunals: 0,
      commitments_kept: 0,
      commitments_broken: 0,
      last_checkin_date: null,
    })
    .eq('device_id', deviceId);
}
