/*
  # Fix login audit RLS policies

  1. Changes
    - Drop existing RLS policies for login_audit table
    - Create new, more permissive policies for login tracking
  
  2. Security
    - Allow authenticated users to insert their own login records
    - Allow users to view their own login history
    - Allow admins to view all login history
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own login records" ON public.login_audit;
DROP POLICY IF EXISTS "Users can view their own login history" ON public.login_audit;
DROP POLICY IF EXISTS "Admin can view all login history" ON public.login_audit;

-- Enable RLS on login_audit table (in case it's not already enabled)
ALTER TABLE public.login_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting login records
-- This policy allows authenticated users to insert records, with more permissive checks
CREATE POLICY "Users can insert their own login records"
ON public.login_audit
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if the user_id matches the authenticated user's ID
  -- OR if the email matches the authenticated user's email
  (auth.uid()::text = user_id::text) OR 
  (auth.jwt() ->> 'email' = email)
);

-- Create policy for viewing own login history
CREATE POLICY "Users can view their own login history"
ON public.login_audit
FOR SELECT
TO authenticated
USING (
  -- Users can see their own login history
  (auth.uid()::text = user_id::text) OR 
  (auth.jwt() ->> 'email' = email)
);

-- Create policy for admin access
CREATE POLICY "Admin can view all login history"
ON public.login_audit
FOR SELECT
TO authenticated
USING (
  -- Check if the user's email is in the admin list
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN ('wjparker@outlook.com', 'ghodgett59@gmail.com')
  )
);