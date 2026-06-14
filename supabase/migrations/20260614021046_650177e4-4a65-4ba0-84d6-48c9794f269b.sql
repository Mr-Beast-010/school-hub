-- Tighten classes access: drop permissive "true" policy, allow teachers to view
DROP POLICY IF EXISTS "Authenticated users can view classes" ON public.classes;

CREATE POLICY "Teachers can view classes"
ON public.classes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Input validation constraints: students
ALTER TABLE public.students ADD CONSTRAINT check_name_length CHECK (length(name) >= 1 AND length(name) <= 100);
ALTER TABLE public.students ADD CONSTRAINT check_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE public.students ADD CONSTRAINT check_parent_phone_format CHECK (parent_phone IS NULL OR parent_phone ~* '^[+]?[0-9 ()-]{7,20}$');
ALTER TABLE public.students ADD CONSTRAINT check_parent_name_length CHECK (parent_name IS NULL OR length(parent_name) <= 100);
ALTER TABLE public.students ADD CONSTRAINT check_address_length CHECK (address IS NULL OR length(address) <= 500);
ALTER TABLE public.students ADD CONSTRAINT check_roll_number_length CHECK (roll_number IS NULL OR length(roll_number) <= 20);

-- Input validation constraints: teachers
ALTER TABLE public.teachers ADD CONSTRAINT check_teacher_name_length CHECK (length(name) >= 1 AND length(name) <= 100);
ALTER TABLE public.teachers ADD CONSTRAINT check_teacher_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE public.teachers ADD CONSTRAINT check_teacher_phone_format CHECK (phone IS NULL OR phone ~* '^[+]?[0-9 ()-]{7,20}$');

-- Grades: marks cannot be negative
ALTER TABLE public.grades ADD CONSTRAINT check_marks_valid CHECK (marks_obtained >= 0);
