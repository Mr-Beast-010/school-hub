-- PROFILES: prevent role self-assignment on insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = current_user_authoritative_role()
);

-- STUDENTS: restrict student view of classes to their own class
DROP POLICY IF EXISTS "Students can view classes" ON public.classes;
CREATE POLICY "Students can view their own class"
ON public.classes
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'student'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.email = auth_user_email()
      AND s.class_id = classes.id
  )
);

-- EXAMS: restrict student view of exams to their own class
DROP POLICY IF EXISTS "Students can view exams" ON public.exams;
CREATE POLICY "Students can view exams for their class"
ON public.exams
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'student'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.email = auth_user_email()
      AND s.class_id = exams.class_id
  )
);