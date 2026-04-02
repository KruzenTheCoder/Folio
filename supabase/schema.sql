-- Drop existing triggers and functions if they exist to allow clean recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_resumes_updated_at ON public.resumes;
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at();

-- Drop existing tables to allow clean recreation (Cascade handles dependencies)
DROP TABLE IF EXISTS public.ats_telemetry CASCADE;
DROP TABLE IF EXISTS public.resume_versions CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.global_stats CASCADE;

-- Drop existing Enums if they exist
DROP TYPE IF EXISTS public.user_plan CASCADE;

-- Create Enums
CREATE TYPE public.user_plan AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- Create Users Table (extends Supabase Auth)
-- Note: Passwords, MFA, email verification, and OAuth identities are handled natively by Supabase in the auth schema.
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  plan public.user_plan DEFAULT 'FREE'::public.user_plan,
  resumes_generated INTEGER DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Resumes Table
CREATE TABLE public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  pdf_url TEXT,
  template TEXT NOT NULL,
  intent JSONB,
  ats_score INTEGER,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  views INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.resumes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Resume Versions Table for History
CREATE TABLE public.resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Global Stats Table
CREATE TABLE public.global_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_resumes INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  avg_ats_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ATS Telemetry Table (For analytics and model training)
CREATE TABLE public.ats_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_title TEXT,
  industry TEXT,
  original_score INTEGER,
  new_score INTEGER,
  ai_analysis JSONB,
  improvements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_telemetry ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Users
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS Policies for Resumes
CREATE POLICY "Users can view their own resumes" 
  ON public.resumes FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own resumes" 
  ON public.resumes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
  ON public.resumes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
  ON public.resumes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS Policies for Resume Versions
CREATE POLICY "Users can view their own resume versions" 
  ON public.resume_versions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.resumes r 
    WHERE r.id = resume_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own resume versions" 
  ON public.resume_versions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.resumes r 
    WHERE r.id = resume_id AND r.user_id = auth.uid()
  ));

-- Create RLS Policies for Global Stats
CREATE POLICY "Anyone can view global stats" 
  ON public.global_stats FOR SELECT 
  TO authenticated, anon 
  USING (true);

-- Create RLS Policies for ATS Telemetry
CREATE POLICY "Users can view their own telemetry"
  ON public.ats_telemetry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert telemetry"
  ON public.ats_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create Trigger to sync new Supabase Auth users to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Update global stats on new user
  UPDATE public.global_stats 
  SET total_users = total_users + 1;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Insert initial global stats row if not exists
INSERT INTO public.global_stats (id, total_resumes, total_users)
SELECT gen_random_uuid(), 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.global_stats);
