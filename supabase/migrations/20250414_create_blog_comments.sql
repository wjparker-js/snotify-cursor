
-- Create a table for blog comments
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on article_id for faster queries
CREATE INDEX IF NOT EXISTS blog_comments_article_id_idx ON public.blog_comments(article_id);

-- Allow anyone to read comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.blog_comments
  FOR SELECT USING (true);

-- Allow anyone to insert comments (no authentication required)
CREATE POLICY "Anyone can create comments" ON public.blog_comments
  FOR INSERT WITH CHECK (true);
