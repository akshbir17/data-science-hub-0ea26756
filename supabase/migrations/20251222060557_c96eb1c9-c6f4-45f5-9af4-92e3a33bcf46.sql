-- Add email column to profiles table for password recovery
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;