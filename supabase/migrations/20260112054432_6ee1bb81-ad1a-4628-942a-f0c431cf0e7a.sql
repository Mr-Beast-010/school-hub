-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;

-- Create restricted policy that only allows teachers to manage students in their classes
CREATE POLICY "Teachers can manage students in their classes"
ON public.students
FOR ALL
USING (
  public.has_role(auth.uid(), 'teacher') AND (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.teachers t ON t.id = s.teacher_id
      WHERE s.class_id = students.class_id AND t.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher') AND (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = students.class_id AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.teachers t ON t.id = s.teacher_id
      WHERE s.class_id = students.class_id AND t.user_id = auth.uid()
    )
  )
);