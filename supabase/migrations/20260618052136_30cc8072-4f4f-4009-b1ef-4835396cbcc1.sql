-- STUDENTS: teachers view all
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;
CREATE POLICY "Teachers can view all students"
ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

-- ATTENDANCE: teachers manage all
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON public.attendance;
CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- GRADES: teachers view + manage all
DROP POLICY IF EXISTS "Teachers can view grades for their classes" ON public.grades;
DROP POLICY IF EXISTS "Teachers can manage grades for their classes" ON public.grades;
CREATE POLICY "Teachers can view all grades"
ON public.grades FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers can manage grades"
ON public.grades FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- EXAMS: teachers can manage all (already view all). Replace class-scoped manage.
DROP POLICY IF EXISTS "Teachers can manage exams for their classes" ON public.exams;
CREATE POLICY "Teachers can manage exams"
ON public.exams FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));