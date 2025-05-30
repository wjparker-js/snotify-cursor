
-- Fix the login trigger function to correctly reference user_id field
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login in registered_users
  UPDATE public.registered_users
  SET last_login = now()
  WHERE id = NEW.user_id;
  
  -- We'll handle the login audit from the client side instead
  -- since we can't reliably access all needed fields here
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger as it's causing errors
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;

-- Create a new trigger on auth.sessions
CREATE TRIGGER on_user_login
AFTER INSERT ON auth.sessions
FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();
