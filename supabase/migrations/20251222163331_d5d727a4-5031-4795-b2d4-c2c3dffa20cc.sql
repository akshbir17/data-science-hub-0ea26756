-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows viewing basic profile info for leaderboards
CREATE POLICY "Users can view all profiles for leaderboard"
ON public.profiles
FOR SELECT
USING (true);

-- Add unique constraint for daily_quiz_scores to enable proper upsert
ALTER TABLE public.daily_quiz_scores 
ADD CONSTRAINT daily_quiz_scores_unique_user_subject_date 
UNIQUE (user_id, subject_id, quiz_date);