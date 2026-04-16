-- Run this in the Supabase SQL editor to set up the database.

CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- About the offender
  offender_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  offender_role TEXT NOT NULL,

  -- About the event
  event_description TEXT,
  event_type TEXT NOT NULL,
  agreed_time TIME NOT NULL,
  event_duration TEXT NOT NULL,
  people_waiting INTEGER DEFAULT 1,

  -- About the lateness
  actual_arrival TIME,
  no_show BOOLEAN DEFAULT FALSE,
  minutes_late INTEGER,
  gave_notice BOOLEAN DEFAULT FALSE,
  notice_timing TEXT,
  notice_method TEXT,
  repeat_offender TEXT NOT NULL,

  -- About the excuse
  gave_excuse BOOLEAN DEFAULT FALSE,
  excuse_text TEXT,
  excuse_category TEXT,
  excuse_convincing INTEGER,
  could_have_avoided TEXT,
  apologised TEXT,

  -- Your reaction
  annoyance_level INTEGER NOT NULL,
  event_impact TEXT NOT NULL,
  forgiven TEXT NOT NULL,
  will_do_again TEXT NOT NULL,
  extra_context TEXT,

  -- Calculated scores (stored for dashboard efficiency)
  relative_time_score NUMERIC NOT NULL,
  event_type_score NUMERIC NOT NULL,
  importance_score NUMERIC NOT NULL,
  excuse_score NUMERIC NOT NULL,
  notice_score NUMERIC NOT NULL,
  final_score NUMERIC NOT NULL,
  verdict TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submissions)
CREATE POLICY "Anyone can insert entries"
  ON entries FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read entries (for the dashboard and result pages)
CREATE POLICY "Anyone can read entries"
  ON entries FOR SELECT
  USING (true);

-- Index for dashboard queries
CREATE INDEX idx_entries_verdict ON entries(verdict);
CREATE INDEX idx_entries_event_type ON entries(event_type);
CREATE INDEX idx_entries_final_score ON entries(final_score DESC);
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
