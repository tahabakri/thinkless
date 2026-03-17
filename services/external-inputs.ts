import { supabase } from '@/lib/supabase';
import { ExternalInput } from '@/types';

interface InputRow {
  id: string;
  device_id: string;
  type: ExternalInput['type'];
  description: string;
  created_at: string;
}

function mapFromDb(row: InputRow): ExternalInput {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function getExternalInputs(deviceId: string): Promise<ExternalInput[]> {
  const { data, error } = await supabase
    .from('external_inputs')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createExternalInput(
  deviceId: string,
  type: ExternalInput['type'],
  description: string
): Promise<ExternalInput> {
  const { data, error } = await supabase
    .from('external_inputs')
    .insert({ device_id: deviceId, type, description })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}
