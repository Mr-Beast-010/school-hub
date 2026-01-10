// Mock data for School Management System

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  dateOfBirth: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface ClassInfo {
  id: string;
  name: string;
  sections: string[];
  classTeacher: string;
  totalStudents: number;
}

export const students: Student[] = [
  {
    id: '1',
    name: 'Rahul Ahmed',
    email: 'rahul.ahmed@school.edu',
    phone: '+880 1712-345678',
    class: 'Class 10',
    section: 'A',
    rollNumber: '101',
    guardianName: 'Mr. Karim Ahmed',
    guardianPhone: '+880 1812-345678',
    address: 'House 45, Road 12, Dhanmondi, Dhaka',
    dateOfBirth: '2008-05-15',
    enrollmentDate: '2023-01-10',
    status: 'active',
  },
  {
    id: '2',
    name: 'Fatima Begum',
    email: 'fatima.begum@school.edu',
    phone: '+880 1713-456789',
    class: 'Class 10',
    section: 'A',
    rollNumber: '102',
    guardianName: 'Mrs. Nasreen Begum',
    guardianPhone: '+880 1813-456789',
    address: 'House 23, Road 8, Gulshan, Dhaka',
    dateOfBirth: '2008-08-22',
    enrollmentDate: '2023-01-10',
    status: 'active',
  },
  {
    id: '3',
    name: 'Arif Hossain',
    email: 'arif.hossain@school.edu',
    phone: '+880 1714-567890',
    class: 'Class 9',
    section: 'B',
    rollNumber: '201',
    guardianName: 'Mr. Jamal Hossain',
    guardianPhone: '+880 1814-567890',
    address: 'House 67, Road 5, Uttara, Dhaka',
    dateOfBirth: '2009-03-10',
    enrollmentDate: '2023-01-15',
    status: 'active',
  },
  {
    id: '4',
    name: 'Nadia Islam',
    email: 'nadia.islam@school.edu',
    phone: '+880 1715-678901',
    class: 'Class 9',
    section: 'A',
    rollNumber: '202',
    guardianName: 'Mr. Rafiq Islam',
    guardianPhone: '+880 1815-678901',
    address: 'House 89, Road 15, Banani, Dhaka',
    dateOfBirth: '2009-11-28',
    enrollmentDate: '2023-01-15',
    status: 'active',
  },
  {
    id: '5',
    name: 'Tanvir Rahman',
    email: 'tanvir.rahman@school.edu',
    phone: '+880 1716-789012',
    class: 'Class 8',
    section: 'A',
    rollNumber: '301',
    guardianName: 'Mr. Shafiq Rahman',
    guardianPhone: '+880 1816-789012',
    address: 'House 12, Road 3, Mirpur, Dhaka',
    dateOfBirth: '2010-07-05',
    enrollmentDate: '2023-02-01',
    status: 'active',
  },
];

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Mahmud Hasan',
    email: 'mahmud.hasan@school.edu',
    phone: '+880 1911-123456',
    subject: 'Mathematics',
    department: 'Science',
    qualification: 'PhD in Mathematics',
    experience: '15 years',
    joiningDate: '2010-06-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mrs. Shabnam Akter',
    email: 'shabnam.akter@school.edu',
    phone: '+880 1912-234567',
    subject: 'English',
    department: 'Humanities',
    qualification: 'MA in English Literature',
    experience: '12 years',
    joiningDate: '2012-08-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mr. Kamal Uddin',
    email: 'kamal.uddin@school.edu',
    phone: '+880 1913-345678',
    subject: 'Physics',
    department: 'Science',
    qualification: 'MSc in Physics',
    experience: '10 years',
    joiningDate: '2014-01-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Mrs. Nasima Rahman',
    email: 'nasima.rahman@school.edu',
    phone: '+880 1914-456789',
    subject: 'Chemistry',
    department: 'Science',
    qualification: 'MSc in Chemistry',
    experience: '8 years',
    joiningDate: '2016-03-25',
    status: 'active',
  },
  {
    id: '5',
    name: 'Mr. Rahim Khan',
    email: 'rahim.khan@school.edu',
    phone: '+880 1915-567890',
    subject: 'Bengali',
    department: 'Humanities',
    qualification: 'MA in Bengali',
    experience: '20 years',
    joiningDate: '2005-07-01',
    status: 'active',
  },
];

export const classes: ClassInfo[] = [
  {
    id: '1',
    name: 'Class 10',
    sections: ['A', 'B', 'C'],
    classTeacher: 'Dr. Mahmud Hasan',
    totalStudents: 120,
  },
  {
    id: '2',
    name: 'Class 9',
    sections: ['A', 'B', 'C'],
    classTeacher: 'Mrs. Shabnam Akter',
    totalStudents: 115,
  },
  {
    id: '3',
    name: 'Class 8',
    sections: ['A', 'B'],
    classTeacher: 'Mr. Kamal Uddin',
    totalStudents: 80,
  },
  {
    id: '4',
    name: 'Class 7',
    sections: ['A', 'B'],
    classTeacher: 'Mrs. Nasima Rahman',
    totalStudents: 75,
  },
  {
    id: '5',
    name: 'Class 6',
    sections: ['A', 'B'],
    classTeacher: 'Mr. Rahim Khan',
    totalStudents: 70,
  },
];

export const dashboardStats = {
  totalStudents: 460,
  totalTeachers: 25,
  totalClasses: 5,
  totalSections: 12,
  attendanceToday: 92,
  upcomingEvents: 3,
};
