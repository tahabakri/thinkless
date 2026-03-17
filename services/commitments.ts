import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types';

interface CommitmentRow {
  id: string;
  device_id: string;
  decision: string;
  deadline: string;
  proof_required: 'photo' | 'text' | 'voice';
  proof_submitted: boolean;
  proof_text: string | null;
  shamed: boolean;
  source: 'drain' | 'tribunal' | 'manual';
  shared_with: string | null;
  created_at: string;
}

function mapFromDb(row: CommitmentRow): Commitment {
  return {
    id: row.id,
    decision: row.decision,
    timestamp: new Date(row.created_at).getTime(),
    deadline: new Date(row.deadline).getTime(),
    proofRequired: row.proof_required,
    proofSubmitted: row.proof_submitted,
    proofText: row.proof_text || undefined,
    shamed: row.shamed,
    source: row.source,
    sharedWith: row.shared_with || undefined,
  };
}

export async function getCommitments(deviceId: string): Promise<Commitment[]> {
  const { data, error } = await supabase
    .from('commitments')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function createCommitment(
  deviceId: string,
  input: { decision: string; source: 'drain' | 'tribunal' | 'manual'; sharedWith?: string }
): Promise<Commitment> {
  const { data, error } = await supabase
    .from('commitments')
    .insert({
      device_id: deviceId,
      decision: input.decision,
      deadline: new Date(Date.now() + 72 * 3600000).toISOString(),
      proof_required: 'text',
      source: input.source,
      shared_with: input.sharedWith || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFromDb(data);
}

export async function submitProof(id: string, proofText: string): Promise<void> {
  const { error } = await supabase
    .from('commitments')
    .update({ proof_submitted: true, proof_text: proofText })
    .eq('id', id);

  if (error) throw error;
}

export async function shameCommitment(id: string): Promise<void> {
  const { error } = await supabase
    .from('commitments')
    .update({ shamed: true })
    .eq('id', id);

  if (error) throw error;
}
