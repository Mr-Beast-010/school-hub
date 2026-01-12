import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAddStudent } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParsedStudent {
  name: string;
  email?: string;
  roll_number?: string;
  class_name?: string;
  class_id?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  date_of_birth?: string;
}

export const BulkUploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ success: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addStudent = useAddStudent();
  const { data: classes } = useClasses();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'roll_number', 'class_name', 'date_of_birth', 'parent_name', 'parent_phone', 'address'];
    const sampleData = [
      'John Doe,john@email.com,2024001,Class 10-A,2008-05-15,Robert Doe,+1234567890,123 Main St',
      'Jane Smith,jane@email.com,2024002,Class 10-B,2008-08-20,Mary Smith,+1234567891,456 Oak Ave',
    ];
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedStudent[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const students: ParsedStudent[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 1 || !values[0]) continue;

      const student: ParsedStudent = { name: '' };
      headers.forEach((header, idx) => {
        const value = values[idx] || '';
        if (header === 'name') student.name = value;
        else if (header === 'email') student.email = value;
        else if (header === 'roll_number') student.roll_number = value;
        else if (header === 'class_name') student.class_name = value;
        else if (header === 'date_of_birth') student.date_of_birth = value;
        else if (header === 'parent_name') student.parent_name = value;
        else if (header === 'parent_phone') student.parent_phone = value;
        else if (header === 'address') student.address = value;
      });

      if (!student.name) {
        parseErrors.push(`Row ${i + 1}: Name is required`);
        continue;
      }

      // Match class by name
      if (student.class_name && classes) {
        const matchedClass = classes.find(c => 
          `${c.name}-${c.section}`.toLowerCase() === student.class_name?.toLowerCase().replace(/\s+/g, '') ||
          `${c.name} - ${c.section}`.toLowerCase() === student.class_name?.toLowerCase() ||
          c.name.toLowerCase() === student.class_name?.toLowerCase()
        );
        if (matchedClass) {
          student.class_id = matchedClass.id;
        }
      }

      students.push(student);
    }

    setErrors(parseErrors);
    return students;
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
      const students = parseCSV(text);
      setParsedStudents(students);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedStudents.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (const student of parsedStudents) {
      try {
        await addStudent.mutateAsync({
          name: student.name,
          email: student.email || null,
          roll_number: student.roll_number || null,
          class_id: student.class_id || null,
          parent_name: student.parent_name || null,
          parent_phone: student.parent_phone || null,
          address: student.address || null,
          date_of_birth: student.date_of_birth || null,
          enrollment_date: new Date().toISOString().split('T')[0],
          photo_url: null,
        });
        success++;
      } catch (error) {
        failed++;
      }
      setUploadProgress({ success, failed });
    }

    setIsUploading(false);
    toast({
      title: 'Bulk upload complete',
      description: `${success} students added successfully${failed > 0 ? `, ${failed} failed` : ''}`,
    });

    if (failed === 0) {
      setParsedStudents([]);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetDialog = () => {
    setParsedStudents([]);
    setErrors([]);
    setUploadProgress({ success: 0, failed: 0 });
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
            Bulk Upload Students
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

          {parsedStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">{parsedStudents.length} students ready to import</span>
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Roll No.</th>
                      <th className="text-left py-2 px-3">Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedStudents.slice(0, 10).map((student, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 px-3">{student.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{student.email || '-'}</td>
                        <td className="py-2 px-3 font-mono">{student.roll_number || '-'}</td>
                        <td className="py-2 px-3">{student.class_id ? '✓ Matched' : student.class_name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedStudents.length > 10 && (
                  <p className="text-center py-2 text-sm text-muted-foreground">
                    ...and {parsedStudents.length - 10} more
                  </p>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${((uploadProgress.success + uploadProgress.failed) / parsedStudents.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading... {uploadProgress.success + uploadProgress.failed} / {parsedStudents.length}
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
                  {isUploading ? 'Uploading...' : `Import ${parsedStudents.length} Students`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
