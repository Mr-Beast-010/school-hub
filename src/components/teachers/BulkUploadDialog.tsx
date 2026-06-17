import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ParsedTeacher {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  qualification?: string;
}

export const TeacherBulkUploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedTeachers, setParsedTeachers] = useState<ParsedTeacher[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'phone', 'subject', 'qualification'];
    const sampleData = [
      'John Smith,john.smith@school.com,+1234567890,Mathematics,M.Sc Mathematics',
      'Jane Doe,jane.doe@school.com,+1234567891,English,M.A English Literature',
    ];
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedTeacher[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const teachers: ParsedTeacher[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 1 || !values[0]) continue;

      const teacher: ParsedTeacher = { name: '', email: '' };
      headers.forEach((header, idx) => {
        const value = values[idx] || '';
        if (header === 'name') teacher.name = value;
        else if (header === 'email') teacher.email = value;
        else if (header === 'phone') teacher.phone = value;
        else if (header === 'subject') teacher.subject = value;
        else if (header === 'qualification') teacher.qualification = value;
      });

      if (!teacher.name) {
        parseErrors.push(`Row ${i + 1}: Name is required`);
        continue;
      }
      if (!teacher.email) {
        parseErrors.push(`Row ${i + 1}: Email is required`);
        continue;
      }

      teachers.push(teacher);
    }

    setErrors(parseErrors);
    return teachers;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Invalid file type', description: 'Please upload a CSV file', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const teachers = parseCSV(text);
      setParsedTeachers(teachers);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedTeachers.length === 0) return;

    setIsUploading(true);
    const joiningDate = new Date().toISOString().split('T')[0];

    const teachersToInsert = parsedTeachers.map(teacher => ({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || null,
      subject: teacher.subject || null,
      qualification: teacher.qualification || null,
      joining_date: joiningDate,
      user_id: null,
    }));

    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert(teachersToInsert)
        .select();

      if (error) throw error;

      const successCount = data?.length || 0;
      toast({
        title: 'Bulk upload complete',
        description: `${successCount} teachers added successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setParsedTeachers([]);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload teachers',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setParsedTeachers([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Upload Teachers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">Download Template</p>
              <p className="text-sm text-muted-foreground">Get the CSV template with required columns</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block">
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Click to upload CSV file</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {parsedTeachers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">{parsedTeachers.length} teachers ready to import</span>
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Subject</th>
                      <th className="text-left py-2 px-3">Qualification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedTeachers.slice(0, 10).map((teacher, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 px-3">{teacher.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{teacher.email}</td>
                        <td className="py-2 px-3">{teacher.subject || '-'}</td>
                        <td className="py-2 px-3">{teacher.qualification || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedTeachers.length > 10 && (
                  <p className="text-center py-2 text-sm text-muted-foreground">
                    ...and {parsedTeachers.length - 10} more
                  </p>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-full" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading {parsedTeachers.length} teachers...
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={resetDialog} disabled={isUploading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="gradient-primary text-primary-foreground"
                >
                  {isUploading ? 'Uploading...' : `Import ${parsedTeachers.length} Teachers`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};