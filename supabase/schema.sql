-- UBT BASE Database Schema
-- Run this in Supabase SQL Editor

-- Users table (synced from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'informatics')),
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer INTEGER NOT NULL CHECK (answer >= 0 AND answer <= 3),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tests table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'informatics')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL CHECK (selected_answer >= 0 AND selected_answer <= 3),
  correct BOOLEAN NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_test_id ON public.answers(test_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Random questions helper
CREATE OR REPLACE FUNCTION public.get_random_questions(p_subject TEXT, p_limit INT)
RETURNS SETOF public.questions AS $$
  SELECT * FROM public.questions
  WHERE subject = p_subject
  ORDER BY random()
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Questions policies (all authenticated users can read)
CREATE POLICY "Authenticated users can read questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Tests policies
CREATE POLICY "Users can read own tests"
  ON public.tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests"
  ON public.tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Users can read own answers"
  ON public.answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests
      WHERE tests.id = answers.test_id AND tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers"
  ON public.answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests
      WHERE tests.id = answers.test_id AND tests.user_id = auth.uid()
    )
  );
