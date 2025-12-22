-- Create streaks table for tracking consecutive day completions
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'quiz', 'sudoku', 'zip', 'queens'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_type)
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own streaks
CREATE POLICY "Users can view their own streaks"
ON public.user_streaks
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own streaks
CREATE POLICY "Users can insert their own streaks"
ON public.user_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own streaks
CREATE POLICY "Users can update their own streaks"
ON public.user_streaks
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);