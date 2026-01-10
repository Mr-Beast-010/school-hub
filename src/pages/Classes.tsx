import { useState } from 'react';
import { Plus, Users, GraduationCap, Layers } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { classes as initialClasses, ClassInfo } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Classes = () => {
  const [classes, setClasses] = useState<ClassInfo[]>(initialClasses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    classTeacher: '',
    sections: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClass: ClassInfo = {
      id: Date.now().toString(),
      name: formData.name,
      classTeacher: formData.classTeacher,
      sections: formData.sections.split(',').map(s => s.trim()),
      totalStudents: 0,
    };
    
    setClasses([...classes, newClass]);
    toast({
      title: 'Class Added',
      description: `${formData.name} has been created successfully.`,
    });
    
    setFormData({ name: '', classTeacher: '', sections: '' });
    setIsAddDialogOpen(false);
  };

  const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
  const totalSections = classes.reduce((sum, c) => sum + c.sections.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground mt-1">
              Manage classes and sections
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Class 11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classTeacher">Class Teacher</Label>
                  <Input
                    id="classTeacher"
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sections">Sections (comma-separated)</Label>
                  <Input
                    id="sections"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                    placeholder="A, B, C"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="gradient-primary text-primary-foreground">
                    Add Class
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-2xl font-bold text-foreground">{classes.length}</p>
            </div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold text-foreground">{totalSections}</p>
            </div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classInfo, index) => (
            <div 
              key={classInfo.id} 
              className="form-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {classInfo.name.split(' ')[1]}
                  </span>
                </div>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                  {classInfo.sections.length} sections
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {classInfo.name}
              </h3>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Class Teacher</span>
                  <span className="font-medium text-foreground">{classInfo.classTeacher}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-medium text-foreground">{classInfo.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sections</span>
                  <div className="flex gap-1">
                    {classInfo.sections.map((section) => (
                      <span 
                        key={section}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Classes;
