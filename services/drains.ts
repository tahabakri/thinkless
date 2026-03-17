import { supabase } from '@/lib/supabase';
import { ThoughtDrain } from '@/types';

interface DrainRow {
  id: string;
  device_id: string;
  text: string;
  socra_response: string | null;
  loop_score: number;
  resolved: boolean;
  created_at: string;
}

function mapFromDb(row: DrainRow): ThoughtDrain {
  return {
    id: row.id,
    text: row.text,
    socraResponse: row.socra_response || '',
    loopScore: row.loop_score,
    resolved: row.resolved,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function getDrains(deviceId: string): Promise<ThoughtDrain[]> {
  const { data, error } = await supabase
    .from('drains')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createDrain(
  deviceId: string,
  text: string,
  socraResponse: string,
  loopScore: number
): Promise<ThoughtDrain> {
  const { data, error } = await supabase
    .from('drains')
    .insert({
      device_id: deviceId,
      text,
      socra_response: socraResponse,
      loop_score: loopScore,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}

export async function resolveDrain(id: string): Promise<void> {
  const { error } = await supabase
    .from('drains')
    .update({ resolved: true })
    .eq('id', id);

  if (error) throw error;
}
