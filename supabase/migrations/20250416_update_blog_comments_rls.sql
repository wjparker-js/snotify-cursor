
-- Update the blog_comments table with RLS policies
-- First ensure RLS is enabled
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Update the policies for blog_comments
-- Anyone can view comments
CREATE OR REPLACE POLICY "Anyone can view blog comments" 
ON public.blog_comments FOR SELECT USING (true);

-- Anyone can create comments
CREATE OR REPLACE POLICY "Anyone can create blog comments" 
ON public.blog_comments FOR INSERT WITH CHECK (true);
