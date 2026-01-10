import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subject {
  id: string;
  name: string;
  class_id: string;
  teacher_id: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  max_marks: number;
  created_at: string;
  subjects?: Subject;
}

export interface Grade {
  id: string;
  student_id: string;
  exam_id: string;
  marks_obtained: number;
  grade: string | null;
  remarks: string | null;
  created_at: string;
  students?: { id: string; name: string };
  exams?: Exam;
}

export const useSubjects = (classId?: string) => {
  return useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => {
      let query = supabase.from('subjects').select('*');
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Subject[];
    },
  });
};

export const useAddSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subject: { name: string; class_id: string; teacher_id?: string | null }) => {
      const { data, error } = await supabase.from('subjects').insert(subject).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject Added', description: 'Subject has been created.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useExams = (classId?: string) => {
  return useQuery({
    queryKey: ['exams', classId],
    queryFn: async () => {
      let query = supabase.from('exams').select(`*, subjects (*)`);
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query.order('exam_date', { ascending: false });
      if (error) throw error;
      return data as Exam[];
    },
  });
};

export const useAddExam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exam: {
      name: string;
      class_id: string;
      subject_id: string;
      exam_date: string;
      max_marks: number;
    }) => {
      const { data, error } = await supabase.from('exams').insert(exam).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam Created', description: 'Exam has been scheduled.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useGrades = (examId?: string) => {
  return useQuery({
    queryKey: ['grades', examId],
    queryFn: async () => {
      let query = supabase.from('grades').select(`*, students (id, name), exams (*, subjects (*))`);
      if (examId) {
        query = query.eq('exam_id', examId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!examId,
  });
};

export const useStudentGrades = (studentId: string) => {
  return useQuery({
    queryKey: ['grades', 'student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select(`*, exams (*, subjects (*))`)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!studentId,
  });
};

export const useSaveGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (grade: {
      student_id: string;
      exam_id: string;
      marks_obtained: number;
      grade?: string;
      remarks?: string;
    }) => {
      const { data, error } = await supabase
        .from('grades')
        .upsert(grade, { onConflict: 'student_id,exam_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Grade Saved', description: 'Grade has been recorded.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useBulkSaveGrades = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      grades: Array<{
        student_id: string;
        exam_id: string;
        marks_obtained: number;
        grade?: string;
        remarks?: string;
      }>
    ) => {
      const { data, error } = await supabase
        .from('grades')
        .upsert(grades, { onConflict: 'student_id,exam_id' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Grades Saved', description: 'All grades have been recorded.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
