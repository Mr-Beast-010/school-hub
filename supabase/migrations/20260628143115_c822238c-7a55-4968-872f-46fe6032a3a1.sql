-- STUDENTS: restrict teacher SELECT to owned classes
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
CREATE POLICY "Teachers can view students in their classes"
ON public.students
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND class_id IS NOT NULL
  AND public.teacher_owns_class(class_id)
);

-- ATTENDANCE: restrict teacher writes to owned classes
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;
CREATE POLICY "Teachers can manage attendance in their classes"
ON public.attendance
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
);

-- EXAMS: restrict teacher writes to owned classes
DROP POLICY IF EXISTS "Teachers can manage exams" ON public.exams;
CREATE POLICY "Teachers can manage exams in their classes"
ON public.exams
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
);

-- GRADES: restrict teacher SELECT and writes to owned classes (via exam -> class)
DROP POLICY IF EXISTS "Teachers can view all grades" ON public.grades;
CREATE POLICY "Teachers can view grades in their classes"
ON public.grades
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = grades.exam_id
      AND public.teacher_owns_class(e.class_id)
  )
);

DROP POLICY IF EXISTS "Teachers can manage grades" ON public.grades;
CREATE POLICY "Teachers can manage grades in their classes"
ON public.grades
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = grades.exam_id
      AND public.teacher_owns_class(e.class_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = grades.exam_id
      AND public.teacher_owns_class(e.class_id)
  )
);