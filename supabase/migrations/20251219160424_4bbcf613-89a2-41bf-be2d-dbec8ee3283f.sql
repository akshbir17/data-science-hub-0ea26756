-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Create enum for semesters
CREATE TYPE public.semester AS ENUM ('3rd', '4th');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  usn TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  semester semester NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create resources table for study materials
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subjects (everyone can view)
CREATE POLICY "Anyone can view subjects" 
  ON public.subjects FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects" 
  ON public.subjects FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for resources
CREATE POLICY "Anyone can view resources" 
  ON public.resources FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage resources" 
  ON public.resources FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true);

-- Storage policies
CREATE POLICY "Anyone can view resource files" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resource files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resource files" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

-- Insert default subjects for 3rd semester
INSERT INTO public.subjects (name, code, semester, description, icon) VALUES
  ('Mathematics', 'MATH301', '3rd', 'Advanced mathematical concepts and applications', 'Calculator'),
  ('Digital Design & Computer Organization', 'DDCO301', '3rd', 'Digital logic design and computer architecture', 'Cpu'),
  ('Data Structures and Algorithms', 'DSA301', '3rd', 'Fundamental data structures and algorithm design', 'Code'),
  ('R-Language', 'RLANG301', '3rd', 'Statistical computing and data analysis with R', 'BarChart'),
  ('Operating Systems', 'OS301', '3rd', 'Operating system concepts and design', 'Monitor');

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, usn)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'usn'
  );
  
  -- Assign role based on metadata (default to student)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();