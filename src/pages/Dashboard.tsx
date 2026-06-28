import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useClasses } from '@/hooks/useClasses';

const Dashboard = () => {
  const { profile, isAdmin } = useAuth();
  const { data: students } = useStudents();
  const { data: teachers } = useTeachers();
  const { data: classes } = useClasses();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome back, {profile?.full_name || 'User'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening at your school today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={students?.length || 0} icon={Users} gradient="primary" subtitle="Enrolled" />
          {isAdmin && (
            <StatCard title="Total Teachers" value={teachers?.length || 0} icon={GraduationCap} gradient="accent" subtitle="Active staff" />
          )}
          <StatCard title="Total Classes" value={classes?.length || 0} icon={BookOpen} gradient="success" subtitle="Sections" />
          <StatCard title="Attendance" value="--" icon={Calendar} gradient="warning" subtitle="Check attendance" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="form-card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold">Recent Students</h2>
              <Link to="/students" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {students?.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">{student.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.classes?.name} - {student.classes?.section}</p>
                  </div>
                </div>
              ))}
              {(!students || students.length === 0) && <p className="text-center py-4 text-muted-foreground">No students yet.</p>}
            </div>
          </div>

          {isAdmin && (
            <div className="form-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-semibold">Teaching Staff</h2>
                <Link to="/teachers" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                {teachers?.slice(0, 5).map((teacher) => (
                  <div key={teacher.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-primary-foreground font-semibold">{teacher.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                    </div>
                  </div>
                ))}
                {(!teachers || teachers.length === 0) && <p className="text-center py-4 text-muted-foreground">No teachers yet.</p>}
              </div>
            </div>
          )}
        </div>


        <div className="form-card animate-fade-in">
          <h2 className="text-lg font-display font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/students" className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all hover:scale-[1.02] group">
              <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Add Student</p><p className="text-sm text-muted-foreground">Enroll new student</p>
            </Link>
            <Link to="/attendance" className="p-4 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all hover:scale-[1.02] group">
              <Calendar className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Attendance</p><p className="text-sm text-muted-foreground">Mark attendance</p>
            </Link>
            <Link to="/grades" className="p-4 rounded-xl bg-success/5 hover:bg-success/10 border border-success/20 transition-all hover:scale-[1.02] group">
              <BookOpen className="w-8 h-8 text-success mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Grades</p><p className="text-sm text-muted-foreground">Enter grades</p>
            </Link>
            <Link to="/classes" className="p-4 rounded-xl bg-warning/5 hover:bg-warning/10 border border-warning/20 transition-all hover:scale-[1.02] group">
              <GraduationCap className="w-8 h-8 text-warning mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Classes</p><p className="text-sm text-muted-foreground">Manage classes</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
