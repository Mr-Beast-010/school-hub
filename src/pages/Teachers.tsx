import { useState } from 'react';
import { Search, Mail, Phone, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { teachers } from '@/data/mockData';

const Teachers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground mt-1">
            View and manage teaching staff information
          </p>
        </div>

        {/* Search */}
        <div className="form-card animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, subject, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher, index) => (
            <div 
              key={teacher.id} 
              className="form-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">{teacher.subject}</span>
                  <span className="text-muted-foreground">• {teacher.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-medium text-foreground">{teacher.experience}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  teacher.status === 'active' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {teacher.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="form-card text-center py-12">
            <p className="text-muted-foreground">No teachers found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
