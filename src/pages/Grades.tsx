import { useState, useMemo } from 'react';
import { Plus, FileText, Save, BookOpen } from 'lucide-react';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import {
  useSubjects,
  useAddSubject,
  useExams,
  useAddExam,
  useGrades,
  useBulkSaveGrades,
  useStudentGrades,
} from '@/hooks/useGrades';
import { generateReportCard } from '@/lib/pdfExport';

const Grades = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [gradesState, setGradesState] = useState<Record<string, number>>({});
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  const [subjectForm, setSubjectForm] = useState({ name: '' });
  const [examForm, setExamForm] = useState({
    name: '',
    subject_id: '',
    exam_date: '',
    max_marks: '100',
  });

  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const { data: subjects } = useSubjects(selectedClassId);
  const { data: exams } = useExams(selectedClassId);
  const { data: examGrades } = useGrades(selectedExamId);
  const { data: studentGrades } = useStudentGrades(selectedStudentId);

  const addSubject = useAddSubject();
  const addExam = useAddExam();
  const bulkSaveGrades = useBulkSaveGrades();

  const classStudents = useMemo(() => {
    return students?.filter((s) => s.class_id === selectedClassId) || [];
  }, [students, selectedClassId]);

  const selectedExam = exams?.find((e) => e.id === selectedExamId);
  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  // Merge existing grades with local state
  const currentGrades = useMemo(() => {
    const existing: Record<string, number> = {};
    examGrades?.forEach((g) => {
      existing[g.student_id] = Number(g.marks_obtained);
    });
    return { ...existing, ...gradesState };
  }, [examGrades, gradesState]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassId) {
      addSubject.mutate({ name: subjectForm.name, class_id: selectedClassId });
      setSubjectForm({ name: '' });
      setIsAddSubjectOpen(false);
    }
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassId) {
      addExam.mutate({
        name: examForm.name,
        class_id: selectedClassId,
        subject_id: examForm.subject_id,
        exam_date: examForm.exam_date,
        max_marks: parseInt(examForm.max_marks),
      });
      setExamForm({ name: '', subject_id: '', exam_date: '', max_marks: '100' });
      setIsAddExamOpen(false);
    }
  };

  const handleGradeChange = (studentId: string, marks: number) => {
    setGradesState((prev) => ({ ...prev, [studentId]: marks }));
  };

  const handleSaveGrades = () => {
    if (!selectedExamId) return;

    const grades = Object.entries(currentGrades).map(([student_id, marks_obtained]) => {
      const maxMarks = selectedExam?.max_marks || 100;
      const percentage = (marks_obtained / maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      return {
        student_id,
        exam_id: selectedExamId,
        marks_obtained,
        grade,
      };
    });

    bulkSaveGrades.mutate(grades);
    setGradesState({});
  };

  const handlePrintReportCard = () => {
    if (selectedStudent && studentGrades && studentGrades.length > 0) {
      generateReportCard(selectedStudent, studentGrades);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Grades & Exams</h1>
            <p className="text-muted-foreground mt-1">Manage exams and record student grades</p>
          </div>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedClassId ? (
          <div className="form-card text-center py-12">
            <p className="text-muted-foreground">Please select a class to manage grades.</p>
          </div>
        ) : (
          <Tabs defaultValue="enter-grades" className="animate-fade-in">
            <TabsList className="mb-6">
              <TabsTrigger value="enter-grades">Enter Grades</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="report-cards">Report Cards</TabsTrigger>
            </TabsList>

            {/* Enter Grades Tab */}
            <TabsContent value="enter-grades">
              <div className="form-card">
                <div className="flex items-center justify-between mb-6">
                  <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams?.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name} - {e.subjects?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedExamId && (
                    <Button
                      onClick={handleSaveGrades}
                      disabled={Object.keys(gradesState).length === 0 || bulkSaveGrades.isPending}
                      className="gradient-primary text-primary-foreground"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {bulkSaveGrades.isPending ? 'Saving...' : 'Save Grades'}
                    </Button>
                  )}
                </div>

                {!selectedExamId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Select an exam to enter grades.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-4">
                      Max Marks: <span className="font-bold">{selectedExam?.max_marks || 100}</span>
                    </div>
                    {classStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {student.name.charAt(0)}
                          </div>
                          <p className="font-medium">{student.name}</p>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={selectedExam?.max_marks || 100}
                          value={currentGrades[student.id] ?? ''}
                          onChange={(e) => handleGradeChange(student.id, parseFloat(e.target.value) || 0)}
                          placeholder="Marks"
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects">
              <div className="form-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Subjects</h2>
                  <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddSubject} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Subject Name</Label>
                          <Input
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm({ name: e.target.value })}
                            placeholder="e.g., Mathematics"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="submit" className="gradient-primary text-primary-foreground">
                            Add Subject
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects?.map((subject) => (
                    <div key={subject.id} className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  ))}
                  {(!subjects || subjects.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No subjects added yet.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams">
              <div className="form-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Exams</h2>
                  <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Exam</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddExam} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Exam Name</Label>
                          <Input
                            value={examForm.name}
                            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                            placeholder="e.g., Mid-Term Exam"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Select
                            value={examForm.subject_id}
                            onValueChange={(v) => setExamForm({ ...examForm, subject_id: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects?.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Exam Date</Label>
                            <Input
                              type="date"
                              value={examForm.exam_date}
                              onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Marks</Label>
                            <Input
                              type="number"
                              value={examForm.max_marks}
                              onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="submit" className="gradient-primary text-primary-foreground">
                            Create Exam
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {exams?.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.subjects?.name} • {exam.exam_date} • Max: {exam.max_marks}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!exams || exams.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">No exams created yet.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Report Cards Tab */}
            <TabsContent value="report-cards">
              <div className="form-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Generate Report Card</h2>
                  <div className="flex gap-3">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {classStudents.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handlePrintReportCard}
                      disabled={!selectedStudentId || !studentGrades?.length}
                      className="gradient-primary text-primary-foreground"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Print Report Card
                    </Button>
                  </div>
                </div>

                {selectedStudentId && studentGrades && studentGrades.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-3">{selectedStudent?.name}'s Grades</h3>
                      <div className="space-y-2">
                        {studentGrades.map((g) => (
                          <div key={g.id} className="flex justify-between text-sm">
                            <span>
                              {g.exams?.name} - {g.exams?.subjects?.name}
                            </span>
                            <span className="font-medium">
                              {g.marks_obtained}/{g.exams?.max_marks} ({g.grade || 'N/A'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedStudentId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No grades recorded for this student.
                  </p>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Select a student to view their grades and generate a report card.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grades;
