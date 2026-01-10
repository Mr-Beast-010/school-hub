import { Student } from '@/hooks/useStudents';
import { Grade } from '@/hooks/useGrades';

// Helper to calculate grade from marks
const calculateGrade = (marks: number, maxMarks: number): string => {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const generateStudentIdCard = (student: Student, schoolName: string = 'EduManage School') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student ID Card - ${student.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f0f0; padding: 20px; }
        .id-card {
          width: 350px;
          height: 220px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding-bottom: 12px;
        }
        .logo {
          width: 45px;
          height: 45px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
        .school-name {
          font-size: 18px;
          font-weight: bold;
        }
        .school-subtitle { font-size: 11px; opacity: 0.8; }
        .content { display: flex; gap: 16px; }
        .photo {
          width: 70px;
          height: 85px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .info { flex: 1; }
        .student-name { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
        .detail { font-size: 11px; margin-bottom: 4px; opacity: 0.9; }
        .detail span { opacity: 0.7; }
        .id-number {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 10px;
          opacity: 0.7;
        }
        .card-container { position: relative; width: 350px; height: 220px; margin: 0 auto; }
        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
          Print ID Card
        </button>
      </div>
      <div class="card-container">
        <div class="id-card">
          <div class="header">
            <div class="logo">🎓</div>
            <div>
              <div class="school-name">${schoolName}</div>
              <div class="school-subtitle">Student Identity Card</div>
            </div>
          </div>
          <div class="content">
            <div class="photo">${student.name.charAt(0)}</div>
            <div class="info">
              <div class="student-name">${student.name}</div>
              <div class="detail"><span>Class:</span> ${student.classes?.name || 'N/A'} - ${student.classes?.section || ''}</div>
              <div class="detail"><span>DOB:</span> ${student.date_of_birth || 'N/A'}</div>
              <div class="detail"><span>Parent:</span> ${student.parent_name || 'N/A'}</div>
              <div class="detail"><span>Phone:</span> ${student.parent_phone || 'N/A'}</div>
            </div>
          </div>
        </div>
        <div class="id-number">ID: ${student.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateReportCard = (
  student: Student,
  grades: Grade[],
  schoolName: string = 'EduManage School',
  examName: string = 'Annual Examination'
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalMarks = grades.reduce((sum, g) => sum + Number(g.marks_obtained), 0);
  const totalMaxMarks = grades.reduce((sum, g) => sum + (g.exams?.max_marks || 100), 0);
  const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : '0';
  const overallGrade = calculateGrade(totalMarks, totalMaxMarks);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card - ${student.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: #f5f5f5; padding: 20px; }
        .report-card {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border: 3px solid #1a365d;
          padding: 0;
        }
        .header {
          background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .school-logo {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 15px;
        }
        .school-name { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .report-title { font-size: 18px; opacity: 0.9; margin-top: 10px; }
        .student-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 25px 30px;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        .info-item { font-size: 14px; }
        .info-item strong { color: #1a365d; }
        .grades-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        .grades-table th {
          background: #2d3748;
          color: white;
          padding: 12px 15px;
          text-align: left;
          font-size: 13px;
        }
        .grades-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .grades-table tr:nth-child(even) { background: #f8fafc; }
        .grades-table .marks { text-align: center; font-weight: bold; }
        .grades-table .grade { text-align: center; }
        .grade-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
        }
        .grade-a { background: #c6f6d5; color: #22543d; }
        .grade-b { background: #bee3f8; color: #2a4365; }
        .grade-c { background: #fefcbf; color: #744210; }
        .grade-d { background: #fed7d7; color: #742a2a; }
        .grade-f { background: #feb2b2; color: #742a2a; }
        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 25px 30px;
          background: #1a365d;
          color: white;
        }
        .summary-item { text-align: center; }
        .summary-value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .summary-label { font-size: 12px; opacity: 0.8; }
        .footer {
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          border-top: 2px solid #e2e8f0;
        }
        .signature {
          text-align: center;
          padding-top: 40px;
          border-top: 1px solid #333;
          width: 150px;
          font-size: 12px;
        }
        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none; }
          .report-card { border: 2px solid #333; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #1a365d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
          Print Report Card
        </button>
      </div>
      <div class="report-card">
        <div class="header">
          <div class="school-logo">🎓</div>
          <div class="school-name">${schoolName}</div>
          <div class="report-title">${examName} - Report Card</div>
        </div>
        
        <div class="student-info">
          <div class="info-item"><strong>Student Name:</strong> ${student.name}</div>
          <div class="info-item"><strong>Class:</strong> ${student.classes?.name || 'N/A'} - ${student.classes?.section || ''}</div>
          <div class="info-item"><strong>Date of Birth:</strong> ${student.date_of_birth || 'N/A'}</div>
          <div class="info-item"><strong>Enrollment Date:</strong> ${student.enrollment_date}</div>
        </div>

        <table class="grades-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th style="text-align: center;">Max Marks</th>
              <th style="text-align: center;">Marks Obtained</th>
              <th style="text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${grades.map(g => {
              const grade = g.grade || calculateGrade(Number(g.marks_obtained), g.exams?.max_marks || 100);
              const gradeClass = grade.startsWith('A') ? 'grade-a' : 
                               grade.startsWith('B') ? 'grade-b' : 
                               grade === 'C' ? 'grade-c' : 
                               grade === 'D' ? 'grade-d' : 'grade-f';
              return `
                <tr>
                  <td>${g.exams?.subjects?.name || 'Subject'}</td>
                  <td class="marks">${g.exams?.max_marks || 100}</td>
                  <td class="marks">${g.marks_obtained}</td>
                  <td class="grade"><span class="grade-badge ${gradeClass}">${grade}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${totalMarks}/${totalMaxMarks}</div>
            <div class="summary-label">Total Marks</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${percentage}%</div>
            <div class="summary-label">Percentage</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${overallGrade}</div>
            <div class="summary-label">Overall Grade</div>
          </div>
        </div>

        <div class="footer">
          <div class="signature">Class Teacher</div>
          <div class="signature">Principal</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
