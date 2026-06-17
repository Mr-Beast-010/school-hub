
-- Helper: is the signed-in teacher assigned to this class?
CREATE OR REPLACE FUNCTION public.teacher_owns_class(_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.teachers t ON t.id = c.teacher_id
    WHERE c.id = _class_id
      AND t.user_id = auth.uid()
  )
$$;

-- STUDENTS: class-scoped read for teachers
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
CREATE POLICY "Teachers can view students in their classes"
ON public.students
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
);

-- ATTENDANCE: class-scoped manage for teachers
DROP POLICY IF EXISTS "Teachers can manage all attendance" ON public.attendance;
CREATE POLICY "Teachers can manage attendance for their classes"
ON public.attendance
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
);

-- GRADES: scope via exam -> class
DROP POLICY IF EXISTS "Teachers can manage all grades" ON public.grades;
DROP POLICY IF EXISTS "Teachers can view all grades" ON public.grades;
CREATE POLICY "Teachers can view grades for their classes"
ON public.grades
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = grades.exam_id
      AND public.teacher_owns_class(e.class_id)
  )
);
CREATE POLICY "Teachers can manage grades for their classes"
ON public.grades
FOR ALL
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

-- EXAMS: scope manage to owned classes, keep school-wide view
DROP POLICY IF EXISTS "Teachers can manage exams" ON public.exams;
CREATE POLICY "Teachers can view all exams"
ON public.exams
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers can manage exams for their classes"
ON public.exams
FOR ALL
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
)
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND public.teacher_owns_class(class_id)
);

-- CLASSES: teachers view-only, mutations admin-only
DROP POLICY IF EXISTS "Teachers can manage classes" ON public.classes;
