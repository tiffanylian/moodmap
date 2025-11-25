-- ============================================
-- MoodMap Database Schema for Supabase
-- ============================================
-- This script sets up the complete database schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Enum for moods
-- ============================================
CREATE TYPE public.mood_label AS ENUM (
  'Hyped',
  'Vibing',
  'Mid',
  'Stressed',
  'Tired'
);

-- ============================================
-- 2. Users table (linked to auth.users)
--    Anonymous in UI; just store id + email
-- ============================================
CREATE TABLE public.users (
  id    UUID PRIMARY KEY,          -- should match auth.users.id
  email TEXT UNIQUE NOT NULL
);

-- Optional: index on email (Supabase usually does this automatically with UNIQUE)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- ============================================
-- 3. Mood pins table
--    Anonymous pins with timestamp for rate limit
-- ============================================
CREATE TABLE public.mood_pins (
  id        BIGSERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood      public.mood_label NOT NULL,
  note      TEXT,                          -- short free-text (e.g., up to 200 chars)
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for map + time queries
CREATE INDEX IF NOT EXISTS idx_mood_pins_user_date
  ON public.mood_pins (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_mood_pins_lat_lng
  ON public.mood_pins (latitude, longitude);

-- ============================================
-- 4. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_pins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS policies: users table
--    Each auth user can insert/select/update only their own row
-- ============================================

-- Allow a user to create their own profile row
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Allow a user to view their own profile row
CREATE POLICY "Users can select their own profile"
ON public.users
FOR SELECT
USING ( auth.uid() = id );

-- Allow a user to update their own profile row (if needed)
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- ============================================
-- 6. RLS policies: mood_pins table
-- ============================================

-- a) Anyone authenticated can see pins (anonymous in UI)
CREATE POLICY "Authenticated users can read all mood pins"
ON public.mood_pins
FOR SELECT
USING ( auth.uid() IS NOT NULL );

-- b) Limit inserts to 5 pins per user per day
CREATE POLICY "Limit to 5 pins per user per day"
ON public.mood_pins
FOR INSERT
WITH CHECK (
  -- pin must belong to current user
  user_id = auth.uid()
  AND (
    SELECT count(*)
    FROM public.mood_pins
    WHERE user_id = auth.uid()
      AND created_at::date = current_date
  ) < 5
);

-- c) Allow users to delete their own pins (optional)
CREATE POLICY "Users can delete their own mood pins"
ON public.mood_pins
FOR DELETE
USING ( user_id = auth.uid() );
