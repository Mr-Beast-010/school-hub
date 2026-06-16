
-- FINDING 1: restrict teacher access to students/attendance/grades to their assigned classes

-- STUDENTS
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;

CREATE POLICY "Teachers can view students in their classes"
  ON public.students FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage students in their classes"
  ON public.students FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
  );

-- ATTENDANCE
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;

CREATE POLICY "Teachers can manage attendance for their classes"
  ON public.attendance FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = attendance.class_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = attendance.class_id AND t.user_id = auth.uid()
    )
  );

-- GRADES
DROP POLICY IF EXISTS "Teachers can view all grades" ON public.grades;
DROP POLICY IF EXISTS "Teachers can manage grades" ON public.grades;

CREATE POLICY "Teachers can view grades for their classes"
  ON public.grades FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE st.id = grades.student_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage grades for their classes"
  ON public.grades FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE st.id = grades.student_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.classes c ON c.id = st.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE st.id = grades.student_id AND t.user_id = auth.uid()
    )
  );

-- FINDING 2: teachers can no longer read other teachers' PII
DROP POLICY IF EXISTS "Teachers can view all teachers" ON public.teachers;

CREATE POLICY "Teachers can view own profile"
  ON public.teachers FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND user_id = auth.uid()
  );
