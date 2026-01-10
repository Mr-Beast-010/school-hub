import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck, FileText, LogOut, School } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: GraduationCap, label: 'Teachers', path: '/teachers' },
  { icon: BookOpen, label: 'Classes', path: '/classes' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: FileText, label: 'Grades', path: '/grades' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <School className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-lg">EduManage</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{profile?.role || 'User'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={signOut}
          className="sidebar-item w-full text-left hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
