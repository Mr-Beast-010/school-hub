import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by: string | null;
  created_at: string;
  students?: {
    id: string;
    name: string;
  };
}

export const useAttendance = (classId?: string, date?: string) => {
  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          students (id, name)
        `);

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!classId,
  });
};

export const useAttendanceForMonth = (classId: string, year: number, month: number) => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  return useQuery({
    queryKey: ['attendance', classId, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!classId,
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      student_id,
      class_id,
      date,
      status,
    }: {
      student_id: string;
      class_id: string;
      date: string;
      status: 'present' | 'absent' | 'late';
    }) => {
      // Upsert to handle both insert and update
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          {
            student_id,
            class_id,
            date,
            status,
            marked_by: user?.id,
          },
          {
            onConflict: 'student_id,date',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
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

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      records: Array<{
        student_id: string;
        class_id: string;
        date: string;
        status: 'present' | 'absent' | 'late';
      }>
    ) => {
      const recordsWithMarkedBy = records.map((r) => ({
        ...r,
        marked_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('attendance')
        .upsert(recordsWithMarkedBy, { onConflict: 'student_id,date' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Attendance Saved',
        description: 'Attendance has been recorded successfully.',
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
