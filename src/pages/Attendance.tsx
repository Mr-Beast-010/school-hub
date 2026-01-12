import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Clock, Save, Users, UserCheck, UserX } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAttendanceForMonth, useBulkMarkAttendance, Attendance } from '@/hooks/useAttendance';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const Attendance_Page = () => {
  const { canEdit } = useAuth();
  const canEditAttendance = canEdit('attendance');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const { data: attendanceData } = useAttendanceForMonth(
    selectedClassId,
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const bulkMarkAttendance = useBulkMarkAttendance();

  // Sort students by roll number
  const classStudents = useMemo(() => {
    const filtered = students?.filter((s) => s.class_id === selectedClassId) || [];
    return filtered.sort((a, b) => {
      const rollA = a.roll_number || '';
      const rollB = b.roll_number || '';
      // Try numeric comparison first
      const numA = parseInt(rollA, 10);
      const numB = parseInt(rollB, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return rollA.localeCompare(rollB);
    });
  }, [students, selectedClassId]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get attendance for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const attendanceForDate = useMemo(() => {
    if (!attendanceData) return {};
    return attendanceData
      .filter((a) => a.date === selectedDateStr)
      .reduce((acc, a) => {
        acc[a.student_id] = a.status as 'present' | 'absent' | 'late';
        return acc;
      }, {} as Record<string, 'present' | 'absent' | 'late'>);
  }, [attendanceData, selectedDateStr]);

  // Merge with local state
  const currentAttendance = useMemo(() => {
    return { ...attendanceForDate, ...attendanceState };
  }, [attendanceForDate, attendanceState]);

  // Today's attendance stats
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayStats = useMemo(() => {
    if (!attendanceData) return { present: 0, absent: 0, late: 0 };
    const todayRecords = attendanceData.filter((a) => a.date === todayStr);
    return {
      present: todayRecords.filter((a) => a.status === 'present').length,
      absent: todayRecords.filter((a) => a.status === 'absent').length,
      late: todayRecords.filter((a) => a.status === 'late').length,
    };
  }, [attendanceData, todayStr]);

  // This month's attendance stats
  const monthStats = useMemo(() => {
    if (!attendanceData) return { present: 0, absent: 0, late: 0 };
    return {
      present: attendanceData.filter((a) => a.status === 'present').length,
      absent: attendanceData.filter((a) => a.status === 'absent').length,
      late: attendanceData.filter((a) => a.status === 'late').length,
    };
  }, [attendanceData]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setAttendanceState({}); // Reset local state when changing date
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(currentAttendance).map(([student_id, status]) => ({
      student_id,
      class_id: selectedClassId,
      date: selectedDateStr,
      status,
    }));

    if (records.length > 0) {
      bulkMarkAttendance.mutate(records);
      setAttendanceState({});
    }
  };

  const getAttendanceCountForDay = (date: Date) => {
    if (!attendanceData) return { present: 0, total: 0 };
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAttendance = attendanceData.filter((a) => a.date === dateStr);
    const present = dayAttendance.filter((a) => a.status === 'present').length;
    return { present, total: dayAttendance.length };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">Mark and track daily attendance</p>
          </div>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedClassId ? (
          <div className="form-card text-center py-12">
            <p className="text-muted-foreground">Please select a class to view and mark attendance.</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 animate-fade-in">
              {/* Today Stats */}
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today Present</p>
                      <p className="text-2xl font-bold text-success">{todayStats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today Absent</p>
                      <p className="text-2xl font-bold text-destructive">{todayStats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today Late</p>
                      <p className="text-2xl font-bold text-warning">{todayStats.late}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Month Stats */}
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Month Present</p>
                      <p className="text-2xl font-bold text-success">{monthStats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Month Absent</p>
                      <p className="text-2xl font-bold text-destructive">{monthStats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Month Late</p>
                      <p className="text-2xl font-bold text-warning">{monthStats.late}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="form-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="py-2 text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {monthDays.map((day) => {
                  const { present, total } = getAttendanceCountForDay(day);
                  const hasData = total > 0;
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        'p-2 rounded-lg text-sm transition-all relative',
                        isToday(day) && 'ring-2 ring-primary',
                        isSelected && 'bg-primary text-primary-foreground',
                        !isSelected && 'hover:bg-muted',
                        !isSameMonth(day, currentDate) && 'opacity-50'
                      )}
                    >
                      {format(day, 'd')}
                      {hasData && !isSelected && (
                        <div
                          className={cn(
                            'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                            present === total ? 'bg-success' : present > 0 ? 'bg-warning' : 'bg-destructive'
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance List */}
            <div className="lg:col-span-2 form-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Attendance for {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {classStudents.length} students in this class
                  </p>
                </div>
                {canEditAttendance && (
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={Object.keys(attendanceState).length === 0 || bulkMarkAttendance.isPending}
                    className="gradient-primary text-primary-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {bulkMarkAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                  </Button>
                )}
              </div>

              {classStudents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No students enrolled in this class.
                </p>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student) => {
                    const status = currentAttendance[student.id];

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {student.roll_number || student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {student.roll_number && <span className="text-muted-foreground mr-2">#{student.roll_number}</span>}
                              {student.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>

                        {canEditAttendance ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={status === 'present' ? 'default' : 'outline'}
                              className={cn(
                                status === 'present' && 'bg-success hover:bg-success/90 text-white'
                              )}
                              onClick={() => handleStatusChange(student.id, 'present')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'late' ? 'default' : 'outline'}
                              className={cn(
                                status === 'late' && 'bg-warning hover:bg-warning/90 text-white'
                              )}
                              onClick={() => handleStatusChange(student.id, 'late')}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'absent' ? 'default' : 'outline'}
                              className={cn(
                                status === 'absent' && 'bg-destructive hover:bg-destructive/90 text-white'
                              )}
                              onClick={() => handleStatusChange(student.id, 'absent')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            status === 'present' && 'bg-success/20 text-success',
                            status === 'late' && 'bg-warning/20 text-warning',
                            status === 'absent' && 'bg-destructive/20 text-destructive',
                            !status && 'bg-muted text-muted-foreground'
                          )}>
                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not marked'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance_Page;
