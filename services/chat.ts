import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/types';

interface ChatRow {
  id: string;
  device_id: string;
  role: 'user' | 'socra';
  text: string;
  created_at: string;
}

function mapFromDb(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.text,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function getChatMessages(deviceId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createChatMessage(
  deviceId: string,
  role: 'user' | 'socra',
  text: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ device_id: deviceId, role, text })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}

export async function clearChat(deviceId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('device_id', deviceId);

  if (error) throw error;
}
