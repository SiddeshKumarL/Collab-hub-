-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');

-- Create enum for skill proficiency
CREATE TYPE public.skill_proficiency AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER');

-- Create enum for skill relationship type
CREATE TYPE public.skill_type AS ENUM ('TEACH', 'LEARN');

-- Create enum for team member status
CREATE TYPE public.team_member_status AS ENUM ('PENDING', 'MEMBER', 'REJECTED');

-- Create enum for skill difficulty
CREATE TYPE public.skill_difficulty AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  difficulty skill_difficulty NOT NULL,
  mindmap_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  link TEXT NOT NULL,
  estimated_hours INTEGER,
  has_certificate BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table (tracks what users teach/learn)
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  skill_type skill_type NOT NULL,
  proficiency skill_proficiency NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id, skill_type)
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 5,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_roles table
CREATE TABLE public.team_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT NOT NULL,
  required_count INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT NOT NULL,
  pitch TEXT,
  status team_member_status DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  external_link TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor_follows table
CREATE TABLE public.mentor_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, mentor_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles viewable by everyone" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for skills
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);

-- RLS Policies for courses
CREATE POLICY "Courses viewable by everyone" ON public.courses FOR SELECT USING (true);

-- RLS Policies for user_skills
CREATE POLICY "User skills viewable by everyone" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Teams viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Team owners can update teams" ON public.teams FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Team owners can delete teams" ON public.teams FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for team_roles
CREATE POLICY "Team roles viewable by everyone" ON public.team_roles FOR SELECT USING (true);
CREATE POLICY "Team owners can manage roles" ON public.team_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);

-- RLS Policies for team_members
CREATE POLICY "Team members viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Users can apply to teams" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Team owners can manage applications" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);

-- RLS Policies for events
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_follows
CREATE POLICY "Follows viewable by everyone" ON public.mentor_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow mentors" ON public.mentor_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow mentors" ON public.mentor_follows FOR DELETE USING (auth.uid() = follower_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Assign default STUDENT role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'STUDENT');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data: Skills
INSERT INTO public.skills (name, description, difficulty) VALUES
  ('React.js', 'Modern JavaScript library for building user interfaces', 'INTERMEDIATE'),
  ('Node.js', 'JavaScript runtime for server-side development', 'INTERMEDIATE'),
  ('Python', 'Versatile programming language for web, data science, and more', 'BEGINNER'),
  ('Machine Learning', 'AI techniques for pattern recognition and prediction', 'ADVANCED'),
  ('PostgreSQL', 'Advanced open-source relational database', 'INTERMEDIATE'),
  ('UI/UX Design', 'User interface and experience design principles', 'BEGINNER'),
  ('Data Structures', 'Fundamental computer science concepts', 'INTERMEDIATE'),
  ('Cloud Computing', 'AWS, Azure, GCP deployment and management', 'ADVANCED'),
  ('Mobile Development', 'iOS and Android app development', 'INTERMEDIATE'),
  ('Blockchain', 'Decentralized technology and smart contracts', 'EXPERT');

-- Seed data: Courses
INSERT INTO public.courses (skill_id, title, platform, link, estimated_hours, has_certificate, description) 
SELECT 
  s.id,
  'Complete ' || s.name || ' Bootcamp',
  CASE 
    WHEN s.difficulty = 'BEGINNER' THEN 'Udemy'
    WHEN s.difficulty = 'INTERMEDIATE' THEN 'Coursera'
    ELSE 'edX'
  END,
  'https://example.com/' || LOWER(REPLACE(s.name, ' ', '-')),
  CASE s.difficulty
    WHEN 'BEGINNER' THEN 20
    WHEN 'INTERMEDIATE' THEN 40
    WHEN 'ADVANCED' THEN 60
    ELSE 80
  END,
  true,
  'Comprehensive course covering all aspects of ' || s.name
FROM public.skills s
LIMIT 5;

-- Seed data: Events
INSERT INTO public.events (title, description, start_date, end_date, tags) VALUES
  ('HackMIT 2025', 'Annual hackathon at MIT with $100k in prizes', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days', ARRAY['hackathon', 'technology']),
  ('AI Summit 2025', 'Conference on latest AI trends and technologies', NOW() + INTERVAL '45 days', NOW() + INTERVAL '47 days', ARRAY['AI', 'conference', 'networking']);
