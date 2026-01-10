import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, IdCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudents, useAddStudent, useUpdateStudent, useDeleteStudent, Student } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { generateStudentIdCard } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';

const Students = () => {
  const { data: students, isLoading } = useStudents();
  const { data: classes } = useClasses();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', class_id: '', parent_name: '', parent_phone: '', address: '', date_of_birth: '',
  });

  const filteredStudents = students?.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent.mutate({ id: editingStudent.id, ...formData });
    } else {
      addStudent.mutate(formData as any);
    }
    resetForm();
    setIsAddDialogOpen(false);
    setEditingStudent(null);
  };

  const resetForm = () => setFormData({ name: '', email: '', class_id: '', parent_name: '', parent_phone: '', address: '', date_of_birth: '' });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name, email: student.email || '', class_id: student.class_id || '',
      parent_name: student.parent_name || '', parent_phone: student.parent_phone || '',
      address: student.address || '', date_of_birth: student.date_of_birth || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleView = (student: Student) => { setSelectedStudent(student); setIsViewDialogOpen(true); };

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1">Manage student enrollments and information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) { resetForm(); setEditingStudent(null); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Class</Label>
                    <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>{classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Parent Name</Label><Input value={formData.parent_name} onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Parent Phone</Label><Input value={formData.parent_phone} onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit" className="gradient-primary text-primary-foreground">{editingStudent ? 'Update' : 'Add'} Student</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="form-card animate-fade-in">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        </div>

        <div className="table-container animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50"><tr><th className="text-left py-4 px-6 font-semibold">Student</th><th className="text-left py-4 px-6 font-semibold">Class</th><th className="text-left py-4 px-6 font-semibold">Parent</th><th className="text-right py-4 px-6 font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">{student.name.charAt(0)}</div><div><p className="font-medium text-foreground">{student.name}</p><p className="text-sm text-muted-foreground">{student.email}</p></div></div></td>
                    <td className="py-4 px-6">{student.classes?.name} - {student.classes?.section}</td>
                    <td className="py-4 px-6 text-muted-foreground">{student.parent_name}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(student)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => generateStudentIdCard(student)}><IdCard className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudent.mutate(student.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && <div className="text-center py-12 text-muted-foreground">No students found.</div>}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 pb-4 border-b"><div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">{selectedStudent.name.charAt(0)}</div><div><h3 className="text-xl font-semibold">{selectedStudent.name}</h3><p className="text-muted-foreground">{selectedStudent.email}</p></div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Class</p><p className="font-medium">{selectedStudent.classes?.name} - {selectedStudent.classes?.section}</p></div>
                  <div><p className="text-sm text-muted-foreground">DOB</p><p className="font-medium">{selectedStudent.date_of_birth || 'N/A'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Parent</p><p className="font-medium">{selectedStudent.parent_name || 'N/A'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Parent Phone</p><p className="font-medium">{selectedStudent.parent_phone || 'N/A'}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Students;
