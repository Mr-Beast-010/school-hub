
-- STUDENTS: replace class-scoped teacher policies with school-wide view
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;

CREATE POLICY "Teachers can view all students"
ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

-- GRADES: replace class-scoped teacher policies with school-wide view + manage
DROP POLICY IF EXISTS "Teachers can manage grades for their classes" ON public.grades;
DROP POLICY IF EXISTS "Teachers can view grades for their classes" ON public.grades;

CREATE POLICY "Teachers can view all grades"
ON public.grades FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can manage all grades"
ON public.grades FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- ATTENDANCE: replace class-scoped teacher policy with school-wide manage
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON public.attendance;

CREATE POLICY "Teachers can manage all attendance"
ON public.attendance FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- CLASSES: ensure teachers can view all classes (manage policy may already exist)
DROP POLICY IF EXISTS "Teachers can view classes" ON public.classes;
CREATE POLICY "Teachers can view all classes"
ON public.classes FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

-- TEACHERS: keep PII protected — teachers only see their own record (no change needed)
