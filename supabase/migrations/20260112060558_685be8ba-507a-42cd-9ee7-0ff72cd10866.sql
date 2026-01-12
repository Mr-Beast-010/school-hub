-- Create a security definer function to get current user's email safely
CREATE OR REPLACE FUNCTION public.auth_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Drop the problematic policies that directly query auth.users
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can view own grades" ON public.grades;

-- Recreate policies using the security definer function
CREATE POLICY "Students can view own record" 
ON public.students 
FOR SELECT 
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND email = public.auth_user_email()
);

CREATE POLICY "Students can view own attendance" 
ON public.attendance 
FOR SELECT 
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = attendance.student_id 
    AND s.email = public.auth_user_email()
  )
);

CREATE POLICY "Students can view own grades" 
ON public.grades 
FOR SELECT 
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = grades.student_id 
    AND s.email = public.auth_user_email()
  )
);