import { supabase } from '@/lib/supabase';
import { TribunalSession } from '@/types';

interface TribunalRow {
  id: string;
  device_id: string;
  topic: string;
  side_a: string | null;
  side_b: string | null;
  verdict: string | null;
  decision: string | null;
  locked: boolean;
  created_at: string;
}

function mapFromDb(row: TribunalRow): TribunalSession {
  return {
    id: row.id,
    topic: row.topic,
    sideA: row.side_a || '',
    sideB: row.side_b || '',
    verdict: row.verdict || '',
    decision: row.decision || '',
    timestamp: new Date(row.created_at).getTime(),
    locked: row.locked,
  };
}

export async function getTribunals(deviceId: string): Promise<TribunalSession[]> {
  const { data, error } = await supabase
    .from('tribunal_sessions')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createTribunal(
  deviceId: string,
  topic: string,
  sideA: string,
  sideB: string,
  verdict: string
): Promise<TribunalSession> {
  const { data, error } = await supabase
    .from('tribunal_sessions')
    .insert({
      device_id: deviceId,
      topic,
      side_a: sideA,
      side_b: sideB,
      verdict,
      locked: true,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}
