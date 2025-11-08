-- CPR AI Trainer Database Schema
-- Run this in your Supabase SQL Editor

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_team_owner BOOLEAN DEFAULT FALSE,
  voice_preference TEXT DEFAULT 'guided',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_results table
CREATE TABLE IF NOT EXISTS lesson_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  summary TEXT,
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_results ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view team members"
  ON users FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

-- Create policies for teams
CREATE POLICY "Users can view own team"
  ON teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update team"
  ON teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM users 
      WHERE id = auth.uid() AND is_team_owner = TRUE
    )
  );

-- Create policies for lessons
CREATE POLICY "All authenticated users can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for lesson_results
CREATE POLICY "Users can view own results"
  ON lesson_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view team results"
  ON lesson_results FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE team_id IN (
        SELECT team_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own results"
  ON lesson_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample lessons
INSERT INTO lessons (title, description, difficulty) VALUES
  ('Basic CPR Introduction', 'Learn the fundamentals of CPR and chest compressions', 'beginner'),
  ('Adult CPR Scenario', 'Practice CPR on an adult victim with realistic scenarios', 'intermediate'),
  ('Child CPR Scenario', 'Learn specialized CPR techniques for children', 'intermediate'),
  ('Advanced Emergency Response', 'Complex multi-victim scenarios requiring advanced skills', 'advanced');

