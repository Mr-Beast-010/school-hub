import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Class {
  id: string;
  name: string;
  section: string;
  teacher_id: string | null;
  created_at: string;
  student_count?: number;
}

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Class[];
    },
  });
};

export const useClassesWithStudentCount = () => {
  return useQuery({
    queryKey: ['classes', 'with-count'],
    queryFn: async () => {
      const { data: classes, error: classError } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (classError) throw classError;

      // Get student counts for each class
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('class_id');

      if (studentError) throw studentError;

      const countMap = students.reduce((acc, s) => {
        if (s.class_id) {
          acc[s.class_id] = (acc[s.class_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return classes.map((c) => ({
        ...c,
        student_count: countMap[c.id] || 0,
      })) as Class[];
    },
  });
};

export const useAddClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classData: { name: string; section: string; teacher_id?: string | null }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Class Added',
        description: `${data.name} - ${data.section} has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Class Deleted',
        description: 'Class has been removed.',
        variant: 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
