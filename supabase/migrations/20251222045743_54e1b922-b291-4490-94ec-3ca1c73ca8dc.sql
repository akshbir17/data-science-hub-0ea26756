-- Add mobile_number and location columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN mobile_number text,
ADD COLUMN location text;

-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL, -- Array of option strings
  correct_answer integer NOT NULL, -- Index of correct option (0-based)
  explanation text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quiz attempts table to track user scores
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  answers jsonb, -- User's answers
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for quizzes
CREATE POLICY "Anyone can view quizzes"
ON public.quizzes FOR SELECT
USING (true);

CREATE POLICY "Admins can manage quizzes"
ON public.quizzes FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS policies for quiz_questions
CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();