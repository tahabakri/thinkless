import { supabase } from '@/lib/supabase';
import { SpiralTimer } from '@/types';

interface SpiralRow {
  id: string;
  device_id: string;
  topic: string;
  duration_minutes: number;
  started_at: string;
  completed_at: string | null;
  decided: boolean;
  decision: string | null;
}

function mapFromDb(row: SpiralRow): SpiralTimer {
  return {
    id: row.id,
    topic: row.topic,
    durationMinutes: row.duration_minutes,
    startedAt: new Date(row.started_at).getTime(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
    decided: row.decided,
    decision: row.decision || undefined,
  };
}

export async function getSpiralTimers(deviceId: string): Promise<SpiralTimer[]> {
  const { data, error } = await supabase
    .from('spiral_timers')
    .select('*')
    .eq('device_id', deviceId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createSpiralTimer(
  deviceId: string,
  topic: string,
  durationMinutes: number
): Promise<SpiralTimer> {
  const { data, error } = await supabase
    .from('spiral_timers')
    .insert({ device_id: deviceId, topic, duration_minutes: durationMinutes })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}

export async function completeSpiralTimer(
  id: string,
  decision?: string
): Promise<void> {
  const { error } = await supabase
    .from('spiral_timers')
    .update({
      completed_at: new Date().toISOString(),
      decided: !!decision,
      decision: decision || null,
    })
    .eq('id', id);

  if (error) throw error;
}
