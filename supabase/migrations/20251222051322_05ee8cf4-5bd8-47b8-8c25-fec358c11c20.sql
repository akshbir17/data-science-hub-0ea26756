-- Create game_scores table for tracking game completions and leaderboard
CREATE TABLE public.game_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  game_type text NOT NULL, -- 'zip' or 'sudoku'
  puzzle_date date NOT NULL DEFAULT CURRENT_DATE, -- UTC date for daily puzzle
  time_seconds integer NOT NULL, -- time taken in seconds
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_type, puzzle_date) -- one score per game per day per user
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view game scores"
ON public.game_scores FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own scores"
ON public.game_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for leaderboard queries
CREATE INDEX idx_game_scores_leaderboard ON public.game_scores (game_type, puzzle_date, time_seconds ASC);