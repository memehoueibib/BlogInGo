/*
  # Blog Application Schema

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - firstname (text)
      - lastname (text)
      - created_at (timestamp)
    - articles
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - content (text)
      - likes (integer)
      - created_at (timestamp)
    - comments
      - id (uuid, primary key)
      - article_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - content (text)
      - created_at (timestamp)
    - favorites
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - article_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  firstname text,
  lastname text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read all profiles"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Articles are viewable by everyone"
    ON public.articles FOR SELECT
    TO authenticated
    USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create articles"
    ON public.articles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own articles"
    ON public.articles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own articles"
    ON public.articles FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    TO authenticated
    USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own favorites"
    ON public.favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage favorites"
    ON public.favorites FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;