import { useState } from 'react';
import { Plus, Users, Layers, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useClassesWithStudentCount, useAddClass, useDeleteClass } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';

const Classes = () => {
  const { data: classes, isLoading } = useClassesWithStudentCount();
  const addClass = useAddClass();
  const deleteClass = useDeleteClass();
  const { canEdit } = useAuth();

  const canEditClasses = canEdit('classes');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', section: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClass.mutate(formData);
    setFormData({ name: '', section: '' });
    setIsAddDialogOpen(false);
  };

  const totalStudents = classes?.reduce((sum, c) => sum + (c.student_count || 0), 0) || 0;

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground mt-1">Manage classes and sections</p>
          </div>
          {canEditClasses && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Class</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2"><Label>Class Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Class 10" required /></div>
                  <div className="space-y-2"><Label>Section</Label><Input value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="e.g., A" required /></div>
                  <div className="flex justify-end gap-3 pt-4">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" className="gradient-primary text-primary-foreground">Add Class</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><Layers className="w-6 h-6 text-primary-foreground" /></div>
            <div><p className="text-sm text-muted-foreground">Total Classes</p><p className="text-2xl font-bold">{classes?.length || 0}</p></div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center"><Users className="w-6 h-6 text-primary-foreground" /></div>
            <div><p className="text-sm text-muted-foreground">Total Students</p><p className="text-2xl font-bold">{totalStudents}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes?.map((classInfo, index) => (
            <div key={classInfo.id} className="form-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-lg">{classInfo.section}</span></div>
                {canEditClasses && (
                  <Button variant="ghost" size="icon" onClick={() => deleteClass.mutate(classInfo.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                )}
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{classInfo.name}</h3>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Section</span><span className="font-medium">{classInfo.section}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Students</span><span className="font-medium">{classInfo.student_count || 0}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Classes;