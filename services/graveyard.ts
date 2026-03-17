import { supabase } from '@/lib/supabase';
import { GraveyardEntry } from '@/types';

interface GraveyardRow {
  id: string;
  device_id: string;
  type: GraveyardEntry['type'];
  description: string;
  original_id: string | null;
  created_at: string;
}

function mapFromDb(row: GraveyardRow): GraveyardEntry {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    timestamp: new Date(row.created_at).getTime(),
    originalId: row.original_id || undefined,
  };
}

export async function getGraveyardEntries(deviceId: string): Promise<GraveyardEntry[]> {
  const { data, error } = await supabase
    .from('graveyard_entries')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createGraveyardEntry(
  deviceId: string,
  type: GraveyardEntry['type'],
  description: string,
  originalId?: string
): Promise<GraveyardEntry> {
  const { data, error } = await supabase
    .from('graveyard_entries')
    .insert({
      device_id: deviceId,
      type,
      description,
      original_id: originalId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}
