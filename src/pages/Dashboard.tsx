import { Users, GraduationCap, BookOpen, Layers, CalendarCheck, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { dashboardStats, students, teachers } from '@/data/mockData';

const Dashboard = () => {
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your school today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={dashboardStats.totalStudents}
            icon={Users}
            gradient="primary"
            subtitle="Enrolled this year"
          />
          <StatCard
            title="Total Teachers"
            value={dashboardStats.totalTeachers}
            icon={GraduationCap}
            gradient="accent"
            subtitle="Active staff"
          />
          <StatCard
            title="Total Classes"
            value={dashboardStats.totalClasses}
            icon={BookOpen}
            gradient="success"
            subtitle={`${dashboardStats.totalSections} sections`}
          />
          <StatCard
            title="Today's Attendance"
            value={`${dashboardStats.attendanceToday}%`}
            icon={CalendarCheck}
            gradient="warning"
            subtitle="Overall attendance"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="form-card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Recent Students
              </h2>
              <span className="text-sm text-muted-foreground">Last 5 enrolled</span>
            </div>
            <div className="space-y-4">
              {students.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.class} - Section {student.section}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Teachers */}
          <div className="form-card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Teaching Staff
              </h2>
              <span className="text-sm text-muted-foreground">{teachers.length} teachers</span>
            </div>
            <div className="space-y-4">
              {teachers.slice(0, 5).map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.subject} • {teacher.department}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                    {teacher.experience}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="form-card animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/students"
              className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all hover:scale-[1.02] group"
            >
              <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-foreground">Add Student</p>
              <p className="text-sm text-muted-foreground">Enroll new student</p>
            </a>
            <a
              href="/teachers"
              className="p-4 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all hover:scale-[1.02] group"
            >
              <GraduationCap className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-foreground">View Teachers</p>
              <p className="text-sm text-muted-foreground">Manage staff</p>
            </a>
            <a
              href="/classes"
              className="p-4 rounded-xl bg-success/5 hover:bg-success/10 border border-success/20 transition-all hover:scale-[1.02] group"
            >
              <BookOpen className="w-8 h-8 text-success mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-foreground">Manage Classes</p>
              <p className="text-sm text-muted-foreground">View all classes</p>
            </a>
            <div className="p-4 rounded-xl bg-warning/5 hover:bg-warning/10 border border-warning/20 transition-all hover:scale-[1.02] group cursor-pointer">
              <Calendar className="w-8 h-8 text-warning mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-foreground">Attendance</p>
              <p className="text-sm text-muted-foreground">Mark attendance</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
