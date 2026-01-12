import { useState } from 'react';
import { Search, Mail, Phone, BookOpen, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useTeachers, useAddTeacher, useDeleteTeacher } from '@/hooks/useTeachers';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherBulkUploadDialog } from '@/components/teachers/BulkUploadDialog';

const Teachers = () => {
  const { data: teachers, isLoading } = useTeachers();
  const addTeacher = useAddTeacher();
  const deleteTeacher = useDeleteTeacher();
  const { canEdit } = useAuth();

  const canEditTeachers = canEdit('teachers');

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', qualification: '' });

  const filteredTeachers = teachers?.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeacher.mutate({ ...formData, user_id: null, joining_date: new Date().toISOString().split('T')[0] });
    setFormData({ name: '', email: '', phone: '', subject: '', qualification: '' });
    setIsAddDialogOpen(false);
  };

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground mt-1">View and manage teaching staff</p>
          </div>
          {canEditTeachers && (
            <div className="flex gap-2">
              <TeacherBulkUploadDialog />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Teacher</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Teacher</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Subject</Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Qualification</Label><Input value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} /></div>
                    <div className="flex justify-end gap-3 pt-4">
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit" className="gradient-primary text-primary-foreground">Add Teacher</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="form-card animate-fade-in">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Search teachers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher, index) => (
            <div key={teacher.id} className="form-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">{teacher.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
                  </div>
                </div>
                {canEditTeachers && (
                  <Button variant="ghost" size="icon" onClick={() => deleteTeacher.mutate(teacher.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4 text-primary" /><span className="font-medium">{teacher.subject || 'N/A'}</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" /><span className="truncate">{teacher.email}</span></div>
                {teacher.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /><span>{teacher.phone}</span></div>}
              </div>
            </div>
          ))}
        </div>
        {filteredTeachers.length === 0 && <div className="form-card text-center py-12"><p className="text-muted-foreground">No teachers found.</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default Teachers;