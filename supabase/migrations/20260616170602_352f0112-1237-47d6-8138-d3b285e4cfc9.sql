
-- STUDENTS: replace narrow class-scoped teacher policies with school-wide read + manage
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.students;

CREATE POLICY "Teachers can view all students"
  ON public.students FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can manage students"
  ON public.students FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- CLASSES: allow teachers to create/edit/delete and view all
DROP POLICY IF EXISTS "Teachers can view classes" ON public.classes;

CREATE POLICY "Teachers can manage classes"
  ON public.classes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- SUBJECTS: school-wide read for teachers
DROP POLICY IF EXISTS "Teachers can view subjects for their classes" ON public.subjects;

CREATE POLICY "Teachers can view all subjects"
  ON public.subjects FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- TEACHERS: school-wide read for teachers (so they can see staff details updated by admin)
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;

CREATE POLICY "Teachers can view all teachers"
  ON public.teachers FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- GRADES: school-wide read + manage for teachers
DROP POLICY IF EXISTS "Teachers can view grades for students in their classes" ON public.grades;
DROP POLICY IF EXISTS "Teachers can insert grades for their classes" ON public.grades;
DROP POLICY IF EXISTS "Teachers can update grades for their classes" ON public.grades;
DROP POLICY IF EXISTS "Teachers can delete grades for their classes" ON public.grades;

CREATE POLICY "Teachers can view all grades"
  ON public.grades FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can manage grades"
  ON public.grades FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- ATTENDANCE: ensure teachers can read & manage (existing ALL policy already covers, recreate cleanly)
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;

CREATE POLICY "Teachers can manage attendance"
  ON public.attendance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));
