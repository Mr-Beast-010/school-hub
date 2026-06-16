-- 1. Allow teachers to read subjects they teach or that belong to classes they teach
CREATE POLICY "Teachers can view subjects for their classes"
ON public.subjects FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = subjects.teacher_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM classes c JOIN teachers t ON t.id = c.teacher_id WHERE c.id = subjects.class_id AND t.user_id = auth.uid())
  )
);

-- 2. Defense-in-depth: prevent users from changing their own role via the profiles update policy.
-- Authoritative role lives in user_roles; this function reads it bypassing RLS safely.
CREATE OR REPLACE FUNCTION public.current_user_authoritative_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = public.current_user_authoritative_role()
);