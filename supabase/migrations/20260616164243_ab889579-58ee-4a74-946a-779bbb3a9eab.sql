-- 1. Remove overly broad USING(true) policies
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated users can view exams" ON public.exams;
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.subjects;

-- 2. Replace unscoped "Teachers can manage grades" ALL policy with class-scoped write policies
DROP POLICY IF EXISTS "Teachers can manage grades" ON public.grades;

CREATE POLICY "Teachers can insert grades for their classes"
ON public.grades FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    EXISTS (SELECT 1 FROM students st JOIN classes c ON c.id = st.class_id JOIN teachers t ON t.id = c.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM students st JOIN subjects s ON s.class_id = st.class_id JOIN teachers t ON t.id = s.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
  )
);

CREATE POLICY "Teachers can update grades for their classes"
ON public.grades FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    EXISTS (SELECT 1 FROM students st JOIN classes c ON c.id = st.class_id JOIN teachers t ON t.id = c.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM students st JOIN subjects s ON s.class_id = st.class_id JOIN teachers t ON t.id = s.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    EXISTS (SELECT 1 FROM students st JOIN classes c ON c.id = st.class_id JOIN teachers t ON t.id = c.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM students st JOIN subjects s ON s.class_id = st.class_id JOIN teachers t ON t.id = s.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
  )
);

CREATE POLICY "Teachers can delete grades for their classes"
ON public.grades FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    EXISTS (SELECT 1 FROM students st JOIN classes c ON c.id = st.class_id JOIN teachers t ON t.id = c.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM students st JOIN subjects s ON s.class_id = st.class_id JOIN teachers t ON t.id = s.teacher_id WHERE st.id = grades.student_id AND t.user_id = auth.uid())
  )
);

-- 3. Prevent users from changing their own role in profiles (privilege escalation)
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_role_change ON public.profiles;
CREATE TRIGGER enforce_profile_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- 4. Restrict student access to teacher PII via a limited view
DROP POLICY IF EXISTS "Students can view teachers" ON public.teachers;

CREATE OR REPLACE VIEW public.teachers_public
WITH (security_invoker = true) AS
SELECT id, name, subject FROM public.teachers;

GRANT SELECT ON public.teachers_public TO authenticated;