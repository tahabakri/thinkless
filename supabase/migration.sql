-- ThinkLess Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Devices (pseudo-auth via device ID)
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (one per device)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  display_name TEXT,
  personality TEXT DEFAULT 'default' CHECK (personality IN ('default', 'drill_sergeant', 'stoic', 'dark_humor', 'deadline')),
  is_pro BOOLEAN DEFAULT FALSE,
  chamber_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_drains INTEGER DEFAULT 0,
  total_tribunals INTEGER DEFAULT 0,
  commitments_kept INTEGER DEFAULT 0,
  commitments_broken INTEGER DEFAULT 0,
  last_checkin_date DATE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  slap_enabled BOOLEAN DEFAULT TRUE,
  slap_frequency TEXT DEFAULT 'daily' CHECK (slap_frequency IN ('aggressive', 'daily', 'gentle')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thought Drains
CREATE TABLE drains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  socra_response TEXT,
  loop_score INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tribunal Sessions
CREATE TABLE tribunal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  side_a TEXT,
  side_b TEXT,
  verdict TEXT,
  decision TEXT,
  locked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commitments
CREATE TABLE commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  proof_required TEXT DEFAULT 'text' CHECK (proof_required IN ('photo', 'text', 'voice')),
  proof_submitted BOOLEAN DEFAULT FALSE,
  proof_text TEXT,
  shamed BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('drain', 'tribunal', 'manual')),
  shared_with TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'socra')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Check-ins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avoiding_decision TEXT NOT NULL,
  committed_action TEXT NOT NULL,
  yesterday_loop TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, date)
);

-- Spiral Timers
CREATE TABLE spiral_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  decided BOOLEAN DEFAULT FALSE,
  decision TEXT
);

-- External Inputs
CREATE TABLE external_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('book', 'conversation', 'article', 'therapy', 'podcast', 'other')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Graveyard Entries
CREATE TABLE graveyard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('broken_commitment', 'unresolved_loop', 'unmade_decision')),
  description TEXT NOT NULL,
  original_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern DNA
CREATE TABLE pattern_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  top_loops TEXT[] DEFAULT '{}',
  avoidance_style TEXT,
  avg_thought_to_action_minutes INTEGER DEFAULT 0,
  total_drains_analyzed INTEGER DEFAULT 0,
  loop_frequency JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reports
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  avg_escape_score INTEGER DEFAULT 0,
  loops_broken INTEGER DEFAULT 0,
  commitments_kept INTEGER DEFAULT 0,
  commitments_missed INTEGER DEFAULT 0,
  total_drains INTEGER DEFAULT 0,
  total_tribunals INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  socra_verdict TEXT,
  top_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_drains_device ON drains(device_id);
CREATE INDEX idx_drains_created ON drains(created_at DESC);
CREATE INDEX idx_tribunals_device ON tribunal_sessions(device_id);
CREATE INDEX idx_tribunals_created ON tribunal_sessions(created_at DESC);
CREATE INDEX idx_commitments_device ON commitments(device_id);
CREATE INDEX idx_commitments_deadline ON commitments(deadline);
CREATE INDEX idx_chat_device ON chat_messages(device_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);
CREATE INDEX idx_checkins_device ON checkins(device_id);
CREATE INDEX idx_checkins_date ON checkins(date DESC);
CREATE INDEX idx_spirals_device ON spiral_timers(device_id);
CREATE INDEX idx_inputs_device ON external_inputs(device_id);
CREATE INDEX idx_inputs_created ON external_inputs(created_at DESC);
CREATE INDEX idx_graveyard_device ON graveyard_entries(device_id);
CREATE INDEX idx_dna_device ON pattern_dna(device_id);
CREATE INDEX idx_reports_device ON weekly_reports(device_id);
CREATE INDEX idx_reports_week ON weekly_reports(week_of DESC);
CREATE INDEX idx_profiles_score ON profiles(chamber_score DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE graveyard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Permissive policies for v1 (device-id auth, no Supabase auth)
-- Tighten these when real auth is added
CREATE POLICY "anon_all" ON devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON drains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON tribunal_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON commitments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON spiral_timers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON external_inputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON graveyard_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON pattern_dna FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON weekly_reports FOR ALL USING (true) WITH CHECK (true);
