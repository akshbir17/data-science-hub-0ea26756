-- Create daily quiz scores table
CREATE TABLE public.daily_quiz_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 5,
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id, quiz_date)
);

-- Enable RLS
ALTER TABLE public.daily_quiz_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view scores (for leaderboard)
CREATE POLICY "Anyone can view daily quiz scores"
ON public.daily_quiz_scores
FOR SELECT
USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert their own scores"
ON public.daily_quiz_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster leaderboard queries
CREATE INDEX idx_daily_quiz_scores_subject_date ON public.daily_quiz_scores(subject_id, quiz_date);
CREATE INDEX idx_daily_quiz_scores_user ON public.daily_quiz_scores(user_id);