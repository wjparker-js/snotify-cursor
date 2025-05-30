
-- Function to get comments for a specific article
CREATE OR REPLACE FUNCTION public.get_comments_for_article(article_id_param UUID)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', bc.id,
    'article_id', bc.article_id,
    'user_name', bc.user_name,
    'content', bc.content,
    'created_at', bc.created_at
  )
  FROM public.blog_comments bc
  WHERE bc.article_id = article_id_param
  ORDER BY bc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a comment
CREATE OR REPLACE FUNCTION public.add_blog_comment(
  article_id_param UUID,
  user_name_param TEXT,
  content_param TEXT
)
RETURNS json AS $$
DECLARE
  new_comment_id UUID;
  result json;
BEGIN
  -- Insert the comment
  INSERT INTO public.blog_comments (article_id, user_name, content)
  VALUES (article_id_param, user_name_param, content_param)
  RETURNING id INTO new_comment_id;
  
  -- Return the newly created comment
  SELECT json_build_object(
    'id', bc.id,
    'article_id', bc.article_id,
    'user_name', bc.user_name,
    'content', bc.content,
    'created_at', bc.created_at
  ) INTO result
  FROM public.blog_comments bc
  WHERE bc.id = new_comment_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
