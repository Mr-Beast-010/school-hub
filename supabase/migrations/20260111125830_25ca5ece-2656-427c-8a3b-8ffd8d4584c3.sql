-- Create a unique index on roll_number per class
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_roll_number_class ON public.students(class_id, roll_number) WHERE roll_number IS NOT NULL;

-- Update handle_new_user to accept role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  signup_role app_role;
BEGIN
  -- Get role from user metadata, default to 'teacher' if not specified
  signup_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'teacher'
  );
  
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), signup_role);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, signup_role);
  
  RETURN NEW;
END;
$function$;

-- Attendance: Students can view their own attendance
CREATE POLICY "Students can view own attendance"
ON public.attendance
FOR SELECT
USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = attendance.student_id 
    AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Grades: Students can view their own grades
CREATE POLICY "Students can view own grades"
ON public.grades
FOR SELECT
USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = grades.student_id 
    AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Students: Students can view their own record
CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
USING (
  public.has_role(auth.uid(), 'student') AND
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Classes: Students can view classes
CREATE POLICY "Students can view classes"
ON public.classes
FOR SELECT
USING (public.has_role(auth.uid(), 'student'));

-- Subjects: Students can view subjects
CREATE POLICY "Students can view subjects"
ON public.subjects
FOR SELECT
USING (public.has_role(auth.uid(), 'student'));

-- Exams: Students can view exams
CREATE POLICY "Students can view exams"
ON public.exams
FOR SELECT
USING (public.has_role(auth.uid(), 'student'));

-- Teachers: Students can view basic teacher info
CREATE POLICY "Students can view teachers"
ON public.teachers
FOR SELECT
USING (public.has_role(auth.uid(), 'student'));