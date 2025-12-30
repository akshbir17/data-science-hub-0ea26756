-- Create announcements table for admin messages
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view announcements
CREATE POLICY "Anyone can view announcements" 
ON public.announcements 
FOR SELECT 
USING (true);

-- Only admins can manage announcements
CREATE POLICY "Admins can manage announcements" 
ON public.announcements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));