-- Fix 1: Teachers table - restrict PII access to own profile or admins
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;

CREATE POLICY "Teachers can view own profile"
ON public.teachers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all teachers"
ON public.teachers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Students table - restrict access to admins and teachers assigned to the student's class
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view students in their classes"
ON public.students
FOR SELECT
USING (
  public.has_role(auth.uid(), 'teacher') AND (
    -- Teacher can see students in classes they teach
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
    OR
    -- Teacher can see students in classes where they teach a subject
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.teachers t ON t.id = s.teacher_id
      WHERE s.class_id = students.class_id AND t.user_id = auth.uid()
    )
  )
);

-- Fix 3: Grades table - restrict access to admins and teachers assigned to the student's class
DROP POLICY IF EXISTS "Authenticated users can view grades" ON public.grades;

CREATE POLICY "Admins can view all grades"
ON public.grades
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view grades for students in their classes"
ON public.grades
FOR SELECT
USING (
  public.has_role(auth.uid(), 'teacher') AND (
    EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE st.id = grades.student_id AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.subjects s ON s.class_id = st.class_id
      JOIN public.teachers t ON t.id = s.teacher_id
      WHERE st.id = grades.student_id AND t.user_id = auth.uid()
    )
  )
);