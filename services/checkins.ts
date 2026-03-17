import { supabase } from '@/lib/supabase';
import { DailyCheckIn } from '@/types';

interface CheckinRow {
  id: string;
  device_id: string;
  date: string;
  avoiding_decision: string;
  committed_action: string;
  yesterday_loop: string;
  created_at: string;
}

function mapFromDb(row: CheckinRow): DailyCheckIn {
  return {
    id: row.id,
    date: row.date,
    avoidingDecision: row.avoiding_decision,
    committedAction: row.committed_action,
    yesterdayLoop: row.yesterday_loop,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function getCheckins(deviceId: string): Promise<DailyCheckIn[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('device_id', deviceId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createCheckin(
  deviceId: string,
  input: { avoidingDecision: string; committedAction: string; yesterdayLoop: string }
): Promise<DailyCheckIn> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('checkins')
    .upsert(
      {
        device_id: deviceId,
        date: today,
        avoiding_decision: input.avoidingDecision,
        committed_action: input.committedAction,
        yesterday_loop: input.yesterdayLoop,
      },
      { onConflict: 'device_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}
